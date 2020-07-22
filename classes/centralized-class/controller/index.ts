// @ts-nocheck
const getClassController = (klass: any) => (class extends (Ogone.classes.component(klass)) {
  connectedCallback() {
    this.remove();
  }
});
export default getClassController.toString();