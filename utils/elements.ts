import gen from "./generator.ts";
import type { ProtocolScriptRegExpList } from "../.d.ts";

const tokens: ProtocolScriptRegExpList = [
  {
    name: "block",
    open: "[",
    reg: /\[([^\[\]])+\]/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `<array${gen.next().value}>`;
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
      const id = `<parenthese${gen.next().value}>`;
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
      const id = `<block${gen.next().value}>`;
      if (expressions) expressions[id] = value;
      if (typedExpressions && typedExpressions.blocks) typedExpressions.blocks[id] = value;
      return id;
    },
    close: "}",
  },
];

export default tokens;
