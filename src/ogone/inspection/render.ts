import SUI from "https://raw.githubusercontent.com/jeanlescure/short_uuid/master/mod.ts";
import { existsSync } from "../../../utils/exists.ts";
import domparse from "../../lib/dom-parser/index.ts";
import { Bundle, XMLNodeDescription } from '../../../.d.ts';

const uuid: SUI = new SUI({
  length: 5,
  shuffle: false,
  debug: false,
  dictionary: ['a', 'b', 'x', 'y', 'z', 'o', 'r', 's', 'n', 'v', '3', '5'],
});
export default function oRender(bundle: Bundle) {
  bundle.files.forEach((file, i) => {
    const index = file;
    if (existsSync(index)) {
      const html = Deno.readTextFileSync(index);
      const rootNode: XMLNodeDescription | null = domparse(html);
      if (rootNode) {
        bundle.components.set(index, {
          rootNode,
          uuid: `data-${uuid.randomUUID()}`,
          file: index,
          esmExpressions: "",
          exportsExpressions: "",
          data: {},
          style: [],
          scripts: {},
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
        });
      }
    }
  });
}
