import type { Bundle, Component, StyleBundle } from '../../.d.ts';
import StyleDocument from "./StyleDocument.ts";
import StyleKeyframes from "./StyleKeyframes.ts";
import StyleMediaQueries from "./StyleMediaQueries.ts";
import StyleRenderer from './StyleRenderer.ts';
import StyleSupports from "./StyleSupports.ts";

// TODO needs more explications on the process
/**
 * @name StyleOutput
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
 * @dependency StyleRenderer
 */
export default class StyleOutput extends StyleRenderer {
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
        StyleSupports.saveElement(styleBundle, bundle, component, {
          item,
        });
      }
      if (!!item.isDocument) {
        StyleDocument.saveElement(styleBundle, bundle, component, {
          item,
        });
      }
      if (!!item.isKeyframes) {
        StyleKeyframes.saveElement(styleBundle, bundle, component, {
          item,
        });
      }
      if (!!item.isMedia) {
        StyleMediaQueries.saveElement(styleBundle, bundle, component, {
          item,
        });
      }
      result += rule;
    });
    result += StyleRenderer.render(styleBundle, bundle, component);
    styleBundle.value += result;
    return result;
  }
}
