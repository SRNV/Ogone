import type { Bundle, Component, StyleBundle } from '../.d.ts';
import ObviousMemory from './ObviousMemory.ts';
// TODO needs more explications on the process and how to add things to Obvious
/**
 * @name Obvious
 * @code OO2-OSB7-OC0
 * @description CSS preprocessor for Ogone, run by default.
 * allows nested rules, variables, exported variables, parent rule ref with &, keyframes compression, css minification
 * @dependency ObviousMemory
 * @dependency ObviousOutput
 * @dependency ObviousParser
 */
export default class Obvious extends ObviousMemory {
  public async read(css: string, bundle: Bundle, component: Component): Promise<string> {
    const styleBundle: StyleBundle = await this.getNewStyleBundle(css, bundle, component);
    this.mapStyleBundle.set("k" + Math.random(), styleBundle);
    return styleBundle.value;
  }
}
