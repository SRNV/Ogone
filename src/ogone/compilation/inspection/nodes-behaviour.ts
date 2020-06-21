import { Bundle, XMLNodeDescription } from "../../../../.d.ts";
import getWebComponent from "../../../components/index.ts";

export default async function oRenderNodesBehavior(
  bundle: Bundle,
  keyComponent: string,
  node: XMLNodeDescription,
) {
  const component = bundle.components.get(keyComponent);
  if (component) {
    const isImported: string = component.imports[node.tagName as string];
    const subcomp = bundle.components.get(isImported);
    if (node.tagName === null || (node.hasFlag && node.tagName)) {
      const elementExtension = getWebComponent(bundle, component, node);
      bundle.classes.push(elementExtension);
    }
    if (
      node.attributes && node.attributes["--await"] &&
      component.type !== "async"
    ) {
      const BadUseOfAwaitInSyncComponentException =
        `[Ogone] --await must be used in an async component. define type="async" to the proto.\n Error in component: ${component.file}\n node: ${node.tagName}`;
      throw BadUseOfAwaitInSyncComponentException;
    }
    if (
      node.attributes && node.attributes["--await"] && isImported &&
      subcomp && subcomp.type !== "async"
    ) {
      const BadUseOfAwaitInSyncComponentException =
        `[Ogone] --await must be called only on async components. change type of <${node.tagName} --await /> or erase --await.\n Error in component: ${component.file}\n node: ${node.tagName}`;
      throw BadUseOfAwaitInSyncComponentException;
    }
    if (node.attributes && node.attributes["--defer"] && !isImported) {
      const BadUseDeferFlagException =
        `[Ogone] --defer must be called only on async components. discard <${node.tagName} --defer="${
          node.attributes["--defer"]
        }" />.\n Error in component: ${component.file}\n node: ${node.tagName}`;
      throw BadUseDeferFlagException;
    }
    if (
      node.attributes && node.attributes["--defer"] && isImported &&
      subcomp && subcomp.type !== "async"
    ) {
      const BadUseDeferFlagException =
        `[Ogone] --defer must be called only on async components. change type of <${node.tagName} --defer="${
          node.attributes["--defer"]
        }" /> or delete it.\n Error in component: ${component.file}\n node: ${node.tagName}`;
      throw BadUseDeferFlagException;
    }
    switch (true) {
      case subcomp &&
        ["async", "store", "router"].includes(subcomp.type) &&
        node.tagName &&
        !node.tagName.startsWith(`${subcomp.type}-`):
        if (subcomp) {
          const InvalidTagNameForTypedComponentException = new Error(
            `[Ogone] '${node.tagName}' is not a valid selector of ${subcomp.type} component. please use the following syntax:

                    use @/${isImported} as '${subcomp.type}-${node.tagName}'

                    input: use @/${isImported} as '${node.tagName}'
                    component: ${component.file}
                  `,
          );
          throw InvalidTagNameForTypedComponentException;
        }
    }
    if (node.nodeType === 1 && node.childNodes && node.childNodes.length) {
      for await (const child of node.childNodes) {
        await oRenderNodesBehavior(bundle, keyComponent, child);
      }
    }
  }
}
