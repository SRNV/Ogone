import gen from "./generator.ts";
import getDeepTranslation from ".//template-recursive.ts";
import type { TypedExpressions } from "../.d.ts";

export default function parseCases(
  typedExpressions: TypedExpressions,
  expressions: any,
  str: string,
): string {
  let str2: string = str;
  let result: string[] | null;
  const reg: RegExp = /(?<=(case\s*))(([^\:]*)+)(?=:)/gi;
  // preserve truth
  // is required because (0 ? 0 : 1)
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
    result = result.map((s) => {
      let sr = s;
      sr = getDeepTranslation(sr, expressions).trim();
      return sr;
    });
    typedExpressions.switch.cases.push(...result);
  }
  typedExpressions.switch.default = !!str2.match(/default([\s\n])*\:/);
  return str2;
}
