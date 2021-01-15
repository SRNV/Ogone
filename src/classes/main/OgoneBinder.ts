import { HTMLElement, HTMLInputElement } from "../../ogone.dom.d.ts";
import { HTMLOgoneElement } from '../../ogone.main.d.ts';
import OgoneContext from './OgoneContext.ts';

export default abstract class OgoneBinder extends OgoneContext {
  static bindValue(Onode: HTMLOgoneElement) {
    const o = Onode.ogone, oc = o.component;
    if (!o.flags || !o.flags.bind || !oc || !o.nodes) return;
    function r(n: HTMLInputElement, dependency: boolean | string) {
      const k = o.flags.bind;
      const evl = o.getContext({
        position: o.position,
        getText: k,
      });
      if (dependency === true) {
        // force binding
        n.value = evl;
      }
      if (
        typeof k === "string" &&
        k.indexOf(dependency as string) > -1 &&
        evl !== undefined && n.value !== evl
      ) {
        n.value = evl;
      }
      return n.isConnected;
    }
    for (let n of o.nodes) {
      (n as unknown as HTMLInputElement).addEventListener("keydown", (ev: Event) => {
        const k = o.flags.bind;
        const evl = o.getContext({
          position: o.position,
          getText: k,
        });
        if (evl !== (n as unknown as HTMLInputElement).value) {
          const ctx = o.getContext({
            position: o.position,
          });
          const values = Object.values(ctx);
          const keys = Object.keys(ctx);
          const fn = new Function(...keys, "n", `${k} = n.value;`);
          fn.bind(oc.data)(...values, n);
          oc.update(k, ev);
        }
      });
      (n as unknown as HTMLInputElement).addEventListener("keyup", (ev: Event) => {
        const k = o.flags.bind;
        const evl = o.getContext({
          position: o.position,
          getText: k,
        });
        if (evl !== (n as unknown as HTMLInputElement).value) {
          const ctx = o.getContext({
            position: o.position,
          });
          const values = Object.values(ctx);
          const keys = Object.keys(ctx);
          const fn = new Function(...keys, "n", `${k} = n.value;`);
          fn.bind(oc.data)(...values, n);
          oc.update(k, ev);
        }
      });
      (n as unknown as HTMLInputElement).addEventListener("change", (ev: Event) => {
        const k = o.flags.bind;
        const evl = o.getContext({
          position: o.position,
          getText: k,
        });
        if (evl !== (n as unknown as HTMLInputElement).value) {
          const ctx = o.getContext({
            position: o.position,
          });
          const values = Object.values(ctx);
          const keys = Object.keys(ctx);
          const fn = new Function(...keys, "n", `${k} = n.value;`);
          fn.bind(oc.data)(...values, n);
          oc.update(k, ev);
        }
      });
      oc.react.push((dependency: string | boolean) =>
        r((n as unknown as HTMLInputElement), dependency)
      );
      r((n as unknown as HTMLInputElement), true);
    }
  }
  static bindClass(Onode: HTMLOgoneElement) {
    const o = Onode.ogone, oc = o.component;
    if (!o.flags || !o.flags.class || !oc || !o.nodes) return;
    function r(n: HTMLElement) {
      const vl = o.getContext({
        position: o.position,
        getText: (o.flags.class),
      });
      if (typeof vl === "string") {
        n.classList.value = vl;
      } else if (typeof vl === "object") {
        const keys = Object.keys(vl);
        n.classList.add(...keys.filter((key) => vl[key]));
        n.classList.remove(...keys.filter((key) => !vl[key]));
      } else if (Array.isArray(vl)) {
        n.classList.value = vl.join(" ");
      }
      return n.isConnected;
    }
    for (let node of o.nodes) {
      oc.react.push(() => r(node as HTMLElement));
      r(node as HTMLElement);
    }
  }
  static bindHTML(Onode: HTMLOgoneElement) {
    const o = Onode.ogone, oc = o.component;
    if (!o.flags || !o.flags.html || !oc || !o.nodes || o.isTemplate) return;
    function r(n: HTMLElement) {
      const vl = o.getContext({
        position: o.position,
        getText: (o.flags.html),
      });
      if (typeof vl === "string") {
        n.innerHTML = '';
        n.insertAdjacentHTML('beforeend', vl);
      }
      return n.isConnected;
    }
    for (let node of o.nodes) {
      oc.react.push(() => r(node as HTMLElement));
      r(node as HTMLElement);
    }
  }
  static bindStyle(Onode: HTMLOgoneElement) {
    const o = Onode.ogone, oc = o.component;
    if (!o.flags || !o.flags.style || !oc || !o.nodes) return;
    function r(n: HTMLElement) {
      const vl: string | ({ [k: string]: boolean }) = o.getContext({
        position: o.position,
        getText: o.flags.style,
      });
      if (typeof vl === "string") {
        Object.keys(n.style)
          .forEach((key: string) => {
            // @ts-ignore
            n.style[key] = vl[key];
          });
      } else if (typeof vl === "object") {
        Object.entries(vl)
          // @ts-ignore
          .forEach(([k, v]: [string, boolean]) => n.style[k] = v);
      }
      return n.isConnected;
    }
    for (let n of o.nodes) {
      oc.react.push(() => r(n as HTMLElement));
      r(n as HTMLElement);
    }
  }
}
