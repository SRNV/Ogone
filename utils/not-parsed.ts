import gen from "./generator.ts";
import type {
  ProtocolScriptRegExpList,
} from "../src/ogone.main.d.ts";

const nullish: ProtocolScriptRegExpList = [
  // strings
  {
    open: false,
    reg: /(?<!\\)\$\{(.*?)(?<!\\)\}/i,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§template${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /(?<!\\)(["'`])(.*?)(?<!\\)\1/i,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `${gen.next().value}_string`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  // end annulations
  {
    name: 'comment',
    split: ["/*", "*/"],
    splittedId: (value, expressions) => {
      const id = `§§comment0§§`;
      if (expressions) expressions[id] = value;
      return "";
    },
  },
  {
    name: 'comment',
    open: "//",
    reg: /(?<!\:)\/\/([^\n])+\n/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§commentLine${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return "";
    },
    close: "/",
  },
  {
    open: false,
    reg: /(:?\s)(\/)(.+?)(?<!\\)(\/)(\w+){0,1}/i,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§regexp${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
];
export default nullish;
