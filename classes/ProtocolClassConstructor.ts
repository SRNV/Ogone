import { Context } from './../enums/templateContext.ts';
import { Utils } from './Utils.ts';
import { Bundle, Component, ModifierContext, XMLNodeDescription } from '../.d.ts';
import ProtocolEnum from '../enums/templateProtocol.ts';

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
export default class ProtocolClassConstructor extends Utils {
  private mapProtocols: Map<string, ProtocolClassConstructorItem> = new Map();
  public setItem(component: Component) {
    this.mapProtocols.set(component.uuid, {
      value: '',
      props: '',
      types: [],
      importedComponentsTypes: [],
    });
  }
  static getPropsDeclarations(component: Component): string {
    return component.requirements ? component.requirements.map(
      ([name, constructors]) =>
        `\ndeclare public ${name}: ${constructors.join(" | ")};`,
    ).join('') : '';
  }
  static getInterfaceProps(component: Component): string {
    return component.requirements ? component.requirements.map(
      ([name, constructors]) => `\n${name}: ${constructors.map((c) => `${c}`,).join(" | ")};`).join() : ''
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
          props: ProtocolClassConstructor.getPropsDeclarations(component),
        });
      }
    }
  }
  public setProps(component: Component) {
    if (component.requirements) {
      component.context.props = ProtocolClassConstructor.getPropsDeclarations(component);
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
        propsTypes = this.template(`{{ props }}`, {
          props: ProtocolClassConstructor.getInterfaceProps(component),
        });
      }
      const ctx = bundle.mapContexts.get(`${component.uuid}-${n.id}`);
      if (ctx) {
        console.warn(3, propsTypes);
        let result = this.template(
          ProtocolEnum.USED_COMPONENT_TEMPLATE,
          {
            tagName,
            tagNameFormatted: tagName.replace(/(\-)([a-z])/gi, "_$2"),
            propsTypes,
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
      console.warn(1,item.value, 2);
      Object.defineProperty(component.context, 'protocol', {
        get: () => {
          return this.template(ProtocolEnum.BUILD, {
            protocol: item.value,
            allUsedComponents: item.importedComponentsTypes.join('\n'),
            runtime: this.getComponentRuntime(component),
            tsx: this.getComponentTSX(component),
          });
        }
      })
    }
  }
  public getComponentTSX(component: Component): string {
    let result = '';
    const { template } = component.elements;
    if (template && template.getOuterTSX) {
      result = template.getOuterTSX();
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
        switchBody: `${casesValue}\ndefault:\n${component.modifiers.default}`,
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
  public async renderProtocol(component: Component): Promise<any | null>{
    const item = this.mapProtocols.get(component.uuid);
    if (item && item.value.trim().length) {
      const file = `
      // @ts-nocheck
      ${component.context.protocol}
      export default Protocol;`;
      const path = `${Deno.cwd()}/${component.file}.${component.uuid}.tsx`;
      Deno.writeTextFileSync(path, file);
      console.warn(file);
      const promise = import(path);
      promise.then((module) => {
        Deno.removeSync(path);
        return module
      }).catch((err) => {
        Deno.removeSync(path);
        this.error(`${component.file}\n${err.message.replace(path, component.file)}`);
      });
      return promise;
    }
    return null;
  }
}