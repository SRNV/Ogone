import { Bundle } from "../.d.ts";

interface ComponentOutput {
  /**
   * the part that saves the node factory into Ogone.render
   * ```typescript
   *    Ogone.render['{% elementId %}'] = function(): Node[] {...};
   * ```
   */
  render: string;
  /**
   * the part that saves a function that will construct the runtime of the component
   * this part is saved into Ogone.components
   * ```typescript
   *   Ogone.components['{% component.uuid %}'] = function OgoneComponentRuntime () {...}
   * ```
   */
  data: string;
  /**
   * the part that saves into Ogone.contexts an util function to resolve the context
   * this function is the one used to return the data in the props or flags or a textnode
   */
  context: string;
  /**
   * the part that saves the customElement in the browser,
   * depends on the environment.
   */
  customElement: string;
}
export default abstract class MapOutput {
  static outputs: Map<string, ComponentOutput> = new Map();
  static async startSavingComponentsOutput(bundle: Bundle): Promise<void> {
    const entries = Array.from(bundle.components.entries());
    for await (let [file] of entries) {
        this.outputs.set(file, {
            render: '',
            data: '',
            context: '',
            customElement: ''
        });
    }
  }
  static async getOutputs(bundle: Bundle) {
    const entries = Array.from(this.outputs.entries());
    for await (let [file, output] of entries.slice().reverse()) {
      bundle.output += `
      /**
       * OUTPUT context for ${file}
       */
      ${output.context}
      `;
    }
    for await (let [file, output] of entries) {
      bundle.output += `
      /**
       * OUTPUT for ${file}
       */
      ${output.data}
      ${output.render}
      ${output.customElement}
      `;
    }
    console.log(bundle.output);
  }
}