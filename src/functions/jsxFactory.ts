import type { JSXFactory, JSXFragmentFactory, Attributes } from '../../types.d.ts';
import { colors } from '../../deps.ts';
import DOMElement from '../classes/DOMElement/DOMElement.ts';
import OgoneComponentRegistry from '../classes/OgoneComponentRegistry.ts';
import DOMElementDescriber from '../classes/DOMElementDescriber.ts';
import type { DOMElementDescription } from '../classes/DOMElementDescriber.ts';
import DOMElementRegistry from '../classes/DOMElementRegistry.ts';
import ModuleResolver from '../classes/ModuleResolver.ts';

function setAttributes(element: DOMElement, attributes: Attributes) {
  // TODO directives inside attributes
  const entries = Object.entries(attributes);
  entries.forEach(([key, value]) => {
    // if the attribute is a function
    // save it as a child of the element
    // this will allow to bind the attribute
    if (typeof value === 'function') {
      element.setChild(new DOMElement({
        value,
        name: key,
        nodeType: 2,
        parent: element,
        children: []
      }));
      if (element.attributes) {
        delete element.attributes[key];
      }
      return;
    }
    element.setChild(new DOMElement({
      value,
      name: key,
      nodeType: 2,
      parent: element,
      children: []
    }));
  });
}
/**
 * jsxFactory
 */
export function h(...args: JSXFactory) {
  const [tag, attributes, ...children] = args;
  const component = OgoneComponentRegistry.getItemByTemplate(tag);
  if (component) {
    /**
     * if the component exists we can render it by setting isImported to true
     */
    component.isImported = true;
  }
  const element = new DOMElement({
    name: tag && tag.name ? tag.name : tag.toString(),
    nodeType: 1,
    children: [],
    component,
    attributes,
    date: performance.now(),
  });
  if (attributes) {
    setAttributes(element, attributes);
  }
  if (tag === hf) {
    element.nodeType = 11;
    element.name = undefined;
    return hf(...children);
  }
  // assign to the children the parent element
  // assign the nodeType to the children
  if (children.length) {
    children.flat().forEach((child: unknown, i: number, arr: unknown[]) => {
      let domelement: DOMElement;
      if (child instanceof DOMElement) {
        child.setParent(element);
        element.setChild(child);
        child.date = performance.now();
      } else {
        domelement = new DOMElement({
          value: child,
          children: [],
          date: performance.now(),
        })
        const isArrowIterationFunction: DOMElementDescription | null = DOMElementDescriber.getArrowFunctionDescription(child as any);
        if (isArrowIterationFunction) {
          // save the arrow iteration informations
          domelement.isArrowIterationFunction = isArrowIterationFunction;
          // need to use the arrow function, to get the child domelement
          try {
            //
            const newChild = (child as (el: unknown, i: number, arr: unknown[]) => DOMElement)(void 0, 0, []) as (DOMElement);
            // set child and set parent
            domelement.setChild(newChild);
            newChild.setParent(domelement);
          } catch (err) {
            const component = ModuleResolver.currentComponent;
            const { red, white, gray } = colors
            console.error(red(`[Ogone] error in component: ${component?.sourcePath}\n\nContext error, please note that all values are undefined during context analyze.\n${gray(err.stack)}`));
            Deno.exit(1);
          }
        } else if (child && typeof child === 'string'
          || child === null
          || typeof child === 'boolean'
          || typeof child === 'number'
          || child instanceof Function) {
          // get the nodetype
          domelement.nodeType = 3;
        }
        // TODO define what to do about objects
        // maybe we can think about a template switch with the objects
        // save the domelement
        domelement.setParent(element);
        element.setChild(domelement);
      }
    });
  }
  return element;
}
/**
 * jsxFragmentFactory
 */
export function hf(...children: JSXFragmentFactory): DOMElement[] {
  const controls: DOMElement[] = []
  children.flat().forEach((child: unknown, i: number, arr: any[]) => {
    let domelement: DOMElement;
    const isArrowIterationFunction: DOMElementDescription | null = DOMElementDescriber.getArrowFunctionDescription(child as any);
    if (isArrowIterationFunction) {
      domelement = new DOMElement({
        value: child,
        children: [],
        date: performance.now(),
      });
      isArrowIterationFunction.wrapperName = typeof arr[i -1] === 'string' && arr[i -1] ? arr[i -1].trim() : undefined;
      // save the arrow iteration informations
      domelement.isArrowIterationFunction = isArrowIterationFunction;
      // need to use the arrow function, to get the child domelement
      const newChild = (child as () => DOMElement)() as (DOMElement);
      // set child and set parent
      domelement.setChild(newChild);
      newChild.setParent(domelement);
      controls.push(domelement);
    }
  });
  return controls;
}