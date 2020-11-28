import gen from "./generator.ts";
import type {
  hmrModuleSystemOptions,
  ProtocolScriptRegExpList,
} from "../.d.ts";
import getDeepTranslation from "./template-recursive.ts";
import exports from "./esm-exports.ts";
import { getMembersKeys, getMembers } from './get-members.ts';

function getHmrModuleSystem({
  variable,
  registry,
  isDefault,
  isAllAs,
  isMember,
  path,
}: hmrModuleSystemOptions): string {
  let result = getDeepTranslation(`
    let $_1 = $_2["$_3"]$_4;
    $_2['*'].push(["$_3", (m) => {
      if (!this.activated) return false;
      $_1 = m$_4;
      this.runtime('destroy');
      this.runtime(0);
      return this.activated;
    }]);`, {
    $_1: variable,
    $_2: registry,
    $_3: path,
    $_4: isDefault ? '.default' : isMember ? `.${variable}` : '',
  });
  return result;
}

const esm: ProtocolScriptRegExpList = [
  {
    name: "ambient import",
    open: false,
    reg:
      /\s*(\bimport\b)\s+(\<string\d+\>)\s*(§{2}endExpression\d+§{2}|;|\n+)?/,
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
          path: getDeepTranslation(id2, expressions).replace(/['"`]/gi, ""),
          ambient: true,
          allAs: false,
          object: false,
          default: false,
          defaultName: null,
          allAsName: null,
          getHmrModuleSystem,
          members: [],
          dynamic: (importFn: string = 'Ogone.imp') => `${importFn}(${getDeepTranslation(id2, expressions)
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
    reg: /(\bimport\b)(.*?)(\bfrom\b)(.*?)(?=(§{2}endExpression\d+§{2}|;|\n+))/i,
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
          defaultName: importDescription.default.alias || importDescription.default.name || null,
          allAsName: importDescription.allAs || null,
          path: getDeepTranslation(str, expressions).replace(/['"\s`]/gi, ""),
          dynamic: (importFn: string = 'Ogone.imp') => `${importFn}(${str}),`,
          value: getDeepTranslation(value, expressions),
          members: importDescription.members,
          getHmrModuleSystem,
        };
      }
      return ``;
    },
    close: false,
  },

  {
    name: "fallback import",
    open: false,
    reg: /(\bimport\b)(.*?)(\bfrom\b)(.*?)(?=(§{2}endExpression\d+§{2}|;|\n+))/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      throw new Error(
        `this syntax of import is not supported\ninput:${getDeepTranslation(value, expressions)
        }`,
      );
    },
    close: false,
  },
  ...exports
];

export default esm;
