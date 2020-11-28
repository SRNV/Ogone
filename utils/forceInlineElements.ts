import gen from "./generator.ts";
import type { ProtocolScriptRegExpList } from "../.d.ts";

const computed: ProtocolScriptRegExpList = [
  {
    open: false,
    reg: /\n+\s*(\&|\+|\<|\>|\||\=|\?|\:|\.)+/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!matches) return '';
      const [, sign] = matches;
      const id = `<sign${gen.next().value}> ${sign} `;
      if (expressions) expressions[id] = value;
      return `${sign}`;
    },
    close: false,
  },
  {
    open: false,
    reg: /(\&|\+|\<(?!\w+\d+>)|(?<!\<\w+\d+)\>|\||\=|\?|\:|\.)+\s*\n+/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!matches) return '';
      const [, sign] = matches;
      const id = `<sign${gen.next().value}> ${sign} `;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
];
export default computed;
