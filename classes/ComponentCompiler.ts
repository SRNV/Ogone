import type { Bundle, Component } from "../.d.ts";
import { Utils } from "./Utils.ts";
import Env from './Env.ts';
/**
 * @name ComponentCompiler
 * @code OCC2-ORC8-OC0
 * @description this will build Components and add access to APIs like: Async, Refs, Controllers, Store
 */
export default class ComponentCompiler extends Utils {
  public async startAnalyze(bundle: Bundle): Promise<void> {
    const entries = Array.from(bundle.components);
    for await (let [, component] of entries) {
      await this.read(bundle, component);
    }
  }
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
    const { mapRender } = bundle;
    if (component.data instanceof Object) {
      const { runtime } = component.scripts;
      const { modules } = component;
      const controllers = this.getControllers(bundle, component);
      const controllerDef = controllers.length > 0
        ? `
            const Controllers = {};
            ${controllers.map(([tagName, path]) => {
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
      let result: string = `function __component (__NODE) {
            OComponent.call(this);
            {{ controllerDef }}
            {{ hasStore }}
            const ___ = (prop, inst, value) => {
              this.update(prop);
              {{ attributeChangedCallback }}
              return value;
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
      const attributeChangedCallback = component.context.reuse ? `if (__NODE.attributeChangedCallback) {
        ___NODE.attributeChangedCallback(prop, value);
      }` : '';
      const d = {
        component,
        attributeChangedCallback,
        modules: modules && Env._env !== "production" ? modules.flat().join("\n") : "",
        asyncResolve: component.type === "async" ? asyncResolve : "",
        protocol: component.protocol ? component.protocol : "",
        data: component.isTyped ?
          // setReactivity will transform the instance to a proxy
          `Ogone.setReactivity(new (${component.context.protocolClass}), (prop) => this.update(prop))`
          // if the end user uses def modifier, the reactivity is inline
          : JSON.stringify(component.data),
        runtime,
        controllerDef: component.type === "store" ? controllerDef : "",
        refs: Object.entries(component.refs).length
          ? Object.entries(component.refs).map(([key, value]) =>
            `'${key}': '${value}',`
          )
          : "",
        hasStore: !!component.hasStore ? store : "",
      };
      result = (await Deno.transpileOnly({
        "/transpiled.ts": `  ${this.template(result, d)}`,
      }, { sourceMap: false, }))["/transpiled.ts"].source;
      if (mapRender.has(result)) {
        const item = mapRender.get(result);
        result = this.template(
          `Ogone.components['{{ component.uuid }}'] = Ogone.components['{{ item.id }}'];`,
          {
            component,
            item,
          },
        );
        bundle.datas.push(this.template(result, d));
      } else {
        mapRender.set(result, {
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
