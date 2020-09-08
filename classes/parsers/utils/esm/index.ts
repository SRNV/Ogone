import gen from "../../ts/src/generator.ts";
import {
  ProtocolScriptRegExpItem,
  ProtocolScriptRegExpList,
} from "../../../../.d.ts";
import getDeepTranslation from "../../../../utils/template-recursive.ts";
import exports from "./exports.ts";
import { getMembersKeys, getMembers } from '../../../../utils/get-members.ts';

const exportASKey: ProtocolScriptRegExpItem = {
  name: "exportAsKey",
  open: false,
  reg: /(.*?)(§{2}keywordAs\d+§{2})\s*([^§\}\,]+)+\,/,
  id: (value, matches, typedExpressions, expressions) => {
    if (!expressions || !matches) {
      throw new Error("expressions or matches are missing");
    }
    const id = `§§exportAsKey${gen.next().value}§§`;
    expressions[id] = value;
    return id;
  },
  close: false,
};
const esm: ProtocolScriptRegExpList = [
  {
    open: false,
    reg: /\s*(§{2}block\d+§{2})\s*/m,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches || !typedExpressions) {
        throw new Error("typedExpressions, expressions or matches are missing");
      }
      const id = `§§blockImport${gen.next().value}§§`;
      let [input, block] = matches;
      let expression = expressions[block];
      while (expression && expression.match(exportASKey.reg as RegExp)) {
        const exportingAliasedKey = expression.match(exportASKey.reg as RegExp);
        if (exportingAliasedKey) {
          const [input, key, as, alias] = exportingAliasedKey;
          const newexpression = ` ${key.trim()}: ${alias},`;
          expression = expression.replace(input, newexpression);
        }
      }
      expressions[block] = expression;
      typedExpressions.blocks[block] = expression;
      expressions[id] = expression;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /(?<!§§blockImport\d+§§)(.*?)\,/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§importCandidate${gen.next().value}§§`;
      expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    name: "ambient import",
    open: false,
    reg:
      /\s*(§{2}keywordImport\d+§{2})\s+(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, id2] = matches;
      expressions[id] = value;
      if (typedExpressions) {
        typedExpressions.imports[id] = {
          key: id,
          value,
          path: expressions[id2].replace(/['"`]/gi, ""),
          ambient: true,
          allAs: false,
          object: false,
          default: false,
          constantDeclaration: [],
          members: {},
          dynamic: `Ogone.imp(${expressions[id2]})`,
        };
      }
      return ``;
    },
    close: false,
  },
  {
    name: "default import",
    open: false,
    reg:
      /\s*(§{2}keywordImport\d+§{2})\s+([\w\d]*)+\s+(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*((§{2}(endLine|endExpression|endPonctuation)\d+§{2})){0,1}/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, key, f, id2] = matches;
      const str = expressions[id2].replace(/[\s]/gi, "");
      expressions[id] = value;
      if (typedExpressions) {
        typedExpressions.imports[key] = {
          key: id,
          ambient: false,
          allAs: false,
          object: false,
          default: true,
          path: expressions[id2].replace(/['"\s`]/gi, ""),
          dynamic: `Ogone.imp(${str}),`,
          value: `import ${key} from ${str};`,
          members: {},
          constantDeclaration: [
            `let ${key} = Ogone.mod[${str}].default;`,
            `Ogone.mod['*'].push([${str}, (m) => {
              if (!this.activated) return false;
              ${key} = m.default;
              this.runtime('destroy');
              this.runtime(0);
              return this.activated;
            }]);
          `,
          ],
        };
      }
      return ``;
    },
    close: false,
  },
  {
    name: "all imports",
    open: false,
    reg: /(§{2}keywordImport\d+§{2})(.*?)(§{2}keywordFrom\d+§{2})(.*?)(?=(§{2}(endPonctuation|endLine|endExpression)\d+§{2}))/i,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, tokens, f, id2] = matches;
      expressions[id] = value;
      if (typedExpressions) {
        console.warn(3, tokens);
        console.warn(4, getMembers(
          getDeepTranslation(tokens, expressions)
        ));
        /*
        typedExpressions.imports[key] = {
          key: id,
          ambient: false,
          allAs: false,
          object: false,
          default: true,
          path: expressions[id2].replace(/['"\s`]/gi, ""),
          dynamic: `Ogone.imp(${str}),`,
          value: `import ${key} from ${str};`,
          members: {},
          constantDeclaration: [
            `let ${key} = Ogone.mod[${str}].default;`,
            `Ogone.mod['*'].push([${str}, (m) => {
              if (!this.activated) return false;
              ${key} = m.default;
              this.runtime('destroy');
              this.runtime(0);
              return this.activated;
            }]);
          `,
          ],
        };
        */
      }
      return ``;
    },
    close: false,
  },

  {
    name: "fallback import",
    open: false,
    reg: /(§{2}keywordImport\d+§{2})(.*?)(§{2}keywordFrom\d+§{2})(.*?)(?=(§{2}(endPonctuation|endLine|endExpression)\d+§{2}))/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      throw new Error(
        `this syntax of import is not supported\ninput:${
        getDeepTranslation(value, expressions)
        }`,
      );
    },
    close: false,
  },
  ...exports
];

export default esm;
