export default function bindStyleMethod(
  component: any,
  node: any,
  opts: any,
): string {
  const { isStore, isRouter } = opts;
  if (
    isRouter || isStore || (!node.directives || !node.directives.style)
  ) {
    return `bindStyle() {}`;
  }
  return `
    bindStyle(value) {
      const o = this.ogone;
      const oc = o.component;
      function r(n) {
        const vl = o.getContext({
          position: o.position,
          getText: '(${
    node.directives.style
      // preserve regular expressions
      .replace(/\\/gi, "\\\\")
      // erase new line
      .replace(/\n/gi, " ")
      // preserve quotes
      .replace(/\'/gi, "\\'").trim()
  })',
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
        r();
      }
    }
  `;
}
