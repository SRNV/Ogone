import gen from "./generator.ts";
import type { ProtocolScriptRegExpList } from "../.d.ts";

const tokens: ProtocolScriptRegExpList = [
  {
    open: false,
    reg: /(;|\n+)\s*(§{2}string\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `chainedString${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
];

export default tokens;
