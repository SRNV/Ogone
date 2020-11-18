import OgoneComponent from '../OgoneComponent.ts';
import DOMElement from './DOMElement.ts';
/**
 * class to get all rendering of elements
 * should differ if it's for SPA/SSR/SSG
 */
export default class DOMElementRenderer {
  protected static registry: Map<string, DOMElement> = new Map();
  static get collection(): DOMElement[] {
    return Array.from(this.registry.entries())
      .map(([key, domelement]) => domelement)
      /**
       * need to sort by the assigned date because some domelements are instantiated before the precedent domelement
       */
      .sort((a: DOMElement, b: DOMElement) => a.date !== undefined && b.date !== undefined && a.date - b.date || 1);
  }
  public static getVarsSPA(component: OgoneComponent) {
    const collection = DOMElementRenderer.getElementsOfComponent(component.uuid as string);
    const vars = collection
      .filter((domelement) => domelement
        && !domelement.isInArrowIteration
        && domelement.declarationSPA)
      .map((domelement) => domelement.declarationSPA);
    return `let ${vars.join(',\n')};`;
  }
  public static getAssignementsSPA(component: OgoneComponent) {
    const collection = DOMElementRenderer.getElementsOfComponent(component.uuid as string);
    const assignements = collection
      .filter((domelement) => domelement
        && !domelement.isInArrowIteration
        && domelement.assignementSPA)
      .map((domelement) => domelement.assignementSPA);
    return assignements.join('\n');
  }
  public static getAppendChildsSPA(component: OgoneComponent) {
    const collection = DOMElementRenderer.getElementsOfComponent(component.uuid as string);
    const appends = collection
      .filter((domelement) => domelement
        && !domelement.isInArrowIteration
        && domelement.appendChildSPA)
      .map((domelement) => domelement.appendChildSPA);
    return appends.join('\n');
  }
  public static getUpdatesSPA(component: OgoneComponent) {
    const collection = DOMElementRenderer.getElementsOfComponent(component.uuid as string);
    const updates = collection
      .filter((domelement) => domelement
        && !domelement.isInArrowIteration
        && domelement.updateSPA)
      .map((domelement) => domelement.updateSPA);
    return updates.join('\n');
  }
  public static getReturnTemplateSPA(component: OgoneComponent) {
    const collection = DOMElementRenderer.getElementsOfComponent(component.uuid as string);
    const result = collection
      .filter((domelement) => domelement
        && !domelement.isInArrowIteration
        && domelement.returnTemplateStatementSPA)
      .map((domelement) => domelement.returnTemplateStatementSPA);
    return result.join('\n');
  }
  public static getIterationsDeclarationsSPA(component: OgoneComponent) {
    const collection = DOMElementRenderer.getElementsOfComponent(component.uuid as string);
    const result = collection
      .filter((domelement) => domelement
        && !domelement.isInArrowIteration
        && domelement.isArrowIterationFunction
        && domelement.iterationDeclaration)
      .map((domelement) => domelement.iterationDeclaration);
    return result.join('\n');
  }
  public static getIterationsCallSPA(component: OgoneComponent) {
    const collection = DOMElementRenderer.getElementsOfComponent(component.uuid as string);
    const result = collection
      .filter((domelement) => domelement
        && !domelement.isInArrowIteration
        && domelement.isArrowIterationFunction
        && domelement.iterationCall)
      .map((domelement) => domelement.iterationCall);
    return result.join('\n');
  }
  static getElementsByNodeType(nodeType: number) {
    return this.collection.filter((domelement) => domelement && domelement.nodeType === nodeType);
  }
  static getElementsOfComponent(uuid: string): DOMElement[] {
    return this.collection.filter((domelement) => domelement && domelement.parentComponent && domelement.parentComponent.uuid === uuid);
  }
}