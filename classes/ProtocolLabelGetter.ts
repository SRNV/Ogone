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
  registerLabelProviders(text: string, labels: LabelProvider[]): void {
    const typedExpressions = getTypedExpression();
    const expressions = {};
    const allTokens = labels.map((labelProvider) =>  {
      // we add the space for indentations
      if (labelProvider.argumentType && labelProvider.argumentType === 'string') return `(?:(?:\\s*)${labelProvider.token}\\s*\\<string\\d+\\>\\s*\\:)`;
      return `(?:\\s*)${labelProvider.token}\\s*\\:`;
    });
    const globalRegExp: RegExp = new RegExp(`(${allTokens.join('|')})`, 'gi');
    const transformedText = read({
      typedExpressions,
      expressions,
      value: text,
      array: notParsedElements.concat(elements),
    });
    // split labels
    // now we got all the content following the token
    const contents = transformedText.split(globalRegExp).filter((s: string) => s.length);
    console.warn(globalRegExp)
    console.warn(contents);
  }
}

const instance = new ProtocolLabelGetter();
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
    token: 'case',
    argumentType: 'string',
    unique: false,
    onParse: (ctx) => {
      console.warn("case", ctx)
    }
  },
]);