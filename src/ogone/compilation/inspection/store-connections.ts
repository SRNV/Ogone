import { Bundle } from "../../../../.d.ts";

import { YAML } from "../../../../deps.ts";
import { Utils } from '../../../../classes/utils/index.ts';

export default function getStoreConnections(bundle: Bundle) {
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
      // throw exceptions if there is anything else than textnode
      const forbiddenElement = store.childNodes.find((c) => c.nodeType !== 3);
      if (forbiddenElement) {
        Utils.error(
          `elements are note allowed inside store elements ${forbiddenElement.tagName} \n\t Error in component: ${component.file}`,
        );
      }
      // we need to get the textnode inside the store element
      const textnode = store.childNodes[0];
      if (textnode) {
        const data = YAML.parse(textnode.rawText, {});
        console.warn(data);
      } else {
        // store modules can be empty if the element is an auto-closing element
        // in this case the developper seems to use all actions, states of the store
      }
    });
  });
}
