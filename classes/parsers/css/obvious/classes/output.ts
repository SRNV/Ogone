import { Bundle, Component, StyleBundle } from '../../../../../.d.ts';
import ObviousParser from './parser.ts';

export default class ObviousOutput extends ObviousParser {
  protected getOutput(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = '';
    styleBundle.mapSelectors.forEach((item) => {
      const entries = Object.entries(item.properties.props);
      let rule = '';
      switch (true) {
        case !!item.isKeyframes:
          this.saveKeyframes(styleBundle, bundle, component, {
            item,
          });
          break;
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
    result += this.renderKeyframes(styleBundle, bundle, component);
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
  protected renderKeyframes(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = '';
    const entries = Array.from(styleBundle.mapKeyframes.entries())
    entries.forEach(([selector, item]: [string, any]) => {
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
        result += this.template(`{{ parent.selector }} { {{ animation }} } {{ keyframesSelector }} { {{ frames }} } `, {
          frames: keyframes.map((keyframe, i: number, arr: typeof keyframes) => {
            const total = arr.length - 1;
            let percent = Math.round((i / total) * 100);
            const entries = Object.entries(keyframe);
            return `${percent}% {${entries.map(([k, v]) => `${k}: ${v};`).join('')}}`;
          }).join(''),
          parent,
          keyframesSelector: `@keyframes ${props["animation-name"]}`,
          animation: `animation: ${props["animation-name"]}; ${animationKeys.map((key) => `${key}:${props[key]};`).join('')}`,
        });
      } else if (item.isKeyframes) {
        result += this.getDeepTranslation(item.rule, styleBundle.tokens.expressions);
      }
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
  protected saveKeyframes(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: { item: any }): void {
    const { item } = opts;
    if (!styleBundle.mapKeyframes.has(item.selector)) styleBundle.mapKeyframes.set(item.selector, item);
    else {
      this.error(`${component.file}\n\tduplicated keyframes.\n\tinput: ${item.selector} {...}`);
    }
  }
}