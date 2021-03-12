import type { Bundle, XMLNodeDescription, Component } from "../ogone.main.d.ts";
import { MapPosition } from "./MapPosition.ts";
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
    try {
      bundle.components.forEach((c) => {
        c.rootNode.childNodes.filter((node, id) => id !== 0).forEach(
          (node) => {
            if (
              node.nodeType === 3 && node.rawText && node.rawText.trim().length
            ) {
              const position = MapPosition.mapNodes.get(node)!;
              this.error(
                `${c.file}:${position && position.line || 0}:${position && position.column || 0}\n\tTop level text are not allowed, excepted for the first lines, these will serve for the imports, services.\nplease wrap this text into the template:\n\t${node.rawText.trim()}\n\t`,
              );
            }
          },
        );
      });
    } catch (err) {
      this.error(`ComponentTopLevelAnalyzer: ${err.message}
${err.stack}`);
    }
  }
  /**
   * @method cleanRoot
   * @param bundle {Bundle}
   * @description rootNode clean up: removes style script proto tags from rootNode, also removes empty textnodes
   */
  cleanRoot(bundle: Bundle) {
    try {
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
    } catch (err) {
      this.error(`ComponentTopLevelAnalyzer: ${err.message}
${err.stack}`);
    }
  }
  /**
   *
   * @param bundle {Bundle}
   * @description start reading the components and focus the rootNode to the template
   * because proto style tags are no more needed at this step
   * after this, top level is template tag level
   */
  public switchRootNodeToTemplateNode(bundle: Bundle) {
    try {
      this.read(bundle);
      bundle.components.forEach((component: Component) => {
        const forbiddenNode = component.rootNode.childNodes.find((n: XMLNodeDescription) => n
          && n.nodeType === 1
          && !["template", "proto"].includes(n.tagName as string));
        if (forbiddenNode) {
          const position = MapPosition.mapNodes.get(forbiddenNode)!;
          this.error(`Component Structure Error: ${component.file}:${position.line}:${position.column}
          [v0.29.0] Only proto and template elements are allowed at the top-level of the component:
          please follow this pattern:
            <template>
              <${forbiddenNode.tagName} />
            </template>
            <proto>
              ...
            </proto>

          you're getting this error cause the ${forbiddenNode.tagName} element is not wrapped into the template element.
          This is to keep a scalable structure for your components.

          Also note that since 0.29.0, to style your component you will need to define the style element into the template element.
          the first style elements will be scoped as before 0.29.0
        `)
        }
        if (component.elements.template) {
          component.rootNode.childNodes = component.elements.template.childNodes.slice();
          component.rootNode.childNodes.forEach((n: XMLNodeDescription) => {
            n.parentNode = component.rootNode;
          });
        }
      });
    } catch (err) {
      this.error(`ComponentTopLevelAnalyzer: ${err.message}
${err.stack}`);
    }
  }
}
