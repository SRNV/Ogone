// import BABEL from "@babel/core";
import Ogone from "../index.ts";
import jsThis from "../../../lib/js-this/switch.js";
import { YAML } from "https://raw.githubusercontent.com/eemeli/yaml/master/src/index.js";
import allowedTypes from "./rules/component-types.js";
import { existsSync } from "../../../utils/exists.ts";
import domparse from "../../../lib/dom-parser/index.js";
import inspectRoutes from "./router/inspect-routes.js";

export default function oRenderScripts() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([pathToComponent, component]) => {
    const proto = component.rootNodePure.childNodes.find((node) =>
      node.tagName === "proto"
    );
    const moduleScript = proto?.childNodes[0];
    let defData;
    let isRouter = false;
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
        { data: true, reactivity: true, casesAreLinkables: true },
      );
      component.data = {
        ...ogoneScript.body.data,
        ...defData,
      };
      const { value } = ogoneScript;
      let script =
        `(function (_state, ctx, event, _once = 0) { switch(_state) { ${value} } });`;
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
      if (!allowedTypes.includes(proto.attributes.type)) {
        const UnsupportedTypeException = new TypeError(
          `[Ogone] ${proto.attributes.type} is not supported, in this version.
          supported types of component: ${allowedTypes.join(" ")}
          error in: ${component.file}`,
        );
        throw UnsupportedTypeException;
      }
      component.type = proto.attributes.type;
      isRouter = true;
      component.routes = inspectRoutes(component, Object.values(component.data));
      component.rootNodePure = domparse("<router></router>");
      component.data = {};
    }
  });
}
