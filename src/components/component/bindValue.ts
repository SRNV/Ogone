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
        console.warn(o.flags.bind)
        function r(n, dependency) {
          const k = o.flags.bind;
          const evl = eval(\`(oc.data.$\{k})\`);
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
            const k = o.flags.bind
            if (eval(\`oc.data.$\{k} !== n.value;\`)) {
                eval(\`oc.data.$\{k} = n.value;\`);
                oc.update(k, ev);
            }
          });
          n.addEventListener('change', (ev) => {
            const k = o.flags.bind
            if (eval(\`oc.data.$\{k} !== n.value;\`)) {
                eval(\`oc.data.$\{k} = n.value;\`);
                oc.update(k, ev);
            }
          });
          oc.react.push((dependency) => r(n, dependency));
          r(n, true);
        }
      }
    `;
  }
