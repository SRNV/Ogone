import gen from "./generator.ts";
import getDeepTranslation from "./template-recursive.ts";
import { Utils } from "../classes/Utils.ts";
import type { ProtocolScriptRegExpList, MapIndexable } from "../.d.ts";
let rid = 0;
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
      /(this)\s*((§{2}(identifier|array)\d+§{2})+)\s*(=>)\s*(§{2}block\d+§{2})/,
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
      /(this)\s*((§{2}(?:identifier|array)\d+§{2})+)\s*(=>)(.*?)(§{2}(endExpression|endPonctuation)\d+§{2})/i,
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
        let translate = fnbody.replace(/(§§endPonctuation\d+§§)/gi, "");
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
  // use syntax
  // use @/path/to/comp.o3 as element-name
  // use relative path
  {
    name: "declarations",
    open: false,
    reg:
      /(use)\s+((\.)([^\s]*)+)\s+(as)\s*(§{2}string\d+§{2})(\s*§{2}endPonctuation\d+§{2})*/,
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
      /(use)\s+(\@\/)((.*?)\s+as\s+)(§{2}string\d+§{2})(\s*§{2}endPonctuation\d+§{2})*/,
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
          as: expressions[matches[5]],
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
      /(use)\s+((https|http)(§{2}optionDiviser\d+§{2}\/{2})([^\s]*)+)\s+(as)\s*(§{2}string\d+§{2})(\s*§{2}endPonctuation\d+§{2})*/,
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
      console.warn(matches)
      throw new Error(
        "please follow this pattern for use expression: use <path> as <string>\n\n",
      );
    },
    close: false,
  },
  {
    name: "declarations",
    open: false,
    reg: /(use)(.*)(\s*§{2}endLine\d+§{2})*/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      throw new Error(`
      this syntax of use is not supported, on this version.
      input: ${getDeepTranslation(value, expressions)}
      `);
    },
    close: false,
  },
  // require syntax
  // require prop as constructor || any
  // require prop1, prop2 as constructor[]
  {
    name: "declarations",
    open: false,
    reg:
      /(require)\s+([^\§\(]*)+(as)\s+(.*?)(§{2}(endLine|endPonctuation)\d+§{2})/,
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
  {
    name: "linkCases",
    open: false,
    reg:
      /\s*(\*){0,1}execute\s+(\b(default)\b)\s*(§{2}(endLine|endPonctuation)\d+§{2})/,
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
