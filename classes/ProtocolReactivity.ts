import gen from "../utils/generator.ts";
import { YAML } from "../deps.ts";
import getTypedExpression from "../utils/typedExpressions.ts";
import elements from "../utils/elements.ts";
import esmElements from "../utils/esm-imports.ts";
import notParsedElements from "../utils/not-parsed.ts";
import computedExp from "../utils/computed.ts";
import forceInlineElements from "../utils/forceInlineElements.ts";
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

export interface GetReactivityOptions {
  /** the code to transform */
  text: string;
  /** the name of the function used for reactions, default is ___ (tripple underscore) */
  reactWith?: string;
}
/**
 * @name ProtocolReactivity
 * @code OPR
 * @code OPR-OCS1-OC0
 * @code OPR-OIA3
 * @code OPR-OSB4
 * @description
 * class to transform text with reactions
 */
export default class ProtocolReactivity extends Utils {
  private expressions: {[k: string]: string} = {};
  private typedExpressions?: TypedExpressions;
  private reactWith?: string;
  getReactivity({ text, reactWith = '___', }: GetReactivityOptions): string {
    let result = '';
    this.reactWith = reactWith;
    this.typedExpressions = getTypedExpression();
    this.expressions = {};
    result = read({
      typedExpressions: this.typedExpressions,
      expressions: this.expressions,
      value: text,
      array: notParsedElements.concat(elements),
    });
    result = this.renderInvalidations(result);
    Object.entries(this.typedExpressions.blocks)
      .forEach(([key, value]) => {
        if (this.typedExpressions) {
          const result2 = this.renderInvalidations(value)
          this.typedExpressions.blocks[key] = result2;
          this.expressions[key] = result2;
        }
      });
    Object.entries(this.typedExpressions.parentheses)
    .forEach(([key, value]) => {
      if (this.typedExpressions) {
        const result2 = this.renderInvalidations(value)
        this.typedExpressions.parentheses[key] = result2;
        this.expressions[key] = result2;
      }
    });
    return getDeepTranslation(result, this.expressions);
  }
  private renderInvalidations(text: string): string {
    // force inline, erase break words next to + < > - && ||
    let result = read({
      value: text,
      array: forceInlineElements,
      typedExpressions: this.typedExpressions,
      expressions: this.expressions,
    })
    const invalidatationRegExp = /(this\.)(.+?\b)(.*?)(\s*=\s*)(?!\>|\<)(.+?)(\n|;|\)$|$)/gi;
    const invalidatationShortOperationRegExp = /(this\.)(.+?\b)(.*?)([\+\-\*]+)(\n|;|\)$|$)/gi;
    const arrayModifier = /(this\.)(.+?\b)((.*?)\.\s*(?:push|splice|pop|reverse|fill|copyWithin|shift|unshift|sort|set)(?:<parenthese\d+>))+/gi;
    result = result.replace(invalidatationRegExp, `${this.reactWith || '___'}("$2", this,\n$1$2$3$4$5\n)$6`);
    result = result.replace(invalidatationShortOperationRegExp, `${this.reactWith || '___'}("$2", this,\n$1$2$3$4\n)$5`);
    result = result.replace(arrayModifier, `${this.reactWith || '___'}("$2", this, $&)`);
    return result;
  }
}