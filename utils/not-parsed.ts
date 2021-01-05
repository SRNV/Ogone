import gen from "./generator.ts";
import type {
  ProtocolScriptRegExpList,
} from "../.d.ts";

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
      const id = `${gen.next().value}_comment`;
      if (expressions) expressions[id] = value;
      return " ".repeat(value.length);
    },
  },
  {
    name: 'comment',
    open: "//",
    reg: /(?<!\:)\/\/([^\n])+(?:\n)/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `${gen.next().value}_comment`;
      if (expressions) expressions[id] = value;
      return " ".repeat(value.length -1)  + '\n';
    },
    close: "/",
  },
  // comments not erased
  {
    name: 'comment_saved',
    split: ["/*", "*/"],
    splittedId: (value, expressions) => {
      const id = `${gen.next().value}_comment`;
      if (expressions) expressions[id] = value;
      return id;
    },
  },
  {
    name: 'comment_saved',
    open: "//",
    reg: /(?<!\:)\/\/([^\n])+\n/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `${gen.next().value}_comment`;
      if (expressions) expressions[id] = value;
      return id;
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
