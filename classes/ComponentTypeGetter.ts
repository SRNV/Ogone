import type { Bundle, Component } from '../.d.ts';
/**
 * @name ComponentTypeGetter
 * @code OO2-OSB7-OC0
 * @description step to set the type of the components
 */
export default class ComponentTypeGetter {
  public async setTypeOfComponents(bundle: Bundle): Promise<void> {
    bundle.components.forEach((component: Component) => {
      const proto = component.elements.proto[0];
      if(proto) {
        component.type = proto.attributes?.type as Component['type'] || 'component';
      }
    });
  }
}
