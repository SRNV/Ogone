import { Bundle, Component, XMLNodeDescription } from "../../../../.d.ts";
import { Utils } from '../../../../classes/utils/index.ts';

function hasController(bundle: Bundle, component: Component): string[][] {
  const controllers = Object.entries(component.imports)
    .filter(([, path]) => {
      const comp = bundle.components.get(path);
      return comp && comp.type === "controller";
    });
  if (controllers.length && component.type !== "store") {
    Utils.error(
      `forbidden use of a controller inside a non-store component. \ncomponent: ${component.file}`,
    );
  }
  return controllers;
}
export default async function (bundle: Bundle, component: Component) {
  if (component.data instanceof Object) {
    const { runtime } = component.scripts;
    const { modules } = component;
    const controllers = hasController(bundle, component);
    const controllerDef = controllers.length > 0
      ? `
      const Controllers = {};
      ${
        controllers.map(([tagName, path]) => {
          const subcomp = bundle.components.get(path);
          let result = subcomp
            ? `
      Controllers["${tagName}"] = {
          async get(rte) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`)).blob()).text(); },
          async post(rte, data = {}, op = {}) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`, { ...op, body: JSON.stringify(data || {}), method: 'POST'})).blob()).text(); },
          async put(rte, data = {}, op = {}) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`, { ...op,  body: JSON.stringify(data || {}), method: 'PUT'})).blob()).text(); },
          async delete(rte, data = {}, op = {}) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`, { ...op,  body: JSON.stringify(data || {}), method: 'DELETE'})).blob()).text(); },
          async patch(rte, data = {}, op = {}) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`, { ...op,  body: JSON.stringify(data || {}), method: 'PATCH'})).blob()).text(); },
        }`
            : "";
          return result;
        })
      }
      Object.seal(Controllers);
    `
      : "";
    const asyncResolve = `
    const Async = {
      resolve: (...args) => {
        if (this.resolve) {
          const promise = this.resolve(...args);
          if (this.dispatchAwait) {
            this.dispatchAwait();
            this.dispatchAwait = false;
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
      ${component.type === "store" ? controllerDef : ""}
      ${
      component.hasStore
        ? `
      const Store = {
        dispatch: (id, ctx) => {
          const path = id.split('/');
          if (path.length > 1) {
            const [namespace, action] = path;
            const mod = this.store[namespace];
            if (mod && mod.runtime) {
              return mod.runtime(\`action:$\{action}\`, ctx)
                .catch((err) => Ogone.error(err.message, \`Error in dispatch. action: \${action} component: ${component.file}\`, err));
            }
          } else {
            const mod = this.store[null];
            if (mod && mod.runtime) {
              return mod.runtime(\`action:$\{id}\`, ctx)
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
              return mod.runtime(\`mutation:$\{mutation}\`, ctx).catch((err) => Ogone.error(err.message, \`Error in commit. mutation: \${mutation} component: ${component.file}\`, err));
            }
          } else {
            const mod = this.store[null];
            if (mod && mod.runtime) {
              return mod.runtime(\`mutation:$\{id}\`, ctx).catch((err) => Ogone.error(err.message, \`Error in commit. mutation: \${id} component: ${component.file}\`, err));
            }
          }
        },
        get: (id) => {
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
      };`
        : ""
    }
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
      ${component.type === "async" ? asyncResolve : ""}
      ${modules ? modules.flat().join("\n") : ""}
      ${component.protocol ? component.protocol : ''}
      const __run = ${runtime}
      this.runtime = __run.bind(this.data);
    };
    `;
    bundle.datas.push(result);
  }
}
