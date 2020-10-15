import gen from "../utils/generator.ts";
import { YAML } from "../deps.ts";
import getTypedExpression from "../utils/typedExpressions.ts";
import elements from "../utils/elements.ts";
import notParsedElements from "../utils/not-parsed.ts";
import esmElements from "../utils/esm-imports.ts";
import computedExp from "../utils/computed.ts";
import cjsElements from "../utils/cjsElements.ts";
import O3Elements from "../utils/o3-elements.ts";
import getDeepTranslation from "../utils/template-recursive.ts";
import read from '../utils/agnostic-transformer.ts';
import { Utils } from "./Utils.ts";
import ProtocolReactivity from './ProtocolReactivity.ts';
import type {
  TypedExpressions,
  ProtocolScriptRegExpList,
  ProtocolScriptParserOptions,
  ProtocolScriptParserReturnType,
} from "../.d.ts";

export type LabelContext = {
  /** the code following the token */
  value: string;
  /** the current token */
  token: string;
  /** the argument following the token */
  argument: null | string;
  /** if the label ends with a break statement */
  endsWithBreak: boolean;
}
export interface LabelProvider {
  /** token used to split the protocol */
  token: string;
  /** the label should be the unique one */
  unique: boolean;
  /** set the argument's type following the label: case <string>, default <null> */
  argumentType?: null | string;
  /** when the label is parsed, first argument is the context of the label */
  onParse(ctx: LabelContext): void;
  /** whenever a label should consider its indentation */
  indentStyle?: boolean;
  /** fs the code should get reactive */
  isReactive?: boolean;
}
export interface LabelProviderOptions {
  labels: LabelProvider[];
  onError(error: Error): void;
}
/**
 * @name ProtocolLabelGetter
 * @code OPLG
 * @code OPLG-OCS1-OC0
 * @code OPLG-OIA3
 * @code OPLG-OSB4
 * @description
 * a better class to only provide the content of the labels like: def, default, declare, before-each, cases etc
 */
export default class ProtocolLabelGetter extends Utils {
  private ProtocolReactivity: ProtocolReactivity = new ProtocolReactivity();
  private expressions: {[k: string]: string} = {};
  private typedExpressions?: TypedExpressions;
  private labels?: LabelProvider[];
  private onError?: LabelProviderOptions['onError'];
  registerLabelProviders(text: string, { labels, onError }: LabelProviderOptions): void {
    this.typedExpressions = getTypedExpression();
    this.expressions = {};
    this.labels = labels;
    this.onError = onError;
    const allTokens = this.getUncatchableLabels();
    const globalRegExp: RegExp = new RegExp(`(${allTokens.join('|')})`, 'gi');
    const transformedText = read({
      typedExpressions: this.typedExpressions,
      expressions: this.expressions,
      value: text,
      array: notParsedElements.concat(elements),
    });
    // split labels
    // now we got all the content following the token
    const contents = transformedText.split(globalRegExp).filter((s: string) => s && s.length);
    const result = this.getLabelContents(contents);
    this.hasBadArgument(result);
    this.hasDuplicateLabelImplementation(transformedText, result);
    this.triggerParsedLabels(result, labels)
  }
  triggerParsedLabels(savedLabels: { [k: string]: string[] }, labels: LabelProvider[]): void {
    labels.forEach((label) => {
      if (label.onParse && typeof label.onParse === 'function') {
        const entries = Object.entries(savedLabels);
        entries.forEach(([key, values]) => {
          const value = values.reverse().join('');
          const token = key.trim().split(' ')[0].replace(/\:$/, '');
          if (label.token === token) {
            const newValue =
            label.isReactive ?
              this.ProtocolReactivity.getReactivity({
                text: getDeepTranslation(value, this.expressions),
              }) : getDeepTranslation(value, this.expressions);
            label.onParse({
              argument: getDeepTranslation(key.trim().split(' ')[1], this.expressions).replace(/\:$/, ''),
              token,
              value: newValue,
              endsWithBreak: !!value.trim().match(/\bbreak[\n\s]*;{0,1}$/)
            });
          }
        });
      }
    });
  }
  /** helps for handling separated string that isn't starting with a \n */
  cleanContents(contents: string[]): void {
    contents.forEach((content, i, arr) => {
      if (content.startsWith('\n')) return true;
      else if(arr[i-1]) {
        arr[i-1] = `${arr[i-1]}${content}`;
        delete arr[i];
      }
    });
  }
  /** should throw an error if one label's argument is not using a good type */
  hasBadArgument(savedLabels: { [k: string]: string[] }): void {
    if (this.labels ) {
      this.labels.map((labelProvider) =>  {
        if (labelProvider.argumentType && labelProvider.argumentType === 'string') {
          const regExp = new RegExp(`(?:(?:\\s*)${labelProvider.token}\\s+(\\<string\\d+\\>)\\s*\\:)`, 'i')
          const entries = Object.entries(savedLabels);
          entries.forEach(([key, value]) => {
            const match = regExp.test(key.trim());
            if (key.startsWith(`${labelProvider.token} `) && !match && this.onError) {
              this.onError(new Error(`label ${labelProvider.token} is only waiting for a ${labelProvider.argumentType} as argument. concatenations are not supported, please use template litteral`));
            }
          });
        }
      });
    }
  }
  /** should throw an error if one label is used multiple time */
  hasDuplicateLabelImplementation(text: string, savedLabels: { [k: string]: string[] }): void {
    if (!this.onError) return;
    const allTokens = this.getCatchableLabels();
    const globalRegExp: RegExp = new RegExp(`(${allTokens.join('|')})`, 'gi');
    const match = text.match(globalRegExp);
    const store: string[] = [];
    match?.forEach((m) => {
      if (this.labels) {
        const token = m.trim();
        const name = token.split(/(?:\s|\:$)/)[0];
        const labelProvider = this.labels.find((label: LabelProvider) => label.token === name && label.unique);
        if (store.includes(m) && savedLabels[m] && this.onError && labelProvider) {
          this.onError(new Error(`[Protocol] - Duplicate label implementation: ${labelProvider.token}`));
        } else {
          store.push(m);
        }
      }
    });
  }
  /** returns strings with regexp that should just be used for testing regexp of labels */
  getUncatchableLabels(): string[] {
    if (!this.labels) return [];
    return this.labels.map((labelProvider) =>  {
      // we add the space for indentations
      if (labelProvider.argumentType && labelProvider.argumentType === 'string') return `(?:(?:\\s*)${labelProvider.token}\\s*(?:.+?)\\s*\\:)`;
      return `(?:\\s*)${labelProvider.token}\\s*\\:`;
    });
  }
  /** returns strings with regexp, you can capture all groups */
  getCatchableLabels(): string[] {
    if (!this.labels) return [];
    return this.labels.map((labelProvider) =>  {
      // we add the space for indentations
      if (labelProvider.argumentType && labelProvider.argumentType === 'string') return `\\n((?:\\s*)${labelProvider.token}\\s*(.+?)\\s*\\:)`;
      return `\\n(\\s*)${labelProvider.token}\\s*\\:`;
    });
  }
  getLabelContents(contents: string[]): { [k: string]: string[] } {
    if (!this.labels) return {};
    this.cleanContents(contents)
    const tokens = this.getCatchableLabels();
    const indentRegExp = /\n\s*/;
    const result: { [k: string]: string[] } = {};
    const reversedContents = contents.slice().reverse();
    reversedContents.forEach((content, i, arr) => {
      const match = content.match(indentRegExp)
      const matchingToken = tokens.find((token) => new RegExp(token, 'g').exec(content));
      if (match) {
        const [indent] = match;
        if (!indent || !content.length) return;
        const parent = reversedContents.find((content2: string, id) => {
          const m = content2?.match(indentRegExp);
          if (m) {
            const matchingTokenForCandidate = tokens.find((token) => new RegExp(token, 'g').exec(content2));
            const [indent2] = m;
            return indent2
              && indent2.length < indent.length
              && id > i
              && matchingTokenForCandidate
              || matchingTokenForCandidate
                && !matchingToken
                && id > i;
          }
        })
        if (parent) {
          const name = parent;
          result[name] = result[name] || [];
          result[name].push(content);
        }
        if (!parent && matchingToken) {
          const match = new RegExp(matchingToken).exec(content);
          if (match) {
            const [input] =  match;
            const value = content.replace(input, '');
            if (value.length) {
              const name = input;
              result[name] = result[name] || [];
              result[name].push(value);
            }
          }
        }
      }
    })
    return result;
  }
}
/*
const instance = new ProtocolLabelGetter();
const labels: LabelProvider[] = [
  {
    token: 'def',
    unique: true,
    indentStyle: true,
    onParse: (ctx: LabelContext) => {
      console.warn("def", ctx)
    }
  },
  {
    token: 'declare',
    unique: true,
    indentStyle: true,
    isReactive: true,
    onParse: (ctx: LabelContext) => {
      console.warn("declare", ctx)
      console.warn(ctx.value)
    }
  },
  {
    token: 'default',
    unique: true,
    isReactive: true,
    onParse: (ctx: LabelContext) => {
      console.warn("default", ctx)
      console.warn(ctx.value);
    }
  },
  {
    token: 'before-each',
    unique: true,
    onParse: (ctx: LabelContext) => {
      console.warn("before-each", ctx)
    }
  },
  {
    token: 'mental',
    unique: true,
    onParse: (ctx: LabelContext) => {
      console.warn("mental", ctx)
    }
  },
  {
    token: 'case',
    argumentType: 'string',
    unique: false,
    isReactive: true,
    onParse: (ctx: LabelContext) => {
      console.warn("case", ctx)
    }
  },
];
instance.registerLabelProviders(`
  before-each:
    const s = {};
  def:
    name: World
    declare: declare
    case '': test
  declare:
    public scrollY: number = 0
    case: lll = 10
    getCase() {
      return this.case++;
    }
  default:
    const { header } = Refs;
  window.addEventListener('scroll', (ev) => {
    if (header) {
      if (window.scrollY > this.scrollY) {
        header.style.top = '-100px';
      } else {
        header.style.top = '0px';
      }
    }
    this.scrollY = window.scrollY
    this.a.push();
  });
  break;
  case 'test': break;
  case 'test2': break;
  case \`\${gfdsg}\`: break;
`, {
  labels,
  onError(err) { throw err; },
});
*/
