import type { DOMElementDescription } from '../DOMElementDescriber.ts';
import Patterns from "../Patterns.ts";
import Utils from '../Utils.ts';
import DOMElementObject, { DOMElementInterface } from './DOMElementObject.ts';

/**
 * class to get all Single Page Application's utils
 * related to the DOMElementObject
 */
export default class DOMElementSPA extends DOMElementObject {
  constructor(opts: DOMElementInterface) {
    super(opts);
  }
  get declarationSPA(): string | undefined {
    if (this.isBoundAttribute) {
      /**
       * the DOMElementObject is a dynamic attribute
       */
      return `${this.uuid}, ${this.uuid}_prev, ${this.uuid}_next`
    }
    if (this.isBoundTextnode) {
      /**
       * if the element is a bound textnode
       * it should use as vars
       * one for the textnode element: new Text(' ')
       * one for the previous value
       * one for the next value
       * one for the update function
       */
      return `${this.uuid}, ${this.uuid}_prev, ${this.uuid}_update, ${this.uuid}_next`;
    }
    if (this.isComponent) {
      /**
       * if the element is a component
       * it should use as vars
       * one for the component element: document.createElement('my-component')
       * one for props function
       */
      return `${this.uuid}, ${this.uuid}_props`;
    }
    if (this.nodeType && [11, 2].includes(this.nodeType)) {
      return undefined;
    }
    return this.uuid;
  }
  get assignementSPA(): string | undefined {
    if (this.isBoundAttribute) {
      /**
       * set the function for the attribute
       */
      return `${this.uuid} = (${(this.value as Function).toString()});`
    }
    if (this.isBoundTextnode) {
      /**
       * if the element is a bound textnode
       * it should use as vars
       * one for the textnode element: new Text(' ')
       * one for the previous value
       * one for the next value
       * one for the update function
       */
      return `${this.uuid} = new Text(' ');
        ${this.uuid}_update = (${this.value});
        ${this.uuid}.data = ${this.uuid}_update();`;
    }
    if (this.isTextnode) {
      return `${this.uuid} = \`${this.value}\``;
    }
    if (this.isComponent && this.component) {
      /**
       * if the element is a component
       * it should use as vars
       * one for the component element: document.createElement('my-component')
       * one for props function
       */
      return `${this.uuid} = crt('${this.component.dataUuidForSPA}');
      ${this.uuid}_props = {};
      `;
    }
    if (this.isArrowIterationFunction) {
      const {
        wrapperName = 'ogone-list'
      } = this.isArrowIterationFunction;
      /**
       * the ogone-list element will wrap the list
       * this allows a better list management
       */
      return `${this.uuid} = crt('${wrapperName}', ${this.isInSVG});`;
    }
    if (this.nodeType && [11, 2].includes(this.nodeType)) {
      return undefined;
    }
    return `${this.uuid} = crt('${this.name}', ${this.isInSVG});`;
  }
  get appendChildSPA(): string | undefined {
    if (this.nodeType && [11].includes(this.nodeType)) {
      return undefined;
    }
    if (this.isBoundAttribute && !this.parent?.isComponent) {
      /**
       * set the attribute at the init using the function to get the value
       */
      return `${this.uuid}_prev = ${this.uuid}(component); att(${(this.parent as DOMElementObject).uuid}, '${this.name}', ${this.uuid}_prev);`;
    }
    if (this.isBoundAttribute && this.parent?.isComponent) {
      const parentUuid = this.parent.uuid;
      /**
       * set the attribute at the init using the function to get the value
       */
      return `${this.uuid}_prev = ${this.uuid}(component);
      if (${parentUuid}_props) {
        ${parentUuid}_props['${this.name}'] = ${this.uuid}_prev;
        ${parentUuid} && ${parentUuid}.props && ${parentUuid}.props(${parentUuid}_props);
      }`;
    }
    if (this.nodeType === 2 && this.parent && !this.parent.isTemplate) {
      return `att(${this.parent.uuid}, '${this.name}', '${this.value}');`
    }
    if (this.parent && this.parent.parent || this.parent && this.parent.isTemplate) {
      return `app(${this.parent.uuid}, ${this.uuid});`;
    }
  }
  get updateSPA(): string | undefined {
    if (this.isBoundAttribute && !this.parent?.isComponent) {
      /**
       * set the attribute at the init using the function to get the value
       */
      return `
      ${this.uuid}_next = ${this.uuid}(component);
      if (${this.uuid}_prev !== ${this.uuid}_next) {
        att(${(this.parent as DOMElementObject).uuid}, '${this.name}', ${this.uuid}_next);
        ${this.uuid}_prev = ${this.uuid}_next;
      }`
    }
    if (this.isBoundAttribute && this.parent?.isComponent) {
      const parentUuid = this.parent.uuid;
      /**
       * set the new value
       * compare it to the previous value
       */
      return `
      ${this.uuid}_next = ${this.uuid}(component);
      if (${this.uuid}_prev !== ${this.uuid}_next) {
        ${parentUuid}_props['${this.name}'] = ${this.uuid}_next;
        ${this.uuid}_prev = ${this.uuid}_next;
      }`
    }
    if (this.isBoundTextnode) {
      /**
       * the element is dynamic textnode
       * it should check the new value before updating
       */
      return `${this.uuid}_next = ${this.uuid}_update(component);
      if (${this.uuid}_prev !== ${this.uuid}_next) {
        ${this.uuid}.data = ${this.uuid}_next;
        ${this.uuid}_prev = ${this.uuid}_next;
      }`;
    }
    if (this.isComponent) {
      return `${this.uuid} && ${this.uuid}.props && ${this.uuid}.props(${this.uuid}_props);`
    }
  }
  get returnTemplateStatementSPA() {
    if (this.isTemplate) {
      return `return ${this.uuid};`;
    }
  }
  get renderIterationFunctionNameSPA() {
    return `render_iteration_${this.uuid}`;
  }
  get renderIterationSubscriberSPA() {
    return `render_iteration_subscriber_${this.uuid}`;
  }
  get iterationCall() {
    return `${this.renderIterationFunctionNameSPA}();`;
  }
  get iterationBodySPA() {
    const infos = this.isArrowIterationFunction;
    const descendants = this.descendantsUntilNewContext as DOMElementSPA[];
    if (!infos || !descendants.length) return '';
    let childs_declarations = `let ${descendants
      .filter((domelement) => domelement.declarationSPA)
      .map((domelement) => domelement.declarationSPA)
      .join(',\n')};`;
    let childs_appends = descendants
      .filter((domelement) => domelement.appendChildSPA)
      .map((domelement) => domelement.appendChildSPA)
      .join('\n');
    let childs_assignments = descendants.slice()
      .sort((b, a) => a && b && a.date && b.date && a.date - b.date || -1)
      .map((domelement) => domelement.assignementSPA)
      .join('\n');
    let childs_update = descendants.slice()
    .sort((a, b) => a && b && a.date && b.date && a.date - b.date || -1)
    .map((domelement) => domelement.updateSPA)
      .join('\n')
    const body = Utils.renderPattern(Patterns.forDirectivePattern, {
      data: {
        array_value: infos.arrayValue,
        element_index: infos.index,
        element_name: infos.currentValue,
        element_array_name: infos.array,
        element_wrapper: this.uuid,
        removal_index: `${this.uuid}_rm`,
        wrapper_update_subscriber: this.renderIterationSubscriberSPA,
        childs_declarations,
        childs_appends,
        childs_assignments,
        childs_update,
        childs_set_attributes: '',
        childs_add_event_listener: '',
      }
    });
    return body;
  }
  getReassignmentFromArraySPA(infos: DOMElementDescription): string {
    if (this.nodeType === 1) {
      return `${this.uuid} = ${infos.array}[${infos.index}];`
    }
    return '';
  }
  get iterationDeclaration() {
    return `
    const ${this.renderIterationSubscriberSPA} = [];
    const ${this.renderIterationFunctionNameSPA} =  (function() {
      ${this.iterationBodySPA}
    }).bind(component)`;
  }
}