import gen from "./generator.ts";
import { ProtocolScriptRegExpList } from "../../../../.d.ts";
import templateReplacer from "../../../../utils/template-recursive.ts";

const tokens: ProtocolScriptRegExpList = [
  {
    open: false,
    reg: /\b([0-9])*(\.){0,1}([0-9])+\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§number${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: "this",
    reg: /\bthis\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordThis${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "this",
  },
  // for o3
  {
    open: "use",
    reg: /\buse\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordUse${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "use",
  },
  // for o3
  {
    open: "require",
    reg: /\brequire\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordRequire${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "require",
  },
  // for o3
  {
    open: "as",
    reg: /\bas\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordAs${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "as",
  },
  // preserve path
  {
    open: false,
    reg: /(\@\/[^\s]+\/{0,1})+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§path${gen.next().value}§§`;
      if (expressions) expressions[id] = value.replace(/\@[\/\\]/, "");
      return id;
    },
    close: false,
  },
  {
    open: "...",
    reg: /\.{3}/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§spread${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: ".",
  },
  {
    open: ".",
    reg: /\./,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§ponctuation${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: ".",
  },
  {
    open: false,
    reg: /\b(default)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordDefault${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(while)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordWhile${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(if)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordIf${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(for)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordFor${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(async)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordAsync${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(await)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordAwait${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(function)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordFunction${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(switch)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordSwitch${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(return)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordReturn${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(yield)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordYield${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(case)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordCase${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(new)(\s|\b){0,1}/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordNew${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(break)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordBreak${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(const)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordConst${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(let)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordLet${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(import)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordImport${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(export)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordExport${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(class)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordClass${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(extends)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordExtends${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(from)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordFrom${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(delete)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordDelete${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: "=",
    reg: /\s(=>)\s/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§arrowFunction${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: ">",
  },
  {
    open: "!",
    reg: /\!(\=){1,2}/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§different${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "=",
  },
  {
    open: "!",
    reg: /\!/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operatorNegative${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "!",
  },
  {
    open: "\${",
    reg: /\$\{([^(\$\{\}]*)+\}/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§template${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "}",
  },
  {
    open: "&",
    reg: /\&\&/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operatorAnd${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "&",
  },
  {
    open: "|",
    reg: /\|\|/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operatorOr${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "|",
  },
  {
    open: "=",
    reg: /\={3}/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operator3equal${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "=",
  },
  {
    open: "=",
    reg: /\={2}/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operator2equal${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "=",
  },

  {
    open: "+",
    reg: /([\s]*)+\+\=([\s\n]*)+/,
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
      const id = `§§operatorDoubleIncrease${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "+",
  },
  {
    open: "+",
    reg: /\+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operator${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "+",
  },
  {
    open: "-",
    reg: /([\s]*)+\-\=([\s\n]*)+/,
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
      const id = `§§operatorDoubleDecrease${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "-",
  },
  {
    open: "-",
    reg: /\-/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§operator${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "-",
  },
  {
    open: "=",
    reg: /([\s]*)+\=([\s\n]*)+/,
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
      const id = `§§option${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: "?",
  },
  {
    open: ":",
    reg: /\:/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§optionDiviser${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: ":",
  },
  {
    name: "block",
    open: "[",
    reg: /\[([^\[\]]*)+\]/,
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
      const id = `§§endPonctuation${gen.next().value}§§`;
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
      if (typedExpressions) typedExpressions.parentheses[id] = value;
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
      if (typedExpressions) typedExpressions.blocks[id] = value;
      return id;
    },
    close: "}",
  },
  {
    name: "endLine",
    open: false,
    reg: /([\n\r])+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§endLine${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
];

export default tokens;
