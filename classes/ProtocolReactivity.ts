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

export interface ProtocolReactivityContext {
  /** the line that should trigger a reaction */
  setter: string;
  /** the property that changed */
  property: string;
  /** the new value */
  value: string;
  /** start index of the reaction  */
  startIndex: number;
  /** the index of the end of the reaction  */
  endIndex: number;
};
export type ProtocolReactivityCallback = (ctx: ProtocolReactivityContext) => string;
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
  registerReactivityProviders(text: string, callback: ProtocolReactivityCallback): string {
    let result = '';
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
    return result;
  }
  private renderInvalidations(text: string): string {
    let result = read({
      value: text,
      array: forceInlineElements,
      typedExpressions: this.typedExpressions,
      expressions: this.expressions,
    })
    console.warn(result);
    return result;
  }
}

const instance = new ProtocolReactivity();
instance.registerReactivityProviders(`
  const { header } = Refs;
  window
    .addEventListener('scroll', (ev) => {
      if (header) {
        if (window.scrollY > this.scrollY) {
          header.style.top = '-100px';
        } else {
          header.style.top = '0px';
        }
      }
      this.scrollY = window.scrollY
      this.array
        .push(fgfds)
      this.l;
      this.array
      . push(fgfds)
      if () {}
      this.array
      .push(fgfds)
      a a = 10
      const o = 10;
    });
  (() => this.scrollY++)();
  (() => this.scrollY = 10)();
  (() => this.scrollY +=+ 10)();
  (() => {
    return this.scrollY++;
  });
  break;
`, (ctx) => ``);