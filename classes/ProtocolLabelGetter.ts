import gen from "../utils/generator.ts";
import { YAML } from "../deps.ts";
import getTypedExpression from "../utils/typedExpressions.ts";
import elements from "../utils/elements.ts";
import esmElements from "../utils/esm-imports.ts";
import notParsedElements from "../utils/not-parsed.ts";
import computedExp from "../utils/computed.ts";
import cjsElements from "../utils/cjsElements.ts";
import O3Elements from "../utils/o3-elements.ts";
import getDeepTranslation from "../utils/template-recursive.ts";
import read from '../utils/agnostic-transformer.ts';
import { Utils } from "./Utils.ts";
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
  argumentType?: null | 'string';
  /** when the label is parsed, first argument is the context of the label */
  onParse(ctx: LabelContext): void;
  /** whenever a label should consider its indentation */
  indentStyle?: boolean;
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
  private expressions: {[k: string]: string} = {};
  private typedExpressions?: TypedExpressions;
  private labels?: LabelProvider[];
  registerLabelProviders(text: string, labels: LabelProvider[]): void {
    this.typedExpressions = getTypedExpression();
    this.expressions = {};
    this.labels = labels;
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
    const contents = transformedText.split(globalRegExp).filter((s: string) => s.length);
    const result = this.getLabelContents(contents);
    this.triggerParsedLabels(result, labels)
    console.warn(globalRegExp)
  }
  triggerParsedLabels(savedLabels: { [k: string]: string[] }, labels: LabelProvider[]): void {
    labels.forEach((label) => {
      if (label.onParse && typeof label.onParse === 'function') {
        const entries = Object.entries(savedLabels);
        entries.forEach(([key, values]) => {
          const value = values.reverse().join('');
          const token = key.split(' ')[0].replace(/\:$/, '');
          if (label.token === token) {
            label.onParse({
              argument: getDeepTranslation(key.split(' ')[1], this.expressions).replace(/\:$/, ''),
              token,
              value: getDeepTranslation(value, this.expressions),
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
  /** returns strings with regexp that should just be used for testing regexp of labels */
  getUncatchableLabels(): string[] {
    if (!this.labels) return [];
    return this.labels.map((labelProvider) =>  {
      // we add the space for indentations
      if (labelProvider.argumentType && labelProvider.argumentType === 'string') return `(?:(?:\\s*)${labelProvider.token}\\s*\\<string\\d+\\>\\s*\\:)`;
      return `(?:\\s*)${labelProvider.token}\\s*\\:`;
    });
  }
  /** returns strings with regexp, you can capture all groups */
  getCatchableLabels(): string[] {
    if (!this.labels) return [];
    return this.labels.map((labelProvider) =>  {
      // we add the space for indentations
      if (labelProvider.argumentType && labelProvider.argumentType === 'string') return `\\n((?:\\s*)${labelProvider.token}\\s*\\<string\\d+\\>\\s*\\:)`;
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
          const name = parent.trim();
          result[name] = result[name] || [];
          result[name].push(content);
        }
        if (!parent && matchingToken) {
          const match = new RegExp(matchingToken).exec(content);
          if (match) {
            const [input] =  match;
            const value = content.replace(input, '');
            if (value.length) {
              const name = input.trim()
              result[name] = result[name] || [];
              result[name].push(value);
            }
          }
        }
      }
    })
    console.warn(contents);
    console.warn(result);
    return result;
  }
}

const instance = new ProtocolLabelGetter();
instance.registerLabelProviders(`
  mental: ii;
  before-each:
    const s = {};
  def:
    name: World
    declare: declare
    case '': test
  declare:
    public scrollY: number = 0
    case: lll = 10
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
  });
  break;
  case 'test': break;
`, [
  {
    token: 'def',
    unique: true,
    indentStyle: true,
    onParse: (ctx) => {
      console.warn("def", ctx)
    }
  },
  {
    token: 'declare',
    unique: true,
    indentStyle: true,
    onParse: (ctx) => {
      console.warn("declare", ctx)
    }
  },
  {
    token: 'default',
    unique: true,
    onParse: (ctx) => {
      console.warn("default", ctx)
    }
  },
  {
    token: 'before-each',
    unique: true,
    onParse: (ctx) => {
      console.warn("before-each", ctx)
    }
  },
  {
    token: 'mental',
    unique: true,
    onParse: (ctx) => {
      console.warn("mental", ctx)
    }
  },
  {
    token: 'case',
    argumentType: 'string',
    unique: false,
    onParse: (ctx) => {
      console.warn("case", ctx)
    }
  },
]);