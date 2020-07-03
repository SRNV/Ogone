export default function bindValueMethod(
  component: any,
  node: any,
  opts: any,
): string {
  const { isStore, isRouter } = opts;
  if (
    isRouter || isStore
  ) {
    return `bindValue() {}`;
  }
  return `
      bindValue() {
        const o = this.ogone;
        const oc = o.component;
        if (!o.flags || !o.flags.bind) return;
        function r(n, dependency) {
          const k = o.flags.bind;
          const evl = o.getContext({
            position: o.position,
            getText: k,
          });
          if (dependency === true) {
            // force binding
            n.value = evl;
          }
          if (typeof k === 'string'
            && k.indexOf(dependency) > -1
            && evl !== undefined && n.value !== evl) {
            n.value = evl;
          }
          return n.isConnected;
        }
        for (let n of o.nodes) {
          n.addEventListener('keydown', (ev) => {
            const k = o.flags.bind;
            const evl = o.getContext({
              position: o.position,
              getText: k,
            });
            if (evl !== n.value) {
              const ctx = o.getContext({
                position: o.position,
              });
              const values = Object.values(ctx);
              const keys = Object.keys(ctx);
              const fn = new Function(...keys, 'n', \`this.$\{k} = n.value;\`)
              fn.bind(oc.data)(...values, n);
              oc.update(k, ev);
            }
          });
          n.addEventListener('keyup', (ev) => {
            const k = o.flags.bind;
            const evl = o.getContext({
              position: o.position,
              getText: k,
            });
            if (evl !== n.value) {
              const ctx = o.getContext({
                position: o.position,
              });
              const values = Object.values(ctx);
              const keys = Object.keys(ctx);
              const fn = new Function(...keys, 'n', \`this.$\{k} = n.value;\`)
              fn.bind(oc.data)(...values, n);
              oc.update(k, ev);
            }
          });
          n.addEventListener('change', (ev) => {
            const k = o.flags.bind;
            const evl = o.getContext({
              position: o.position,
              getText: k,
            });
            if (evl !== n.value) {
              const ctx = o.getContext({
                position: o.position,
              });
              const values = Object.values(ctx);
              const keys = Object.keys(ctx);
              const fn = new Function(...keys, 'n', \`this.$\{k} = n.value;\`)
              fn.bind(oc.data)(...values, n);
              oc.update(k, ev);
            }
          });
          oc.react.push((dependency) => r(n, dependency));
          r(n, true);
        }
      }
    `;
}
