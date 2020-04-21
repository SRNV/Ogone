module.exports = function() {
  const texts = this.item.dom.filter((item) => item.type === 3 && item.rawText.length);
  texts.forEach((t) => {
    const query = t.querySelector.trim();
    const node = query.length !== 0 ?
      this.rootNode.querySelector(query) :
      this.rootNode;
      if (node) {
        const text = node.childNodes[t.id];
        if (text && text.nodeType === 3) {
          text.querySelector = t.querySelector;
          text.id = t.id;
          this.textNodes.push(text);
        }
    }
  });
  this.textNodes.forEach((el) => {
    el.data = el.rawText;
    const text = (function() {
      try {
        const val = eval(`\`${el.rawText}\``)
        return val;
      } catch(e) {
        throw e;
      }
    }).bind(this.proxy)();
    el.rawText = text;
    el.text = text;
  });
}