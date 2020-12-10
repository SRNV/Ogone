import type { Bundle, Component, StyleBundle } from '../../.d.ts';
import { Utils } from "../Utils.ts";

// TODO comments here
export default abstract class StyleKeyframes extends Utils {
  static renderElement(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: any): string {
    let result = '';
    const render = ([selector, item]: [string, any]) => {
      if (item.isNestedKeyframes) {
        const { props } = item.properties;
        const { parent } = item;

        const keys = Object.keys(props);
        const animationKeys = keys.filter((k) => k.indexOf('animation') > -1);
        const keyframes: { [k: string]: string }[] = [];
        Object.entries(props)
          .filter(([k]) => k.indexOf('animation') < 0)
          .map(([k, value]: [string, any]) => {
            const newValue = value.split('|');
            newValue.forEach((v: string, i: number) => {
              keyframes[i] = keyframes[i] || {};
              keyframes[i][k] = v.trim().length ? v.trim() : keyframes[i - 1] ? keyframes[i - 1][k] : '';
            });
            return [k, newValue];
          });
        const m = item.selector.match(/@keyframes\s+(.*)/i);
        if (m) {
          let [, name] = m;
          props["animation-name"] = props["animation-name"] || name;
        } else {
          this.error(`${component.file}\n\t@keyframes requires a name\n\tplease follow this pattern: @keyframes <name> { ... }\n\tinput: ${item.selector} { ... }`);
        }
        result += this.template(`{% parentRule %} {% keyframesSelector %} { {% frames %} } `, {
          parentRule: item.parent && !item.parent.isSpecial ? `{% parent.selector %} { {% animation %} }` : '',
          frames: keyframes.map((keyframe, i: number, arr: typeof keyframes) => {
            const total = arr.length - 1;
            let percent = Math.round((i / total) * 100);
            const entries = Object.entries(keyframe);
            return `${Number.isNaN(percent) ? 0 : percent}% {${entries.map(([k, v]) => `${k}: ${v};`).join('')}}`;
          }).join(''),
          parent,
          keyframesSelector: `@keyframes ${props["animation-name"]}`,
          animation: `${animationKeys.map((key) => `${key}:${props[key]};`).join('')} {% animationProp %}`,
          animationProp: !props["animation"] ? `animation-name: ${props["animation-name"]};` : '',
        });
      } else if (item.isKeyframes) {
        const propsEntries = Object.entries(item.properties.props);
        const props = propsEntries.length ? propsEntries.map(([name, value]) => `${name}: ${value};`).join('') : null;
        if (props) {
          result += `${item.selector} { ${props} } `;
        }
      }
    };
    if (opts && opts.id) {
      const candidate = styleBundle.mapKeyframes.get(opts.id);
      // @ts-ignore
      if (opts.id && candidate) [[opts.id, candidate]].forEach(render);
    } else {
      const entries = Array.from(styleBundle.mapKeyframes.entries());
      entries.forEach(render);
    }
    return result;
  }
  static saveElement(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: { item: any }): void {
    const { item } = opts;
    if (!styleBundle.mapKeyframes.has(item.id)) styleBundle.mapKeyframes.set(item.id, item);
    else {
      this.error(`${component.file}\n\tduplicated keyframes.\n\tinput: ${item.selector} {...}`);
    }
  }
}
