const { observe } = require('universal-observer');

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
      let finalValue = value;
      const oldValue = obj[prop];
      if (Array.isArray(value)) {
        finalValue = observe(value, (chn) => {
          this.renderGlobalCTX();
        });    
      }
      obj[prop] = finalValue;
      if (Array.isArray(value)) {
        this.renderGlobalCTX();

      }
      if (!this.reactivity) return true;
      if (prop in this.watchers && typeof this.watchers[prop] === 'function') {
        this.watchers[prop](oldValue, obj[prop]);
      }
      this.textNodes
        .filter((t) => t.binded && this.item.reactiveText[t.querySelector])
        .forEach((t) => {
          if (t.data.indexOf(prop) === -1) return;
          try {
            // const newtext = (function() { return eval(`\`${t.data}\``) }).bind(obj)();
            this.getContext[t.querySelector](`\`${t.data}\``, (newtext, item, index, ctx, query) => {
              if (!t.context) {
                t.context = {
                  [query]:''
                };
              }
              if (newtext !== t.context[query]) {
                this.send({
                  value: newtext.trim(),
                  textId: t.id,
                  id: this.id,
                  type: 'text',
                  querySelector: query,
                })
               t.context[query] = newtext;
              }
            })
          } catch(textNodeEvaluationException) {
            throw textNodeEvaluationException;
          }
        });
        if (this.reactive[prop]) {
          this.reactive[prop].forEach((query, i) => {
            this.send({
              value: obj[prop],
              querySelector: query,
              type: 'bind',
              id: this.id,
            });
          });
        }
    },
  });
}