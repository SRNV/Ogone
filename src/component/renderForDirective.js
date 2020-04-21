
module.exports = function(querySelector) {
  const directive = this.item.for[querySelector];
  const { script } = directive;
  const ctx = `{ ${Object.keys(directive.ctx)} }`;
  const scriptReturned = `
  const ${ctx} = (function(LIM) {
    ${script.value}
    return ${ctx};
  }).bind(this)(LIM)
  return userid;
  `;
  const test = `
    ${script.value}
    return ${ctx};
  `;
  console.warn(test);
  const fn = new Function(...script.arguments, scriptReturned);
  const fnTest = new Function(...script.arguments, test);
  const LIM = [3, 2];
  console.warn(fn.bind(this.proxy)(LIM));
  console.warn(test);
  console.warn(fnTest.bind(this.proxy)(LIM));
};