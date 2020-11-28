import type { Bundle, Component, StyleBundle } from '../../.d.ts';
import { Utils } from "../Utils.ts";
import StyleRenderer from "./StyleRenderer.ts";

// TODO comments here
export default abstract class StyleMediaQueries extends Utils {
  static renderElement(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: { id: string }): string {
    let result = '';
    const render = ([selector, item]: [string, any]) => {
      const { queries } = item;
      queries.forEach((query: any) => {
        let type = "normal";
        let target = query;
        if (query.id.trim() !== selector.trim()) {
          switch (true) {
            case query.selector.trim().startsWith('@keyframes'):
              type = "keyframes"
              break;
            case query.selector.trim().startsWith('@supports'):
              type = "supports"
              break;
            case query.selector.trim().startsWith('@media'):
              type = "media"
              break;
          }
          result += StyleRenderer.render(styleBundle, bundle, component, {
            type,
            id: target.id,
            selector: target.selector,
          });
        } else {
          result += `${query.selector} { `;
          const propsEntries = Object.entries(query.properties.props);
          const props = propsEntries.length ? propsEntries.map(([name, value]) => `${name}: ${value};`).join('') : null;
          if (props) {
            result += `${(query.isNestedMedia ? query.parent : query).selector} { ${props} } `;
          }
        }
      });
      result += `} `;
    };
    if (opts && opts.id) {
      const candidate = styleBundle.mapMedia.get(opts.id);
      if (candidate) {
        // @ts-ignore
        [[opts.id, candidate]].forEach(render);
      } else {
        const candidate2 = styleBundle.mapSelectors.get(opts.id);
        // @ts-ignore
        [[opts.id, candidate2]].forEach(render);
      }
    } else {
      const entries = Array.from(styleBundle.mapMedia.entries());
      entries.forEach(render);
    }
    return result;
  }
  static saveElement(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: { item: any }): void {
    const { item } = opts;
    if (!styleBundle.mapMedia.has(item.id)) styleBundle.mapMedia.set(item.id, { queries: [item] });
    else {
      const itemMedia = styleBundle.mapMedia.get(item.id);
      itemMedia.queries.push(item);
    }
  }
}
