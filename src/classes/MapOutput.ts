import { Bundle } from "../ogone.main.d.ts";
import TSTranspiler from './TSTranspiler.ts';

interface ComponentOutput {
  /**
   * string vars that will be defined at the very begining of the code
   * and reused in the whole application
   */
  vars: string[];
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
  /**
   * create a runtime service with Ogone.run and Ogone.runSync
   */
  globalRuntime: string;
  globalRuntimeSync: string;
}
export default abstract class MapOutput {
  static outputs: ComponentOutput = {
    vars: [],
    render: [],
    data: [],
    context: [],
    customElement: [],
    types: [],
    globalRuntime: '',
    globalRuntimeSync: '',
};
  /**
   * fullfiled by TSTranspiler
   * this one will bundle all Ogone classes to one
   */
  static runtime: string = '';
  static async getOutputs(bundle: Bundle) {
    bundle.output += `
      const ogone_types_component = "component";
      const ogone_types_store = "store";
      const ogone_types_async = "async";
      const ogone_types_router = "router";
      const ogone_types_controller = "controller";
      const ogone_types_app = "app";
      const ogone_types_gl = "gl";
      ${this.getGlobalRuntimes()}
      ${this.outputs.vars.join('\n')}
      ${this.outputs.types.join('\n')}
      ${this.outputs.data.join('\n')}
      ${this.outputs.context.slice().reverse().join('\n')}
      ${this.outputs.render.join('\n')}
    `;
    // remove useless level increment
    bundle.output = bundle.output.replace(/l\+{2};\s*\/\*+\/\s*l\-{2};/gi, '');
    // transpile the output
    bundle.output = await TSTranspiler.transpile(bundle.output);
    this.cleanOutputs();
  }
  static cleanOutputs(): void {
    this.outputs.context.splice(0);
    this.outputs.data.splice(0);
    this.outputs.types.splice(0);
    this.outputs.render.splice(0);
  }
  static saveDeclarations(bundle: Bundle) {
    const entries = Array.from(bundle.components.entries()).map(([k,c]) => c);
    entries.forEach((component) => {
      const { nodeList } = component.rootNode;
      const declarationVars = `const ${component.uuid.replace(/\-/gi, '_')} = '${component.uuid}'`;
      const declarationVarsTemplate = `const ${component.uuid.replace(/\-/gi, '_')}_nt = '${component.uuid}-nt'`;
      if (!MapOutput.outputs.vars.includes(declarationVars)) {
        MapOutput.outputs.vars.push(declarationVars, declarationVarsTemplate)
      }
      nodeList.forEach((node) => {
        const nId = node.tagName === null ? 'nt' : node.id;
        const declarationVarsNode = `const ${(component.uuid + `_${nId}`).replace(/\-/gi, '_')} = '${component.uuid}-${nId}'`;
        if (!MapOutput.outputs.vars.includes(declarationVarsNode)) {
          MapOutput.outputs.vars.push(declarationVarsNode)
        }
      })
    });
  }
  static getGlobalRuntimes(): string {
    return `
Ogone.run = async function (Onode, _state, ctx, event) {
  switch(Onode.uuid) {
    ${this.outputs.globalRuntime}
  }
}
Ogone.runSync = function (Onode, _state, ctx, event) {
  switch(Onode.uuid) {
    ${this.outputs.globalRuntimeSync}
  }
}
    `;
  }
}