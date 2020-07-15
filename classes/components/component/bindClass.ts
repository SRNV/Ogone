export default function bindClassMethod(
  component: any,
  node: any,
  opts: any,
): string {
  const { isStore, isRouter } = opts;
  if (
    isRouter || isStore
  ) {
    return `bindClass() {}`;
  }
  return `
    bindClass() {
      const o = this.ogone, oc = o.component;
      if (!o.flags || !o.flags.class) return;
      function r(n) {
        const vl = o.getContext({
          position: o.position,
          getText: (o.flags.class),
        });
        if (typeof vl === 'string') {
          n.classList.value = vl;
        } else if (typeof vl === 'object') {
          const keys = Object.keys(vl);
          n.classList.add(...keys.filter((key) => vl[key]));
          n.classList.remove(...keys.filter((key) => !vl[key]));
        } else if (Array.isArray(vl)) {
          n.classList.value = vl.join(' ');
        }
        return n.isConnected;
      }
      for (let node of o.nodes) {
        oc.react.push(() => r(node));
        r(node);
      }
    }`;
}
