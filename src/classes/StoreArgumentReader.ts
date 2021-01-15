import type { Bundle } from "../ogone.main.d.ts";
import { YAML } from '../../deps/yaml.ts';
import { Utils } from "./Utils.ts";

/**
 * TODO provide a way to filter the data that we want from the store
 * @name StoreArgumentReader
 * @code OSAR6
 * @code OSAR6-OC0
 * @description this class will inspect all stores
 * few errors are fired, for example, this will trigger an error as it's forbidden to nest an element inside a StoreComponent:
 * ```html
 * <store-component>
 *  <div></div>
 * </store-component>
 * ```
 * the developer should be able to cherry-pick the data, actions, mutations that he want to plug to his component
 *
 * ```html
 * <store-component>
 *  data:
 *    - myData
 *  actions:
 *    - myAction
 *    - myotherAction
 *  mutations:
 *    - myMutation
 * </store-component>
 * ```
 * @dependency YAML
 */
export default class StoreArgumentReader extends Utils {
  read(bundle: Bundle) {
    try {
      const entries = Array.from(bundle.components.entries());
      entries.forEach(([pathToComponent, component]) => {
        if (!component.rootNode || component.type === "store") return;
        // not recursive
        // get all top level store declarations
        const cr = component.rootNode.childNodes;
        const stores = cr.filter((child) => {
          const { tagName } = child;
          if (!tagName) return;
          const isImported = component.imports[tagName];
          const subComponent = bundle.components.get(isImported);
          return subComponent && subComponent.type === "store";
        });
        component.hasStore = stores.length > 0;
        stores.forEach((store) => {
          // throw exceptions if there is anything else than a textnode
          const forbiddenElement = store.childNodes.find((c) => c.nodeType !== 3);
          if (forbiddenElement) {
            this.error(
              `elements are note allowed inside store elements ${forbiddenElement.tagName} \n\t Error in component: ${component.file}`,
            );
          }
          // we need to get the textnode inside the store element
          const textnode = store.childNodes[0];
          if (textnode) {
            const data = YAML.parse(textnode.rawText as string, {});
            console.warn(data);
            // TODO finish filters
          }
          // store modules can be empty if the element is an auto-closing element
          // in this case the developper seems to use all actions, states of the store
        });
      });
    } catch (err) {
      this.error(`StoreArgumentReader: ${err.message}`);
    }
  }
}
