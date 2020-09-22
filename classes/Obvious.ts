import type { Bundle, Component, StyleBundle } from '../.d.ts';
import ObviousMemory from './ObviousMemory.ts';

export default class Obvious extends ObviousMemory {
  public async read(css: string, bundle: Bundle, component: Component): Promise<string> {
    const styleBundle: StyleBundle = await this.getNewStyleBundle(css, bundle, component);
    this.mapStyleBundle.set("k" + Math.random(), styleBundle);
    return styleBundle.value;
  }
}
