export default function constructorMethods(
  component: any,
  node: any,
  opts: any,
): string {
  const { isTemplate } = opts;
  let templateConstruction = "";
  if (isTemplate) {
    // save external dependencies and required props to component
    // only if it's a template
    templateConstruction = `
      const component = new Ogone.components['${component.uuid}']();
      component.requirements = (${
      component.properties ? JSON.stringify(component.properties) : null
    });
      component.dependencies = (${JSON.stringify(node.dependencies)});
      this.component = component;
      this.component.type = '${component.type || "component"}';
      this.setOgone();
    `;
  }
  //define dependencies of the node
  return `
    constructor() {
      super();
      this.dependencies = (${JSON.stringify(node.dependencies)});
      this.positionInParentComponent = ${isTemplate ? "[]" : null};
      ${templateConstruction}
      // define templates of hmr
      Ogone.mod[this.extends] = Ogone.mod[this.extends] || [];
    }
  `;
}
