import gen from "../ts/src/generator.ts";
import type { ProtocolScriptRegExpList } from "../../../.d.ts";
import getDeepTranslation from "../../../utils/template-recursive.ts";

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
      const id = `§§keywordThis1§§`;
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
      const id = `§§keywordUse1§§`;
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
      const id = `§§keywordRequire1§§`;
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
      const id = `§§keywordAs1§§`;
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
      const id = `§§spread1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: ".",
  },
  {
    open: ".",
    reg: /\./,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§ponctuation1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: ".",
  },
  {
    open: false,
    reg: /\b(default)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordDefault1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(abstract)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordAbstract1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(static)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordStatic1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(private)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordPrivate1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(protected)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordProtected1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(readonly)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordReadonly1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(public)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordPublic1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(do)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordDo1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(with)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordWith1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(interface)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordInterface1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(while)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordWhile1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(else\s+if)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordElseIf${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(if)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordIf1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(else)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordElse1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(for)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordFor1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(async)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordAsync1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(await)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordAwait1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(function)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordFunction1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(switch)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordSwitch1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(return)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordReturn1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(yield)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordYield1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(case)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordCase1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(new)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordNew1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(break)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordBreak1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(const)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordConst1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(let)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordLet1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(import)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordImport1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(export)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordExport1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(class)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordClass1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(extends)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordExtends1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(from)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordFrom1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(delete)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordDelete1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\b(type)\b/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordType1§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: "=",
    reg: /\s*(=>)\s*/,
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
