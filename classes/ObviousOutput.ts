import type { Bundle, Component, StyleBundle } from '../.d.ts';
import ObviousParser from './ObviousParser.ts';

// TODO needs more explications on the process
/**
 * @name ObviousOutput
 * @code OOO1-OSB7-OC0
 * @description this is the class that will help rendering the new CSS
 * the first method used is getOutput that returns a string
 * ```ts
 * protected getOutput(styleBundle: StyleBundle, bundle: Bundle, component: Component): string
 * ```
 * you will use this one like following
 * ```ts
 *   this.getOutput(styleBundle, bundle, component);
 * ```
 * this method will add to the `styleBundle.value` the transformed CSS
 * ```ts
 *  result += this.render(styleBundle, bundle, component);
    styleBundle.value += result;
 * ```
 * @dependency ObviousParser
 */
export default class ObviousOutput extends ObviousParser {
  protected getOutput(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = '';
    styleBundle.mapSelectors.forEach((item) => {
      let rule = '';
      item.properties.children.forEach((child: any) => {
        if (child.parent) {
          child.parent = item;
        }
      })
      if (!!item.isSupports) {
        this.saveSupports(styleBundle, bundle, component, {
          item,
        });
      }
      if (!!item.isDocument) {
        this.saveDocument(styleBundle, bundle, component, {
          item,
        });
      }
      if (!!item.isKeyframes) {
        this.saveKeyframes(styleBundle, bundle, component, {
          item,
        });
      }
      if (!!item.isMedia) {
        this.saveMediaQueries(styleBundle, bundle, component, {
          item,
        });
      }
      result += rule;
    });
    result += this.render(styleBundle, bundle, component);
    styleBundle.value += result;
    return result;
  }
  protected render(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: { type: string; id: string; selector: string; }): string {
    let result = '';
    if (opts && opts.type) {
      switch (opts.type) {
        case "supports":
          result += this.renderSupports(styleBundle, bundle, component, {
            id: opts.selector,
          });
          styleBundle.mapSupports.delete(opts.selector);
          break;
        case "keyframes":
          result += this.renderKeyframes(styleBundle, bundle, component, {
            id: opts.id,
          });
          styleBundle.mapKeyframes.delete(opts.id);
          break;
        case "media":
          result += this.renderMediaQueries(styleBundle, bundle, component, {
            id: opts.id,
          });
          styleBundle.mapMedia.delete(opts.id);
          break;
        case "normal":
          result += this.renderRules(styleBundle, bundle, component, {
            id: opts.id,
          });
          styleBundle.mapSelectors.delete(opts.id);
          break;
      }
    } else {
      result += this.renderDocument(styleBundle, bundle, component);
      result += this.renderSupports(styleBundle, bundle, component);
      result += this.renderPreservedRules(styleBundle, bundle, component);
      result += this.renderRules(styleBundle, bundle, component);
      result += this.renderMediaQueries(styleBundle, bundle, component);
      result += this.renderKeyframes(styleBundle, bundle, component);
    }
    return result;
  }
  protected renderRules(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: { id: string }): string {
    let result = '';
    const render = (item: any) => {
      if (!item.isSpecial && !item.omitOutputSelector) {
        if (item.parent
          && this.isNotSpecial(item.parent.selector.trim())
          && this.isNotSpecial(item.selector.trim())) {
          let { selector } = item;
          const match = selector.match(/&/gi);
          if (!match) {
            selector = `${item.parent.selector} ${selector}`;
          } else {
            selector = selector.replace(/&/gi, item.parent.selector);
          }
          item.selector = selector;
        }
        const entries = Object.entries(item.properties.props);
        const props = entries.length ? entries.map(([name, value]) => `${name}: ${value};`).join('') : null;
        if (props) {
          result += this.template(`${item.selector} { {{props}} } `, {
            props,
          });
        }
      }
    };
    if (opts && opts.id) {
      const rule = styleBundle.mapSelectors.get(opts.id);
      if (rule) {
        render(rule);
      } else {
        this.error(`rule not found`);
      }
    } else {
      styleBundle.mapSelectors.forEach(render);
    }
    return result;
  }
  protected renderPreservedRules(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = '';
    styleBundle.mapPreservedRules.forEach((rule) => {
      result += `${rule};`;
    })
    return this.getDeepTranslation(result, styleBundle.tokens.expressions);
  }
  protected renderMediaQueries(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: { id: string }): string {
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
          result += this.render(styleBundle, bundle, component, {
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
  protected renderDocument(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
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
  protected renderSupports(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: any): string {
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
          result += this.render(styleBundle, bundle, component, {
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
  protected renderKeyframes(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: any): string {
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
        result += this.template(`{{ parentRule }} {{ keyframesSelector }} { {{ frames }} } `, {
          parentRule: item.parent && !item.parent.isSpecial ? `{{ parent.selector }} { {{ animation }} }` : '',
          frames: keyframes.map((keyframe, i: number, arr: typeof keyframes) => {
            const total = arr.length - 1;
            let percent = Math.round((i / total) * 100);
            const entries = Object.entries(keyframe);
            return `${Number.isNaN(percent) ? 0 : percent}% {${entries.map(([k, v]) => `${k}: ${v};`).join('')}}`;
          }).join(''),
          parent,
          keyframesSelector: `@keyframes ${props["animation-name"]}`,
          animation: `${animationKeys.map((key) => `${key}:${props[key]};`).join('')} {{ animationProp }}`,
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
  protected saveMediaQueries(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: { item: any }): void {
    const { item } = opts;
    if (!styleBundle.mapMedia.has(item.id)) styleBundle.mapMedia.set(item.id, { queries: [item] });
    else {
      const itemMedia = styleBundle.mapMedia.get(item.id);
      itemMedia.queries.push(item);
    }
  }
  protected saveKeyframes(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: { item: any }): void {
    const { item } = opts;
    if (!styleBundle.mapKeyframes.has(item.id)) styleBundle.mapKeyframes.set(item.id, item);
    else {
      this.error(`${component.file}\n\tduplicated keyframes.\n\tinput: ${item.selector} {...}`);
    }
  }
  protected saveDocument(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: { item: any }): void {
    const { item } = opts;
    if (!styleBundle.mapDocument.has(item.isDocument)) styleBundle.mapDocument.set(item.isDocument, { childs: [item] });
    else {
      const doc = styleBundle.mapDocument.get(item.isDocument);
      doc.childs.push(item);
    }
  }
  protected saveSupports(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: { item: any }): void {
    const { item } = opts;
    if (!styleBundle.mapSupports.has(item.isSupports)) styleBundle.mapSupports.set(item.isSupports, { childs: [item] });
    else {
      const doc = styleBundle.mapSupports.get(item.isSupports);
      doc.childs.push(item);
    }
  }
}
