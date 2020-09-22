import type { Bundle, XMLNodeDescription } from "../.d.ts";
import WebComponentDefinition from "./WebComponentDefinition.ts";

export default class NodeAnalyzerCompiler extends WebComponentDefinition {
  async read(
    bundle: Bundle,
    keyComponent: string,
    node: XMLNodeDescription,
  ): Promise<void> {
    const component = bundle.components.get(keyComponent);
    if (component) {
      const isImported: string = component.imports[node.tagName as string];
      const subcomp = bundle.components.get(isImported);
      if (
        node.attributes && node.attributes["--await"] &&
        component.type !== "async"
      ) {
        const BadUseOfAwaitInSyncComponentException =
          `--await must be used in an async component. define type="async" to the proto.\n Error in component: ${component.file}\n node: ${node.tagName}`;
        this.error(BadUseOfAwaitInSyncComponentException);
      }
      if (
        node.attributes && node.attributes["--await"] && isImported &&
        subcomp && subcomp.type !== "async"
      ) {
        const BadUseOfAwaitInSyncComponentException =
          `--await must be called only on async components. change type of <${node.tagName} --await /> or erase --await.\n Error in component: ${component.file}\n node: ${node.tagName}`;
        this.error(BadUseOfAwaitInSyncComponentException);
      }
      if (node.attributes && node.attributes["--defer"] && !isImported) {
        const BadUseDeferFlagException =
          `--defer must be called only on async components. discard <${node.tagName} --defer="${node.attributes["--defer"]
          }" />.\n Error in component: ${component.file}\n node: ${node.tagName}`;
        this.error(BadUseDeferFlagException);
      }
      if (
        node.attributes && node.attributes["--defer"] && isImported &&
        subcomp && subcomp.type !== "async"
      ) {
        const BadUseDeferFlagException =
          `--defer must be called only on async components. change type of <${node.tagName} --defer="${node.attributes["--defer"]
          }" /> or delete it.\n Error in component: ${component.file}\n node: ${node.tagName}`;
        this.error(BadUseDeferFlagException);
      }
      switch (true) {
        case subcomp &&
          ["async", "store", "router"].includes(subcomp.type) &&
          node.tagName &&
          !node.tagName.startsWith(`${subcomp.type}-`):
          if (subcomp) {
            this.error(
              `'${node.tagName}' is not a valid selector of ${subcomp.type} component. please use the following syntax:
                use @/${isImported} as '${subcomp.type}-${node.tagName}'

                input: use @/${isImported} as '${node.tagName}'
                component: ${component.file}
              `,
            );
          }
      }
      if (node.nodeType === 1 && node.childNodes && node.childNodes.length) {
        for await (const child of node.childNodes) {
          await this.read(bundle, keyComponent, child);
        }
      }
      if (node.tagName === null || (node.hasFlag && node.tagName)) {
        this.render(bundle, component, node);
      }
    }
  }
}
