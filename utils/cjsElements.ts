import gen from "./generator.ts";
import type {
  ProtocolScriptRegExpList,
  TypedExpressions,
} from "../.d.ts";

const cjs: ProtocolScriptRegExpList = [
  {
    open: false,
    reg: /(§{2}keywordRequire\d+§{2})\s*(§{2}parenthese\d+§{2})/,
    id: (
      value,
      matches,
      typedExpressions,
      expressions,
    ) => {
      if (!expressions || !typedExpressions || !matches) {
        throw new Error("matches, expressions or typedExpressions are missing");
      }
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
