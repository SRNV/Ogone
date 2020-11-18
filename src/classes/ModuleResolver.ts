import type { OgoneModule } from './OgoneModule.ts';
import OgoneComponent from './OgoneComponent.ts';
import type { ModuleGetterOptions } from './ModuleGetterOptions.ts';
import { v4 } from '../../deps.ts';
import { ModuleErrors } from './ModuleErrors.ts';
import DOMElement from './DOMElement/DOMElement.ts';

export default abstract class ModuleResolver {
  static currentComponent: OgoneComponent | null = null;
  static async resolve(module: OgoneModule, opts: ModuleGetterOptions, isRootComponent: boolean = false): Promise<OgoneComponent> {
    const { entrypoint } = opts;

    // get the default DOM Graph
    // for this we use the default export or the export named template
    // we are waiting for a function
    if (!module.default || module.default && !(module.default instanceof Function)) {
      throw ModuleErrors.error(`${entrypoint}\n\t Export default is required for all component as a function`)
    }
    const component = new OgoneComponent({
      file: '',
      uuid: v4.generate(),
      templateFactory: module.default,
    });
    component.isRootComponent = isRootComponent;
    component.isImported = isRootComponent;
    return component;
  }
  /**
   * set the template of the component
   */
  static setComponentTemplate(component: OgoneComponent): boolean {
    ModuleResolver.currentComponent = component;
    const availableTemplate = component.templateFactory;
    const defaultTemplate =
      availableTemplate && availableTemplate.bind ?
        availableTemplate : null;
    // start by using the templtate
    switch (true) {
      // default/template is a function
      case !!defaultTemplate && typeof defaultTemplate === 'function':
        if (defaultTemplate) {
          component.template = new defaultTemplate() as unknown as DOMElement;
          if (component.template) {
            // set the component of the template
            // this allows all element to identify the component
            component.template.component = component;
          }
          return true;
        }
    }
    return false;
  }
}