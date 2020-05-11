let i = 0;
function getId(type) {
    i++;
    return `§§${type}${i}§§`;
}
function preserve(str, expressions, template) {
  let result = str;
  const splitted = result.split(template[0]).filter((s) => s.indexOf(template[1]) > -1);
  splitted.forEach((s) => {
    let c = s.split(template[1])[0];
    const key = getId('__');
    const content = `${template[0]}${c}${template[1]}`;
    expressions[key] = content;
    result = result.replace(content, key);
  })
  return result;
}
export default function scopeCSS(cssStr, scopeId) {
  let result = cssStr;
  let expressions = {};
  // preserve all attributes
  result = preserve(result, expressions, ['(', ')']);
  result = preserve(result, expressions, ['[', ']']);
  const matches = result.match(/([^\{\}])+(?=\{)/gi).filter((s) => !s.trim().startsWith('@'));
  if (matches) {
    matches.forEach((selector) => {
      let s = selector;
      const inputs = selector.split(/([\s,\>\<\(\)])+/gi).filter((s) => s.trim().length);
      inputs.forEach((inp) => {
        let token =  inp;
        if (token.indexOf(':') > -1) {
          token = token.split(':')[0];
        }
        s = s.replace(token, `${token}[${scopeId}]`);
      })
      result = result.replace(selector, s);
    });
  }
  while (Object.keys(expressions).find((key) => result.indexOf(key) > -1)) {
    Object.entries(expressions).forEach(([key, value]) => {
        result = result.replace(key, value)
    });
  }
  return result;
}
