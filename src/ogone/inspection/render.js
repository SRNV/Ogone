import { existsSync } from "../../../utils/exists.ts";
import Ogone from "../index.ts";
import domparse from "../../lib/dom-parser/index.js";

export default function oRender() {
  Ogone.files.forEach((file, i) => {
    const index = file;
    if (existsSync(index)) {
      const html = Deno.readTextFileSync(index);
      const rootNodePure = domparse(html);

      Ogone.components.set(index, {
        rootNodePure,
        uuid: `data-${i}`,
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
