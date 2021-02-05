import getTypedExpression from "../../utils/typedExpressions.ts";
import elements from "../../utils/elements.ts";
import notParsedElements from "../../utils/not-parsed.ts";
// import forceInlineElements from "../../utils/forceInlineElements.ts";
import getDeepTranslation from "../../utils/template-recursive.ts";
import read from "../../utils/agnostic-transformer.ts";
import { Utils } from "./Utils.ts";
import type {
  Expressions,
  ProtocolScriptRegExpList,
  TypedExpressions,
} from "../ogone.main.d.ts";
import RegExpTransformable from "./RegExpTransformable.ts";

export default class DenoEnv extends Utils {
  /**
   * use this method to transform the DenoEnv of the components
   * @param css {string}
   * @param opts {DenoEnvOptions}
   */
  public static transform(file: string): string {
    if (!file.match(/(?<=(@)(json|md|yml){0,1})(\{)/)) return file;
    const typedExpressions = getTypedExpression();
    const expressions: Expressions = {};
    let result = read({
      value: file,
      expressions,
      typedExpressions,
      array: notParsedElements.concat(elements.filter((item) => item.name === 'block')),
    });
    Object.entries(expressions)
      .forEach(([key, value]: string[]) => {
        if (key.endsWith('_string')) {
          expressions[key] = read({
            value,
            expressions,
            typedExpressions,
            array: [
              {
                reg: /(?<=(@)(json|md|yml){0,1})(?<value>\d+_block)/,
                open: false,
                close: false,
                id: (value, matches) => {
                  result = value;
                  console.warn(matches);

                  return getDeepTranslation(result, expressions);
                },
              }
            ],
          }) as string;
        }
      });
    return result;
  }
}
