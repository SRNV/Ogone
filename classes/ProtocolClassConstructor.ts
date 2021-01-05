import { Context } from './../enums/templateContext.ts';
import { Utils } from './Utils.ts';
import { Bundle, Component, ModifierContext, XMLNodeDescription } from '../.d.ts';
import OgoneNS from "../types/ogone/namespaces.ts";
import ProtocolEnum from '../enums/templateProtocol.ts';
import ProtocolReactivity from './ProtocolReactivity.ts';
import { ComponentEngine } from '../enums/componentEngine.ts';
interface ProtocolClassConstructorItem {
  /** one string that contains all the properties of the protocol */
  value: string;
  /** one string that contains all the ambient types for the protocol */
  types: string[];
  /** ambient props declarations */
  props: string;
  /** all the imported components types */
  importedComponentsTypes: string[];
}
export default class ProtocolClassConstructor extends ProtocolReactivity {
  private mapProtocols: Map<string, ProtocolClassConstructorItem> = new Map();
  private ProtocolReactivity: ProtocolReactivity = new ProtocolReactivity();
  public setItem(component: Component) {
    this.mapProtocols.set(component.uuid, {
      value: '',
      props: '',
      types: [],
      importedComponentsTypes: [],
    });
  }
  static getInterfaceProps(component: Component): string {
    return component.requirements ? component.requirements.map(
      ([name, type]) => `\n${name}: ${type};`).join('') : ''
  }
  static getPropsFromNode(node: XMLNodeDescription): string {
    return Object.entries(node.attributes).filter(([key]) =>
      key.startsWith(":")
    ).map(([key, value]) =>
      `\n${key.slice(1)}: ${value === '=""' ? null : value}`
    ).join("\n,")
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
  private recursiveInspectionOfNodes(bundle: Bundle, component: Component, opts: { importedComponent: Component, tagName: string, n: XMLNodeDescription }) {
    const {
      importedComponent,
      tagName,
      n,
    } = opts;
    const item = this.mapProtocols.get(component.uuid);
    const { requirements } = importedComponent;
    let propsTypes: string = "";
    if (n.tagName === tagName) {
      if (requirements && requirements.length) {
        propsTypes = this.template(`{% props %}`, {
          props: ProtocolClassConstructor.getInterfaceProps(importedComponent),
        });
      }
      const ctx = bundle.mapContexts.get(`${component.uuid}-${n.id}`);
      if (ctx) {
        let result = this.template(
          ProtocolEnum.USED_COMPONENT_TEMPLATE,
          {
            tagName,
            tagNameFormatted: tagName.replace(/(\-)([a-z])/gi, "_$2"),
            propsTypes,
            genericType: `Ogone${importedComponent.type.toUpperCase()}Component`,
            position: ctx.position,
            data: ctx.data,
            modules: ctx.modules,
            value: ctx.value,
            props: ProtocolClassConstructor.getPropsFromNode(n),
          },
        );
        if (item) {
          item.importedComponentsTypes.push(result);
        }
      }
    }
    if (n.childNodes) {
      for (let nc of n.childNodes) {
        this.recursiveInspectionOfNodes(bundle, component, {
          importedComponent,
          tagName,
          n: nc
        });
      }
    }
  };
  getAllUsedComponents(bundle: Bundle, component: Component): void {
    for (let [tagName, imp] of Object.entries(component.imports)) {
      const subc = bundle.components.get(imp);
      if (subc) {
        this.recursiveInspectionOfNodes(bundle, component, {
          tagName,
          importedComponent: subc,
          n: component.rootNode
        });
      }
    }
  }
  public buildProtocol(component: Component) {
    const item = this.mapProtocols.get(component.uuid);
    if (item) {
      Object.defineProperty(component.context, 'protocol', {
        get: () => {
          const runtime = this.getComponentRuntime(component);
          const namespaces = OgoneNS(runtime);
          return this.template(ProtocolEnum.BUILD, {
            runtime,
            namespaces,
            modules: component.esmExpressions,
            protocol: item.value.length ? item.value : `class Protocol {
              ${component.data ? Object.entries(component.data).map(([key, value]) => `\n${key} = (${JSON.stringify(value)});\n`) : ''}
            }`,
            allUsedComponents: item.importedComponentsTypes.join('\n'),
            tsx: this.getComponentTSX(component),
          });
        }
      })
      Object.defineProperty(component.context, 'protocolClass', {
        get: () => item.value,
      });
    }
  }
  public getComponentTSX(component: Component): string {
    let result = '';
    const { template } = component.elements;
    if (template && template.getOuterTSX) {
      result = template.getOuterTSX(component);
    }
    return result;
  }
  public getComponentRuntime(component: Component): string {
    let casesValue = component.modifiers.cases
      .map((modifier: ModifierContext) => `${modifier.token} ${modifier.argument}: ${modifier.value}`)
      .join('\n');
    let script: string = this.template(Context.TEMPLATE_COMPONENT_RUNTIME_PROTOCOL,
      {
        body: Context.TEMPLATE_COMPONENT_RUNTIME_BODY,
        switchBody: `\n${casesValue}\ndefault:\n${component.modifiers.default}`,
        file: component.file,
        caseGate: component.modifiers.cases.length || component.modifiers.default.length
          ? this.template(Context.CASE_GATE, {
              declaredCases: component.modifiers.cases.map((modifier: ModifierContext) => modifier.argument).join(','),
            })
          : '',
        reflections: component.modifiers.compute,
        beforeEach: component.modifiers.beforeEach,
        async: ["async", "store", "controller"].includes(
            component.type as string,
          )
          ? "async"
          : "",
      },
    );
    return script;
  }
  public async setComponentRuntime(component: Component) {
    let casesValue = component.modifiers.cases
      .map((modifier: ModifierContext) => `${modifier.token} ${modifier.argument}: ${modifier.value}`)
      .join('\n');
    let script: string = this.template(Context.TEMPLATE_COMPONENT_RUNTIME_PROTOCOL_AS_FUNCTION,
      {
        body: Context.TEMPLATE_COMPONENT_RUNTIME_BODY,
        switchBody: `\n${casesValue}\ndefault:\n${component.modifiers.default}`,
        file: component.file,
        caseGate: component.modifiers.cases.length || component.modifiers.default.length
          ? this.template(Context.CASE_GATE, {
              declaredCases: component.modifiers.cases.map((modifier: ModifierContext) => modifier.argument).join(','),
            })
          : '',
        reflections: component.modifiers.compute,
        beforeEach: component.modifiers.beforeEach,
        async: ["async", "store", "controller"].includes(
            component.type as string,
          )
          ? "async"
          : "",
      },
    );
    const runtime = (await Deno.transpileOnly({
      "/transpiled.ts": script
    }, { sourceMap: false }))["/transpiled.ts"].source
    // save the runtime
    component.scripts.runtime = component.isTyped && !component.context.engine.includes(ComponentEngine.ComponentInlineReaction)
        || !component.isTyped && component.context.engine.includes(ComponentEngine.ComponentProxyReaction)
      ? runtime
      : this.getReactivity({ text: runtime });
  }
}