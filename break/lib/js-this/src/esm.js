import gen from "./generator.js";
import expressions from "./expressions.js";
function renderImport({ key, path, caller, isDefault, isAllAs, isBlock }) {
  switch (true) {
    case isDefault:
      return `const ${key} = ${caller}(${path}).default;`;
    case isBlock:
      return `const ${key} = ${caller}(${path});`;
    default:
      return `const ${key} = ${caller}(${path});`;
  }
}
const exportASKey = {
  name: "exportAsKey",
  open: false,
  reg: /\s*([^§\{\,]*)+\s*(§{2}keywordAs\d+§{2})\s*([^§\}\,]*)+,?/,
  id: (value, matches, typedExpressions, expressions) => {
    const id = `§§exportAsKey${gen.next().value}§§`;
    expressions[id] = value;
    return id;
  },
  close: false,
};
export default [
  {
    open: false,
    reg: /(\*)\s*(§{2}keywordAs\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§allAs${gen.next().value}§§`;
      expressions[id] = value;
      return id;
    },
    close: false,
  },
  {
    open: false,
    reg: /\s*(§{2}block\d+§{2})\s*/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§blockImport${gen.next().value}§§`;
      let [input, block] = matches;
      let expression = expressions[block];
      while (expression && expression.match(exportASKey.reg)) {
        const exportingAliasedKey = expression.match(exportASKey.reg);
        if (exportingAliasedKey) {
          const [input, key, as, alias] = exportingAliasedKey;
          const newexpression = ` ${key.trim()}: ${alias},`;
          expression = expression.replace(input, newexpression);
        }
      }
      /*
      if (expression.indexOf('§§') > -1) {
        const token = expression.match(/(§{2}([^§]*)+\d*§{2})/);
        const exp = expressions[token[1]];
        const UnexpectedTokenException = new SyntaxError(`Unexpected token "${exp}" in import expression`);
        throw UnexpectedTokenException;
      }
      */
      expressions[block] = expression;
      typedExpressions.blocks[block] = expression;
      expressions[id] = expression;
      return id;
    },
    close: false,
  },
  {
    name: "export default",
    open: false,
    reg:
      /(§{2}keywordExport\d+§{2})\s*(§{2}keywordDefault\d+§{2})\s*([^\s]*)+\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§export${gen.next().value}§§`;
      expressions[id] = value;
      return `exports.default = ${matches[3]}`;
    },
    close: false,
  },
  {
    name: "export vars",
    open: false,
    reg:
      /(§{2}keywordExport\d+§{2})\s*(§{2}(keywordConst|keywordLet)\d+§{2})\s*([^§])+\s*(§{2}operatorsetter\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§export${gen.next().value}§§`;
      const [input, exp, constorLet, optional, key, setter] = matches;
      expressions[id] = value;
      return `exports.${key} ${setter}`;
    },
    close: false,
  },
  {
    open: false,
    reg: /(?<!§§blockImport\d+§§)([^,§]*)+\s*,/,
    id: (value, matches, typedExpressions, expressions) => {
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
      const id = `§§importAllAs${gen.next().value}§§`;
      const [input, imp, allAs, key, f, id2] = matches;
      expressions[id] = value;
      typedExpressions.imports[key] = {
        ambient: null,
        default: null,
        block: null,
        allAs: expressions[id2].replace(/['"`]/gi, ""),
        expression: `import ${key} from ${
          expressions[id2].replace(/^(['"`])/, "$1/node_modules/").replace(
            /[\s]/gi,
            "",
          )
        };`,
        exports: `import ${key} from ${
          expressions[id2].replace(/[\s]/gi, "")
        };`,
      };
      return `import ${key} from ${id2};`;
    },
    close: false,
  },
  {
    name: "ambient import",
    open: false,
    reg:
      /\s*(§{2}keywordImport\d+§{2})\s+(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, id2] = matches;
      expressions[id] = value;
      typedExpressions.imports[id] = {
        ambient: expressions[id2].replace(/['"`]/gi, ""),
        allAs: null,
        block: null,
        default: null,
        expression: `import ${expressions[id2]};`,
      };
      return `require(${id2});`;
    },
    close: false,
  },
  {
    name: "default direct import",
    open: false,
    reg:
      /\s*(§{2}keywordImport\d+§{2})\s+([^§]*)+\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, key] = matches;
      expressions[id] = value;
      typedExpressions.imports[key] = {
        ambient: null,
        allAs: null,
        block: null,
        default: key.replace(/['"`]/gi, "").trim(),
        expression: `import ${key} from '${key}';`,
      };
      return `const ${key} = require('${key}');`;
    },
    close: false,
  },
  {
    name: "export default from",
    open: false,
    reg:
      /\s*(§{2}keywordExport\d+§{2})\s+([\w\d]*)+\s+(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, key, f, id2] = matches;
      expressions[id] = value;
      typedExpressions.exports[key] = {
        default: null,
        var: null,
        require: expressions[id2].replace(/['"`]/gi, ""),
      };
      return `exports.${key} = require(${id2});`;
    },
    close: false,
  },
  {
    name: "default import",
    open: false,
    reg:
      /\s*(§{2}keywordImport\d+§{2})\s+([\w\d]*)+\s+(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, key, f, id2] = matches;
      expressions[id] = value;
      typedExpressions.imports[key] = {
        ambient: null,
        allAs: null,
        block: null,
        default: expressions[id2].replace(/['"\s`]/gi, ""),
        expression: `import { ${key} } from ${
          expressions[id2].replace(/^(['"`])/, "$1./node_modules/").replace(
            /[\s]/gi,
            "",
          )
        }`,
        exports: `
          import o_${key} from ${expressions[id2].replace(/[\s]/gi, "")}
          export const ${key} = o_${key};
        `,
      };
      return `import ${key} from ${id2}`;
    },
    close: false,
  },

  {
    name: "default and aliased import",
    open: false,
    reg:
      /(§{2}keywordImport\d+§{2})\s*(§{2}importCandidate\d*§{2})\s*(§{2}allAs\d+§{2})\s*([^§]*)+\s*(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, key, allAs, alias, f, id2] = matches;
      expressions[id] = value;
      typedExpressions.imports[
        expressions[key].replace(/[,\s\n]/gi, "")
      ] = {
        ambient: null,
        allAs: null,
        block: null,
        default: expressions[id2].replace(/['"\s`]/gi, ""),
        expression: `import ${expressions[key].replace(/[,\s\n]/gi, "")} from ${
          expressions[id2].replace(/^(['"`])/, "$1/node_modules/").replace(
            /[\s]/gi,
            "",
          )
        }`,
      };
      typedExpressions.imports[
        alias.replace(/[,\s\n]/gi, "")
      ] = {
        ambient: null,
        default: null,
        block: null,
        allAs: expressions[id2].replace(/['"`]/gi, ""),
        expression: `import ${alias} from ${
          expressions[id2].replace(/^(['"`])/, "$1/node_modules/").replace(
            /[\s]/gi,
            "",
          )
        };`,
      };
      return `
        import ${key} from ${id2};
        import ${alias} from ${id2};
      `;
    },
    close: false,
  },
  {
    name: "default and aliased import",
    open: false,
    reg:
      /(§{2}keywordImport\d+§{2})\s*(§{2}allAs\d*§{2})\s*(§{2}importCandidate\d+§{2})\s*([^§]*)+\s*(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, allAs, alias, key, f, id2] = matches;
      expressions[id] = value;
      typedExpressions.imports[
        key.replace(/[,\s\n]/gi, "")
      ] = {
        ambient: null,
        allAs: null,
        block: null,
        default: expressions[id2].replace(/['"`]/gi, ""),
        expression: `import ${expressions[key].replace(/[,\s\n]/gi, "")} from ${
          expressions[id2].replace(/^(['"`])/, "$1/node_modules/").replace(
            /[\s]/gi,
            "",
          )
        }`,
      };
      typedExpressions.imports[
        expressions[alias].replace(/[,\s\n]/gi, "")
      ] = {
        ambient: null,
        default: null,
        block: null,
        allAs: expressions[id2].replace(/['"`]/gi, ""),
        expression: `import ${alias} from ${
          expressions[id2].replace(/^(['"`])/, "$1/node_modules/").replace(
            /[\s]/gi,
            "",
          )
        };`,
      };
      return `
        import ${key} from ${id2};
        import ${alias} from ${id2};
      `;
    },
    close: false,
  },
  {
    name: "object import",
    open: false,
    reg:
      /\s*(§{2}keywordImport\d+§{2})\s*(§{2}blockImport\d+§{2})\s*(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, key, f, id2] = matches;
      expressions[id] = value;
      typedExpressions.imports[
        expressions[key]
          .replace(/\n,/gi, ",")
          .replace(/,\}/gi, "}")
      ] = {
        ambient: null,
        default: null,
        allAs: null,
        block: expressions[id2].replace(/['"`]/gi, ""),
        expression: `import ${
          expressions[key].replace(/\n,/gi, ",").replace(/,\}/gi, "}")
        } from ${
          expressions[id2].replace(/^(['"`])/, "$1/node_modules/").replace(
            /[\s]/gi,
            "",
          )
        }`,
      };
      return `
        import ${key} from ${id2};
      `;
    },
    close: false,
  },
  {
    name: "default and object import",
    open: false,
    reg:
      /\s*(§{2}keywordImport\d+§{2})\s*(§{2}blockImport\d+§{2})\s*([^§]*)+\s*(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, key, def, f, id2] = matches;
      typedExpressions.imports[def.replace(/[,\s\n]/gi, "")] = {
        ambient: null,
        block: null,
        allAs: null,
        default: expressions[id2].replace(/['"`]/gi, ""),
        expression: `import ${def.replace(/[,\s\n]/gi, "")} from ${
          expressions[id2].replace(/^(['"`])/, "$1/node_modules/").replace(
            /[\s]/gi,
            "",
          )
        };`,
      };
      typedExpressions.imports[
        expressions[key]
          .replace(/\n,/gi, ",")
          .replace(/,\}/gi, "}")
      ] = {
        ambient: null,
        default: null,
        allAs: null,
        block: expressions[id2].replace(/['"`]/gi, ""),
        expression: `import ${
          expressions[key].replace(/\n,/gi, ",").replace(/,\}/gi, "}")
        } from ${
          expressions[id2].replace(/^(['"`])/, "$1/node_modules/").replace(
            /[\s]/gi,
            "",
          )
        };`,
      };
      return `
        import ${key} from ${id2};
        import ${def} from ${id2};
      `;
    },
    close: false,
  },
  {
    name: "default and object import",
    open: false,
    reg:
      /\s*(§{2}keywordImport\d+§{2})\s*(§{2}importCandidate\d+§{2})\s*(§{2}blockImport\d+§{2})\s*(§{2}keywordFrom\d+§{2})\s*(§{2}string\d+§{2})\s*(§{2}(endLine|endExpression|endPonctuation)\d+§{2})?/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§import${gen.next().value}§§`;
      const [input, imp, def, key, f, id2] = matches;
      typedExpressions.imports[
        expressions[def].replace(/[,\s\n]/gi, "")
      ] = {
        ambient: null,
        block: null,
        allAs: null,
        default: expressions[id2].replace(/['"`]/gi, ""),
        expression: `import ${expressions[def].replace(/[,\s\n]/gi, "")} from ${
          expressions[id2].replace(/^(['"`])/, "$1/node_modules/").replace(
            /[\s]/gi,
            "",
          )
        }`,
      };
      typedExpressions.imports[
        expressions[key]
          .replace(/\n,/gi, ",")
          .replace(/,\}/gi, "}")
      ] = {
        ambient: null,
        default: null,
        allAs: null,
        block: expressions[id2].replace(/['"`]/gi, ""),
        expression: `import ${
          expressions[key].replace(/\n,/gi, ",").replace(/,\}/gi, "}")
        } from ${
          expressions[id2].replace(/^(['"`])/, "$1/node_modules/").replace(
            /[\s]/gi,
            "",
          )
        };`,
      };
      return `
        import ${key} from ${id2};
        import ${def} from ${id2};
      `;
    },
    close: false,
  },
  {
    name: "fallback import",
    open: false,
    reg: /(§{2}keywordImport\d+§{2})([^\s\S]*)+/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = ``;
      const UnsupportedSyntaxOfImport = new SyntaxError(
        `[Ogone] this syntax of import is not supported\n`,
      );
      throw UnsupportedSyntaxOfImport;
    },
    close: false,
  },
];
