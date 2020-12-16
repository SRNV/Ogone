import type { Bundle, Component, XMLNodeDescription } from '../.d.ts';
import { MapPosition } from "./MapPosition.ts";
import Ogone from "./Ogone.ts";
import RouterAnalyzer from "./RouterAnalyzer.ts";
import { Utils } from "./Utils.ts";

/**
 * @name ComponentTypeGetter
 * @code OO2-OSB7-OC0
 * @description step to set the type of the components
 */
export default class ComponentTypeGetter extends Utils {
  private RouterAnalyzer: RouterAnalyzer = new RouterAnalyzer();
  public async setTypeOfComponents(bundle: Bundle): Promise<void> {
    bundle.components.forEach((component: Component) => {
      const proto = component.elements.proto[0];
      if(proto) {
        component.type = proto.attributes?.type as Component['type'] || 'component';
        bundle.types[component.type] = true;
      }
    });
  }
  public assignTypeConfguration(bundle: Bundle): void {
    bundle.components.forEach((component: Component) => {
      const proto = component.elements.proto[0];
      const position = MapPosition.mapNodes.get(proto)!;
      if (
        component.requirements && component.data &&
        component.requirements.length
      ) {
        component.requirements.forEach(([key]) => {
          if (component.data[key]) {
            this.error(
              `${component.file}:${position.line}:${position.column}\n\t${key} is already defined in datas for component`,
            );
          }
          component.data[key] = null;
        });
      }
      if(proto) {
        const { type } = component as Component;
        if (!Ogone.allowedTypes.includes(type as string)) {
          this.error(
            `${component.file}:${position.line}:${position.column}\n\t
              ${type} is not supported, in this version.
                supported types of component: ${Ogone.allowedTypes.join(" ")}`,
          );
        }
        if (type === "controller") {
          const run = eval(component.scripts.runtime);
          if (run) {
            const namespace = proto.attributes.namespace;
            if (namespace && /[^\w]/gi.test(namespace as string)) {
              const char = (namespace as string).match(/[^\w]/);
              this.error(
                `forbidden character in namespace found. please remove it.\ncomponent: ${component.file}\ncharacter: ${char}`,
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
            const comp = {
              ns: component.namespace,
              data: component.data,
              runtime: (_state: any, ctx: any) => { },
            };
            comp.runtime = run.bind(comp.data);
            // save the controller
            Ogone.controllers[comp.ns as string] = comp;
          }
        }
        if (type === "router") {
          if(!component.data.routes) {
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
        if (["store", "controller", "router"].includes(type as string)) {
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
  }
}
