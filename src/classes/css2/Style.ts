import getTypedExpression from "../../../utils/typedExpressions.ts";
import elements from "../../../utils/elements.ts";
import notParsedElements from "../../../utils/not-parsed.ts";
import forceInlineElements from "../../../utils/forceInlineElements.ts";
import getDeepTranslation from "../../../utils/template-recursive.ts";
import read from "../../../utils/agnostic-transformer.ts";
import { Utils } from "../Utils.ts";
import type {
  ProtocolScriptRegExpList,
  TypedExpressions,
} from "../../ogone.main.d.ts";

interface StyleOptions {
  vars: { [k: string]: string | StyleOptions["vars"] }
}
export default class Style extends Utils {
  private static readonly tokens: ProtocolScriptRegExpList = [
    {
      name: 'rule_value',
      open: false,
      close: false,
      reg: /(?<=\:)(?<value>.+?)(?:(\;|\}))/,
    },
    {
      name: 'selector',
      open: false,
      close: false,
      // |;|} selector { rules }
      reg: /(?<=\d+_block|^|\;)(?<selector>[^;]+?)(?<rules>\d+_block)/,
    },
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