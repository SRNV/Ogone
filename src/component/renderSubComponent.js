module.exports = function() {
  const entries = Object.entries(this.item.imports);
  entries.forEach(([path, querySelector]) => {
    const nodes = this.rootNode.querySelectorAll(querySelector);
    if (nodes && nodes.length) {
      nodes.forEach((node) => {
        new OComponent(path, `[${this.id}][${this.item.uuid}] ${querySelector}`, o, websocket);
      });
    }
  });
}