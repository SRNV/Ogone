import type { Bundle, Component } from "../ogone.main.d.ts";
import type { XMLNodeDescription } from "../ogone.main.d.ts";
import MapOutput from "./MapOutput.ts";
import { Utils } from "./Utils.ts";
import HMR from './HMR.ts';
/**
 * @name SwitchContextBuilder
 * @code OSCB3-ORC8-OC0
 * @description this class will build the context part. context part helps for loop rendering
 */
export default class SwitchContextBuilder extends Utils {
  static mapContexts: Map<string, string> = new Map();
  public async startAnalyze(bundle: Bundle): Promise<void> {
    try {
      const entries = Array.from(bundle.components);
      for await (let [path] of entries) {
        await this.read(bundle, path);
      }
    } catch (err) {
      this.error(`SwitchContextBuilder: ${err.message}
${err.stack}`);
    }
  }
  read(bundle: Bundle, keyComponent: string) {
    try {
      const component = bundle.components.get(keyComponent);
      if (component) {
        Object.entries(component.for).forEach(([nId, flag]) => {
          // @ts-ignore
          const { script } = flag;
          const { modules } = component;
          const { node, ctx, getLength, array, item: itemName, aliasItem, destructured } = script;
          let contextIf = null;
          if (node.attributes && node.attributes["--if"]) {
            let nxt = node.nextElementSibling;
            node.hasFlag = true;
            node.ifelseBlock = {
              main: node.attributes["--if"],
              ifFlag: {
                [node.id]: node.attributes["--if"],
              },
              elseIf: {},
              elseFlag: {},
            };
            while (
              nxt && nxt.attributes &&
              (nxt.attributes["--else-if"] || nxt.attributes["--else"])
            ) {
              nxt.ifelseBlock = node.ifelseBlock;
              if (nxt.attributes["--else-if"]) {
                node.ifelseBlock.elseIf[nxt.id] = nxt.attributes["--else-if"];
              } else {
                node.ifelseBlock.elseFlag[nxt.id] = nxt.attributes["--else"];
              }

              const elseDir = !!nxt.attributes["--else"];
              nxt = nxt.nextElementSibling;
              if (
                elseDir && nxt && nxt.attributes &&
                (!!nxt.attributes["--else"] || !!nxt.attributes["--else-if"])
              ) {
                this.error(
                  "else flag has to be the last in if-else-if blocks, no duplicate of --else are allowed.",
                );
              }
            }
          }
          if (node.ifelseBlock && node.attributes && !node.attributes["--for"]) {
            node.hasFlag = true;
            const { ifFlag, elseFlag, elseIf, main } = node.ifelseBlock;
            const isElse = elseFlag[node.id];
            const isElseIf = elseIf[node.id];
            const isMain = ifFlag[node.id];
            const allElseIf = Object.values(elseIf);
            if (!!isMain) {
              contextIf = `
              if (GET_LENGTH && !(${main})) {
                return 0;
              }
            `;
            } else if (!!isElseIf) {
              contextIf = `
              if (GET_LENGTH && (${main})) {
                return 0;
              } else if (GET_LENGTH && !(${isElseIf})) {
                return 0;
              }
            `;
            } else if (!!isElse) {
              contextIf = `
              if (GET_LENGTH && (${main})) {
                return 0;
              ${allElseIf.map((key) => {
                return `
              } else if (GET_LENGTH && ${key}) {
                return 0;`;
              }).join("\n")
                }
              }
            `;
            }
          }
          function renderConditions(item: XMLNodeDescription) {
            if (!!item.ifelseBlock && item.id) {
              item.hasFlag = true;
              const { ifFlag, elseFlag, elseIf, main } = item.ifelseBlock;
              const isElse = elseFlag[item.id];
              const isElseIf = elseIf[item.id];
              const isMain = ifFlag[item.id];
              const allElseIf = Object.values(elseIf);
              if (!!isMain) {
                return `(${main})`;
              } else if (!!isElseIf) {
                return `!(${main}) && (${isElseIf})`;
              } else if (!!isElse && allElseIf.length) {
                return `!(${main}) && !(${allElseIf.join(" && ")})`;
              } else if (!!isElse) {
                return `!(${main})`;
              }
            }
            return "";
          }
          const nodeHasProps = !!Object.keys(node.attributes).find(n => n.startsWith(":"));
          const isImported = bundle.components.get(keyComponent)?.imports[node.tagName];
          const isNodeDynamic = nodeHasProps && !node.attributes['--for'] && !isImported;
          const contextScript =
            node.hasFlag || !node.tagName && node.nodeType === 1 || isNodeDynamic
              ? `
          Ogone.contexts[{% context.id %}] = function(opts) {
            const GET_TEXT = opts.getText;
            const GET_LENGTH = opts.getLength;
            const POSITION = opts.position;
            {% data %}
            {% value %}
            {% modules %}
            {% context.if %}
            {% context.getNodeDynamicLength || context.getLength %}
            try {
              if (GET_TEXT) {
                  return eval('('+GET_TEXT+')');
                }
                return { {% context.result %} };
            } catch(err) {
              if (typeof {% itemName %} === 'undefined' || !({% itemName %})) { return undefined }
              displayError('Error in component:\\n\\t {%component.file%} '+\`$\{GET_TEXT}\`, err.message ,err);
              throw err;
            }
          };
        `
              : `Ogone.contexts[{% context.id %}] = Ogone.contexts[{% context.parentId %}];`;
          const result = this.template(contextScript, {
            component,
            data: component.context.data,
            value: script.value || "",
            itemName: aliasItem || itemName,
            context: {
              id: (`${component.uuid}_${nId}`).replace(/\-/gi, '_'),
              if: contextIf ? contextIf : "",
              parentId: node.parentNode
                ? (`${component.uuid}_${node.parentNode.id}`).replace(/\-/gi, '_')
                : "",
              result: component.data ? [
                // the key can start with a bracket or a brace
                // if the element is destructured
                ...Object.keys(ctx).filter((key) => !key.match(/^(\{|\[)/)),
                ...(destructured ? destructured : []),
                ...Object.keys(component.data)
              ]
                .join(',') : '',
              getNodeDynamicLength: isNodeDynamic ? `
            if (GET_LENGTH) {
              return 1;
            }` : null,
              getLength: getLength
                ? getLength({
                  filter: renderConditions(node),
                })
                : "",
            },
            modules: component.deps.map((dep) => dep.destructuredOgoneRequire).join('\n'),
          });
          const key = `${component.uuid}-${node.id}`;
          // save context into bundle
          // will use it for type checking into props in compiler-time
          bundle.mapContexts.set(key, {
            position: `const POSITION: number[] = Array.from(new Array(${script.level})).map((a,i) => 0);`,
            data: component.data instanceof Object
              ? Object.keys(component.data).map((prop) =>
                `const ${prop} = this.${prop};`
              ).join("\n")
              : "",
            value: script.value || "",
            modules: modules ? modules.map((md) => md[0]).join(";\n") : "",
          });
          MapOutput.outputs.context.push(result);
          SwitchContextBuilder.sendChanges({
            output: result,
            key,
            component,
          });
        });
      }
    } catch (err) {
      this.error(`SwitchContextBuilder: ${err.message}
${err.stack}`);
    }
  }
  /**
   * send changes through HMR
   */
  static sendChanges(opts: { key: string; component: Component; output: string }) {
    const { key, output, component } = opts;
    if (this.mapContexts.has(key)) {
      const item = this.mapContexts.get(key);
      if (item !== output) {
        HMR.postMessage({
          output,
          invalid: item,
          uuid: component.uuid,
          type: 'context',
        });
        this.mapContexts.set(key, output);
      }
    } else {
      this.mapContexts.set(key, output);
    }
  }
}
