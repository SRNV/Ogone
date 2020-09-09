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
          // TODO write getHmrModuleSystem
          getHmrModuleSystem: () => '',
          members: [],
          dynamic: (importFn: string = 'Ogone.imp') => `${importFn}(${
            getDeepTranslation(id2, expressions)
            }),`,
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
      const [input, imp, tokens, f, str] = matches;
      expressions[id] = value;
      if (typedExpressions) {
        const importDescription = getMembers(
          getDeepTranslation(tokens, expressions)
        );
        typedExpressions.imports[id] = {
          key: id,
          ambient: false,
          allAs: importDescription.hasAllAs,
          object: importDescription.hasMembers,
          default: importDescription.hasDefault,
          path: expressions[str].replace(/['"\s`]/gi, ""),
          dynamic: (importFn: string = 'Ogone.imp') => `${importFn}(${
            getDeepTranslation(str, expressions)
            }),`,
          value: getDeepTranslation(value, expressions),
          members: importDescription.members,
          // TODO write getHmrModuleSystem
          getHmrModuleSystem: () => '',
          /*
          // earlier version
          getHmrModuleSystem: [
            `let ${key} = Ogone.mod[${str}].default;`,
            `Ogone.mod['*'].push([${str}, (m) => {
              if (!this.activated) return false;
              ${key} = m.default;
              this.runtime('destroy');
              this.runtime(0);
              return this.activated;
            }]);`,
          ],
          */
        };
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
