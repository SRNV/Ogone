import { Bundle, Component } from '../.d.ts';
/**
 * this class should create for each component
 * a new tsx file, it should expose the diagnostics to the end-user
 */
export default class TSXContextCreator {
  async read(bundle: Bundle) {
    const entries = Array.from(bundle.components.entries());
    setTimeout(() => {
      entries.forEach(([key, component]) => {
        this.createContext(bundle, component);
      })
    }, 0);
  }
  private createContext(bundle: Bundle, component: Component) {
    console.log(component.file, component.context, component.context.protocol);
  }
}
