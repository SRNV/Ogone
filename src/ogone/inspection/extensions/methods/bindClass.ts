export default function bindClassMethod(component: any, node: any, opts: any): string {
  const { isStore, isRouter } = opts;
  if (isRouter || isStore || (!node.directives || !node.directives.class)) return `bindClass() {}`;
  return `
    bindClass() {
      const o = this.ogone;
      const oc = o.component;
      function r(n) {
        const vl = o.getContext({
          position: o.position,
          getText: '(${node.directives.class
            // preserve regular expressions
            .replace(/\\/gi, '\\\\')
            // erase new line
            .replace(/\n/gi, ' ')
            // preserve quotes
            .replace(/\'/gi, '\\\'').trim()})',
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