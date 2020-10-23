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
  public async renderProtocol(component: Component): Promise<any | null>{
    const item = this.mapProtocols.get(component.uuid);
    if (item && item.value.trim().length) {
      const file = `export default ${item.value}`;
      const tmp = Deno.makeTempFileSync({ prefix: 'protocol_temp_file' });
      const path = `${tmp}.ts`;
      Deno.writeTextFileSync(path, file);
      const promise = import(path);
      promise.then((module) => {
        Deno.removeSync(path);
        return module
      });
      return promise;
    }
    return null;
  }
  public setProps(component: Component) {
    if (component.requirements) {
      component.context.props = component.requirements.map(
        ([name, constructors]) =>
          `\ndeclare public ${name}: ${constructors.join(" | ")};`,
      ).join('');
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
        propsTypes = this.template(`: { {{ props }} }`, {
          props: requirements.map(
            ([name, constructors]) =>
              `\n${name}: ${constructors.map(
                (c) => `${c}`,
              ).join(" | ")
              };`,
          ),
        });
      }
      const ctx = bundle.mapContexts.get(`${component.uuid}-${n.id}`);
      if (ctx) {
        let result = this.template(
          ProtocolEnum.USED_COMPONENT_TEMPLATE,
          {
            tagName,
            interfaceConstructors: Object.entries(component.data).map((
              [key, v],
            ) =>
              v !== null
                ? v.constructor.name === "Array"
                  ? `${key} : any[]`
                  : `${key}: typeof ${v.constructor.name}`
                : ``
            ).join(";\n"),
            tagNameFormatted: tagName.replace(/(\-)([a-z])/gi, "_$2"),
            propsTypes,
            position: ctx.position,
            data: ctx.data,
            modules: ctx.modules,
            value: ctx.value,
            props: Object.entries(n.attributes).filter(([key]) =>
              key.startsWith(":")
            ).map(([key, value]) =>
              `\n${key.slice(1)}: ${value === '=""' ? null : value}`
            ).join("\n,"),
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
          return this.template(ProtocolEnum.BUILD, {
            types: this.template(ProtocolEnum.TYPES_TEMPLATE, {
              props: component.context.props,
            }),
            protocol: item.value,
            allUsedComponents: item.importedComponentsTypes.join('\n'),
          });
        }
      })
    }
  }
}