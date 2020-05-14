export default function renderInvalidation(typedExpressions, expressions, str) {
  let result = str.replace(
    /(chainedLine\d*§{2})\s*(§{2}keyword)/gi,
    "$1§§endExpression0§§$2",
  )
    .replace(/(§{2})(\})/gi, "$1§§endExpression0§§$2");
  result.split(/(§{2}(endLine|endPonctuation|endExpression)\d+§{2})/gi)
    .filter((exp) => {
      return exp.length && exp.indexOf("endLine") < 0 && (
        exp.indexOf("operatorsetter") > -1 ||
        exp.indexOf("operatorDoubleIncrease") > -1 ||
        exp.indexOf("operatorDoubleDecrease") > -1 ||
        exp.match(
          /(§{2}keywordThis\d*§{2})\s*(§{2}identifier\d*§{2})\s*(§{2}chainedLine\d*§{2})+/,
        ) ||
        exp.match(
          /(§{2}keywordThis\d*§{2})\s*(§{2}identifier\d*§{2})\s*(§{2}arrayModifier\d*§{2})+/,
        ) ||
        (exp.indexOf("arrayModifier") > -1 && exp.indexOf("keywordThis") > -1)
      );
    })
    .map((exp) => {
      const key = Object.keys(typedExpressions.setters).find((key) =>
        exp.indexOf(key) > -1
      );
      if (!key) return;
      const name = key && key.startsWith("§§array")
        ? key
        : `'${expressions[key].replace(/(§{2}ponctuation\d*§{2})/, "")}'` || "";
      result = result.replace(
        exp,
        `${exp.replace(/(§§endPonctuation\d+§§)$/, "")}; ____(${name}, this)`,
      );
    });
  return result;
}
