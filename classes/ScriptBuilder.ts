// TODO split this file
import ProtocolScriptParser from "./ProtocolScriptParser.ts";
import OgoneNS from "../types/ogone/namespaces.ts";
import {
  YAML,
  join,
  absolute,
  fetchRemoteRessource,
} from "../deps.ts";
import { existsSync } from "../utils/exists.ts";
import type { Bundle, XMLNodeDescription, Component } from "../.d.ts";
import Ogone from "./Ogone.ts";
import { Utils } from "./Utils.ts";
import { Configuration } from "./Configuration.ts";
import RouterAnalyzer from './RouterAnalyzer.ts';
/**
 * @name ScriptBuilder
 * @code OSB4
 * @description step 4.
 * this class will create the protocole, and saving it inside the component
 * it also analyze the component by using it's type
 * any error inside a router component will trigger an error
 *
 * TS Errors are also emitted with the Deno.compile method
 *
 * it exposes Ogone Namespace, and let the developer use Ogone on Client side
 * this is done by using the function OgoneNS that will parse which names are used in the developer code
 *
 * @dependency ProtocolScriptParser
 */
export default class ScriptBuilder extends Utils {
  private ProtocolScriptParser: ProtocolScriptParser =
    new ProtocolScriptParser();
  private RouterAnalyzer: RouterAnalyzer = new RouterAnalyzer();
  private mapScript: Map<string, { script: string; declarations: any }> =
    new Map();
  private async getProtocol(
    opts: { declarations: string },
  ): Promise<{ Protocol: any; instance: typeof Function; source: string }> {
    // @ts-ignore
    const result = await Deno.transpileOnly({
      "proto.ts": opts.declarations,
    }, { sourceMap: false });
    const getter = new Function(
      `${result["proto.ts"].source}\nreturn Protocol;`,
    );
    const Protocol = getter();
    return {
      Protocol: getter,
      instance: new Protocol(),
      source: result["proto.ts"].source,
    };
  }
  public async renderTS(
    bundle: Bundle,
    component: Component,
    script: string,
    opts: any = {},
  ): Promise<string> {
    let file = Deno.readTextFileSync(component.file);
    const startPerf = performance.now();
    let protocol = opts.declarations;
    // @ts-ignore
    let [diag, emit] = (await Deno.compile("proto.ts", {
      "proto.ts": `
            ${OgoneNS(script)}
            ${opts.declarations ? protocol : ""}
            // do not remove this comment bellow
            // ogone-sep
            ${script}`,
    }, {
      module: "esnext",
      target: "esnext",
      noImplicitThis: false,
      noFallthroughCasesInSwitch: false,
      allowJs: false,
      removeComments: false,
      resolveJsonModule: false,
      experimentalDecorators: true,
      noImplicitAny: true,
      allowUnreachableCode: false,
      jsx: "preserve",
      lib: ["dom", "esnext"],
      inlineSourceMap: false,
      inlineSources: false,
      alwaysStrict: false,
      sourceMap: false,
      strictFunctionTypes: true,
      types: Configuration.types || [],
    }));

    if (diag) {
      for (const d of diag) {
        // @ts-ignore
        const m = d.message ? d.message : "";
        const source = d.sourceLine && d.sourceLine.indexOf("____('") > -1
          ? d.sourceLine.split("____('")[0].trim()
          : d.sourceLine as string;
        const lines = file.split("\n");
        const sourceLine = lines.find((t, i, arr) => {
          return t.indexOf(source) > -1 &&
            (file.indexOf(arr[i - 1]) < file.indexOf(source));
        });
        const linePosition = lines.indexOf(sourceLine || "");
        const columnPosition = sourceLine?.indexOf(source.trim());
        console.warn(d)
        this.error(
          `${component.file}:${linePosition + 1}:${columnPosition ? columnPosition + 1 : 0
          }\n\t${m}\n\t${sourceLine ? sourceLine : ""}\n\t`,
        );
      }
      Deno.exit(1);
    }
    this.warn(
      `TSC: ${component.file} - ${Math.round(performance.now() - startPerf)
      } ms`,
    );
    return (Object.values(emit)[0] as string).split("// ogone-sep")[1];
  }
  async read(bundle: Bundle): Promise<void> {
    const entries = Array.from(bundle.components.entries());
    for await (let [, component] of entries) {
      const protos = component.elements.proto;
      if (protos.length > 1) {
        this.error(
          `multiple proto found in ${component.file}. not supported in this version.`,
        );
      }
    }
    for await (let [, component] of entries) {
      const proto = component.elements.proto[0];
      // @ts-ignore
      const moduleScript = proto?.getInnerHTML();
      let defData: any;
      if (proto && "def" in proto.attributes) {
        // allowing <proto def="..."
        // absolute <proto def="http://..."
        // absolute <proto def="path/to/folder"
        // relative <proto def="../"
        // relative <proto def="./"
        const defPath = (proto.attributes.def as string).trim();
        const relativePath = join(component.file, defPath);
        const remoteRelativePath = absolute(component.file, defPath);
        const isAbsoluteRemote = ["http", "ws", "https", "ftp"].includes(
          defPath.split("://")[0],
        );
        if (!defPath.endsWith(".yml") && !defPath.endsWith(".yaml")) {
          this.error(
            `definition files require YAML extensions.\ncomponent: ${component.file}\ninput: ${defPath}`,
          );
        }
        if (isAbsoluteRemote) {
          this.warn(`Def: ${defPath}`);
          const def = await fetchRemoteRessource(defPath);
          if (!def) {
            this.error(
              `definition file ${defPath} is not reachable. \ncomponent: ${component.file}\ninput: ${defPath}`,
            );
          } else {
            defData = YAML.parse(def, {});
          }
        } else if (!!component.remote) {
          this.warn(`Def: ${remoteRelativePath}`);
          const def = await fetchRemoteRessource(remoteRelativePath);
          if (!def) {
            this.error(
              `definition file ${remoteRelativePath} is not reachable. \ncomponent: ${component.file}\ninput: ${defPath}`,
            );
          } else {
            defData = YAML.parse(def, {});
          }
        } else if (existsSync(defPath)) {
          this.warn(`Def: ${defPath}`);
          const def = Deno.readTextFileSync(defPath);
          defData = YAML.parse(def, {});
        } else if (!component.remote && existsSync(relativePath)) {
          const def = Deno.readTextFileSync(relativePath);
          defData = YAML.parse(def, {});
        } else {
          this.error(
            `can't find the definition file of proto: ${defPath}`,
          );
        }
      }

      if (moduleScript && proto) {
        const { type } = proto?.attributes;
        const ogoneScript = this.ProtocolScriptParser.parse(
          moduleScript as string,
          {
            data: true,
            reactivity: !["controller"].includes(type as string),
            casesAreLinkables: true,
            beforeCases: true,
          },
        );
        const cases = this.ProtocolScriptParser.parse(
          moduleScript as string,
          { parseCases: true },
        );
        const { each } = ogoneScript.body.switch.before;
        // here set the cases and if the default is present in the script
        const { cases: declaredCases, default: declaredDefault } =
          cases.body.switch;
        let caseGate = declaredCases.length || declaredDefault
          ? `
              // @ts-ignore
            if (typeof _state === "string" && ![${declaredCases}].includes(_state)) {
              return;
            }
            `
          : null;
        // @ts-ignore
        const isTyped: boolean = !!ogoneScript.body.protocol &&
          ogoneScript.body.protocol.length;
        let protocol: string = "", prototype = {};
        // @ts-ignore
        if (isTyped) {
          const resultProto = this.getProtocol(
            { declarations: ogoneScript.body.protocol },
          );
          prototype = (await resultProto).instance;
          protocol = (await resultProto).source;
        }
        component.data = {
          ...ogoneScript.body.data, // #REL1
          ...defData,
          // allows dev to define the values
          ...prototype,
        };
        component.protocol = protocol.toString().startsWith("let ")
          ? protocol
          : null;
        const declarations = isTyped ? ogoneScript.body.protocol : null;
        // get the types of the component
        const { value } = ogoneScript;
        let sc = `
            {{ beforeEach }}
            {{ reflections }}
            {{ caseGate }}
            switch(_state) { {{ switchBody }} }`;
        // transpile ts
        // @ts-ignore
        let script: string = this.template(
          `({{ async }} function ({{ protocolAmbientType }} _state: _state, ctx: ctx, event: event, _once: number = 0) {
                try {
                  {{ body }}
                } catch(err) {
                  // @ts-ignore
                  Ogone.error('Error in the component: \\n\\t {{ file }}' ,err.message, err);
                  throw err;
                }
              });`,
          {
            body: sc,
            switchBody: value,
            file: component.file,
            protocolAmbientType: isTyped ? "this: Protocol," : "",
            caseGate: caseGate ? caseGate : "",
            reflections: ogoneScript.body.reflections.join("\n"),
            beforeEach: each ? each : "",
            async: proto && proto.attributes &&
              ["async", "store", "controller"].includes(
                proto.attributes.type as string,
              )
              ? "async"
              : "",
          },
        );
        // save script for scan
        this.mapScript.set(component.uuid, {
          script,
          declarations,
        });
        // @ts-ignore
        component.scripts.runtime = (await Deno.transpileOnly({
          "proto.ts": script,
        }, {
          sourceMap: false,
        }))["proto.ts"].source;
      } else if (defData) {
        component.data = defData;
      }

      if (proto) {
        const indexofProto = component.rootNode.childNodes.indexOf(proto);
        delete component.rootNode.childNodes[indexofProto];
      }
      if (
        component.requirements && component.data &&
        component.requirements.length
      ) {
        component.requirements.forEach(([key]) => {
          if (component.data[key]) {
            this.error(
              `${key} is already defined in datas for component ${component.file}`,
            );
          }
          component.data[key] = null;
        });
      }

      if (proto && "type" in proto.attributes) {
        const { type } = proto.attributes;
        if (!Ogone.allowedTypes.includes(type as string)) {
          this.error(
            `${type} is not supported, in this version.
                supported types of component: ${Ogone.allowedTypes.join(" ")}
                error in: ${component.file}`,
          );
        }
        component.type =
          (type as "component" | "async" | "store" | "router" | "controller");
        bundle.types[component.type] = true;
        if (type === "controller") {
          const run = eval(component.scripts.runtime);
          const namespace = proto.attributes.namespace;
          if (namespace && /[^\w]/gi.test(namespace as string)) {
            const char = (namespace as string).match(/[^\w]/);
            this.error(
              `forbidden character in namespace found. please remove it.\ncomponent: ${component.file}\ncharacter: ${char}`,
            );
          }
          if (namespace && (namespace as string).length) {
            // set the component type, default is null
            component.namespace = (namespace as string);
          } else {
            this.error(
              `proto's namespace is missing in ${type} component.\ncomponent: ${component.file}\nplease set the attribute namespace, this one can't be empty.`,
            );
          }
          const comp = {
            ns: component.namespace,
            data: component.data,
            runtime: (_state: any, ctx: any) => { },
          };
          comp.runtime = run.bind(comp.data);
          // save the controller
          Ogone.controllers[comp.ns as string] = comp;
        }
        if (type === "router") {
          component.routes = this.RouterAnalyzer.inspectRoutes(
            bundle,
            component,
            Object.values(component.data),
          );
          component.data = {};
        }

        if (type === "store") {
          if (proto.attributes.namespace) {
            // set the component type, default is null
            component.namespace = (proto.attributes.namespace as string);
          }
        }
        if (["store", "controller"].includes(type as string)) {
          // check if there is any forbidden element
          component.rootNode.childNodes
            .filter((child: XMLNodeDescription) => {
              return child.tagName && child.tagName !== "proto";
            })
            .map((child: XMLNodeDescription) => {
              this.error(
                `a forbidden element found in ${type} component.\ncomponent: ${component.file}\nelement: ${child.tagName}`,
              );
            });
        }
      }
    }
  }
  async inspectContexts(bundle: Bundle): Promise<void> {
    const c = Array.from(bundle.components.entries());
    for await (let [, component] of c) {
      const usedComponents: string[] = [];
      const nodeInspect = (
        component: Component,
        importedComponent: Component,
        tagName: string,
        n: XMLNodeDescription,
      ) => {
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
          const item = bundle.mapContexts.get(`${component.uuid}-${n.id}`);
          if (item) {
            let result = this.template(
              `/** component: {{ tagName }} */
              declare interface $_component_{{ tagNameFormatted }} {
                /** values of {{ tagName }} */
                {{ interfaceConstructors }}
              };
              function {{ tagNameFormatted }}Component (this: $_component_{{ tagNameFormatted }} & Protocol & Props) {
                {{ position }}
                {{ data }}
                {{ modules }}
                {{ value }}
                const {{ tagNameFormatted }} {{ propsTypes }} = {
                  {{ props }}
                };
              }`,
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
                position: item.position,
                data: item.data,
                modules: item.modules,
                value: item.value,
                props: Object.entries(n.attributes).filter(([key]) =>
                  key.startsWith(":")
                ).map(([key, value]) =>
                  `\n${key.slice(1)}: ${value === '=""' ? null : value}`
                ).join("\n,"),
              },
            );
            usedComponents.push(result);
          }
        }
        if (n.childNodes) {
          for (let nc of n.childNodes) {
            nodeInspect(component, importedComponent, tagName, nc);
          }
        }
      };
      for (let [tagName, imp] of Object.entries(component.imports)) {
        const subc = bundle.components.get(imp);
        if (subc) {
          nodeInspect(component, subc, tagName, component.rootNode);
        }
      }
      const itemScript = this.mapScript.get(component.uuid);
      if (itemScript) {
        let compiledAnalyzer = this.template(
          `\n
          {{ classProps }}
          {{ script }}
          {{ allComponents }}`,
          {
            script: itemScript.script,
            allComponents: usedComponents.join("\n"),
            classProps: `class Props {
              {{ props }}
            }`,
            props: component.requirements
              ? component.requirements.map(
                ([name, constructors]) =>
                  `\ndeclare public ${name}: ${constructors.join(" | ")};`,
              )
              : "",
          },
        );
        await this.renderTS(bundle, component, compiledAnalyzer, {
          declarations: itemScript.declarations || `declare class Protocol {}`,
        });
      }
    }
    // remove all previous item
    this.mapScript.clear();
  }
}
