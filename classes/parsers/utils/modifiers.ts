import gen from "../ts/src/generator.ts";
import type {
  ProtocolScriptRegExpList,
} from "../../../.d.ts";

const modifiers: ProtocolScriptRegExpList = [
  {
    name: "async functions",
    open: false,
    reg: /(§{2}keywordAsync\d+§{2})\s*(§{2}keywordFunction\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordFunction${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    name: "abstract class",
    open: false,
    reg:
      /(§{2}keywordAbstract\d+§{2})\s*(§{2}keywordClass\d+§{2})/i,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§keywordClass${gen.next().value}§§`;
      expressions[id] = value;
      return id;
    },
    close: false,
  },
];
export default modifiers;
