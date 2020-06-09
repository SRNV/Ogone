export default function renderExpressions(
  typedExpressions,
  expressions,
  elements,
  str,
  name,
) {
  let result = str.replace(/\}/gi, "\n}").replace(/(\{)(\w)/, "$1\n$2");
  elements.forEach((item) => {
    if (name && !item.name) return;
    if (name && item.name && name !== item.name) return;
    if (item.open && item.close) {
      while (
        result.indexOf(item.open) > -1 && result.indexOf(item.close) > -1 &&
        result.match(item.reg)
      ) {
        const matches = result.match(item.reg);
        const value = matches[0];
        result = result.replace(
          item.reg,
          item.id(value, matches, typedExpressions, expressions),
        );
      }
      return;
    }
    if (item.open === false && item.close === false) {
      while (result.match(item.reg)) {
        const matches = result.match(item.reg);
        const value = matches[0];
        result = result.replace(
          item.reg,
          item.id(value, matches, typedExpressions, expressions),
        );
      }
    }
    if (item.split) {
      while (
        result.indexOf(item.split[0]) > -1 &&
        result.indexOf(item.split[1]) > -1
      ) {
        const exp = result.split(item.split[0])[1];
        const result = `${item.split[0]}${exp.split(item.split[1])[0]}${
          item.split[1]
        }`;
        result = result.replace(result, item.id(result));
      }
    }
  });
  return result;
}
