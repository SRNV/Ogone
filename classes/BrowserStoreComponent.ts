// @ts-nocheck
const getClassStore = (
  klass,
) => (class extends (Ogone.classes.component(klass)) {
  constructor() {
    super();
    this.type = "store";
  }
});
export default getClassStore.toString();
