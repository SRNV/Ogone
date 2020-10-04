import gen from "./generator.ts";
import type { ProtocolScriptRegExpList } from "../.d.ts";

const computed: ProtocolScriptRegExpList = [
  {
    open: false,
    reg: /\s*(§{2})(commentLine\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§endLine${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg:
      /(\.)(push|splice|pop|reverse|fill|copyWithin|shift|unshift|sort|set)(§{2})(parenthese\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§arrayModifier${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\.\s*([\w\d]+)+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§identifier${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /(§{2})(identifier\d+)(§{2})\s*(§{2})(parenthese\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§method${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /(§{2})(operator\d+)(§{2})\s*(§{2})(string\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§concatString${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /(§{2})(identifier\d+)(§{2})\s*(§{2})(parenthese\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§method${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg:
      /(\bfunction\b)(\s)*([^§\s])+(\s)*(§{2})(parenthese\d+)(§{2})([\s\n])*(§{2})(block\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§functionDeclaration${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /([^§\s\(])+\s*(§{2})(parenthese\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§functionCall${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg:
      /(§{2})(endLine\d+)(§{2})\s*(§{2})((operator|arrayModifier|method)\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§chainedLine${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg:
      /(§{2})((operator|arrayModifier|method)\d+)(§{2})\s*(§{2})(endLine\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§chainedLine${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /(§{2})(chainedLine\d+)(§{2})\s*(§{2})(endLine\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§chainedLine${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    name: "declare",
    reg: /\bdeclare\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordDeclare${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    name: "declare",
    reg: /(§{2})(keywordDeclare\d+)(§{2})\s*(§{2})(optionDiviser\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§Declaration${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  // before(§§operator\d+§§)each
  {
    open: false,
    reg: /(before(§§operator\d+§§)each)/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordBeforeEach${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
];
export default computed;
