import type { ProtocolScriptRegExpList } from "../../.d.ts";
let rid = 0;

const items: ProtocolScriptRegExpList = [
  {
    name: "linkCases",
    open: false,
    reg:
      /\s*(\*){0,1}execute\s+(\b(default)\b)\s*(;|\n+)/,
    id: (value, match, typedExpressions, expressions) => {
      if (!expressions || !match) {
        throw new Error("expressions or matches are missing");
      }
      const [inpute, runOnce] = match;
      if (!runOnce) {
        rid++;
        return `_once !== ${rid} ? ____r(0, [], ${rid}) : null; return;`;
      }
      return `____r(0, [], _once || null); return;`;
    },
    close: false,
  },
  {
    name: "linkCases",
    open: false,
    reg: /\s*(\*){0,1}execute\s+(case|default)\s*/,
    id: (value, match, typedExpressions, expressions) => {
      if (!expressions || !match) {
        throw new Error("expressions or matches are missing");
      }
      throw new Error(`
      the following syntax is not supported\n
        please one of those syntaxes:
          execute case 'casename' use [ctx, event];
          execute case 'casename';
          execute default;
        It assumes that cases are strings in proto.
        It can change in the future, do not hesitate to make a pull request on it.
      `);
    },
    close: false,
  },
];

export default items;
