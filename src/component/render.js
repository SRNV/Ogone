module.exports = function(querySelector) {
  this.send({
    querySelector,
    type: 'component',
    attr: this.item.uuid,
    id: this.id,
    html: this.rootNode.toString(),
    data: this.data,
  });
}