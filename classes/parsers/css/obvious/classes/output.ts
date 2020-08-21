import { Bundle, Component, StyleBundle } from '../../../../../.d.ts';
import ObviousParser from './parser.ts';

export default class ObviousOutput extends ObviousParser {
  protected getOutput(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = '';
    styleBundle.mapSelectors.forEach((item) => {
      const entries = Object.entries(item.properties.props);
      let rule = '';
      switch (true) {
        case !!item.isMedia:
          this.saveMediaQueries(styleBundle, bundle, component, {
            item,
          });
          break;
        default:
          const props = entries.length ? entries.map(([name, value]) => `${name}: ${value};`).join('') : null;
          if (props) {
            rule = this.template(`${item.selector} { {{props}} } `, {
              props,
            });
          }
          break;
      }
      result += rule;
    });
    result += this.renderMediaQueries(styleBundle, bundle, component);
    styleBundle.value = result;
    return result;
  }
  protected renderMediaQueries(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = '';
    const entries = Array.from(styleBundle.mapMedia.entries())
    entries.forEach(([selector, item]: [string, any]) => {
      result += `${selector} { `;
      const { queries } = item;
      queries.forEach((query: any) => {
        if (query.isNestedMedia) {
          const propsEntries = Object.entries(query.properties.props);
          const props = propsEntries.length ? propsEntries.map(([name, value]) => `${name}: ${value};`).join('') : null;
          if (props) {
            result += `${query.parent.selector} { ${props} } `;
          }
        } else if (query.isMedia) {
          const propsEntries = Object.entries(query.properties.props);
          const props = propsEntries.length ? propsEntries.map(([name, value]) => `${name}: ${value};`).join('') : null;
          if (props) {
            result += `${query.selector} { ${props} } `;
          }
        }
      });
      result += `} `;
    });
    return result;
  }
  protected saveMediaQueries(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: { item: any }): void {
    const { item } = opts;
    if (!styleBundle.mapMedia.has(item.isMedia)) styleBundle.mapMedia.set(item.isMedia, { queries: [item] });
    else {
      const itemMedia = styleBundle.mapMedia.get(item.isMedia);
      itemMedia.queries.push(item);
    }
  }
}