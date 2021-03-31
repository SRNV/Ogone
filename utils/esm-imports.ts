import gen from "./generator.ts";
import type {
  hmrModuleSystemOptions,
  ProtocolScriptRegExpList,
} from "../src/ogone.main.d.ts";
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
      (this.isAsync  || this.isStore? Ogone.run  : Ogone.runSync).apply(this.data, [this,'destroy']);
      (this.isAsync  || this.isStore? Ogone.run  : Ogone.runSync).apply(this.data, [this,0]);
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
      /\s*(\bimport\b)\s+(\d+_string)\s*(§{2}endExpression\d+§{2}|;|\n+)?/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, id2] = matches;
      expressions[id] = value;
      if (typedExpressions) {
        const path = getDeepTranslation(id2, expressions).replace(/['"`]/gi, "");
        const type = path.startsWith('.') ? 'relative' :
          path.startsWith('@') ? 'absolute':
          'remote';
        const isRemote = path.startsWith('http://')
          || path.startsWith('https://');
        typedExpressions.imports[id] = {
          key: id,
          uuid: `a${crypto.getRandomValues(new Uint32Array(1)).join('')}`,
          value,
          path,
          type,
          isRemote,
          ambient: true,
          allAs: false,
          object: false,
          default: false,
          defaultName: null,
          allAsName: null,
          getHmrModuleSystem,
          members: [],
        };
      }
      return id;
    },
    close: false,
  },
  {
    name: "all imports",
    open: false,
    reg: /(\bimport\b)(\s+(?:component|type)\s+){0,1}(.+?)(\bfrom\b)(.*?)(?=(§{2}endExpression\d+§{2}|;|\n+))/i,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, importType, tokens, f, str] = matches;
      expressions[id] = value;
      const isComponent = importType && importType.trim() === 'component' || false;
      const isType = importType && importType.trim() === 'type' || false;
      if (typedExpressions) {
        const importDescription = getMembers(
          getDeepTranslation(tokens, expressions)
          );
          const path = getDeepTranslation(str, expressions).replace(/['"\s`]/gi, "");
        const isRemote = path.startsWith('http://')
          || path.startsWith('https://');
        const type = path.startsWith('.') ? 'relative' :
          path.startsWith('@') ? 'absolute':
          'remote';
        typedExpressions.imports[id] = {
          key: id,
          type,
          isComponent,
          isType,
          isRemote,
          uuid: `a${crypto.getRandomValues(new Uint32Array(1)).join('')}`,
          ambient: false,
          allAs: importDescription.hasAllAs,
          object: importDescription.hasMembers,
          default: importDescription.hasDefault,
          defaultName: importDescription.default.alias || importDescription.default.name || null,
          allAsName: importDescription.allAs || null,
          path,
          value: getDeepTranslation(value, expressions),
          members: importDescription.members,
          getHmrModuleSystem,
        };
      }
      return !!isComponent ? '' : id;
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
