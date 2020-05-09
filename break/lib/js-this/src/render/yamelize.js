import { YAML } from 'https://raw.githubusercontent.com/eemeli/yaml/master/src/index.js';

export default function(typedExpressions, expressions, prog) {
  let result = prog;
  const match = prog.match(/([^\n\r]+){0,1}(this:)/);
  const matches = prog.match(/([^\n\r]+){0,1}(this:)/gi);
  const DoubleDeclarationOfThisException = new Error('[Ogone] double declaration of "this:" in component');
  let previousDeclaration = [];
  if (matches) {
    matches.forEach((dec) => {
      if (previousDeclaration.includes(dec)) {
        throw DoubleDeclarationOfThisException;
      }
      previousDeclaration.push(dec);
      return;
    });
  }
  if (match) {
    const spaces = match[1] || '';
    const reg = new RegExp(`\\n${spaces.replace(/\s/gi, '\\s')}[^\\s]`, 'gi');
    const candidate = prog.split(`\n${match[0]}`).filter((c) => c.trim().length);
    if (candidate && candidate[0]) {
      let data = candidate[0].split(reg)[0];
      let previous = data;
      while (data.indexOf('§§') > -1) {
        Object.entries(expressions).forEach(([key, value]) => {
          data = data.replace(key, expressions[key]);
        });
      }
      const declaration = `${match[0]}${previous}`;
      const yaml = YAML.parse(data);
      result = result.replace(declaration, '');
      typedExpressions.data = yaml;
    }
  }
  return result;
};
