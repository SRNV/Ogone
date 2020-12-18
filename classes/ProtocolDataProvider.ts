import type { Bundle, Component, ModifierContext } from '../.d.ts';
import ProtocolModifierGetter from './ProtocolModifierGetter.ts';
import { Utils } from './Utils.ts';
import DefinitionProvider from './DefinitionProvider.ts';
import ProtocolClassConstructor from './ProtocolClassConstructor.ts';
import ProtocolBodyConstructor from './ProtocolBodyConstructor.ts';
import ProtocolReactivity from './ProtocolReactivity.ts';
import { MapPosition } from "./MapPosition.ts";

/**
 * @name ProtocolDataProvider
 * @code OPDP2-OSB7-OC0
 * @description
 * better class to get all modifiers of the protocol
 */
export default class ProtocolDataProvider extends Utils {
  private DefinitionProvider: DefinitionProvider = new DefinitionProvider();
  private ProtocolBodyConstructor: ProtocolBodyConstructor = new ProtocolBodyConstructor();
  private ProtocolClassConstructor: ProtocolClassConstructor = new ProtocolClassConstructor();
  private ProtocolModifierGetter: ProtocolModifierGetter = new ProtocolModifierGetter();
  private ProtocolReactivity: ProtocolReactivity = new ProtocolReactivity();
  public async read(bundle: Bundle): Promise<void> {
    const entries = Array.from(bundle.components.entries());
    entries.forEach(([, component]: [string, Component]) => {
      const proto = component.elements.proto[0];
      if (!proto || !proto.getInnerHTML) return;
      const position = MapPosition.mapNodes.get(proto)!;
      const protocol = proto.getInnerHTML();
      this.ProtocolClassConstructor.setItem(component);
      this.ProtocolModifierGetter.registerModifierProviders(protocol, {
        modifiers: [
          {
            token: 'def',
            unique: true,
            indentStyle: true,
            exclude: ['declare'],
            onParse: (ctx: ModifierContext) => {
              this.DefinitionProvider.saveDataOfComponent(component, ctx);
            }
          },
          {
            token: 'declare',
            unique: true,
            indentStyle: true,
            exclude: ['def'],
            isReactive: component.type !== "controller",
            onParse: (ctx: ModifierContext) => {
              component.isTyped = true;
              this.ProtocolClassConstructor.setProps(component);
              this.ProtocolClassConstructor.saveProtocol(component, ctx);
            }
          },
          {
            token: 'default',
            unique: true,
            isReactive: component.type !== "controller",
            onParse: (ctx: ModifierContext) => {
              component.modifiers.default = ctx.value;
            }
          },
          {
            token: 'before-each',
            unique: true,
            isReactive: component.type !== "controller",
            onParse: (ctx: ModifierContext) => {
              this.ProtocolBodyConstructor.setBeforeEachContext(component, ctx);
            }
          },
          {
            token: 'compute',
            unique: true,
            isReactive: component.type !== "controller",
            onParse: (ctx: ModifierContext) => {
              this.ProtocolBodyConstructor.setComputeContext(component, ctx);
            }
          },
          {
            token: 'case',
            argumentType: 'string',
            unique: false,
            isReactive: component.type !== "controller",
            onParse: (ctx: ModifierContext) => {
              this.ProtocolBodyConstructor.setCaseContext(component, ctx);
            }
          },
        ],
        onError: (err) => {
          this.error(`Error in component: ${component.file}:${position.line}:${position.column} \n\t${err.message}`);
        }
      });
    });
    for await (const [, component] of entries) {
      this.ProtocolClassConstructor.getAllUsedComponents(bundle, component);
      this.ProtocolClassConstructor.buildProtocol(component);
      await this.ProtocolClassConstructor.setComponentRuntime(component);
      await this.DefinitionProvider.setDataToComponentFromFile(component);
    }
  }
  // set the automatic reactivity helper
  // protocolReactivity will add a function after all AssignmentPattern
  setReactivity(text: string) {
    return this.ProtocolReactivity.getReactivity({ text });
  }
}
