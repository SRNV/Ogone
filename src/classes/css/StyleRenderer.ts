import type { Bundle, Component, StyleBundle } from '../../ogone.main.d.ts';
import StyleKeyframes from "./StyleKeyframes.ts";
import StyleSupports from "./StyleSupports.ts";
import StyleDocument from './StyleDocument.ts';
import StyleMediaQueries from "./StyleMediaQueries.ts";
import StyleParser from "./StyleParser.ts";

// TODO comments here
export default abstract class StyleRenderer extends StyleParser {
  static render(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: { type: string; id: string; selector: string; }): string {
    let result = '';
    if (opts && opts.type) {
      switch (opts.type) {
        case "supports":
          result += StyleSupports.renderElement(styleBundle, bundle, component, {
            id: opts.selector,
          });
          styleBundle.mapSupports.delete(opts.selector);
          break;
        case "keyframes":
          result += StyleKeyframes.renderElement(styleBundle, bundle, component, {
            id: opts.id,
          });
          styleBundle.mapKeyframes.delete(opts.id);
          break;
        case "media":
          result += StyleMediaQueries.renderElement(styleBundle, bundle, component, {
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
      result += StyleDocument.renderElement(styleBundle, bundle, component);
      result += StyleSupports.renderElement(styleBundle, bundle, component);
      result += this.renderPreservedRules(styleBundle, bundle, component);
      result += this.renderRules(styleBundle, bundle, component);
      result += StyleMediaQueries.renderElement(styleBundle, bundle, component);
      result += StyleKeyframes.renderElement(styleBundle, bundle, component);
    }
    return result;
  }
  static renderRules(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: { id: string }): string {
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
          result += this.template(`${item.selector} { {%props%} } `, {
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
  static renderPreservedRules(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = '';
    styleBundle.mapPreservedRules.forEach((rule) => {
      result += `${rule};`;
    })
    return this.getDeepTranslation(result, styleBundle.tokens.expressions);
  }
}
