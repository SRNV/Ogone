const template = require('es6-template-strings');

function renderContexts() {
  Object.entries(this.item.for).forEach(([querySelector, directive]) => {
    const html = this.rootNode.querySelector(`${querySelector}`).toString();
    this.getContext[querySelector]('', (result, item, index, ctx, { id, idElement, parentId }, arr) => {
      if (html) {
        const rendered = template(html, {...ctx, ...this.proxy});
        this.send({
          index,
          parentId,
          templateQuerySelector: querySelector,
          type: 'context',
          html: rendered,
          length: arr.length,
          id: this.id,
          idElement,
          querySelector: id,
        });
      }
    });
  });
};
function setGetContext() {
  Object.entries(this.item.for).forEach(([querySelector, directive]) => {
    const { script, } = directive;
    const ctx = `{ ${Object.keys(directive.ctx)} }`;
    const contextScript = `
      ${script.value}
      return ${ctx};
    `;
    const fn = new Function(...script.arguments, contextScript);
    this.getContext[querySelector] = fn.bind(this.proxy);
  });
}
module.exports = {
  renderContexts,
  setGetContext
}