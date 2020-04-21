module.exports = function(msg) {
  const node = this.item.directives
    .find((d) => d.querySelector === msg.querySelector);
  if (node) {
    const event = node.directives.find((d) => d[0] === msg.event);
    if (event && event[1] instanceof Function) {
      switch(event[0]) {
        case 'model':
          event[1].bind(this.proxy)(msg.value);
          break;
        default: 
          event[1].bind(this.proxy)();
          break;
      }
    }
  }
}