import { Bundle, OgoneConfiguration } from "../../.d.ts";
import ContextCompiler from "./context-compiler.ts";
import ContextBuilder from "./render-context.ts";
import ComponentCompiler from "./component-compiler.ts";
import Renderer from "./renderer.ts";

export default class RuntimeCompiler {
  private ContextCompiler: ContextCompiler = new ContextCompiler();
  private ComponentCompiler: ComponentCompiler = new ComponentCompiler();
  private ContextBuilder: ContextBuilder = new ContextBuilder();
  private Renderer: Renderer = new Renderer();
  public async read(bundle: Bundle): Promise<void> {
    const entries = Array.from(bundle.components);
    for await (let [path, component] of entries) {
      this.ContextCompiler.read(bundle, path, component.rootNode);
      await this.ComponentCompiler.read(bundle, component);
      await this.ContextBuilder.read(bundle, path);
      await this.Renderer.read(bundle, path, component.rootNode);
    }
  }
}
