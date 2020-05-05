import gen from './generator';
import expressions from './expressions';

export default [
  {
    open: false,
    reg: /(§{2}keywordRequire\d+§{2})\s*(§{2}parenthese\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§keywordRequire${gen.next().value}§§`
      const strKey = expressions[matches[2]];
      const str = expressions[strKey.replace(/[\(\)]/gi,'')].replace(/['"`]/gi, '');
      typedExpressions.require.push(str);
      expressions[id] = value;
      return id;
    },
    close: false,
  },
];