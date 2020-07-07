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
      bundle.components.set(
        index,
        getNewComponent({
          rootNode,
          file: index,
        }),
      );
    }
  });
  // then render remote components
  bundle.remotes.forEach((remote, i) => {
    const { path, file } = remote;
    const index = path;
    const rootNode: XMLNodeDescription | null = domparse(file);
    if (rootNode) {
      bundle.components.set(
        index,
        getNewComponent({
          remote,
          rootNode,
          file: index,
        }),
      );
    }
  });
}
