import gen from "./generator.ts";
import type {
  ProtocolScriptRegExpList,
} from "../.d.ts";

const modifiers: ProtocolScriptRegExpList = [
  {
    name: "abstract class",
    open: false,
    reg:
      /(\babstract\b)\s*(§{2}keywordClass\d+§{2})/i,
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
