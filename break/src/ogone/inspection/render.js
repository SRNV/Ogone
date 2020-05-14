import { existsSync } from "../../../utils/exists.ts";
import Ogone from "../index.ts";
import domparse from "../../../lib/dom-parser/index.js";
export default function oRender() {
  Ogone.files.forEach((file, i) => {
    const index = file;
    if (existsSync(index)) {
      const html = Deno.readTextFileSync(index);
      const rootNodePure = domparse(html, {
        comment: false,
        script: false,
        style: true,
        pre: true,
      });

      Ogone.components.set(index, {
        rootNodePure,
        uuid: `data-${i}`,
        file: index,
        esmExpressions: "",
        exportsExpressions: "",
        data: {},
        style: [],
        scripts: {},
        dom: [],
        imports: {},
        directives: [],
        for: {},
        refs: {},
        reactive: {},
        reactiveText: {},
        // if the component type is set as router
        routes: null,
      });
    } else {
      console.warn("[Ogone] passed", dir);
    }
  });
}
