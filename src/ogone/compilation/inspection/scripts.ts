import jsThis from "../../../../lib/js-this/switch.ts";
import { YAML } from "https://raw.githubusercontent.com/eemeli/yaml/master/src/index.js";
import allowedTypes from "./rules/component-types.ts";
import { existsSync } from "../../../../utils/exists.ts";
import inspectRoutes from "./router/inspect-routes.ts";
import { Bundle } from '../../../../.d.ts';

export default async function oRenderScripts(bundle: Bundle): Promise<void> {
  const entries = Array.from(bundle.components.entries());
  for await (let [, component] of entries) {
    const proto = component.rootNode.childNodes.find((node) =>
      node.tagName === "proto"
    );
    const moduleScript = proto?.childNodes[0];
    let defData;
    if (proto && "def" in proto.attributes) {
      if (existsSync(proto.attributes.def as string)) {
        console.warn(`[Ogone] definition of proto: ${proto.attributes.def}`);
        const def = Deno.readTextFileSync(proto.attributes.def as string);
        defData = YAML.parse(def, {});
      } else {
        const DefinitionOfProtoNotFoundException = new Error(
          `[Ogone] can't find the definition file of proto: ${proto.attributes.def}`,
        );
        throw DefinitionOfProtoNotFoundException;
      }
    }
    if (moduleScript) {
      const ogoneScript = jsThis(
        moduleScript.rawText as string,
        {
          data: true,
          reactivity: true,
          casesAreLinkables: true,
          beforeCases: true,
        },
      );
      const cases = jsThis(moduleScript.rawText as string, { parseCases: true });
      const { each } = ogoneScript.body.switch.before;
      // here set the cases and if the default is present in the script
      const { cases: declaredCases, default: declaredDefault } = cases.body.switch;
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
      sc = (await Deno.transpileOnly({
        'proto.ts': sc,
      }, {
        module: 'esnext',
        target: 'esnext',
        types: ['./proto.d.ts'],
        resolveJsonModule: false,
        experimentalDecorators: true,
        allowUnreachableCode: false,
        jsx: 'preserve',
        jsxFactory: 'Ogone.r(',
        inlineSourceMap: false,
        inlineSources: false,
        alwaysStrict: false,
        sourceMap: false,
        strictFunctionTypes: true,
      }))['proto.ts'].source;
      let script = `(${
        proto && proto.attributes && ["async", "store"].includes(proto.attributes.type as string)
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
    if (component.requirements && component.data && component.requirements.length) {
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
      component.type = (type as "component" | "async" | "store" | "router" | "controller");
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
    }
  }
}
