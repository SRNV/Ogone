import { Bundle } from "../ogone.main.d.ts";
import TSTranspiler from './TSTranspiler.ts';

interface ComponentOutput {
  /**
   * the part that saves the node factory into Ogone.render
   * ```typescript
   *    Ogone.render['{% elementId %}'] = function(): Node[] {...};
   * ```
   */
  render: string[];
  /**
   * the part that saves a function that will construct the runtime of the component
   * this part is saved into Ogone.components
   * ```typescript
   *   Ogone.components['{% component.uuid %}'] = function () {...}
   * ```
   */
  data: string[];
  /**
   * the part that saves into Ogone.contexts an util function to resolve the context
   * this function is the one used to return the data in the props or flags or a textnode
   */
  context: string[];
  /**
   * the part that saves the customElement in the browser,
   * depends on the environment.
   */
  customElement: string[];
  /**
   * referenced types for all ogone-nodes
   */
  types: string[];
}
export default abstract class MapOutput {
  static outputs: ComponentOutput = {
    render: [],
    data: [],
    context: [],
    customElement: [],
    types: [],
};
  /**
   * fullfiled by TSTranspiler
   * this one will bundle all Ogone classes to one
   */
  static runtime: string = '';
  static async getOutputs(bundle: Bundle) {
    bundle.output += `
      ${this.outputs.types.join('\n')}
      ${this.outputs.data.join('\n')}
      ${this.outputs.context.slice().reverse().join('\n')}
      ${this.outputs.render.join('\n')}
      customElements.define('ogone-node', OgoneBaseClass);
    `;
    bundle.output = await TSTranspiler.transpile(bundle.output);
  }
}