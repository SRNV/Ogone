// @ts-nocheck
const getClassRouter = (klass) =>
  class extends (Ogone.classes.component(klass)) {
    constructor() {
      super();
      this.type = "router";
    }
  };
export default getClassRouter.toString();
