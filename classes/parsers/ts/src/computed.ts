import gen from "./generator.ts";
import { CustomScriptRegExpProtocol } from "../../../../.d.ts";

const computed: CustomScriptRegExpProtocol = [
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
      /(§{2})(ponctuation\d+)(§{2})(push|splice|pop|reverse|fill|copyWithin|shift|unshift|sort|set)(§{2})(parenthese\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§arrayModifier${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /(§{2}ponctuation\d+§{2})([^§\s])+/,
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
      /(§{2})(keywordFunction\d+)(§{2})(\s)*([^§\s])+(\s)*(§{2})(parenthese\d+)(§{2})([\s\n])*(§{2})(block\d+)(§{2})/,
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
];
export default computed;
