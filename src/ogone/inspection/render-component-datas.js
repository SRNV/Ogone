import Ogone from "../index.ts";
export default function (component) {
  if (component.data instanceof Object) {
    const { runtime } = component.scripts;
    const keysOfData = Object.keys(component.data);
    const asyncResolve = `
    const Async = {
      resolve: (...args) => {
        if (this.resolve) {
          const promise = this.resolve(...args);
          if (this.dispatchAwait) {
            this.dispatchAwait();
            this.promiseResolved = true;
          }
          this.resolve = null;
          return promise;
        } else if (this.resolve === null) {
          const DoubleUseOfResolveException = new Error('Double use of resolution in async component');
          Ogone.error(DoubleUseOfResolveException.message, 'Double Resolution of Promise', {
            message: \`component: ${component.file}\`
          });
          throw DoubleUseOfResolveException;
        }
      },
    };
    // freeze Async Object;
    Object.freeze(Async);
    `;
    let result = `
    Ogone.components['${component.uuid}'] = function () {
      OComponent.call(this);
      ${component.hasStore ? `
      const Store = {
        dispatch: (id, ctx) => {
          const path = id.split('/');
          if (path.length > 1) {
            const [namespace, action] = path;
            const mod = this.store[namespace];
            if (mod && mod.runtime) {
              return mod.runtime(action, ctx)
                .catch((err) => Ogone.error(err.message, \`Error in dispatch. action: \${action} component: ${component.file}\`, err));
            }
          } else {
            const mod = this.store[null];
            if (mod && mod.runtime) {
              return mod.runtime(id,ctx)
                .catch((err) => Ogone.error(err.message, \`Error in dispatch. action: \${action} component: ${component.file}\`, err));
            }
          }
        },
        commit: (id, ctx) => {
          const path = id.split('/');
          if (path.length > 1) {
            const [namespace, mutation] = path;
            const mod = this.store[namespace];
            if (mod && mod.runtime) {
              return mod.runtime(mutation, ctx).catch((err) => Ogone.error(err.message, \`Error in commit. mutation: \${mutation} component: ${component.file}\`, err));
            }
          } else {
            const mod = this.store[null];
            if (mod && mod.runtime) {
              return mod.runtime(id,ctx).catch((err) => Ogone.error(err.message, \`Error in commit. mutation: \${id} component: ${component.file}\`, err));
            }
          }
        },
        get: (id, ctx) => {
          const path = id.split('/');
          if (path.length > 1) {
            const [namespace, get] = path;
            const mod = this.store[namespace];
            if (mod && mod.data) {
              return mod.data[get];
            }
          } else {
            const mod = this.store[null];
            if (mod && mod.data) {
              return mod.data[id];
            }
          }
        },
      };` : ""}
      const ____ = (prop, inst) => {
        this.update(prop);
      };
      const ____r = (name, use, once) => {
        this.runtime(name, use[0], use[1], once);
      };
      this.data = ${JSON.stringify(component.data)};
      this.refs = {
        ${
      component.refs
        ? Object.entries(component.refs).map(([key, value]) =>
          `'${key}': '${value}',`
        )
        : ""
    }
      }
      const Refs = this.refs;
      ${component.type === 'async' ? asyncResolve : ""}
      const run = ${runtime}
      this.runtime = (run || function(){}).bind(this.data);
    };
    `;
    Ogone.datas.push(result);
  }
}
