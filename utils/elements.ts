import gen from "./generator.ts";
import type { ProtocolScriptRegExpList } from "../.d.ts";

const tokens: ProtocolScriptRegExpList = [
  {
    open: "!",
    reg: /\!/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operatorNegative1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "!",
  },
  {
    open: "&",
    reg: /\&\&/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operatorAnd1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "&",
  },
  {
    open: "|",
    reg: /\|\|/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operatorOr1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "|",
  },
  {
    open: "=",
    reg: /\={3}/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operator3equal1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "=",
  },
  {
    open: "=",
    reg: /\={2}/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operator2equal1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "=",
  },

  {
    open: "+",
    reg: /\s+\+\=([\s\n]*)+/i,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operatorsetter${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "=",
  },
  {
    open: "+",
    reg: /\+{2}/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operatorDoubleIncrease1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "+",
  },
  {
    open: "+",
    reg: /\+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operator1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "+",
  },
  {
    open: "-",
    reg: /\s+\-\=([\s\n]*)+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operatorsetter${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "=",
  },
  {
    open: "-",
    reg: /\-{2}/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operatorDoubleDecrease1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "-",
  },
  {
    open: "-",
    reg: /\-/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operator1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "-",
  },
  {
    open: "=",
    reg: /\s+\=([\s\n]*)+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operatorsetter${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "=",
  },
  {
    open: "?",
    reg: /\?/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§option1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "?",
  },
  {
    open: ":",
    reg: /\:/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§optionDiviser1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: ":",
  },
  {
    name: "block",
    open: "[",
    reg: /\[([^\[\]])+\]/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§array${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "]",
  },

  {
    open: ";",
    reg: /\;/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§endPonctuation1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: ";",
  },
  {
    name: "parentheses",
    open: "(",
    reg: /\(([^\(\)])*\)/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§parenthese${gen.next().value}§§`;
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
      const id = `§§block${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      if (typedExpressions && typedExpressions.blocks) typedExpressions.blocks[id] = value;
      return id;
    },
    close: "}",
  },
  {
    name: "endLine",
    open: false,
    reg: /\n+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§endLine0§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
];

export default tokens;
