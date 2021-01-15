import gen from "../generator.ts";
import getDeepTranslation from "../template-recursive.ts";
import type { ProtocolScriptRegExpList, MapIndexable } from "../../src/ogone.main.d.ts";

export interface ReflectionTranslater {
  body: string;
  identifier: string;
  isBlock?: boolean;
}
export function translateReflection(
  { body, identifier, isBlock }: ReflectionTranslater,
) {
  const cases: string[] = [];
  // identify the properties used
  const getPropertyRegExpGI = /(this\.)([\w\.]*)+/gi;
  const getPropertyRegExp = /(this\.)([\w\.]*)+/;
  const a = body.match(getPropertyRegExpGI);
  const b = identifier.match(getPropertyRegExpGI);
  const array = [...(a ? a : []), ...(b ? b : [])];
  const n = identifier.replace(/^(\.)/, '')
    .replace(/^(.*?)(\[)(.*?)(\])(.*?)$/, "$1");
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
    return (isBlock ? `
        if ([${cases}].includes(_state as any) || _state === 0) {
          this${identifier} = (() => ${body})();____("${n}", this);
        }` :
      `if ([${cases}].includes(_state as any) || _state === 0) {
          this${identifier} = ${body};____("${n}", this);
        }`
      ).trim();
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
      /(this)\s*(.+?)\s*(=>)\s*(\d+_block)/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches || !typedExpressions) {
        throw new Error(
          "typedExpressions or expressions or matches are missing",
        );
      }
      const id = `<${gen.next().value}reflection>`;
      const [input, keywordThis, identifier, arrow, fnbody] = matches;
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
        isBlock: true,
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
      /(this)\s*(.+?)\s*(=>)(.*?)(?:§{2}endExpression\d+§{2}|;|\n+)/i,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches || !typedExpressions) {
        throw new Error(
          "typedExpressions or expressions or matches are missing",
        );
      }
      const id = `<${gen.next().value}reflection>`;
      const [input, keywordThis, identifier, arrow, fnbody] = matches;
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
      /(this)\s*(.+?)\s*(=>)\s*([^\s]+)+/,
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
