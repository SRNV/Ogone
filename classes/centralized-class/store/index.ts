// @ts-nocheck
const getClassStore = (klass) => (class extends (Ogone.classes.component(klass)) {
    constructor() {
      super();
      this.type = "store";
    }
    renderStore() {
      const o = this.ogone, oc = o.component;
      if (oc.namespace !== o.namespace) {
        const error = 'the attribute namespace is not the same provided in the component store';
        const BadNamspaceException = new Error(`[Ogone] ${error}`);
        Ogone.error(error, 'Store Module: Bad Namsepace Exception', {
          message: `
          store namespace: $\{o.namespace}
          attribute namespace: $\{oc.namespace}
          `
        })
        throw BadNamspaceException;
      }
      oc.startLifecycle();
      this.removeNodes().remove();
    };
  });
export default getClassStore.toString();