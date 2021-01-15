import gen from "../generator.ts";
import getDeepTranslation from "../template-recursive.ts";
import type { ProtocolScriptRegExpList } from "../../src/ogone.main.d.ts";
const items: ProtocolScriptRegExpList = [
  // use syntax
  // use @/path/to/comp.o3 as element-name
  // use relative path
  {
    // parse missing string
    name: "declarations",
    open: false,
    reg:
      /(use)\s+(.*?)(\s+as\s+)/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      throw new Error(
        `use syntax is no more supported, please use a default import instead: import MyComponent from 'path/to/component.o3'\ninput: ${value}`,
      );
    },
    close: false,
  },
];

export default items;
