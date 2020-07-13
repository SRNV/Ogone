import oRenderNodesBehavior from "./inspection/nodes-behaviour.ts";
import { Bundle } from "../../.d.ts";
import ContextCompiler from "./context-compiler.ts";
import ContextBuilder from "./render-context.ts";
import ComponentCompiler from "./component-compiler.ts";
import { Configuration } from "../config/index.ts";

export default class RuntimeCompiler {
  private ContextCompiler: ContextCompiler;
  private ComponentCompiler: ComponentCompiler;
  private ContextBuilder: ContextBuilder;
  constructor(opts: Configuration) {
    this.ComponentCompiler = new ComponentCompiler(opts);
    this.ContextCompiler = new ContextCompiler(opts);
    this.ContextBuilder = new ContextBuilder(opts);
  }
  public async read(bundle: Bundle): Promise<void> {
    const entries = Array.from(bundle.components);
    for await (let [path, component] of entries) {
      this.ContextCompiler.read(bundle, path, component.rootNode);
      await this.ComponentCompiler.read(bundle, component);
      await this.ContextBuilder.read(bundle, path);
      await oRenderNodesBehavior(bundle, path, component.rootNode);
    }
  }
}
