// @ts-nocheck
const getClassAsync = (
  klass,
) => (class extends (Ogone.classes.component(klass)) {
  constructor() {
    super();
    this.type = "async";
  }
});
export default getClassAsync.toString();
