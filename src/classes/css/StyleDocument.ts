import type { Bundle, Component, StyleBundle } from '../../.d.ts';
import { Utils } from '../Utils.ts';

// TODO comments here
export default abstract class StyleDocument extends Utils {
  static renderElement(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = '';
    const entries = Array.from(styleBundle.mapDocument.entries())
    entries.forEach(([selector, parent]: [string, any]) => {
      result += `${selector} { `;
      const { childs } = parent;
      childs.forEach((item: any) => {
        const propsEntries = Object.entries(item.properties.props);
        const props = propsEntries.length ? propsEntries.map(([name, value]) => `${name}: ${value};`).join('') : null;
        if (props) {
          result += `${item.selector} { ${props} } `;
        }
      });
      result += `} `;
    });
    return result;
  }
  static saveElement(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: { item: any }): void {
    const { item } = opts;
    if (!styleBundle.mapDocument.has(item.isDocument)) styleBundle.mapDocument.set(item.isDocument, { childs: [item] });
    else {
      const doc = styleBundle.mapDocument.get(item.isDocument);
      doc.childs.push(item);
    }
  }
}
