import type { Bundle, Component } from "../ogone.main.d.ts";
import { Utils } from "./Utils.ts";
import Env from './Env.ts';
import { ComponentEngine } from '../enums/componentEngine.ts';
import MapOutput from "./MapOutput.ts";
import TSTranspiler from "./TSTranspiler.ts";
// TODO create a file dedicated to the APIs
/**
 * @name ComponentCompiler
 * @code OCC2-ORC8-OC0
 * @description this will build Components and add access to APIs like: Async, Refs, Controllers, Store
 */
export default class ComponentCompiler extends Utils {
  public async startAnalyze(bundle: Bundle): Promise<void> {
    try {
      const entries = Array.from(bundle.components);
      for await (let [, component] of entries) {
        await this.read(bundle, component);
      }
    } catch (err) {
      this.error(`ComponentCompiler: ${err.message}
${err.stack}`);
    }
  }
  private getControllers(
    bundle: Bundle,
    component: Component,
  ): [string, any][] {
    try {
      const controllers = Object.entries(component.imports)
        .filter(([, path]) => {
          const comp = bundle.components.get(path);
          return comp && comp.type === "controller";
        });
      if (controllers.length && component.type !== "store") {
        this.error(
          this.template(
            `forbidden use of a controller inside a non-store component. \ncomponent: {% component.file %}`,
            { component },
          ),
        );
      }
      return controllers;
    } catch (err) {
      this.error(`ComponentCompiler: ${err.message}
${err.stack}`);
    }
  }
  public async read(bundle: Bundle, component: Component): Promise<void> {
    try {
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
                  .catch((err) => Ogone.displayError(err.message, \`Error in dispatch. action: \${action} component: {% component.file %}\`, err));
              }
            } else {
              const mod = this.store[null];
              if (mod && mod.runtime) {
                return mod.runtime(\`action:$\{id}\`, ctx)
                  .catch((err) => Ogone.displayError(err.message, \`Error in dispatch. action: \${action} component: {% component.file %}\`, err));
              }
            }
          },
          commit: (id, ctx) => {
            const path = id.split('/');
            if (path.length > 1) {
              const [namespace, mutation] = path;
              const mod = this.store[namespace];
              if (mod && mod.runtime) {
                return mod.runtime(\`mutation:$\{mutation}\`, ctx).catch((err) => Ogone.displayError(err.message, \`Error in commit. mutation: \${mutation} component: {% component.file %}\`, err));
              }
            } else {
              const mod = this.store[null];
              if (mod && mod.runtime) {
                return mod.runtime(\`mutation:$\{id}\`, ctx).catch((err) => Ogone.displayError(err.message, \`Error in commit. mutation: \${id} component: {% component.file %}\`, err));
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
                Ogone.displayError(DoubleUseOfResolveException.message, 'Double Resolution of Promise', {
                 message: \`component: {% component.file %}\`
                });
                throw DoubleUseOfResolveException;
              }
            },
          };
          // freeze Async Object;
          Object.freeze(Async);
          `;
        let result: string = `function OgoneComponentRuntime () {
            Ogone.createComponent.call(this);
            {% controllerDef %}
            {% hasStore %}
            const ___ = (prop, inst, value) => {
              this.update(prop);
              return value;
            };
            const ____r = (name, use, once) => {
              this.runtime(name, use[0], use[1], once);
            };
            this.data = {% data %};
            this.refs = {
              {% refs %}
            };
            const Refs = this.refs;
            {% asyncResolve %}
            {% modules %}
            {% protocol %}
            const __run = {% runtime %}
            this.runtime = __run.bind(this.data);
          };
          `;
        const d = {
          component,
          modules: modules && Env._env !== "production" ? modules.flat().join("\n") : "",
          asyncResolve: component.type === "async" ? asyncResolve : "",
          protocol: component.protocol ? component.protocol : "",
          dataSource: component.isTyped
            ? `new (${component.context.protocolClass})`
            : JSON.stringify(component.data),
          data: component.isTyped
            || component.context.engine.includes(ComponentEngine.ComponentProxyReaction)
            && !component.context.engine.includes(ComponentEngine.ComponentInlineReaction) ?
            // setReactivity will transform the instance to a proxy
            `Ogone.setReactivity({% dataSource %}, (prop) => this.update(prop))`
            // if the end user uses the def modifier, the reactivity is inline
            : '{% dataSource %}',
          runtime,
          controllerDef: component.type === "store" ? controllerDef : "",
          refs: Object.entries(component.refs).length
            ? Object.entries(component.refs).map(([key, value]) =>
              `'${key}': '${value}',`
            )
            : "",
          hasStore: !!component.hasStore ? store : "",
        };
        result = await TSTranspiler.transpile(`  ${this.template(result, d)}`);
        if (mapRender.has(result)) {
          const item = mapRender.get(result);
          result = this.template(
            `Ogone.components['{% component.uuid %}'] = Ogone.components['{% item.id %}'];`,
            {
              component,
              item,
            },
          );
          MapOutput.outputs.data.push(this.template(result, d))
        } else {
          mapRender.set(result, {
            id: component.uuid,
          });
          MapOutput.outputs.data.push(this.template(
            `Ogone.components['{% component.uuid %}'] = ${result.trim()}`,
            d,
          ));
        }
      }
    } catch (err) {
      this.error(`ComponentCompiler: ${err.message}
${err.stack}`);
    }
  }
}
