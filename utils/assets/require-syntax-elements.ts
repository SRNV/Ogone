import getDeepTranslation from "../template-recursive.ts";
import type { ProtocolScriptRegExpList, MapIndexable } from "../../.d.ts";

const items: ProtocolScriptRegExpList = [
  // require syntax
  // require prop as constructor || any
  // require prop1, prop2 as constructor[]
  {
    name: "declarations",
    open: false,
    reg:
      /(require)\s+([^\§\(]*)+(as)\s+(.*?)(;|\n+)/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches || !typedExpressions) {
        throw new Error("expressions or matches are missing");
      }
      const isAlreadyRequired = typedExpressions.properties.find(
        ([key]) => key === matches[2],
      );
      if (isAlreadyRequired) {
        throw new Error(
          `property ${matches[2]} is already required in component`,
        );
      }
      const type = getDeepTranslation(matches[4], expressions);
      const array = matches[2].split(",");
      if (array.length === 1) {
        typedExpressions.properties.push([array[0].trim(), [type]]);
      } else {
        array.forEach((key) => {
          typedExpressions.properties.push([key.trim(), [type]]);
        });
      }
      return "";
    },
    close: false,
  },
  // fallbak for require syntax
  {
    name: "declarations",
    open: false,
    reg:
      /(require)\s*([^\§]*)+(as)/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches || !typedExpressions) {
        throw new Error("expressions or matches are missing");
      }
      throw new SyntaxError(`[Ogone]
      this require syntax is not supported in this version of Ogone.
      please follow this syntax:
        require <props> as (<type>);
      `);
    },
    close: false,
  },
];

export default items;
