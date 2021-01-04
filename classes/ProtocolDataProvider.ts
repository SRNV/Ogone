import type { Bundle, Component, ModifierContext, TypedExpressions } from '../.d.ts';
import ProtocolModifierGetter from './ProtocolModifierGetter.ts';
import { Utils } from './Utils.ts';
import DefinitionProvider from './DefinitionProvider.ts';
import ProtocolClassConstructor from './ProtocolClassConstructor.ts';
import ProtocolBodyConstructor from './ProtocolBodyConstructor.ts';
import ProtocolReactivity from './ProtocolReactivity.ts';
import { MapPosition } from "./MapPosition.ts";
import notParsedElements from '../utils/not-parsed.ts';
import elements from '../utils/elements.ts';
import read from '../utils/agnostic-transformer.ts';
import getTypedExpressions from '../utils/typedExpressions.ts';
import getDeepTranslation from '../utils/template-recursive.ts';
import generator from "../utils/generator.ts";

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
              this.transformInheritedPropertiesInContext(component, ctx);
              component.isTyped = true;
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
      await this.DefinitionProvider.setDataToComponentFromFile(component);
      this.DefinitionProvider.transformInheritedProperties(component);
    }
    for await (const [, component] of entries) {
      this.ProtocolClassConstructor.getAllUsedComponents(bundle, component);
      this.ProtocolClassConstructor.buildProtocol(component);
      await this.ProtocolClassConstructor.setComponentRuntime(component);
    }
  }
  // set the automatic reactivity helper
  // protocolReactivity will add a function after all AssignmentPattern
  setReactivity(text: string) {
    return this.ProtocolReactivity.getReactivity({ text });
  }
  private transformInheritedPropertiesInContext(component: Component, ctx: ModifierContext) {
    const expressions: any = {};
    const typedExpressions = getTypedExpressions();
    let result = read({
      value: ctx.value,
      array: notParsedElements.concat(elements).concat([
        {
          name: 'inherit',
          reg: /(inherit)(?:\s+)([^\s\:\n\=\;\?]+)+(\:(?<types>.+?)){0,1}(?:\=)/i,
          open: false,
          id: (value, matches) => {
            const id = `${generator.next().value}_inherit`;
            if (matches) {
              const [input, statement, property] = matches;
              const types = matches?.groups?.types || 'unknown';
              component.requirements = component.requirements || [];
              component.requirements.push([property.trim(), getDeepTranslation(types, expressions)])
              expressions[id] = `${property}${':' + types}=`;
              return id;
            }
            expressions[id] = value;
            return id;
          },
          close: false,
        }
      ]),
      expressions,
      typedExpressions,
    });
    ctx.value = getDeepTranslation(result, expressions);
  }
}
