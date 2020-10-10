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
      /(\.)(push|splice|pop|reverse|fill|copyWithin|shift|unshift|sort|set)(<parenthese\d+>)/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `<arrayModifier${gen.next().value}>`;
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
    reg: /(§{2})(identifier\d+)(§{2})\s*(<parenthese\d+>)/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§method${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /(\+|\-)\s*(§{2})(string\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§concatString${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /(§{2})(identifier\d+)(§{2})\s*(<parenthese\d+>)/,
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
      /(\bfunction\b)(\s)*([^§\s])+(\s)*(<parenthese\d+>)([\s\n])*(<block\d+>)/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§functionDeclaration${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /([^§\s\(])+\s*(<parenthese\d+>)/,
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
      /\n+\s*(§{2})((operator|arrayModifier|method)\d+)(§{2})/,
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
      /(§{2})((operator|arrayModifier|method)\d+)(§{2})\s*\n+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§chainedLine${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /(§{2})(chainedLine\d+)(§{2})\s*\n+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§chainedLine${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
];
export default computed;
