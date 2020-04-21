module.exports = function(querySelector) {
  const dir = this.item.directives;
  dir.slice(1).forEach(({ querySelector, directives }) => {
    const forDirectives = directives.filter((directive) => directive[0] === 'for');
    forDirectives.forEach(([type, context]) => {
      this.renderForDirective(querySelector, context.array);
    })
  })
}