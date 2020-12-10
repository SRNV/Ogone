import gen from "./generator.ts";
import type { ProtocolScriptRegExpList } from "../.d.ts";

const computed: ProtocolScriptRegExpList = [
  {
    open: false,
    reg: /\n+\s*(\&|\+|\<|\>|\||\=|\?|\:|\.)+/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!matches) return '';
      const [, sign] = matches;
      const id = `${gen.next().value}_sign ${sign} `;
      if (expressions) expressions[id] = value;
      return `${sign}`;
    },
    close: false,
  },
  {
    open: false,
    reg: /(\&|\+|(?!\d+_\w+)|(?<!\d+_\w+)|\||\=|\?|\:|\.)+\s*\n+/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!matches) return '';
      const [, sign] = matches;
      const id = `${gen.next().value}_sign ${sign} `;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
];
export default computed;
