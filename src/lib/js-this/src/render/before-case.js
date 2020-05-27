import { YAML } from "https://raw.githubusercontent.com/eemeli/yaml/master/src/index.js";

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
    while (Object.keys(expressions).find((k) => data.indexOf(k) > -1)) {
      const key = Object.keys(expressions).find((k) => data.indexOf(k) > -1);
      const index = data.indexOf(key);
      const firstPart = data.substring(0, index);
      const secondPart = data.substring(index + key.length, data.length);
      data = `${firstPart}${expressions[key]}${secondPart}`;
    }
    if (m.trim() === "before-each") {
      typedExpressions.switch.before.each = data;
    } else {
      typedExpressions.switch.before.cases[before] = data;
    }
  });
  return result;
}