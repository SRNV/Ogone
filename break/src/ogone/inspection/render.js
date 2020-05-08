import { existsSync } from "../../../utils/exists.ts";
import Ogone from "../index.ts";
import domparse from "../../../lib/dom-parser/index.js";

export default function oRender() {
    Ogone.files.forEach((file) => {
        const index = file;
        if (existsSync(index)) {
          const html = Deno.readTextFileSync(index);
          const rootNode = domparse(html, {
            comment: true,
            script: true,
            style: true,
            pre: false,
          });
          const rootNodePure = domparse(html, {
            comment: false,
            script: false,
            style: false,
            pre: true,
          });

          Ogone.components.set(index, {
            uuid: `data-${btoa(Math.random().toString())}`,
            html: rootNode.toString(),
            file: index,
            rootNode,
            rootNodePure,
            esmExpressions: '',
            exportsExpressions: '',
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
          });
        } else {
          console.warn('[Ogone] passed', dir);
        }
      });
  }