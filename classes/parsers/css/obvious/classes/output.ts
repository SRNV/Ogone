import { Bundle, Component, StyleBundle } from '../../../../../.d.ts';
import ObviousParser from './parser.ts';

export default class ObviousOutput extends ObviousParser {
  protected getOutput(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = '';
    styleBundle.mapSelectors.forEach((item) => {
      const entries = Object.entries(item.properties);
      let rule = this.template(`${item.selector} { {{props}} } `, {
        props: entries.length ? entries.map(([name, value]) => `${name}: ${value};`).join('') : '',
      });
      result += rule;
    })
    styleBundle.value = result;
    return result;
  }
}