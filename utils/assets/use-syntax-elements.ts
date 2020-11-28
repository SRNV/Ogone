import gen from "../generator.ts";
import getDeepTranslation from "../template-recursive.ts";
import type { ProtocolScriptRegExpList } from "../../.d.ts";
const items: ProtocolScriptRegExpList = [
  // use syntax
  // use @/path/to/comp.o3 as element-name
  // use relative path
  {
    name: "declarations",
    open: false,
    reg:
      /(use)\s+((\.)([^\s]*)+)\s+(as)\s*(\<string\d+\>)\s*;*/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `use${gen.next().value}`;
      let path = getDeepTranslation(matches[2], expressions);
      path = getDeepTranslation(path, expressions).trim();
      if (typedExpressions) {
        typedExpressions.use[id] = {
          path,
          as: expressions[matches[6]],
          type: "relative",
        };
      }
      return "";
    },
    close: false,
  },
  // use absolute path
  {
    name: "declarations",
    open: false,
    reg:
      /(use)\s+((\@\/)(.*?))\s+(as)\s*(\<string\d+\>)\s*(;){0,1}/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `use${gen.next().value}`;
      let path = matches[4];
      path = getDeepTranslation(path, expressions);
      if (typedExpressions) {
        typedExpressions.use[id] = {
          path,
          as: expressions[matches[6]],
          type: "absolute",
        };
      }
      return "";
    },
    close: false,
  },
  // use remotes components
  {
    name: "declarations",
    open: false,
    reg:
      /(use)\s+((https|http)(\:\/{2})([^\s]*)+)\s+(as)\s*(\<string\d+\>)\s*;*/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§use${gen.next().value}§§`;
      let path = getDeepTranslation(matches[2], expressions);
      if (typedExpressions) {
        typedExpressions.use[id] = {
          path,
          as: expressions[matches[7]],
          type: "remote",
        };
      }
      return "";
    },
    close: false,
  },
  {
    // parse missing string
    name: "declarations",
    open: false,
    reg:
      /(use)\s+(\@\/)(.*?)(\s+as\s+)/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      console.warn(value, matches)
      throw new Error(
        "please follow this pattern for use expression: use <path> as <string>\n\n",
      );
    },
    close: false,
  },
];

export default items;
