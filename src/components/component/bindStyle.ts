export default function bindStyleMethod(
  component: any,
  node: any,
  opts: any,
): string {
  const { isStore, isRouter } = opts;
  if (
    isRouter || isStore
  ) {
    return `bindStyle() {}`;
  }
  return `
    bindStyle(value) {
      const o = this.ogone;
      const oc = o.component;
      if (!o.flags || !o.flags.style) return;
      function r(n) {
        const vl = o.getContext({
          position: o.position,
          getText: o.flags.style,
        });
        if (typeof vl === 'string') {
          n.style = vl;
        } else if (typeof vl === 'object') {
          Object.entries(vl).forEach(([k, v]) => n.style[k] = v);
        }
        return n.isConnected;
      }
      for (let n of o.nodes) {
        oc.react.push(() => r(n));
        r(n);
      }
    }
  `;
}
