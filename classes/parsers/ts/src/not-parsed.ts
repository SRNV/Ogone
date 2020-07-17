import gen from "./generator.ts";
import {
  ProtocolScriptRegExpList,
  TypedExpressions,
} from "../../../../.d.ts";

const nullish: ProtocolScriptRegExpList = [
  // strings
  {
    pair: true,
    open: '"',
    reg: /\"([^"])*\"/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§string${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: '"',
  },
  {
    open: '\"',
    reg: /\\\"([^"]*)+\\\"/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§escapedstring${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: '\"',
  },
  {
    pair: true,
    open: "'",
    reg: /\'([^']*)+\'/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§string${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "'",
  },
  {
    pair: true,
    open: "\'",
    reg: /\\\'([^']*)+\\\'/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§escapedstring${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "\'",
  },
  {
    pair: true,
    open: "`",
    reg: /\`([^`]*)+\`/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§string${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "`",
  },
  {
    pair: true,
    open: "\`",
    reg: /\\\`([^`]*)+\\\`/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§escapedstring${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "\`",
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
];
export default nullish;
