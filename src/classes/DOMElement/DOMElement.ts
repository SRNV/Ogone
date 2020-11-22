import DOMElementObject, { DOMElementInterface } from './DOMElementObject.ts';
import DOMElementSPA from "./DOMElementSPA.ts";
import DOMElementRegistry from '../DOMElementRegistry.ts';

/**
 * class that participate to the DOM Tree description
 */
export default class DOMElement extends DOMElementSPA {
  constructor(opts: DOMElementInterface) {
    super(opts);
    DOMElementRegistry.subscribe(this.uuid, this);
  }
  setParent(parent: DOMElement) {
    this.parent = parent;
  }
  setChild(child: DOMElement) {
    this.children.push(child);
  }
}