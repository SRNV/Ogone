import { Bundle, Component, StyleBundle } from '../../../../.d.ts';
import read from '../../utils/agnostic-transformer.ts';
import { Utils } from '../../../utils/index.ts';
import ObviousOutput from './classes/output.ts';

let i = 0;
function getId(type: string): string {
  i++;
  return `${type}${i}`;
}
export default class ObviousParser extends ObviousOutput {
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
