import { Bundle, Component, StyleBundle } from '../../../../.d.ts';
import read from '../../utils/agnostic-transformer.ts';
import ObviousMemory from './classes/memory.ts';

let i = 0;
function getId(type: string): string {
  i++;
  return `${type}${i}`;
}
export default class ObviousParser extends ObviousMemory {
  private expressions: { [k: string]: string } = {};
  private mapStyleBundle: Map<string, StyleBundle> = new Map();
  private getUniqueId(type: string): string {
    const id = getId(type);
    return id;
  }
  public async read(css: string, bundle: Bundle, component: Component): Promise<string> {
    const styleBundle: StyleBundle = await this.getNewStyleBundle(css, bundle, component);
    return styleBundle.value;
  }
}
