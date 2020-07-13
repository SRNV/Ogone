import computedExp from "../computed.ts";
import renderExpressions from "./renderExpressions.ts";
import renderComputed from "./computed.ts";
import renderNullifiedValues from "./renderNullifiedValues.ts";
import elements from "../elements.ts";
import o3 from "./o3-syntax-render.ts";
import templateReplacer from "../../../../../utils/template-recursive.ts";
import {
  CustomScriptRegExpProtocol,
  TypedExpressions,
} from "../../../../../.d.ts";

export default function beforeCase(
  typedExpressions: TypedExpressions,
  expressions: any,
  prog: string,
) {
  let result = prog;
  const matches = prog.match(/([^\n\r]+){0,1}(before-(each|case\s[^\:]+))/gi);
  if (!matches) return result;
  const p = prog.split(/(def|case[^:]+|default|before\s*[^:]+)\s*\:/gi);
  matches.forEach((m) => {
    let data = p.find((el, i, arr) => arr[i - 1] && arr[i - 1] === m.trim());
    let before = p.find((el, i, arr) => arr[i + 1] && arr[i + 1] === data);
    const content = `${m}:${data}`;
    result = result.replace(content, "");
    // reflection
    data = renderNullifiedValues(typedExpressions, expressions, data);
    data = renderExpressions(
      typedExpressions,
      expressions,
      elements,
      data,
    );

    data = renderComputed(typedExpressions, expressions, computedExp, data);
    // data = renderSetterExpression(typedExpressions, expressions, data);
    data = data.replace(
      /((chainedLine|parenthese|array|functionCall)\d*§{2})\s*(§{2}keyword)/gi,
      "$1§§endExpression0§§$3",
    );
    data = o3(typedExpressions, expressions, data);
    data = templateReplacer(data, expressions);
    if (m.trim() === "before-each") {
      typedExpressions.switch.before.each = data;
    } else if (before) {
      typedExpressions.switch.before.cases[before] = data;
    }
  });
  return result;
}
