import gen from "./generator.ts";
import type { ProtocolScriptRegExpList } from "../.d.ts";

const computed: ProtocolScriptRegExpList = [
  {
    open: false,
    reg: /\n+\s*(\&|\+|\<|\>|\||\=|\?|\:|\.)+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `<sign${gen.next().value}>`;
      if (expressions) expressions[id] = value;
      if (!matches) return id;
      const [, sign] = matches;
      return `${sign}`;
    },
    close: false,
  },
  {
    open: false,
    reg: /(\&|\+|\<|\>|\||\=|\?|\:|\.)+\s*\n+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `<sign${gen.next().value}>`;
      if (expressions) expressions[id] = value;
      if (!matches) return id;
      const [, sign] = matches;
      return `${sign}`;
    },
    close: false,
  },
];
export default computed;
