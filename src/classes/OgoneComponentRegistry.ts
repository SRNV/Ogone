import OgoneComponent from './OgoneComponent.ts';

export default abstract class OgoneComponentRegistry {
  private static readonly registry: Map<string, OgoneComponent> = new Map();
  static subscribe(uuid: string, component: OgoneComponent): boolean {
    this.registry.set(uuid, component);
    return true;
  }
  static getComponent(uuid: string): OgoneComponent | undefined {
    return this.registry.get(uuid);
  }
  /**
   * the module and the component are using the same function,
   * so we just need to compare the value
   * these are equal
   */
  static getItemByTemplate(template: Function): OgoneComponent | undefined {
    const entries = Array.from(this.registry.entries());
    const found = entries.find(([key, component]) => {
      return component.templateFactory === template;
    });
    if (found) {
      const [, component] = found;
      return component;
    }
  }
  static getItemByUrl(url: string): OgoneComponent | undefined {
    const entries = Array.from(this.registry.entries());
    const found = entries.find(([key, component]) => component.sourcePath === url);
    if (found) {
      const [, component] = found;
      return component;
    }
  }
  static get collection() {
    return Array.from(this.registry.entries())
  }
  static getRootComponent(): OgoneComponent | undefined {
    const isComponent = this.collection.find(([, component]: [string, OgoneComponent]) => component.isRootComponent)
    if (isComponent) {
      const found = isComponent[1];
      return found;
    }
  }
}