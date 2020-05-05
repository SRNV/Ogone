const gen = require('./generator');
const expressions = require('./expressions');

module.exports = [
  // reflection regexp this.name => {};
  {
    name: 'reflection',
    open: false,
    reg: /(§{2})(keywordThis\d+)(§{2})\s*(§{2})(identifier\d+)(§{2})\s*(§{2})(arrowFunction\d+)(§{2})\s*(§{2})(block\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§reflection${gen.next().value}§§`
      expressions[id] = value;
      return id;
    },
    close: false,
  },
  // simplify from '' syntax
  {
    open: false,
    reg: /(§{2})(keywordFrom\d+)(§{2})\s*(§{2})(string\d+)(§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§pathImport${gen.next().value}§§`
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
    name: 'declarations',
    open: false,
    reg: /(§{2}keywordUse\d+§{2})\s*(§{2}path\d+§{2})\s*(§{2}keywordAs\d+§{2})\s+(?!§§string)/,
    id: (value, matches, typedExpressions, expressions) => {
      const MissingStringInUseExpressionException = new Error('[Ogone] please follow this pattern for use expression: use @/absolute/path.o3 as <string>\n\n')
      throw MissingStringInUseExpressionException;
    },
    close: false,
  },
  {
    name: 'declarations',
    open: false,
    reg: /(§{2}keywordUse\d+§{2})\s*(§{2}path\d+§{2})\s*(§{2}keywordAs\d+§{2})\s*(§{2}string\d+§{2})(\s*§{2}endPonctuation\d+§{2})*/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§use${gen.next().value}§§`
      typedExpressions.use[id] = {
        path:  expressions[matches[2]],
        as: expressions[matches[4]],
      };
      return '';
    },
    close: false,
  },
  // require syntax
  // require prop as constructor || any
  // require prop1, prop2 as constructor[]
  {
    name: 'declarations',
    open: false,
    reg: /(§{2}keywordRequire\d+§{2})\s*([^\§\(]*)+(§{2}keywordAs\d+§{2})\s*([^\§\[\]]*)+(§{2}(endLine|endPonctuation)\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§require${gen.next().value}§§`
      const any = null;
      const isAlreadyRequired = typedExpressions.properties
        .find(([key]) => key === matches[2]);
      if (isAlreadyRequired) {
        const AlreadyRequiredPropertyException = new Error(`[Ogone] property ${matches[2]} is already required in component`);
        throw AlreadyRequiredPropertyException;
      }
      const array = matches[2].split(',');
      if (array.length === 1) {
        typedExpressions.properties.push([array[0].trim(), [matches[4]]])
      } else {
        array.forEach((key) => {
          typedExpressions.properties.push([key.trim(), [matches[4]]])
        })
      }
      return '';
    },
    close: false,
  },
  {
    name: 'declarations',
    open: false,
    reg: /(§{2}keywordRequire\d+§{2})\s*([^\§]*)+(§{2}keywordAs\d+§{2})\s*(§{2}array\d+§{2})\s*(§{2}endLine\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§require${gen.next().value}§§`;
      const any = { name: null };
      const keys = matches[2].replace(/\s/gi, '').split(',');
      const props = keys
      .map((key) => {
          const isAlreadyRequired = typedExpressions.properties
            .find(([key2]) => key2 === key);
          if (isAlreadyRequired) {
            const AlreadyRequiredPropertyException = new Error(`[Ogone] property ${key} is already required in component`);
            throw AlreadyRequiredPropertyException;
          }
          return [key, eval(expressions[matches[4]]).filter(f => f).map((f) => f.name)]
        });
      typedExpressions.properties.push(...props);
      return '';
    },
    close: false,
  },
];