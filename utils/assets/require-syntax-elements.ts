import getDeepTranslation from "../template-recursive.ts";
import type { ProtocolScriptRegExpList, MapIndexable } from "../../.d.ts";

const items: ProtocolScriptRegExpList = [
  // require syntax
  // require prop as constructor || any
  // require prop1, prop2 as constructor[]
  // fallbak for require syntax
  {
    name: "declarations",
    open: false,
    reg:
      /(require)\s+(.+?)(as)/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches || !typedExpressions) {
        throw new Error("expressions or matches are missing");
      }
      throw new SyntaxError(`[Ogone] 0.28.0
      the require syntax is no more supported,
      please use the declare or def modifier and add the statement inherit before the name of the property
        example:
          <proto>
            declare:
              inherit name;
              inherit myProp: string = 'value';
              public inherit state: 'normal' | 'activated' = 'normal';
          </proto>
      `);
    },
    close: false,
  },
];

export default items;
