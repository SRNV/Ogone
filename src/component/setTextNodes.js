const S = require('string');

module.exports = function setTextNodes() {
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
    if (S(el.rawText).between('\${', '\}').s.length) {
      el.binded = true;
    } else {
      el.binded = false;
    }
    el.data = el.rawText;
    //if (!el.binded) return;
    let globalTexts = [];
    this.getContext[el.querySelector](`\`${el.rawText}\``, (result, item, index, ctx, ids, arr) => {
      /*
      this.send({
        ...ids,
        type: 'text',
        position: `${ids.uuid} ${el.id}`,
        id: this.id,
        textId: el.id,
        value: result,
      });
      */
     globalTexts.push([`${ids.uuid} ${el.id}`, result]);
    }, () => {
      this.send({
        type: 'init-text',
        id: this.id,
        globalTexts,
      });
    })
  });
}