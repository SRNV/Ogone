// @ts-nocheck
import { YAML } from "../../../../deps.ts";
import templateReplacer from "../../../../utils/template-recursive.ts";
import { Utils } from "../../../../classes/utils/index.ts";

export default function (typedExpressions, expressions, prog) {
  let result = prog;
  const matches = prog
    .replace(/([\'\"\`])([^\1]*)+(\1)/gi, "")
    .match(/([^\n\r]+){0,1}(def\s*:)/gi);
  let previousDeclaration = [];
  if (matches) {
    matches.forEach((dec) => {
      if (previousDeclaration.includes(dec.replace(/\s/gi, "").trim())) {
        Utils.error(
          'double declaration of "def:" in component',
        );
      }
      previousDeclaration.push(dec.replace(/\s/gi, "").trim());
      return;
    });
  }
  /**
   * TODO
   * parse when def: is inside a quote ['`"]
   */
  const p = prog.split(/(def|case[^:]+|default|before\s*[^:]+)\s*\:/gi);
  let data = p.find((el, i, arr) => arr[i - 1] && arr[i - 1] === "def");
  if (!data) return result;
  let def = p.find((el, i, arr) => arr[i + 1] && arr[i + 1] === data);
  let previous = data;
  data = templateReplacer(data, expressions);
  const declaration = `${def}:${previous}`;
  const yaml = YAML.parse(data);
  result = result.replace(declaration, "");
  typedExpressions.data = yaml;
  return result;
}