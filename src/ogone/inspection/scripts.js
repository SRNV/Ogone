// import BABEL from "@babel/core";
import Ogone from "../index.ts";
import jsThis from "../../lib/js-this/switch.js";
import { YAML } from "https://raw.githubusercontent.com/eemeli/yaml/master/src/index.js";
import allowedTypes from "./rules/component-types.js";
import { existsSync } from "../../../utils/exists.ts";
import domparse from "../../lib/dom-parser/index.js";
import inspectRoutes from "./router/inspect-routes.js";

export default function oRenderScripts() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([pathToComponent, component]) => {
    const proto = component.rootNodePure.childNodes.find((node) =>
      node.tagName === "proto"
    );
    const moduleScript = proto?.childNodes[0];
    let defData;
    if (proto && "def" in proto.attributes) {
      if (existsSync(proto.attributes.def)) {
        console.warn(`[Ogone] definition of proto: ${proto.attributes.def}`);
        const def = Deno.readTextFileSync(proto.attributes.def);
        defData = YAML.parse(def);
      } else {
        const DefinitionOfProtoNotFoundException = new Error(
          `[Ogone] can't find the definition of proto: ${proto.attributes.def}`,
        );
        throw DefinitionOfProtoNotFoundException;
      }
    }
    if (moduleScript) {
      const ogoneScript = jsThis(
        moduleScript.rawText,
        {
          data: true,
          reactivity: true,
          casesAreLinkables: true,
          beforeCases: true,
        },
      );
      const cases = jsThis(moduleScript.rawText, { parseCases: true });
      const { each } = ogoneScript.body.switch.before;
      // here set the cases and if the default is present in the script
      component.switch = cases.body.switch;
      // set the datas of the component
      const { cases: declaredCases, default: declaredDefault } =
        component.switch;
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
      let script = `(${
        proto.attributes && ["async", "store"].includes(proto.attributes.type)
          ? "async"
          : ""
      } function (_state, ctx, event, _once = 0) {
          try {
            ${caseGate ? caseGate : ""}
            ${each ? each : ""}
            switch(_state) { ${value} }
          } catch(err) {
            Ogone.error('Error in the component: \\n\\t ${component.file}' ,err.message, err);
            throw err;
          }
        });`;
      component.scripts.runtime = script;
    } else if (defData) {
      component.data = defData;
    }
    if (component.properties && component.data && component.properties.length) {
      component.properties.forEach(([key]) => {
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
      if (!allowedTypes.includes(type)) {
        const UnsupportedTypeException = new TypeError(
          `[Ogone] ${type} is not supported, in this version.
          supported types of component: ${allowedTypes.join(" ")}
          error in: ${component.file}`,
        );
        throw UnsupportedTypeException;
      }
      component.type = type;
      if (type === "router") {
        component.routes = inspectRoutes(
          component,
          Object.values(component.data),
        );
        component.data = {};
      }
      if (type === "store") {
        if (proto.attributes.namespace) {
          // set the component type, default is null
          component.namespace = proto.attributes.namespace;
        }
      }
    }
  });
}
