import { Utils } from './Utils.ts';
import { Component } from '../.d.ts';
import { LabelContext } from './ProtocolLabelGetter.ts';
import read from '../utils/agnostic-transformer.ts';
import reflectionsElements from '../utils/assets/reflection-syntax-elements.ts';
import getDeepTranslation from '../utils/template-recursive.ts';
import getTypedExpressions from '../utils/typedExpressions.ts';


interface ProtocolClassConstructorItem {
  /** one string that contains all the properties of the protocol */
  value: string;
  /** one string that contains all the ambient types for the protocol */
  types: string[];
  /** ambient props declarations */
  props: string;
}
export default class ProtocolClassConstructor extends Utils {
  private mapProtocols: Map<string, ProtocolClassConstructorItem> = new Map();
  public setItem(component: Component) {
    this.mapProtocols.set(component.uuid, {
      value: '',
      props: '',
      types: [],
    });
  }
  public saveProtocol(component: Component, ctx: LabelContext) {
     if (ctx.token === 'declare') {
       const item = this.mapProtocols.get(component.uuid);
       if (item) {
         item.value = `
         class Protocol {
           ${ctx.value.trim()}
         }`.trim();
         console.warn(item.value);
       }
     }
  }
  public setProps(component: Component) {
    const item = this.mapProtocols.get(component.uuid);
    if (item && component.requirements) {
      item.props = component.requirements.map(
        ([name, constructors]) =>
          `\ndeclare public ${name}: ${constructors.join(" | ")};`,
      ).join('');
    }
  }
  public setBeforeEachContext(component: Component, ctx: LabelContext) {
    if (ctx.token === 'before-each') {
      const item = this.mapProtocols.get(component.uuid);
      if (item) {
        const expressions = {};
        const typedExpressions = getTypedExpressions();
        const transformedValue = read({
          array: reflectionsElements,
          value: ctx.value,
          typedExpressions,
          expressions
        });
        component.context.beforeEach = getDeepTranslation(transformedValue, expressions)
      }
    }
  }
}