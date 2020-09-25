import Env from "./Env.ts";
import type { Bundle, Component, XMLNodeDescription } from "./../.d.ts";
import { Utils } from "./Utils.ts";
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
  protected render(
    bundle: Bundle,
    component: Component,
    node: XMLNodeDescription,
  ) {
    if (!component) return "";
    const isTemplate = node.tagName === null;
    const isImported = node.tagName ? component.imports[node.tagName] : false;
    const isProduction = Env._env === "production";
    const componentPragma = node.pragma
      ? node.pragma(bundle, component, true)
      : "";
    // no definition for imported component
    if (isImported) {
      return "";
    }
    const templateSlots = {
      component,
      classId: isTemplate
        ? `${component.uuid}-nt`
        : `${component.uuid}-${node.id}`,
      extension: isTemplate ? "HTMLTemplateElement" : `HTMLElement`,
    };
    let componentExtension = ``;
    let definition =
      `customElements.define('{{ classId }}', Ogone.classes['{{ component.type }}']({{ extension }}), { extends: 'template' });`;

    if (!isTemplate) {
      definition =
        `customElements.define('{{ classId }}', Ogone.classes['{{ component.type }}']({{ extension }}));`;
    }
    if (!isProduction) {
      // for HMR
      // asking if the customElement is already defined
      definition = `
        if (!customElements.get("{{ classId }}")) {
          ${definition}
        }
      `;
    }
    const render = `Ogone.render['{{ classId }}'] = ${componentPragma
        .replace(/\n/gi, "")
        .replace(/\s+/gi, " ")
      }`;
    bundle.customElements.push(this.template(definition, templateSlots));
    bundle.render.push(this.template(render, templateSlots));
    if (["controller"].includes(component.type)) {
      return `class extends HTMLTemplateElement {
        constructor(){super();}
        setOgone() {}
        connectedCallBack(){this.remove()} };`;
    }
    return this.template(componentExtension, templateSlots);
  }
}
