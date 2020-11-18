import ModuleResolver from './src/classes/ModuleResolver.ts';
import './src/functions/jsxFactory.ts';
import type { ModuleGetterOptions } from './src/classes/ModuleGetterOptions.ts';
import OgoneComponent from './src/classes/OgoneComponent.ts';
import DevServer from './src/classes/DevServer.ts';
import OgoneSandBox from './src/classes/OgoneSandBox/OgoneSandBox.ts';
import { path } from './deps.ts';

export class OgoneApplication {
  static async getComponents(opts: ModuleGetterOptions): Promise<OgoneComponent[]> {
    await OgoneSandBox.startSession();
    const documents = await OgoneSandBox.renderSession();
    const rootComponentPath = path.join(Deno.cwd(), opts.entrypoint);
    const components: OgoneComponent[] = [];
    for (let document of documents) {
      const component = await ModuleResolver.resolve(document.module, opts, document.sourcePath === rootComponentPath);
      component.sourcePath = document.sourcePath;
      component.file = document.importable;
      component.sandBoxPath = document.sandBoxPath;
      components.push(component);
    }
    return components;
  }
  static async mount(component: OgoneComponent): Promise<boolean> {
    const isSaved: boolean = await ModuleResolver.setComponentTemplate(component);
    return isSaved;
  }
  /**
   * start development of the application
   * @param root {string} path to the root component
   * @param registry {string} all the components used in the application
   */
  static async dev(root: string): Promise<OgoneComponent[]> {
    const components = await OgoneApplication.getComponents({
      entrypoint: root,
    });
    // OgoneApplication.mount will set the template of the component
    for await (const component of components) {
      await OgoneApplication.mount(component);
    }
    await DevServer.serveSPA();
    return components;
  }
}