import type { Bundle, Component } from '../.d.ts';
import ProtocolModifierGetter from './ProtocolModifierGetter.ts';
import { ModifierContext } from './ProtocolModifierGetter.ts';
import { Utils } from './Utils.ts';
import DefinitionProvider from './DefinitionProvider.ts';
import ProtocolClassConstructor from './ProtocolClassConstructor.ts';
import ProtocolBodyConstructor from './ProtocolBodyConstructor.ts';

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
  public async read(bundle: Bundle): Promise<void> {
    const entries = Array.from(bundle.components.entries());
    entries.forEach(([, component]: [string, Component]) => {
      const proto = component.elements.proto[0];
      if (!proto || !proto.getInnerHTML) return;
      const protocol = proto.getInnerHTML();
      this.ProtocolClassConstructor.setItem(component);
      this.ProtocolModifierGetter.registerModifierProviders(protocol, {
        modifiers: [
          {
            token: 'def',
            unique: true,
            indentStyle: true,
            onParse: (ctx: ModifierContext) => {
              this.DefinitionProvider.saveDataOfComponent(component, ctx);
            }
          },
          {
            token: 'declare',
            unique: true,
            indentStyle: true,
            isReactive: true,
            onParse: (ctx: ModifierContext) => {
              this.ProtocolClassConstructor.saveProtocol(component, ctx);
              this.ProtocolClassConstructor.setProps(component);
            }
          },
          {
            token: 'default',
            unique: true,
            isReactive: true,
            onParse: (ctx: ModifierContext) => {
              console.warn("default", ctx)
              // console.warn(ctx.value);
            }
          },
          {
            token: 'before-each',
            unique: true,
            isReactive: true,
            onParse: (ctx: ModifierContext) => {
              this.ProtocolBodyConstructor.setBeforeEachContext(component, ctx);
            }
          },
          {
            token: 'compute',
            unique: true,
            isReactive: true,
            onParse: (ctx: ModifierContext) => {
              this.ProtocolBodyConstructor.setComputeContext(component, ctx);
            }
          },
          {
            token: 'case',
            argumentType: 'string',
            unique: false,
            isReactive: true,
            onParse: (ctx: ModifierContext) => {
              console.warn("case", ctx)
              this.ProtocolBodyConstructor.setComputeContext(component, ctx);
            }
          },
        ],
        onError: (err) => {
          this.error(err.message);
        }
      });
    });
    for await (const [, component] of entries) {
      await this.DefinitionProvider.setDataToComponentFromFile(component);
    }
  }
}
