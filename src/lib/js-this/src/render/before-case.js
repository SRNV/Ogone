import computedExp from "../../src/computed.js";
import renderExpressions from "../../src/render/renderExpressions.js";
import renderComputed from "../../src/render/computed.js";
import renderNullifiedValues from "../../src/render/renderNullifiedValues.js";
import elements from "../../src/elements.js";
import o3 from "../../src/render/o3-syntax-render.js";
import templateReplacer from "../../../../../utils/template-recursive.ts";

export default function beforeCase(
  typedExpressions,
  expressions,
  prog,
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
    } else {
      typedExpressions.switch.before.cases[before] = data;
    }
  });
  return result;
}
