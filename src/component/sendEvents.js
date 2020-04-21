module.exports = function() {
  this.send({
    type: 'events',
    events: this.item.directives,
    id: this.id,
  });
}