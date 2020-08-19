import { Bundle, Component, StyleBundle } from '../../../../../.d.ts';
import ObviousMemory from './memory.ts';

export default class ObviousOutput extends ObviousMemory {
  private getOutput(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
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