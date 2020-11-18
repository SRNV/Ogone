import Utils from '../Utils.ts';
import OgoneComponent from '../OgoneComponent.ts';
import { increment } from '../../functions/increment.ts';
import type { DOMElementDescription } from '../DOMElementDescriber.ts';
import DOMElement from "./DOMElement.ts";
/**
 * base class of DOMElement/DOMElementSPA
 */

export type DOMTreeElement = DOMElementObject;
export interface DOMElementInterface {
  /** the parent element of the element, undefined if the element is on top */
  parent?: DOMTreeElement;
  /** the children of the element */
  children: DOMElement[];
  /** the name of the element */
  name?: string;
  /** the value of the element, defined if it's a textnode */
  value?: unknown;
  /** the type of the element
   * 1 for all elements including the fragments
   * 2 for attributes
   * 3 for textnodes
   * 11 for fragments
   */
  nodeType?: 1 | 2 | 3 | 11;
  /**
   * the element is a template and on top of the dom
   * or direct child of the top fragment
   */
  isTemplate?: boolean;
  /**
   * the element is a style element and on top of the dom
   * or direct child of the top fragment
   */
  isStyle?: boolean;
  /** the element is on top and it's a fragment element */
  isFragment?: boolean;
  /** the attributes of the element */
  attributes?: { [k: string]: unknown };
  /** related component */
  component?: OgoneComponent;
  /** whenever the end user uses an arrow function with three parameters
   * and the last one has an assignment.
   * this is only parsed when the arrow function is an element's child
   */
  isArrowIterationFunction?: DOMElementDescription;
  /**
   * to sort the element, we need to assign them a date, using Date.now()
   */
  date?: number;
}
export default class DOMElementObject extends Utils implements DOMElementInterface {
  parent: DOMElementInterface['parent'];
  children: DOMElementInterface['children'];
  name: DOMElementInterface['name'];
  nodeType: DOMElementInterface['nodeType'];
  value: DOMElementInterface['value'];
  attributes: DOMElementInterface['attributes'];
  component: DOMElementInterface['component'];
  isArrowIterationFunction: DOMElementInterface['isArrowIterationFunction'];
  date: DOMElementInterface['date'];
  id?: number;
  constructor(opts: DOMElementInterface) {
    super();
    const {
      nodeType,
      parent,
      name,
      children,
      value,
      attributes,
      component,
      isArrowIterationFunction,
      date = 0,
    } = opts;
    this.nodeType = nodeType;
    this.parent = parent;
    this.name = name;
    this.children = children;
    this.value = value;
    this.attributes = attributes;
    this.component = component;
    this.id = increment();
    this.isArrowIterationFunction = isArrowIterationFunction;
    this.date = date || performance.now();
  }
  get uuid(): string {
    const idType = this.isBoundTextnode ? 'bt'
      : this.isTemplate ? 'tmp'
        : this.isComponent ? 'c'
          : this.isArrowIterationFunction ? 'lp'
            : this.nodeType === 3 ? 't'
              : this.nodeType === 2 ? 'a'
                : 'n';
    return `${idType}${this.id}`;
  }
  get isTextnode(): boolean {
    return this.nodeType === 3 && !this.isBoundTextnode;
  }
  get isBoundTextnode(): boolean {
    return this.nodeType === 3 && typeof this.value === 'function';
  }
  get isBoundAttribute(): boolean {
    return this.nodeType === 2 && typeof this.value === 'function';
  }
  get isTemplate(): boolean {
    return this.nodeType === 1 && this.name === 'template' && (!this.parent || this.parent.isFragment);
  }
  get isStyle(): boolean {
    return this.nodeType === 1 && this.name === 'style' && (!this.parent || this.parent.isFragment);
  }
  get isFragment(): boolean {
    return this.nodeType === 11 && this.name === undefined && !this.parent;
  }
  get isComponent(): boolean {
    return this.nodeType === 1 && !!this.component && !this.isTemplate;
  }
  get isInSVG(): boolean {
    let result = this.name === 'svg';
    let parent = this.parent;
    while (parent && !result) {
      if (parent && parent.name === 'svg' || this.name === 'svg') {
        result = true;
        break;
      }
      parent = parent?.parent;
    }
    return result;
  }
  /**
   * if the element is used inside a iteration,
   * the rendering should be delayed,
   * true if one of the ancestors element is a directive
   */
  get isInArrowIteration(): boolean {
    let result = false;
    let parent = this.parent;
    while (parent) {
      if (parent && parent.isArrowIterationFunction) {
        result = true;
        break;
      }
      parent = parent?.parent;
    }
    return result;
  }
  /** returns the component that is using this element */
  get parentComponent(): OgoneComponent | undefined {
    let parent = this.parent;
    while (parent) {
      if (parent?.parent) {
        parent = parent?.parent;
      } else {
        break;
      }
    }
    return (parent || this).component;
  }
  /**
   * returns all the descendants domelement
   */
  get descendants(): DOMElementObject[] {
    const descendants: DOMElementObject[] = [];
    function recursive_children(children: DOMElementObject[]) {
      children.forEach((d) => {
        descendants.push(d);
        recursive_children(d.children);
      });
    }
    recursive_children(this.children);
    return descendants;
  }
    /**
   * returns all the descendants domelement until a new context is reached (ctx like a for directive)
   */
  get descendantsUntilNewContext(): DOMElementObject[] {
    const descendants: DOMElementObject[] = [];
    function recursive_children(children: DOMElementObject[]) {
      children.forEach((d) => {
        if (!d.isArrowIterationFunction) {
          descendants.push(d);
          recursive_children(d.children);
        }
      });
    }
    recursive_children(this.children);
    return descendants;
  }
}