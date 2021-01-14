import { HTMLOgoneElement, OnodeComponent } from "../../.d.ts";
import Ogone from './Ogone.ts';

export default abstract class OgoneContext {
  static setContext(Onode: HTMLOgoneElement) {
    const o = Onode.ogone, oc = o.component;
    if (!oc || !o.key) return;
    if (o.isTemplate) {
      oc.key = o.key;
      oc.dependencies = o.dependencies;
      if (o.parentComponent) {
        oc.parent = o.parentComponent;
        oc.parent.childs.push(oc);
      }
      if (Ogone.contexts[o.parentCTXId] && o.parentComponent) {
        const gct = Ogone.contexts[o.parentCTXId].bind(
          o.parentComponent.data,
        );
        oc.parentContext = gct;
        o.getContext = gct;
      }
    } else if (Ogone.contexts[Onode.extends] && oc) {
      o.getContext = Ogone.contexts[Onode.extends].bind(oc.data);
    }
    if (o.type === "store" && oc.parent) {
      oc.namespace = Onode.getAttribute("namespace") || null;
      oc.parent.store[oc.namespace as string] = oc;
    }
  }
  static setHMRContext(Onode: HTMLOgoneElement) {
    const o = Onode.ogone, oc = o.component;
    // register to hmr
    if (o.isTemplate && oc && o.uuid) {
      Ogone.instances[o.uuid].push(oc);
    }
    Ogone.mod[Onode.extends].push((pragma: string) => {
      Ogone.render[Onode.extends] = eval(pragma);
      if (!o.nodes) return;
      if (o.isTemplate) {
        return true;
      } else if (oc) {
        const invalidatedNodes = o.nodes.slice();
        const ns = Array.from(o.nodes);
        o.render = Ogone.render[Onode.extends];
        Ogone.renderingProcess(Onode);
        invalidatedNodes.forEach((n, i) => {
          if (n.ogone) {
            if (i === 0) n.firstNode.replaceWith(...ns);
            Ogone.destroy(n);
          } else {
            if (i === 0) n.replaceWith(...ns);
            (n as HTMLElement).remove();
          }
        });
        oc.renderTexts(true);
        return true;
      }
    });
  }
  static setDevToolContext(Onode: HTMLOgoneElement) {
    const o = Onode.ogone, oc = o.component;
    if (!oc) return;
    const ocp = oc.parent as OnodeComponent;
    const tree = o.tree
      ? o.tree
        .replace(
          "null",
          Onode.isComponent ? ocp.key as string : oc.key as string,
        )
        .split(">")
      : [o.key];
    Ogone.ComponentCollectionManager.read({
      tree,
      key: o.key,
      parentNodeKey: o.parentNodeKey,
      name: o.name || tree[tree.length - 1],
      ctx: oc,
      isRoot: o.isRoot,
      parentCTX: ocp,
      type: o.isTemplate ? o.isRoot ? "root" : oc.type : "element",
    });
  }
}