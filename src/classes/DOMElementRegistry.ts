import DOMElement from './DOMElement/DOMElement.ts';
import DOMElementRenderer from './DOMElement/DOMElementRenderer.ts';
/**
 * class to save all the element used
 */
export default class DOMElementRegistry extends DOMElementRenderer {
  public static subscribe(uuid: string, domelement: DOMElement) {
    if (!this.registry.has(uuid)) {
      this.registry.set(uuid, domelement);
    }
  }
}