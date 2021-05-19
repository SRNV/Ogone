import type { Bundle, Component, XMLNodeDescription } from '../ogone.main.d.ts';
import { Configuration } from "./Configuration.ts";
import { MapPosition } from "./MapPosition.ts";
import Ogone from "../main/OgoneBase.ts";
import RouterAnalyzer from "./RouterAnalyzer.ts";
import { Utils } from "./Utils.ts";
import HMR from './HMR.ts';
import { absolute, existsSync } from '../../deps/deps.ts';

const registry: { [k: string]: { [c: string]: boolean } } = {};
/**
 * @name ComponentTypeGetter
 * @code OO2-OSB7-OC0
 * @description step to set the type of the components
 */
export default class ComponentTypeGetter extends Utils {
  private RouterAnalyzer: RouterAnalyzer = new RouterAnalyzer();
  public async setTypeOfComponents(bundle: Bundle): Promise<void> {
    try {
      bundle.components.forEach((component: Component) => {
        const proto = component.elements.proto[0];
        if (proto) {
          component.type = proto.attributes?.type as Component['type'] || 'component';
          bundle.types[component.type] = true;
        }
      });
    } catch (err) {
      this.error(`ComponentTypeGetter: ${err.message}
${err.stack}`);
    }
  }
  setApplication(bundle: Bundle) {
    try {
      const rootComponent: Component | undefined = bundle.components.get(Configuration.entrypoint);
      const entries = Array.from(bundle.components.entries()).map(([, c]) => c);
      if (rootComponent) {
        const { head, template } = rootComponent.elements;
        if (rootComponent.type !== "app") {
          this.error(`${rootComponent.file}\n\troot component type should be defined as app.`);
        }
        if (head && head.getInnerHTML) {
          const headHasChanged = Configuration.setHead(head.getInnerHTML());
          if (headHasChanged) {
            this.infos('head element has changed. waiting 1 second before reloading application.');
            setTimeout(() => {
              this.infos('head element changed, reloading.');
              HMR.postMessage({
                type: 'reload',
              });
            }, 1000);
          }
          if (template) {
            // remove the head in the template
            template.childNodes.splice(
              template.childNodes.indexOf(head),
              1
            );
          }
        }
        this.setApplicationConfiguration(rootComponent);
        rootComponent.type = "component";
      }
      // change all the sub component that are typed as app
      entries.forEach((component: Component) => {
        if (component.type === 'app') {
          component.type = 'component';
        }
      });
    } catch (err) {
      this.error(`ComponentTypeGetter: ${err.message}
${err.stack}`);
    }
  }
  forbiddenUseOfPrivateOnTemplate(bundle: Bundle) {
    try {
      bundle.components.forEach((component: Component) => {
        const template = component.elements.template;
        if (['store', 'router', 'controller'].includes(component.type) && template) {
          const position = MapPosition.mapNodes.get(template)!;
          if (template.attributes.private || template.attributes.protected) {
            this.error(`${component.file}:${position.line}:${position.column}\n\t
            Using a private|protected template is not allowed for ${component.type} components
            `);
          }
        } else if (template && template.attributes.private && template.attributes.protected) {
          const position = MapPosition.mapNodes.get(template)!;
          this.error(`${component.file}:${position.line}:${position.column}\n\t
          cannot set both, private and protected, on template. please choose one attribute.
          `);
        }
      });
    } catch (err) {
      this.error(`ComponentTypeGetter: ${err.message}
${err.stack}`);
    }
  }
  public assignTypeConfguration(bundle: Bundle): void {
    try {
      registry[bundle.uuid] = registry[bundle.uuid] || {};
      bundle.components.forEach((component: Component) => {
        const proto = component.elements.proto[0];
        const position = MapPosition.mapNodes.get(proto)!;
        if (proto) {
          const { type } = component as Component;
          if (!Ogone.allowedTypes.includes(type as string)) {
            this.error(
              `${component.file}:${position.line}:${position.column}\n\t
              ${type} is not supported, in this version.
                supported types of component: ${Ogone.allowedTypes.join(" ")}`,
            );
          }
          if (type === "controller") {
            const namespace = proto.attributes.namespace;
            if (namespace && /[^\w]/gi.test(namespace as string)) {
              const char = (namespace as string).match(/[^\w]/);
              this.error(
                `${component.file}:${position.line}:${position.column}\n\tforbidden character in namespace found. please remove it.\ncharacter: ${char}`,
              );
            }
            if (namespace && (namespace as string).length) {
              // set the component type, default is null
              component.namespace = (namespace as string);
            } else {
              this.error(
                `${component.file}:${position.line}:${position.column}\n\tproto's namespace is missing in ${type} component.\nplease set the attribute namespace, this one can't be empty.`,
              );
            }
            // TODO add possibility to import modules
            const comp = {
              namespace: component.namespace,
              protocol: `(${component.context.protocolClass})`,
              runtime: `${component.scripts.runtime}`,
              file: component.file,
            };
            if (registry[bundle.uuid] && registry[bundle.uuid][comp.namespace as string]) {
              this.error(
                `${component.file}:${position.line}:${position.column}\n\tnamespace already used`,
              );
            }
            // save the controller
            Ogone.controllers[comp.namespace as string] = comp;
            registry[bundle.uuid][comp.namespace as string] = true;
          }
          if (type === "router") {
            if (!component.data.routes) {
              const position = MapPosition.mapNodes.get(proto)!;
              this.error(`${component.file}:${position.line}:${position.column}\nall router components should provide routes through a def modifier`);
            }
            component.routes = this.RouterAnalyzer.inspectRoutes(
              bundle,
              component,
              Object.values(component.data.routes),
            );
            component.data = {};
          }

          if (type === "store") {
            if (proto.attributes.namespace) {
              // set the component type, default is null
              component.namespace = (proto.attributes.namespace as string);
            }
          }
          if (["store", "controller"].includes(type as string)) {
            // check if there is any forbidden element
            component.rootNode.childNodes
              .filter((child: XMLNodeDescription) => {
                return child.tagName && child.tagName !== "proto";
              })
              .map((child: XMLNodeDescription) => {
                const position = MapPosition.mapNodes.get(child)!;
                this.error(
                  `${component.file}:${position.line}:${position.column}\n\ta forbidden element found in ${type} component.\nelement: ${child.tagName}`,
                );
              });

          }
        }
      });
    } catch (err) {
      this.error(`ComponentTypeGetter: ${err.message}
${err.stack}`);
    }
  }
  setApplicationConfiguration(component: Component) {
    let result;
    if (component.elements.proto) {
      const [proto] = component.elements.proto;
      result = proto.attributes.base as string;
      if (result) {
        const position = MapPosition.mapNodes.get(proto)!;
        if (!result.startsWith('.')) {
          this.error(`${component.file}:${position.line}:${position.column}\n\t path to base folder has to be relative to the component.`)
        }
        result = absolute(component.file, result);
        if (!existsSync(result)) {
          this.error(`${component.file}:${position.line}:${position.column}\n\t base folder does not exist.`);
        }
        const info = Deno.statSync(result);
        if (info.isFile) {
          this.error(`${component.file}:${position.line}:${position.column}\n\t a folder is required for proto's base attribute.`);
        }
      }
    }
    Configuration.static = result ? `${
      result
        .replace(/^\.+/, '')
        .replace(/\/$/, '')
        .replace(/^\//, '')
    }/` : Configuration.static;
  }
}
