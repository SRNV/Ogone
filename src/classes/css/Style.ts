import type { Bundle, Component, StyleBundle } from '../../ogone.main.d.ts';
import StyleMemory from './StyleMemory.ts';
// TODO needs more explications on the process and how to add things to Style
/**
 * @name Style
 * @code OO2-OSB7-OC0
 * @description CSS preprocessor for Ogone, run by default.
 * allows nested rules, variables, exported variables, parent rule ref with &, keyframes compression, css minification
 * @dependency StyleMemory
 * @dependency StyleOutput
 * @dependency StyleParser
 */
export default class Style extends StyleMemory {
  public async read(css: string, bundle: Bundle, component: Component): Promise<string> {
    this.trace('getting new style bundle');

    const styleBundle: StyleBundle = await this.getNewStyleBundle(css, bundle, component);
    this.mapStyleBundle.set("k" + Math.random(), styleBundle);
    return styleBundle.value;
  }
}
