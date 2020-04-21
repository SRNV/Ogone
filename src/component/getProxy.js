module.exports = function() {
  return new Proxy(this.data, {
    get(obj, prop) {
      return obj[prop];
    },
    set: (obj, prop, value) => {
      if (this.ws.readyState === 3) {
        Reflect.deleteProperty(obj, prop);
        return true;
      }
      if (obj[prop] === value || this.ws.readyState !== 1) {
        return true;
      }
      const oldValue = obj[prop];
      obj[prop] = value;
      if (!this.reactivity) return true;
      if (prop in this.watchers && typeof this.watchers[prop] === 'function') {
        this.watchers[prop](oldValue, value);
      }
      this.textNodes
        .forEach((t) => {
          if (t.data.indexOf(prop) === -1) return;
          try {
            const newtext = (function() { return eval(`\`${t.data}\``) }).bind(obj)();
            if (newtext !== t.text) {
              this.send({
                value: newtext.trim(),
                textId: t.id,
                id: this.id,
                type: 'text',
                querySelector: t.querySelector
              })
              t.text = newtext;
            }
          } catch(textNodeEvaluationException) {
            throw textNodeEvaluationException;
          }
        });
        if (this.reactive[prop]) {
          this.reactive[prop].forEach((query, i) => {
            this.send({
              value,
              querySelector: query,
              type: 'bind',
              id: this.id,
            });
          });
        }
    },
  });
}