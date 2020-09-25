import type { Bundle, XMLNodeDescription, Component } from "../.d.ts";
import { Utils } from "./Utils.ts";
/**
 * @name ComponentTopLevelAnalyzer
 * @code OCTLA5
 * @description analyses if all is good inside the component
 * no text is allowed between the tags
 * and only <proto>, <template> and <style> tags are allowed at the top level
 */
export default class ComponentTopLevelAnalyzer extends Utils {
  /**
   * @method read
   * @param bundle {Bundle}
   * @description throw Error: text is not allowed excepted for the first line
   */
  read(bundle: Bundle) {
    bundle.components.forEach((c) => {
      c.rootNode.childNodes.filter((node, id) => id !== 0).forEach(
        (node) => {
          if (
            node.nodeType === 3 && node.rawText && node.rawText.trim().length
          ) {
            this.error(
              `Top level text are not allowed, excepted for the first lines, these will serve for the imports, services.\nplease wrap this text into an element:\t${node.rawText.trim()}\n\tcomponent: ${c.file}`,
            );
          }
        },
      );
    });
  }
  /**
   * @method cleanRoot
   * @param bundle {Bundle}
   * @description rootNode clean up: removes style script proto tags from rootNode, also removes empty textnodes
   */
  cleanRoot(bundle: Bundle) {
    bundle.components.forEach((c: Component) => {
      c.rootNode.childNodes = c.rootNode.childNodes.filter((node, id) => {
        return node.tagName !== "style" &&
          node.tagName !== "script" &&
          node.tagName !== "proto" &&
          node.nodeType !== 8 ||
          (node.nodeType === 3 && node.rawText &&
            !node.rawText.trim().length) ||
          (id === 0 && node.nodeType !== 3);
      });
    });
  }
  /**
   *
   * @param bundle {Bundle}
   * @description start reading the components and focus the rootNode to the template
   * because proto style tags are no more needed at this step
   * after this, top level is template tag level
   */
  public switchRootNodeToTemplateNode(bundle: Bundle) {
    this.read(bundle);
    bundle.components.forEach((component: Component) => {
      const forbiddenNode = component.rootNode.childNodes.find((n: XMLNodeDescription) => n
        && n.nodeType === 1
        && !["template", "proto", "style"].includes(n.tagName as string));
      if (forbiddenNode) {
        this.error(`Component Structure Error: ${component.file}
          [v0.20.0] Only proto, template and style elements are allowed at the top-level of the component:
          please follow this pattern:
            <proto>
              ...
            </proto>
            <template>
              <${forbiddenNode.tagName} />
            </template>
            <style>
              ...
            </style>
          you're getting this error cause the ${forbiddenNode.tagName} element is not wrapped into the template element.
          This is to keep a scalable structure for your components.
        `)
      }
      if (component.elements.template) {
        component.rootNode.childNodes = component.elements.template.childNodes.slice();
        component.rootNode.childNodes.forEach((n: XMLNodeDescription) => {
          n.parentNode = component.rootNode;
        });
      }
    });
  }
}
