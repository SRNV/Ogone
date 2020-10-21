import { Utils } from './Utils.ts';
import { Component, ModifierContext } from '../.d.ts';
import ProtocolEnum from '../enums/templateProtocol.ts';

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
  public saveProtocol(component: Component, ctx: ModifierContext) {
     if (ctx.token === 'declare') {
       const item = this.mapProtocols.get(component.uuid);
       if (item) {
         item.value = this.template(ProtocolEnum.PROTOCOL_TEMPLATE.trim(), {
           data: ctx.value.trim(),
         });
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
  public buildProtocol(component: Component) {
    const item = this.mapProtocols.get(component.uuid);
    if (item) {
      Object.defineProperty(component.context, 'protocol', {
        get: () => {
          return this.template(ProtocolEnum.BUILD, {
            types: this.template(ProtocolEnum.TYPES_TEMPLATE, {
              props: item.props,
            }),
            protocol: item.value,
            allUsedComponents: '',
          })
        }
      })
    }
  }
}