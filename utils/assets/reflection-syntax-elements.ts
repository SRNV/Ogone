import gen from "../generator.ts";
import getDeepTranslation from "../template-recursive.ts";
import type { ProtocolScriptRegExpList, MapIndexable } from "../../.d.ts";

export function translateReflection(
  { body, identifier }: { body: string; identifier: string },
) {
  const cases: string[] = [];
  const getPropertyRegExpGI = /(this\.)([\w\.]*)+/gi;
  const getPropertyRegExp = /(this\.)([\w\.]*)+/;
  const a = body.match(getPropertyRegExpGI);
  const b = identifier.match(getPropertyRegExpGI);
  const array = [...(a ? a : []), ...(b ? b : [])];
  const n = identifier.replace(/^(\.)/, "");
  if (array.length) {
    array.forEach((thisExpression) => {
      const m = thisExpression.match(
        getPropertyRegExp,
      );
      if (m) {
        const [input, keywordThis, property] = m;
        const key: string = `'update:${property.replace(/^(\.)/, "")}'`;
        if (!cases.includes(key)) {
          cases.push(key);
        }
      }
    });
    return `
      if ([${cases}].includes(_state as any) || _state === 0) {
        this${identifier} = (() => ${body})();____("${n}", this);
      }`;
  } else {
    return `
      if (_state === 0) {
        this${identifier} = (() => ${body})();____("${n}", this);
      }`;
  }
}
const items: ProtocolScriptRegExpList = [
  {
    name: "reflection",
    open: false,
    reg:
      /(this)\s*((§{2}(identifier|array)\d+§{2})+)\s*(=>)\s*(<block\d+>)/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches || !typedExpressions) {
        throw new Error(
          "typedExpressions or expressions or matches are missing",
        );
      }
      const id = `§§reflection${gen.next().value}§§`;
      const [input, keywordThis, identifier] = matches;
      const fnbody = matches.find(
        (k, i, arr) => arr[i - 1] && arr[i - 1].trim() === "=>",
      );
      if (expressions) expressions[id] = value;
      let translate = fnbody;
      let translateIdentifier = identifier;
      function template() {
        translate = getDeepTranslation(translate, expressions as MapIndexable);
        translateIdentifier = getDeepTranslation(
          translateIdentifier,
          expressions as MapIndexable,
        );
      }
      template();
      translate = translateReflection({
        body: translate as string,
        identifier: translateIdentifier,
      });
      template();
      typedExpressions.reflections.push(translate);
      return "";
    },
    close: false,
  },
  {
    name: "reflection",
    open: false,
    reg:
      /(this)\s*((§{2}(?:identifier|array)\d+§{2})+)\s*(=>)(.*?)(§{2}endExpression\d+§{2}|;|\n+)/i,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches || !typedExpressions) {
        throw new Error(
          "typedExpressions or expressions or matches are missing",
        );
      }
      const id = `§§reflection${gen.next().value}§§`;
      const [input, keywordThis, identifier] = matches;
      const fnbody = matches.find(
        (k, i, arr) => arr[i - 1] && arr[i - 1].trim() === "=>",
      );
      if (expressions) expressions[id] = value;
      if (fnbody) {
        let translate = fnbody.replace(/;/gi, "");
        let translateIdentifier = identifier;
        function template() {
          translate = getDeepTranslation(translate, expressions as MapIndexable);
          translateIdentifier = getDeepTranslation(
            translateIdentifier,
            expressions as MapIndexable,
          );
        }
        template();
        translate = translateReflection({
          body: translate,
          identifier: translateIdentifier,
        });
        template();
        typedExpressions.reflections.push(translate);
      }
      return "";
    },
    close: false,
  },
  {
    name: "reflection",
    open: false,
    reg:
      /(this)\s*(§{2}identifier\d+§{2})\s*(=>)\s*([^\s]+)+/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const UpsupportedReflectionSyntax = new Error(
        `[Ogone] Unsupported syntax of reflection.
${value}
not supported in this version of Ogone
      `,
      );
      return "";
    },
    close: false,
  },
];

export default items;
