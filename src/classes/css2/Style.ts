import getTypedExpression from "../../../utils/typedExpressions.ts";
import elements from "../../../utils/elements.ts";
import notParsedElements from "../../../utils/not-parsed.ts";
import forceInlineElements from "../../../utils/forceInlineElements.ts";
import getDeepTranslation from "../../../utils/template-recursive.ts";
import read from "../../../utils/agnostic-transformer.ts";
import { Utils } from "../Utils.ts";
import type {
  ProtocolScriptRegExpItem,
  ProtocolScriptRegExpList,
  TypedExpressions,
} from "../../ogone.main.d.ts";

interface StyleOptions {
  vars: { [k: string]: string | StyleOptions["vars"] }
}
class TokenREGEX implements ProtocolScriptRegExpItem {
  public name?: string;
  public close?: ProtocolScriptRegExpItem['close'] = false;
  public open?: ProtocolScriptRegExpItem['open'] = false;
  constructor(public reg: ProtocolScriptRegExpItem['reg'], public id: ProtocolScriptRegExpItem['id']) {}
}
export default class Style extends Utils {
  private static readonly tokens: ProtocolScriptRegExpList = [
    new TokenREGEX(/(?<=\:)(?<value>.+?)(?:(\;|\}))/, () => ''),
    new TokenREGEX(/(?<=\d+_block|^|\;)(?<selector>[^;]+?)(?<rules>\d+_block)/, () => ''),
    new TokenREGEX(/(\b@export)(\s+const\b)/, () => ''),
    new TokenREGEX(/(\b@const\b)/, () => ''),
    new TokenREGEX(/(\.{3})([^\s;\},]+?)(?:\s|;|\}|,)/, () => ''),
  ];
  /**
   * use this method to transform the style of the components
   * @param css {string}
   * @param opts {StyleOptions}
   */
  public transform(css: string, opts: StyleOptions): string {
    const typedExpressions = getTypedExpression();
    const expressions = {};
    let result = read({
      value: css,
      expressions,
      typedExpressions,
      array: notParsedElements
        .concat(elements),
    });
    return result;
  }
}