import Ogone from "../index.ts";
import { YAML } from "https://raw.githubusercontent.com/eemeli/yaml/master/src/index.js";
export default function getStoreConnections() {
const entries = Array.from(Ogone.components.entries());
entries.forEach(([pathToComponent, component]) => {
  if (!component.rootNodePure || component.type === 'store') return;
  // not recursive
  // get all top level store declarations
  const cr = component.rootNodePure.childNodes;
  const stores = cr.filter((child) => {
      const { tagName } = child;
      const isImported = component.imports[tagName];
      if (isImported) {
        const subComponent = Ogone.components.get(isImported);
        return subComponent.type === 'store';
      }
  });
  stores.forEach((store) => {

    // throw exceptions if there is anything else than textnode
    const forbiddenElement = store.childNodes.filter((c) => c.nodeType !== 3);
    if (forbiddenElement.length) {
      const StoreChildElementsFoundException = new DOMException(`[Ogone] elements are note allowed inside store elements ${forbiddenElement.tagName} \n\t Error in component: ${component.file}`)
      throw StoreChildElementsFoundException;
    }
    // we need to get the textnode inside the store element
    const textnode = store.childNodes[0];
    if (textnode) {
      const data = YAML.parse(textnode.value);
      console.warn(data);
    } else {
      // store modules can be empty if the element is an auto-closing element
      // in this case the developper seems to use all actions, states of the store
    }
  })
});
}