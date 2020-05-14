export default function renderSetterExpression(
  typedExpressions,
  expressions,
  str,
) {
  let result = str;
  const reg = /(§§keywordThis\d+§§)\s*(§§(identifier||array)\d+§§)/gi;
  const matches = result.match(reg);
  if (!matches) return result;
  matches.forEach((input) => {
    const match = input.match(
      /(§§keywordThis\d+§§)\s*(§§(identifier||array)\d+§§)/,
    );
    const key = match[2];
    const value = expressions[key];
    typedExpressions.setters[key] = value;
  });
  return result;
}
