const Ogone = require('.');

module.exports = function(component) {
  let serverDeclaration = 'const Server = {};'
  if (component.services instanceof Object) {
    for (let service in component.services) {
      serverDeclaration+= `
        Object.defineProperty(Server, '${service}', {
          get: () => function(...params) {
            self.send({
              uuid: '${component.uuid}',
              id: self.id,
              type: 'prayer',
              service: '${service}',
              params,
            })
            return new Promise(() => {
              resolve([1,3,45,6546]);
            })
          },
        });
      `;
    }
    serverDeclaration += `
      Object.freeze(Server);
      Object.seal(Server);
    `;
  }
  if (component.data instanceof Object) {
    let result = `
    Ogone.components['${component.uuid}'] = function(...args) {
      OComponent.call(this, ...args);
      const self = this;
      this.runtime = {
        ${Object.entries(component.scripts).map(([key, value]) => `'${key}' : (function() {
          ${serverDeclaration}
          ${value}
        }).bind(self.data),`)}
      };
    };
    Ogone.components['${component.uuid}'].prototype.data = ${JSON.stringify(component.data)};
    Ogone.components['${component.uuid}'].prototype.refs = {
      ${
        component.refs ? Object.entries(component.refs).map(([key, value]) => `'${key}': '${value}',`) : ''
      }
    }
    `;
    Ogone.datas.push(result);
  }
  
}