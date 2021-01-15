import gen from "./generator.ts";
import type { ProtocolScriptRegExpList } from "../src/ogone.main.d.ts";

const tokens: ProtocolScriptRegExpList = [
  {
    name: "block",
    open: "[",
    reg: /\[([^\[\]])+\]/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `${gen.next().value}_array`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "]",
  },

  {
    name: "parentheses",
    open: "(",
    reg: /\(([^\(\)])*\)/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `${gen.next().value}_parenthese`;
      if (expressions) expressions[id] = value;
      if (typedExpressions && typedExpressions.parentheses) typedExpressions.parentheses[id] = value;
      return id;
    },
    close: ")",
  },
  {
    name: "block",
    open: "{",
    reg: /\{([^\{\}])*\}/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `${gen.next().value}_block`;
      if (expressions) expressions[id] = value;
      if (typedExpressions && typedExpressions.blocks) typedExpressions.blocks[id] = value;
      return id;
    },
    close: "}",
  },
];

export default tokens;
