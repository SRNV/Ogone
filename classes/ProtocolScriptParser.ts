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
import { Utils } from "./Utils.ts";
import type {
  TypedExpressions,
  ProtocolScriptRegExpList,
  ProtocolScriptParserOptions,
  ProtocolScriptParserReturnType,
} from "../.d.ts";

// TODO clean code

/**
 * @name ProtocolScriptParser
 * @code OPSP
 * @code OPSP-OCS1-OC0
 * @code OPSP-OIA3
 * @code OPSP-OSB4
 * @description
 * class to parse custom script for Ogone
 * this class will parse the setters statements
 * and add some features like: reflections, execute default, before-each statement, def's Area
 */
export default class ProtocolScriptParser extends Utils {
  public read(
    opts: {
      typedExpressions: TypedExpressions;
      expressions: any;
      value: string;
      name?: string;
      array: ProtocolScriptRegExpList;
      before?: (str: string) => string;
    },
  ) {
    const {
      typedExpressions,
      expressions,
      value,
      name,
      array,
      before,
    } = opts;
    let result: string = before ? before(value) : value;
    array.forEach((item) => {
      if (name && !item.name) return;
      if (name && item.name && name !== item.name) return;
      if (item.open && item.close && item.id && item.pair) {
        while (
          // we need to parse if the character is alone or not
          // no need to change it if it's not
          !((result.split(item.open as string).length - 1) % 2) &&
          result.indexOf(item.open as string) > -1 &&
          result.indexOf(item.close as string) > -1 &&
          result.match(item.reg as RegExp)
        ) {
          const matches = result.match(item.reg as RegExp);
          const value = matches ? matches[0] : null;
          if (matches && value) {
            result = result.replace(
              item.reg as RegExp,
              item.id(value, matches, typedExpressions, expressions),
            );
          }
        }
        return;
      }
      if (item.open && item.close && item.id && !item.pair) {
        while (
          result.indexOf(item.open as string) > -1 &&
          result.indexOf(item.close as string) > -1 &&
          result.match(item.reg as RegExp)
        ) {
          const matches = result.match(item.reg as RegExp);
          const value = matches ? matches[0] : null;
          if (matches && value) {
            result = result.replace(
              item.reg as RegExp,
              item.id(value, matches, typedExpressions, expressions),
            );
          }
        }
        return;
      }
      if (item.open === false && item.close === false && item.id) {
        while (result.match(item.reg as RegExp)) {
          const matches = result.match(item.reg as RegExp);
          const value = matches ? matches[0] : null;
          if (matches && value) {
            result = result.replace(
              item.reg as RegExp,
              item.id(value, matches, typedExpressions, expressions),
            );
          }
        }
      }
      if (item.split && item.splittedId) {
        while (result.indexOf(item.split[0]) > -1
          && result.indexOf(item.split[1]) > -1
          && result.indexOf(item.split[0]) < result.indexOf(item.split[1])) {
          const part1 = result.substring(
            result.indexOf(item.split[0]),
            result.indexOf(item.split[1]) + 2,
          );
          result = result.replace(part1, item.splittedId(result, expressions));
        }
      }
    });
    return result;
  }
  public parse(
    str: string,
    opts: ProtocolScriptParserOptions,
  ): ProtocolScriptParserReturnType {
    let typedExpressions = getTypedExpression();

    let expressions = {
      "§§endExpression0§§": "\n",
    };
    let prog = `\n${str}`;
    prog = this.read({
      array: notParsedElements,
      expressions,
      value: prog,
      typedExpressions,
    });

    prog = this.read({
      array: elements,
      value: prog,
      typedExpressions,
      expressions,
      before: (str) => str.replace(/\}/gi, "\n}").replace(/(\{)(\w)/, "$1\n$2"),
    });
    if (opts && opts.cjs) {
      prog = this.read({
        array: cjsElements,
        value: prog,
        typedExpressions,
        expressions,
        before: (str) =>
          str.replace(/\}/gi, "\n}").replace(/(\{)(\w)/, "$1\n$2"),
      });
    }

    if (opts && opts.esm) {
      prog = this.read({
        array: esmElements,
        value: prog,
        typedExpressions,
        expressions,
      });
    }

    // finally replace all keys
    prog = getDeepTranslation(prog, expressions);
    return {
      value: prog,
      body: typedExpressions,
    };
  }
}
