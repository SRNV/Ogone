export default function storeMethods(component: any, node: any, opts: any): string {
    const { isStore } = opts;
    if (!isStore) return 'renderStore(){}'
    return `
    renderStore() {
        const o = this.ogone;
        const oc = o.component;
        if (oc.namespace !== '${component.namespace}') {
          const error = 'the attribute namespace is not the same provided in the component store';
          const BadNamspaceException = new Error(\`[Ogone] $\{error}\`);
          Ogone.error(error, 'Store Module: Bad Namsepace Exception', {
            message: \`
            store namespace: ${component.namespace}
            attribute namespace: $\{oc.namespace}
            \`
          })
          throw BadNamspaceException;
        }
        oc.startLifecycle();
        this.remove();
      }`;
  }