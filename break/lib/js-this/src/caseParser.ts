import gen from "./generator.js";

export default function parseCases(
  typedExpressions: any,
  expressions: any,
  str: string,
): string {
  let str2: string = str;
  let result: string[] | null;
  const reg: RegExp = /(?<=(case\s*))(([^\:]*)+)(?=:)/gi;
  // preserve truth
  // is required because (0 ? 0 : 1) expressions the : character
  const regT: RegExp = /\?([^\:]*)+:/;

  while (str2.match(regT)) {
    const match = str2.match(regT);
    if (match) {
      const [input, point, value] = match;
      const key = `§§leftMemberTern${gen.next().value}§§`;
      expressions[key] = input;
      str2 = str2.replace(input, key);
    }
  }
  // get the matching cases
  result = str2.match(reg);
  if (result) {
    const keys = Object.keys(expressions);
    result = result.map((s) => {
      let sr = s;
      while (
        keys.find((key) =>
          sr.indexOf(key) > -1 &&
          (sr = sr.replace(key, expressions[key]).trim())
        )
      ) {
      }
      return sr;
    });
    typedExpressions.switch.cases.push(...result);
  }
  typedExpressions.switch.default = !!str2.match(/default([\s\n])*\:/);
  return str2;
}
