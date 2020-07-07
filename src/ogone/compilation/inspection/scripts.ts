import jsThis from "../../../../lib/js-this/switch.ts";
import { YAML, join, absolute, fetchRemoteRessource } from "../../../../deps.ts";
import allowedTypes from "./rules/component-types.ts";
import { existsSync } from "../../../../utils/exists.ts";
import inspectRoutes from "./router/inspect-routes.ts";
import { Bundle, XMLNodeDescription } from "../../../../.d.ts";
import Ogone from "../../index.ts";

export default async function oRenderScripts(bundle: Bundle): Promise<void> {
  const entries = Array.from(bundle.components.entries());
  for await (let [, component] of entries) {
    const protos = component.rootNode.childNodes.filter((node) =>
      node.tagName === "proto"
    );
    if (protos.length > 1) {
      const MultipleProtoProvidedException = new Error(`[Ogone] multiple proto found in ${component.file}. not supported in this version.`);
      throw MultipleProtoProvidedException;
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
      const relativePath = join(component.file, proto.attributes.def as string);
      const remoteRelativePath = absolute(component.file, proto.attributes.def as string);
      if (!!component.remote) {
        console.warn(`[Ogone] remote definition of proto: ${proto.attributes.def}`);
        const def = await fetchRemoteRessource(remoteRelativePath);
        if (!def) {
          throw new Error(`[Ogone] definition file ${remoteRelativePath} is not reachable. \ncomponent: ${component.file}\ninput: ${proto.attributes.def}`);
        } else {
          defData = YAML.parse(def, {});
        }
      } else if (existsSync(proto.attributes.def as string)) {
        console.warn(`[Ogone] definition of proto: ${proto.attributes.def}`);
        const def = Deno.readTextFileSync(proto.attributes.def  as string);
        defData = YAML.parse(def, {});
      } else if (!component.remote && existsSync(relativePath)) {
        const def = Deno.readTextFileSync(relativePath);
        defData = YAML.parse(def, {});
      } else {
        const DefinitionOfProtoNotFoundException = new Error(
          `[Ogone] can't find the definition file of proto: ${proto.attributes.def}`,
        );
        throw DefinitionOfProtoNotFoundException;
      }
    }
    if (moduleScript && proto) {
      const { type } = proto?.attributes;
      const ogoneScript = jsThis(
        moduleScript as string,
        {
          data: true,
          reactivity: !["controller"].includes(type as string),
          casesAreLinkables: true,
          beforeCases: true,
        },
      );
      const cases = jsThis(
        moduleScript as string,
        { parseCases: true },
      );
      const { each } = ogoneScript.body.switch.before;
      // here set the cases and if the default is present in the script
      const { cases: declaredCases, default: declaredDefault } =
        cases.body.switch;
      let caseGate = declaredCases.length || declaredDefault
        ? `
      if (typeof _state === "string" && ![${declaredCases}].includes(_state)) {
        return;
      }
      `
        : null;
      component.data = {
        ...ogoneScript.body.data,
        ...defData,
      };
      const { value } = ogoneScript;
      let sc = `
      ${each ? each : ""}
      ${ogoneScript.body.reflections.join("\n")}
      ${caseGate ? caseGate : ""}
      switch(_state) { ${value} }`;
      // transpile ts
      // @ts-ignore
      sc = (await Deno.transpileOnly({
        "proto.ts": sc,
      }, {
        module: "esnext",
        target: "esnext",
        types: ["./proto.d.ts"],
        resolveJsonModule: false,
        experimentalDecorators: true,
        allowUnreachableCode: false,
        jsx: "preserve",
        jsxFactory: "Ogone.r(",
        inlineSourceMap: false,
        inlineSources: false,
        alwaysStrict: false,
        sourceMap: false,
        strictFunctionTypes: true,
      }))["proto.ts"].source;
      let script = `(${
        proto && proto.attributes &&
          ["async", "store", "controller"].includes(
            proto.attributes.type as string,
          )
          ? "async"
          : ""
        } function (_state, ctx, event, _once = 0) {
          try {
            ${sc}
          } catch(err) {
            Ogone.error('Error in the component: \\n\\t ${component.file}' ,err.message, err);
            throw err;
          }
        });`;
      component.scripts.runtime = script;
    } else if (defData) {
      component.data = defData;
    }
    if (proto) {
      const indexofProto = component.rootNode.childNodes.indexOf(proto);
      delete component.rootNode.childNodes[indexofProto];
    }
    if (
      component.requirements && component.data && component.requirements.length
    ) {
      component.requirements.forEach(([key]) => {
        if (component.data[key]) {
          const AlreadyDefinedPropAsDatainComponentException = new Error(
            `${key} is already defined in datas for component ${component.file}`,
          );
          throw AlreadyDefinedPropAsDatainComponentException;
        }
        component.data[key] = null;
      });
    }
    if (proto && "type" in proto.attributes) {
      const { type } = proto.attributes;
      if (!allowedTypes.includes(type as string)) {
        const UnsupportedTypeException = new TypeError(
          `[Ogone] ${type} is not supported, in this version.
          supported types of component: ${allowedTypes.join(" ")}
          error in: ${component.file}`,
        );
        throw UnsupportedTypeException;
      }
      component.type =
        (type as "component" | "async" | "store" | "router" | "controller");
      if (type === "controller") {
        const run = eval(component.scripts.runtime);
        const namespace = proto.attributes.namespace;
        if (namespace && /[^\w]/gi.test(namespace as string)) {
          const char = (namespace as string).match(/[^\w]/);
          const ForbiddenCharactersInNamespaceException = new Error(`[Ogone] forbidden character in namespace found. please remove it.\ncomponent: ${component.file}\ncharacter: ${char}`);
          throw ForbiddenCharactersInNamespaceException;
        }
        if (namespace && (namespace as string).length) {
          // set the component type, default is null
          component.namespace = (namespace as string);
        } else {
          const RequiredNamespaceAttributeException = new Error(`[Ogone] proto's namespace is missing in ${type} component.\ncomponent: ${component.file}\nplease set the attribute namespace, this one can't be empty.`)
          throw RequiredNamespaceAttributeException;
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
        component.routes = inspectRoutes(
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
            const ForbiddenElementInComponentException = new Error(`[Ogone] a forbidden element found in ${type} component.\ncomponent: ${component.file}\nelement: ${child.tagName}`);
            throw ForbiddenElementInComponentException;
          })
      }
    }
  }
}
