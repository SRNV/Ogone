export default function constructorMethods(
  component: any,
  node: any,
  opts: any,
): string {
  const { isTemplate, isProduction } = opts;
  let templateConstruction = "";
  if (isTemplate) {
    // save external dependencies and required props to component
    // only if it's a template
    templateConstruction = `
      const component = new Ogone.components['${component.uuid}']();
      component.requirements = (${
      component.requirements ? JSON.stringify(component.requirements) : null
    });
      component.dependencies = (${JSON.stringify(node.dependencies)});
      this.component = component;
      this.component.type = '${component.type || "component"}';
      this.setOgone({ isRoot: true });
      // define runtime for hmr
      ${!isProduction ? `Ogone.run['${component.uuid}'] = Ogone.run['${component.uuid}'] || [];` : ''}
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
      ${!isProduction ? `Ogone.mod[this.extends] = Ogone.mod[this.extends] || [];` :  ''}
    }
  `;
}
