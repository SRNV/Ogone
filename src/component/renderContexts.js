function renderContexts() {
  Object.entries(this.item.for).forEach(([querySelector, directive]) => {
    const html = this.rootNode.querySelector(`${querySelector}`).toString();
    this.getContext[querySelector]('', null, null, (length) => {
      this.send({
        length,
        querySelector,
        type: 'array',
        id: this.id,
      });
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