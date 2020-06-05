import SUI from "https://raw.githubusercontent.com/jeanlescure/short_uuid/master/mod.ts";
import { existsSync } from "../../../utils/exists.ts";
import domparse from "../../lib/dom-parser/index.js";

const uuid = new SUI({
  length: 5,
  shufle: false,
  debugg: false,
  dictionary: ['a', 'b', 'x', 'y', 'z', 'o', 'r', 's', 'n', 'v', '3', '5'],
});
export default function oRender(bundle) {
  bundle.files.forEach((file, i) => {
    const index = file;
    if (existsSync(index)) {
      const html = Deno.readTextFileSync(index);
      const rootNodePure = domparse(html);
      const filenameRegExp = /([^\/\\.]+)+/gi;
      bundle.components.set(index, {
        rootNodePure,
        uuid: `data-${uuid.randomUUID()}`,
        file: index,
        esmExpressions: "",
        exportsExpressions: "",
        data: {},
        style: [],
        scripts: {},
        imports: {},
        directives: [],
        for: {},
        refs: {},
        reactive: {},
        // if the component type is set as router
        routes: null,
        // if the component type is store
        namespace: null,
        modules: [],
      });
    } else {
      console.warn("[Ogone] passed", dir);
    }
  });
}
