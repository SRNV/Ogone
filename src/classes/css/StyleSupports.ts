import type { Bundle, Component, StyleBundle } from '../../ogone.main.d.ts';
import { Utils } from "../Utils.ts";
import StyleRenderer from "./StyleRenderer.ts";
// TODO comments here
export default abstract class StyleSupports extends Utils {
  static renderElement(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: any): string {
    let result = '';
    const render = ([selector, parent]: [string, any]) => {
      result += `${selector} { `;
      const { childs } = parent;
      childs.forEach((item: any) => {
        if (item.selector.trim() === selector.trim()) return;
        let type = "normal";
        switch (true) {
          case item.selector.trim().startsWith('@keyframes'):
            type = "keyframes"
            break;
          case item.selector.trim().startsWith('@media'):
            type = "media"
            break;
          case item.selector.trim().startsWith('@supports'):
            type = "supports"
            break;
        }
        if (item.selector !== selector) {
          result += StyleRenderer.render(styleBundle, bundle, component, {
            type,
            id: item.id,
            selector: item.selector,
          });
        }
      });
      result += `} `;
    };
    if (opts && opts.id) {
      const candidate = styleBundle.mapSupports.get(opts.id);
      if (candidate) {
        // @ts-ignore
        ([[opts.id, candidate]] as string[][]).forEach(render);
      } else {
        this.error(`@supports not found`);
      }
    } else {
      const entries = Array.from(styleBundle.mapSupports.entries());
      entries.forEach(render);
    }
    return result;
  }
  static saveElement(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: { item: any }): void {
    const { item } = opts;
    if (!styleBundle.mapSupports.has(item.isSupports)) styleBundle.mapSupports.set(item.isSupports, { childs: [item] });
    else {
      const doc = styleBundle.mapSupports.get(item.isSupports);
      doc.childs.push(item);
    }
  }
}
