import ProtocolScriptParser from "../parsers/ts/index.ts";
import OgoneNS from "../../types/ogone/namespaces.ts";
import {
  YAML,
  join,
  absolute,
  fetchRemoteRessource,
} from "../../deps.ts";
import { existsSync } from "../../utils/exists.ts";
import { Bundle, XMLNodeDescription, Component, Route } from "../../.d.ts";
import Ogone from "../main/index.ts";
import { tags as customTags } from "../../yaml-config.ts";
import { Utils } from "../utils/index.ts";
import { Configuration } from "../config/index.ts";

// @ts-ignore
YAML.defaultOptions.customTags = customTags;
export default class ScriptInspector extends Utils {
  private ProtocolScriptParser: ProtocolScriptParser =
    new ProtocolScriptParser();
  private allowedKeys = [
    "path",
    "redirect",
    "component",
    "name",
    "children",
    "title",
    "once",
  ];
  private requiredKeys = [
    "path",
    "component",
  ];
  private startRecursiveRouterInspection(
    bundle: Bundle,
    component: Component,
    route: Route,
    opts: any,
  ) {
    if (!route) return;
    const keys = Object.keys(route);
    const unsupported = keys.find((k) => !this.allowedKeys.includes(k));
    const missingKey = this.requiredKeys.find((k) => !(k in route));
    if (missingKey) {
      this.error(
        `${missingKey} is undefined in one route of component ${component.file}`,
      );
    }
    if (unsupported) {
      this.error(
        `${unsupported} is not supported in this version of Ogone
        error found in: ${component.file}`,
      );
    }

    if (route.component) {
      const c = component.imports[route.component];
      if (c) {
        if (!bundle.components.get(c)) {
          this.error(
            `incorrect path: ${c} is not a component. error found in: ${component.file}`,
          );
        }
        const newcomp = bundle.components.get(c);
        if (newcomp) {
          route.component = `${newcomp.uuid}-nt`;
          route.uuid = newcomp.uuid;
        }
      } else {
        this.error(
          `${route.component} is not imported in the component.
          please use this syntaxe to import a component: use @/... as '${route.component}'
          error found in: ${component.file}`,
        );
      }
    }
    if (route.path && opts.parentPath) {
      route.path = `${opts.parentPath}/${route.path}`;
      route.path = route.path.replace(/\/\//gi, "/");
    }
    if (route.children) {
      if (!Array.isArray(route.children)) {
        this.error(`route.children should be an Array.
          error found in: ${component.file}`);
      }

      route.children.forEach((child) => {
        this.startRecursiveRouterInspection(
          bundle,
          component,
          child,
          { routes: opts.routes, parentPath: route.path },
        );
      });
    }
    opts.routes.push(route);
  }
  private inspectRoutes(
    bundle: Bundle,
    component: Component,
    routes: Route[],
  ): Route[] {
    if (!Array.isArray(routes)) {
      this.error(
        `inspectRoutes is waiting for an array as argument 2.
          error found in: ${component.file}`,
      );
    }
    const opts = {
      parentPath: null,
      routes: [],
    };
    routes.forEach((route) => {
      this.startRecursiveRouterInspection(bundle, component, route, opts);
    });
    return opts.routes;
  }
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
        this.error(
          `${component.file}:${linePosition + 1}:${
            columnPosition ? columnPosition + 1 : 0
          }\n\t${m}\n\t${sourceLine}\n\t`,
        );
      }
      Deno.exit(1);
    }
    this.warn(
      `TSC: ${component.file} - ${
        Math.round(performance.now() - startPerf)
      } ms`,
    );
    return (Object.values(emit)[0] as string).split("// ogone-sep")[1];
  }
  async read(bundle: Bundle): Promise<void> {
    const entries = Array.from(bundle.components.entries());
    for await (let [, component] of entries) {
      const protos = component.rootNode.childNodes.filter((node) =>
        node.tagName === "proto"
      );
      if (protos.length > 1) {
        this.error(
          `multiple proto found in ${component.file}. not supported in this version.`,
        );
      }
    }
    for await (let [, component] of entries) {
      const proto = component.rootNode.childNodes.find((node) =>
        node.tagName === "proto"
      );
      // @ts-ignore
      const moduleScript = proto?.getInnerHTML();
      let defData;
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
        component.scripts.runtime = value.trim().length && isTyped
          ? (await this.renderTS(component, script, {
            declarations,
          })).replace(/^(\s*;)/, "")
          : // @ts-ignore
            (await Deno.transpileOnly({
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
            runtime: (_state: any, ctx: any) => {},
          };
          comp.runtime = run.bind(comp.data);
          // save the controller
          Ogone.controllers[comp.ns as string] = comp;
        }
        if (type === "router") {
          component.routes = this.inspectRoutes(
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
}
