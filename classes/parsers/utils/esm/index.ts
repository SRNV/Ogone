import gen from "../../ts/src/generator.ts";
import {
  ProtocolScriptRegExpItem,
  ProtocolScriptRegExpList,
} from "../../../../.d.ts";
import getDeepTranslation from "../../../../utils/template-recursive.ts";
import exports from "./exports.ts";

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
    reg: /(\*)\s*(§{2}keywordAs\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§allAs${gen.next().value}§§`;
      expressions[id] = value;
      return id;
    },
    close: false,
  },
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
    name: "aliased import",
    open: false,
    reg:
      /\s*(§{2}keywordImport\d+§{2})\s*(§{2}allAs\d+§{2})\s+([^§]*)+\s+(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§importAllAs${gen.next().value}§§`;
      const [input, imp, allAs, key, f, id2] = matches;
      expressions[id] = value;
      const str = expressions[id2].replace(/[\s]/gi, "");
      if (typedExpressions) {
        typedExpressions.imports[key] = {
          key: id,
          value,
          ambient: false,
          default: false,
          object: false,
          allAs: true,
          dynamic: `Ogone.imp(${str}),`,
          path: expressions[id2].replace(/['"`]/gi, ""),
          members: [],
          constantDeclaration: [
            `let ${key} = Ogone.mod[${str}];`,
            `
            Ogone.mod['*'].push([${str}, (m) => {
              if (!this.activated) return false;
              ${key} = m;
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
          members: [],
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
          members: [],
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
    name: "default and aliased import",
    open: false,
    reg:
      /(§{2}keywordImport\d+§{2})\s*(§{2}importCandidate\d*§{2})\s*(§{2}allAs\d+§{2})(.*?)(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, key, allAs, alias, f, id2] = matches;
      expressions[id] = value;
      const str = expressions[id2].replace(/['"\s`]/gi, "");
      if (typedExpressions) {
        typedExpressions.imports[alias.replace(/[,\s\n]/gi, "")] = {
          key: id,
          ambient: false,
          default: false,
          object: false,
          allAs: true,
          path: expressions[id2].replace(/['"`]/gi, ""),
          members: [],
          constantDeclaration: [
            `let ${alias} = Ogone.mod[${str}];`,
            `Ogone.mod['*'].push([${str}, (m) => {
              if (!this.activated) return false;
              ${alias} = m;
              this.runtime('destroy');
              this.runtime(0);
              return this.activated;
            }]);
          `,
          ],
          dynamic: `Ogone.imp(${str}),`,
          value: `import ${alias} from ${str};`,
        };
        typedExpressions.imports[expressions[key].replace(/[,\s\n]/gi, "")] = {
          key: id,
          ambient: false,
          allAs: false,
          object: false,
          default: true,
          path: str,
          dynamic: `Ogone.imp(${str}),`,
          members: [],
          value: `import ${key} from ${str};`,
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
    name: "default and aliased import",
    open: false,
    reg:
      /(§{2}keywordImport\d+§{2})\s*(§{2}allAs\d*§{2})\s*(§{2}importCandidate\d+§{2})(.*?)(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, allAs, alias, key, f, id2] = matches;
      expressions[id] = value;
      const str = expressions[id2].replace(/[\s]/gi, "");
      const kAlias = expressions[alias].replace(/[,\s\n]/gi, "");
      if (typedExpressions) {
        typedExpressions.imports[kAlias] = {
          key: id,
          ambient: false,
          default: false,
          object: false,
          allAs: true,
          path: expressions[id2].replace(/['"`]/gi, ""),
          value: `import ${kAlias} from ${str};`,
          constantDeclaration: [
            `let ${kAlias} = Ogone.mod[${str}];`,
            `Ogone.mod['*'].push([${str}, (m) => {
              if (!this.activated) return false;
              ${kAlias} = m;
              this.runtime('destroy');
              this.runtime(0);
              return this.activated;
            }]);
          `,
          ],
          dynamic: `Ogone.imp(${str}),`,
          members: [],
        };
        typedExpressions.imports[key.trim()] = {
          key: id,
          ambient: false,
          allAs: false,
          object: false,
          default: true,
          path: str,
          dynamic: `Ogone.imp(${str}),`,
          value: `import ${key} from ${str};`,
          members: [],
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
    name: "object import",
    open: false,
    reg:
      /\s*(§{2}keywordImport\d+§{2})\s*(§{2}blockImport\d+§{2})\s*(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, key, f, id2] = matches;
      expressions[id] = value;
      const str = expressions[id2].replace(/[\s]/gi, "");
      const realKey = expressions[key]
        .replace(/\n,/gi, ",")
        .replace(/,\}/gi, "}")
        .trim();
      const arr = realKey
        .replace(/^(\{)/, "[")
        .replace(/(\})$/, "]")
        .replace(/([\w]+)+/gi, "'$1'");
      const arrayOfKey = eval(arr);
      if (typedExpressions) {
        typedExpressions.imports[realKey] = {
          key: id,
          ambient: false,
          default: false,
          allAs: false,
          members: arrayOfKey,
          object: true,
          path: expressions[id2].replace(/['"`]/gi, ""),
          dynamic: `Ogone.imp(${str}),`,
          value: `import ${realKey} from ${str};`,
          constantDeclaration: arrayOfKey
            .map((prop: string) => [
              `let ${prop} = Ogone.mod[${str}].${prop};`,
              `Ogone.mod['*'].push([${str}, (m) => {
              if (!this.activated) return false;
              ${prop} = m.${prop};
              this.runtime('destroy');
              this.runtime(0);
              return this.activated;
            }]);
          `,
            ])
            .flat(),
        };
      }
      return ``;
    },
    close: false,
  },
  {
    name: "default and object import",
    open: false,
    reg:
      /\s*(§{2}keywordImport\d+§{2})\s*(§{2}blockImport\d+§{2})(.*?)(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, key, def, f, id2] = matches;
      const kDef = def.replace(/[,\s\n]/gi, "");
      const str = expressions[id2].replace(/[\s]/gi, "");
      const realKey = expressions[key]
        .replace(/\n,/gi, ",")
        .replace(/,\}/gi, "}")
        .trim();
      const arr = realKey
        .replace(/^(\{)/, "[")
        .replace(/(\})$/, "]")
        .replace(/([\w]+)+/gi, "'$1'");
      const arrayOfKey = eval(arr);
      if (typedExpressions) {
        typedExpressions.imports[realKey] = {
          key: id,
          ambient: false,
          default: false,
          allAs: false,
          object: true,
          members: arrayOfKey,
          dynamic: `Ogone.imp(${str}),`,
          path: expressions[id2].replace(/['"`]/gi, ""),
          value: `import ${realKey} from ${str};`,
          constantDeclaration: arrayOfKey
            .map((prop: string) => [
              `let ${prop} = Ogone.mod[${str}].${prop};`,
              `
            Ogone.mod['*'].push([${str}, (m) => {
              if (!this.activated) return false;
              ${prop} = m.${prop};
              this.runtime('destroy');
              this.runtime(0);
              return this.activated;
            }]);
          `,
            ])
            .flat(),
        };
        typedExpressions.imports[kDef.trim()] = {
          key: id,
          ambient: false,
          allAs: false,
          object: false,
          default: true,
          path: str,
          value: `import ${kDef} from ${str};`,
          dynamic: `Ogone.imp(${str}),`,
          members: [],
          constantDeclaration: [
            `let ${kDef} = Ogone.mod[${str}].default;`,
            `Ogone.mod['*'].push([${str}, (m) => {
              if (!this.activated) return false;
              ${kDef} = m.default;
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
    name: "default and object import",
    open: false,
    reg:
      /\s*(§{2}keywordImport\d+§{2})\s*(§{2}importCandidate\d+§{2})\s*(§{2}blockImport\d+§{2})\s*(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, def, key, f, id2] = matches;
      if (typedExpressions) {
        typedExpressions.imports[expressions[def].replace(/[,\s\n]/gi, "")] = {
          key: id,
          value,
          ambient: false,
          object: false,
          allAs: false,
          default: true,
          path: expressions[id2].replace(/['"`]/gi, ""),
          constantDeclaration: [],
          members: [],
          dynamic: `import ${
            expressions[def].replace(
              /[,\s\n]/gi,
              "",
            )
            } from ${
            expressions[id2]
              .replace(/[\s]/gi, "")
            }`,
        };
        typedExpressions.imports[
          expressions[key].replace(/\n,/gi, ",").replace(/,\}/gi, "}")
        ] = {
          key: id,
          value,
          ambient: false,
          default: false,
          allAs: false,
          object: true,
          path: expressions[id2].replace(/['"`]/gi, ""),
          members: [],
          constantDeclaration: [],
          dynamic: `import ${
            expressions[key]
              .replace(/\n,/gi, ",")
              .replace(/,\}/gi, "}")
            } from ${
            expressions[id2]
              .replace(/[\s]/gi, "")
            };`,
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
