import { HTMLOgoneElement, OnodeComponent } from "../../ogone.main.d.ts";
import OgoneExtends from './OgoneExtends.ts';

export default class OgoneContext extends OgoneExtends { }
export function setContext(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc || !o.key) return;
  if (o.isTemplate) {
    oc.key = o.key;
    oc.dependencies = o.dependencies;
    if (o.parentComponent) {
      oc.parent = o.parentComponent;
      oc.parent.childs.push(oc);
    }
    if (OgoneContext.contexts[o.parentCTXId] && o.parentComponent) {
      const gct = OgoneContext.contexts[o.parentCTXId].bind(
        o.parentComponent.data,
      );
      oc.parentContext = gct;
      o.getContext = gct;
    }
  } else if (OgoneContext.contexts[Onode.extends] && oc) {
    o.getContext = OgoneContext.contexts[Onode.extends].bind(oc.data);
  }
  if (o.type === "store" && oc.parent) {
    oc.namespace = Onode.getAttribute("namespace") || null;
    oc.parent.store[oc.namespace as string] = oc;
  }
}
export function setDevToolContext(Onode: HTMLOgoneElement) {
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
  OgoneContext.ComponentCollectionManager.read({
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
