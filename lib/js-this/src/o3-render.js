// @ts-nocheck
import gen from "./generator.js";
import templateReplacer from "../../../utils/template-recursive.ts";
let rid = 0;
export function translateReflection({ body, identifier }) {
  const cases = [];
  const getPropertyRegExpGI = /(this\.)([\w\.]*)+/gi;
  const getPropertyRegExp = /(this\.)([\w\.]*)+/;
  const a = body.match(getPropertyRegExpGI);
  const b = identifier.match(getPropertyRegExpGI);
  const array = [...(a ? a : []), ...(b ? b : [])];
  const n = identifier.replace(/^(\.)/, "");
  if (array.length) {
    array.forEach((thisExpression) => {
      const [input, keywordThis, property] = thisExpression.match(
        getPropertyRegExp,
      );
      const key = `'update:${property.replace(/^(\.)/, "")}'`;
      if (!cases.includes(key)) {
        cases.push(key);
      }
    });
    return `
      if ([${cases}].includes(_state) || _state === 0) {
        this${identifier} = (() => ${body})();____("${n}", this);
      }`;
  } else {
    return `
      if (_state === 0) {
        this${identifier} = (() => ${body})();____("${n}", this);
      }`;
  }
}
export default [
  // reflection regexp this.name => {};
  // reflection is the same feature for computed datas but with the following syntax
  // this.reflected => { return Math.random() };
  // TODO
  {
    name: "reflection",
    open: false,
    reg:
      /(§{2}keywordThis\d+§{2})\s*((§{2}(identifier|array)\d+§{2})+)\s*(§{2}arrowFunction\d+§{2})\s*(§{2}block\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§reflection${gen.next().value}§§`;
      const [input, keywordThis, identifier] = matches;
      const fnbody = matches.find(
        (k, i, arr) => arr[i - 1] && arr[i - 1].startsWith("§§arrowFunction"),
      );
      expressions[id] = value;
      let translate = fnbody;
      let translateIdentifier = identifier;
      function template() {
        translate = templateReplacer(translate, expressions);
        translateIdentifier = templateReplacer(
          translateIdentifier,
          expressions,
        );
      }
      template();
      translate = translateReflection({
        body: translate,
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
      /(§{2}keywordThis\d+§{2})\s*((§{2}(identifier|array)\d+§{2})+)\s*(§{2}arrowFunction\d+§{2})\s*([^\s]+)+\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§reflection${gen.next().value}§§`;
      const [input, keywordThis, identifier] = matches;
      const fnbody = matches.find(
        (k, i, arr) => arr[i - 1] && arr[i - 1].startsWith("§§arrowFunction"),
      );
      expressions[id] = value;
      const cases = [];
      let translate = fnbody.replace(/(§§endPonctuation\d+§§)/gi, "");
      let translateIdentifier = identifier;
      function template() {
        translate = templateReplacer(translate, expressions);
        translateIdentifier = templateReplacer(
          translateIdentifier,
          expressions,
        );
      }
      template();
      translate = translateReflection({
        body: translate,
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
      /(§{2}keywordThis\d+§{2})\s*(§{2}identifier\d+§{2})\s*(§{2}arrowFunction\d+§{2})\s*([^\s]+)+/,
    id: (value, matches, typedExpressions, expressions) => {
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
  // simplify from '' syntax
  {
    open: false,
    reg: /(§{2})(keywordFrom\d+)(§{2})\s*(§{2})(string\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§pathImport${gen.next().value}§§`;
      typedExpressions.from[id] = value;
      expressions[id] = value;
      return id;
    },
    close: false,
  },
  // use syntax
  // use @/path/to/comp.o3 as element-name
  {
    // parse missing string
    name: "declarations",
    open: false,
    reg:
      /(§{2}keywordUse\d+§{2})\s*(§{2}path\d+§{2})\s*(§{2}keywordAs\d+§{2})\s+(?!(§§string))/,
    id: (value, matches, typedExpressions, expressions) => {
      const MissingStringInUseExpressionException = new Error(
        "[Ogone] please follow this pattern for use expression: use @/absolute/path.o3 as <string>\n\n",
      );
      throw MissingStringInUseExpressionException;
    },
    close: false,
  },
  // use relative path
  {
    name: "declarations",
    open: false,
    reg:
      /(§{2}keywordUse\d+§{2})\s*((§{2}ponctuation)([^\s]*)+)\s*(§{2}keywordAs\d+§{2})\s*(§{2}string\d+§{2})(\s*§{2}endPonctuation\d+§{2})*/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§use${gen.next().value}§§`;
      let path = templateReplacer(matches[2], expressions);
      path = templateReplacer(path, expressions).trim();
      typedExpressions.use[id] = {
        path,
        as: expressions[matches[6]],
        type: "relative",
      };
      return "";
    },
    close: false,
  },
  // use absolute path
  {
    name: "declarations",
    open: false,
    reg:
      /(§{2}keywordUse\d+§{2})\s*(§{2}path\d+§{2})\s*(§{2}keywordAs\d+§{2})\s*(§{2}string\d+§{2})(\s*§{2}endPonctuation\d+§{2})*/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§use${gen.next().value}§§`;
      let path = expressions[matches[2]];
      path = templateReplacer(path, expressions);
      typedExpressions.use[id] = {
        path,
        as: expressions[matches[4]],
        type: "absolute",
      };
      return "";
    },
    close: false,
  },
  // use remotes components
  {
    name: "declarations",
    open: false,
    reg:
      /(§{2}keywordUse\d+§{2})\s+((https|http)(§{2}optionDiviser\d+§{2}\/{2})([^\s]*)+)\s+(§{2}keywordAs\d+§{2})\s*(§{2}string\d+§{2})(\s*§{2}endPonctuation\d+§{2})*/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§use${gen.next().value}§§`;
      let path = templateReplacer(matches[2], expressions);
      typedExpressions.use[id] = {
        path,
        as: expressions[matches[7]],
        type: "remote",
      };
      return "";
    },
    close: false,
  },
  {
    name: "declarations",
    open: false,
    reg: /(§{2}keywordUse\d+§{2})(.*)(\s*§{2}endLine\d+§{2})*/,
    id: (value, matches, typedExpressions, expressions) => {
      const UnsupportedSyntaxOfUseException = new SyntaxError(`
      [Ogone] this syntax of use is not supported, on this version.
      input: ${templateReplacer(value, expressions)}
      `);
      throw UnsupportedSyntaxOfUseException;
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
      /(§{2}keywordRequire\d+§{2})\s*([^\§\(]*)+(§{2}keywordAs\d+§{2})\s*([^\§\[\]]*)+(§{2}(endLine|endPonctuation)\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§require${gen.next().value}§§`;
      const any = null;
      const isAlreadyRequired = typedExpressions.properties.find(
        ([key]) => key === matches[2],
      );
      if (isAlreadyRequired) {
        const AlreadyRequiredPropertyException = new Error(
          `[Ogone] property ${matches[2]} is already required in component`,
        );
        throw AlreadyRequiredPropertyException;
      }
      const array = matches[2].split(",");
      if (array.length === 1) {
        typedExpressions.properties.push([array[0].trim(), [matches[4]]]);
      } else {
        array.forEach((key) => {
          typedExpressions.properties.push([key.trim(), [matches[4]]]);
        });
      }
      return "";
    },
    close: false,
  },
  {
    name: "declarations",
    open: false,
    reg:
      /(§{2}keywordRequire\d+§{2})\s*([^\§]*)+(§{2}keywordAs\d+§{2})\s*(§{2}array\d+§{2})\s*(§{2}endLine\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§require${gen.next().value}§§`;
      const any = { name: null };
      const keys = matches[2].replace(/\s/gi, "").split(",");
      const props = keys.map((key) => {
        const isAlreadyRequired = typedExpressions.properties.find(
          ([key2]) => key2 === key,
        );
        if (isAlreadyRequired) {
          const AlreadyRequiredPropertyException = new Error(
            `[Ogone] property ${key} is already required in component`,
          );
          throw AlreadyRequiredPropertyException;
        }
        return [
          key,
          eval(expressions[matches[4]])
            .filter((f) => f)
            .map((f) => f.name),
        ];
      });
      typedExpressions.properties.push(...props);
      return "";
    },
    close: false,
  },
  {
    name: "linkCases",
    open: false,
    reg:
      /\s*(\*){0,1}execute\s+(§{2}keywordDefault\d+§{2})\s*(§{2}(endLine|endPonctuation)\d+§{2})/,
    id: (value, match, typedExpressions, expressions) => {
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
    reg: /\s*(\*){0,1}execute\s+(§{2}(keywordDefault|keywordCase)\d+§{2})\s*/,
    id: (value, match, typedExpressions, expressions) => {
      const UnsupportedSyntaxOfCaseExecutionException = new SyntaxError(`
      [Ogone] the following syntax is not supported\n
        please one of those syntaxes:
          execute case 'casename' use [ctx, event];
          execute case 'casename';
          execute default;
        It assumes that cases are strings in proto.
        It can change in the future, do not hesitate to make a pull request on it.
      `);
      throw UnsupportedSyntaxOfCaseExecutionException;
    },
    close: false,
  },
];
