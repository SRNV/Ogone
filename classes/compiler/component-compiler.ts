import { Bundle, Component } from "../../.d.ts";
import { Utils } from "../utils/index.ts";

const t = new Map();
export default class ComponentCompiler extends Utils {
  private getControllers(
    bundle: Bundle,
    component: Component,
  ): [string, any][] {
    const controllers = Object.entries(component.imports)
      .filter(([, path]) => {
        const comp = bundle.components.get(path);
        return comp && comp.type === "controller";
      });
    if (controllers.length && component.type !== "store") {
      this.error(
        this.template(
          `forbidden use of a controller inside a non-store component. \ncomponent: {{ component.file }}`,
          { component },
        ),
      );
    }
    return controllers;
  }
  public async read(bundle: Bundle, component: Component): Promise<void> {
    if (component.data instanceof Object) {
      const { runtime } = component.scripts;
      const { modules } = component;
      const controllers = this.getControllers(bundle, component);
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
      const store = `
        const Store = {
          dispatch: (id, ctx) => {
            const path = id.split('/');
            if (path.length > 1) {
              const [namespace, action] = path;
              const mod = this.store[namespace];
              if (mod && mod.runtime) {
                return mod.runtime(\`action:$\{action}\`, ctx)
                  .catch((err) => Ogone.error(err.message, \`Error in dispatch. action: \${action} component: {{ component.file }}\`, err));
              }
            } else {
              const mod = this.store[null];
              if (mod && mod.runtime) {
                return mod.runtime(\`action:$\{id}\`, ctx)
                  .catch((err) => Ogone.error(err.message, \`Error in dispatch. action: \${action} component: {{ component.file }}\`, err));
              }
            }
          },
          commit: (id, ctx) => {
            const path = id.split('/');
            if (path.length > 1) {
              const [namespace, mutation] = path;
              const mod = this.store[namespace];
              if (mod && mod.runtime) {
                return mod.runtime(\`mutation:$\{mutation}\`, ctx).catch((err) => Ogone.error(err.message, \`Error in commit. mutation: \${mutation} component: {{ component.file }}\`, err));
              }
            } else {
              const mod = this.store[null];
              if (mod && mod.runtime) {
                return mod.runtime(\`mutation:$\{id}\`, ctx).catch((err) => Ogone.error(err.message, \`Error in commit. mutation: \${id} component: {{ component.file }}\`, err));
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
        };`;
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
                 message: \`component: {{ component.file }}\`
                });
                throw DoubleUseOfResolveException;
              }
            },
          };
          // freeze Async Object;
          Object.freeze(Async);
          `;
      let result: string = `function () {
            OComponent.call(this);
            {{ controllerDef }}
            {{ hasStore }}
            const ____ = (prop, inst) => {
              this.update(prop);
            };
            const ____r = (name, use, once) => {
              this.runtime(name, use[0], use[1], once);
            };
            this.data = {{ data }};
            this.refs = {
              {{ refs }}
            };
            const Refs = this.refs;
            {{ asyncResolve }}
            {{ modules }}
            {{ protocol }}
            const __run = {{ runtime }}
            this.runtime = __run.bind(this.data);
          };
          `;
      const d = {
        component,
        modules: modules ? modules.flat().join("\n") : "",
        asyncResolve: component.type === "async" ? asyncResolve : "",
        protocol: component.protocol ? component.protocol : "",
        data: JSON.stringify(component.data),
        runtime: runtime,
        controllerDef: component.type === "store" ? controllerDef : "",
        refs: Object.entries(component.refs).length
          ? Object.entries(component.refs).map(([key, value]) =>
            `'${key}': '${value}',`
          )
          : "",
        hasStore: !!component.hasStore ? store : "",
      };
      result = this.template(result, d);
      if (t.has(result)) {
        const item = t.get(result);
        result = this.template(
          `Ogone.components['{{ component.uuid }}'] = Ogone.components['{{ item.id }}'];`,
          {
            component,
            item,
          },
        );
        bundle.datas.push(this.template(result, d));
      } else {
        t.set(result, {
          id: component.uuid,
        });
        bundle.datas.push(
          this.template(
            `Ogone.components['{{ component.uuid }}'] = ${result.trim()}`,
            d,
          ),
        );
      }
    }
  }
}
