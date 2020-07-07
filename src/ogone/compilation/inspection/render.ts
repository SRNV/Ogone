import SUI from "https://raw.githubusercontent.com/jeanlescure/short_uuid/master/mod.ts";
import { existsSync } from "../../../../utils/exists.ts";
import domparse from "../../../../lib/dom-parser/index.ts";
import { Bundle, XMLNodeDescription } from "../../../../.d.ts";

const uuid: SUI = new SUI({
  length: 5,
  shuffle: false,
  debug: false,
  dictionary: ["a", "b", "x", "y", "z", "o", "r", "s", "n", "v", "3", "5"],
});
function getNewComponent(opts: any) {
  return {
    uuid: `data-${uuid.randomUUID()}`,
    esmExpressions: "",
    exportsExpressions: "",
    data: {},
    style: [],
    scripts: {
      runtime: "function(){};",
    },
    imports: {},
    flags: [],
    for: {},
    refs: {},
    reactive: {},
    // if the component type is set as router
    routes: null,
    // if the component type is store
    namespace: null,
    modules: [],
    type: "component",
    requirements: null,
    hasStore: false,
    ...opts,
  };
}
export default function oRender(bundle: Bundle) {
  // start by local components
  bundle.files.forEach((local, i) => {
    const { path, file } = local;
    const index = path;
    const rootNode: XMLNodeDescription | null = domparse(file);
    if (rootNode) {
      const component = getNewComponent({
        rootNode,
        file: index,
      });
      bundle.components.set(
        index,
        component,
      );
      bundle.repository[component.uuid] = {};
    }
  });
  // then render remote components
  bundle.remotes.forEach((remote, i) => {
    const { path, file } = remote;
    const index = path;
    const rootNode: XMLNodeDescription | null = domparse(file);
    if (rootNode) {
      const component = getNewComponent({
        remote,
        rootNode,
        file: index,
      });
      bundle.components.set(
        index,
        component,
      );
      bundle.repository[component.uuid] = {};
    }
  });
  // finally save it into repository
  bundle.files.concat(bundle.remotes).forEach((localOrRemote) => {
    if (localOrRemote.item) {
      const parent = bundle.components.get(localOrRemote.parent);
      if (parent) {
        bundle.repository[parent.uuid] = bundle.repository[parent.uuid] || {};
        bundle.repository[parent.uuid][localOrRemote.item.path] = localOrRemote.path;
      }
    }
  })
}
