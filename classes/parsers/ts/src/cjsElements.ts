import gen from "./generator.ts";
import { CustomScriptRegExpProtocol, TypedExpressions } from "../../../../.d.ts";

const cjs: CustomScriptRegExpProtocol = [
  {
    open: false,
    reg: /(§{2}keywordRequire\d+§{2})\s*(§{2}parenthese\d+§{2})/,
    id: (
      value: string,
      matches: RegExpMatchArray,
      typedExpressions: TypedExpressions,
      expressions: any,
    ) => {
      const id = `§§keywordRequire${gen.next().value}§§`;
      const strKey = expressions[matches[2]];
      const str = expressions[strKey.replace(/[\(\)]/gi, "")].replace(
        /['"`]/gi,
        "",
      );
      typedExpressions.require.push(str);
      expressions[id] = value;
      return id;
    },
    close: false,
  },
];
export default cjs;
