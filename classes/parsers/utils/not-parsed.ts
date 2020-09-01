import gen from "../ts/src/generator.ts";
import {
  ProtocolScriptRegExpList,
  TypedExpressions,
} from "../../../.d.ts";

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
      const id = `§§string${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  // end annulations
  {
    split: ["/*", "*/"],
    splittedId: (value, expressions) => {
      const id = `§§comment${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return "";
    },
  },
  {
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
