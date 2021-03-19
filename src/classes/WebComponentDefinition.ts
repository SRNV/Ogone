import Env from "./Env.ts";
import type { Bundle, Component, XMLNodeDescription } from "./../ogone.main.d.ts";
import { Utils } from "./Utils.ts";
import MapOutput from './MapOutput.ts';
import HMR from './HMR.ts';
/**
 * @name WebComponentDefinition
 * @code OWCD1-ONAC3-ORC8-OC0
 * @description will build the definition part and the render part.
 * this add for each components
 * ```ts
 * customElements.define(component.uuid, Ogone.classes[component.type]);
 * ```
 */
export default class WebComponentDefinition extends Utils {
  static mapRender: Map<string, string> = new Map();
  static mapTypes: Map<string, string> = new Map();
  protected render(
    bundle: Bundle,
    component: Component,
    node: XMLNodeDescription,
  ) {
    try {
      if (!component) return "";
      const isTemplate = node.tagName === null && node.nodeType === 1;
      const isImported = node.tagName ? component.imports[node.tagName] : false;
      const isProduction = Env._env === "production";
      let componentPragma = node.pragma
        ? node.pragma(bundle, component, true)
        : "";
      // no definition for imported component
      if (isImported) {
        return "";
      }
      const templateSlots = {
        component,
        elementId: isTemplate
          ? `${component.uuid}-nt`
          : `${component.uuid}-${node.id}`,
      };
      const variable = templateSlots.elementId.replace(/\-/gi, '_');
      let componentExtension = ``;
      const render = `Ogone.render[${variable}] = ${componentPragma
        .replace(/\n/gi, "")
        .replace(/\s+/gi, " ")
        }`;
      const types = `Ogone.types[${variable}] = ogone_types_{% component.type %};`;
      // transform the template with the slots
      const newrender = this.template(render, templateSlots);
      const newtypes = this.template(types, templateSlots);
      // save it into the MapOutputs
      MapOutput.outputs.render.push(newrender);
      MapOutput.outputs.types.push(newtypes);
      // send changes through HMR
      if (isTemplate) {
        WebComponentDefinition.sendChanges({
          node,
          key: component.uuid,
          component,
          render: newrender,
          types: newtypes,
        });
      }
      if (["controller"].includes(component.type)) {
        return `class extends HTMLTemplateElement {
        constructor(){super();}
        connectedCallBack(){this.remove()} };`;
      }
      return this.template(componentExtension, templateSlots);
    } catch (err) {
      this.error(`WebComponentDefinition: ${err.message}
${err.stack}`);
    }
  }
  /**
   * start sending changes through HMR
   * save the initial state
   */
  static sendChanges(opts: {
    component: Component;
    node: XMLNodeDescription;
    key: string;
    render: string;
    types: string;
  }) {
    const { render, types, key, component, node } = opts;
    const output = `
    ${MapOutput.outputs.vars
      .filter((v) => v && v.includes(component.uuid))
      .join('\n')}
    ${MapOutput.outputs.data
      .filter((v) => v && v.includes(component.uuid))
      .join('\n')}
    ${MapOutput.outputs.types
      .filter((v) => v && v.includes(component.uuid))
      .join('\n')}
      ${MapOutput.outputs.context
        .filter((v) => v && v.includes(component.uuid))
        .join('\n')}
    ${render}
    `;
    if (this.mapRender.has(key)) {
      const item = this.mapRender.get(key)!;
      if (item !== node.dna) {
        HMR.postMessage({
          output,
          invalid: item,
          uuid: component.uuid,
          type: 'render',
        });
        this.mapRender.set(key, node.dna);
      }
    } else {
      this.mapRender.set(key, node.dna);
    }
  }
}
