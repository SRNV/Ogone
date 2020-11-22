/// <reference lib="dom" />
/**
 * this files should export all the functions
 * that can be used in the runtime
 */
/**
 * should return a deep reactive proxy
 * @param target the proxy target object
 * @param updateFunction
 * @param parentKey an index to save the proxy
 */
export function reactive(target: Object, updateFunction: Function, parentKey: string = ''): Object {
  const proxies: { [k: string]: Object } = {};
  return new Proxy(target, {
    get(obj: { [k: string]: unknown }, key: string, ...args: unknown[]) {
      let v;
      const id = `${parentKey}.${key.toString()}`;
      if (key === 'prototype') {
        v = Reflect.get(obj, key, ...args)
      } else if (obj[key] instanceof Object && !proxies[id]) {
        v = reactive(obj[key] as Object, updateFunction, id);
        proxies[id] = v;
      } else if (proxies[id]) {
        return proxies[id];
      } else {
        v = Reflect.get(obj, key, ...args);
      }
      return v;
    },
    set(obj: { [k: string]: unknown }, key: string, value: unknown, ...args: unknown[]) {
      if (obj[key] === value) return true;
      const id = `${parentKey}.${key.toString()}`;
      const v = Reflect.set(obj, key, value, ...args);
      updateFunction(id);
      return v;
    },
    deleteProperty(obj, key) {
      const id = `${parentKey}.${key.toString()}`;
      const v = Reflect.deleteProperty(obj, key)
      delete proxies[id];
      updateFunction(id);
      return v;
    }
  });
}
/**
 * createElement function
 */
export function crt(n: string, ns = false) {
  return ns ? document.createElementNS("http://www.w3.org/2000/svg", n) : document.createElement(n);
}
/**
 * append function
 */
export function app(p: HTMLElement, n: HTMLElement) {
  p && n && p.append(n);
}
/**
 * append functionfeat/hello-world
}
/**
 * setAttribute function
 */
export function att(n: HTMLElement, k: string, v: string) {
  n && k && n.setAttribute(k, v || '');
}
/**
 * addEventListener function
 */
export function add(n: HTMLElement, k: string, f: EventListenerOrEventListenerObject) {
  n && k && f &&  n.addEventListener(k, f);
}