import { ComponentEngine } from '../enums/componentEngine.ts';
import { Utils } from "./Utils.ts";
import type {
  Component,
  Bundle,
  XMLNodeDescription,
  XMLNodeDescriberDescription,
  DOMParserExpressions,
  DOMParserPragmaDescription,
  ParseFlagsOutput,
} from "../ogone.main.d.ts";
/**
 * @class
 * @name XMLJSXOutputBuilder
 * @extends Utils
 * @description
 * XMLJSXOutputBuilder class to render the specific, minimalist and custom JSX for Ogone
 */
export default class XMLJSXOutputBuilder extends Utils {
  /**
   * list of the supported flags
   */
  public flags: string[] = [
    "--click",
    "--mouseenter",
    "--mouseover",
    "--mousemove",
    "--mousedown",
    "--mouseup",
    "--mouseleave",
    "--mouseout",
    "--dblclick",
    "--resize",
    "--drag",
    "--dragend",
    "--dragstart",
    "--input",
    "--change",
    "--blur",
    "--focus",
    "--focusin",
    "--focusout",
    "--select",
    "--keydown",
    "--keyup",
    "--keypress",
    "--submit",
    "--reset",
    "--touchcancel",
    "--touchmove",
    "--touchend",
    "--touchenter",
    "--touchstart",
    "--wheel",
  ];
  private renderPragma({
    bundle,
    component,
    isOgone,
    node,
    props,
    nId,
    getNodeCreations,
    isImported,
    idComponent,
    nodeIsDynamic,
    isRoot,
    setAttributes,
    nodesPragma,
    params,
    flags,
    query,
    appending,
    isTemplate,
    isAsyncNode,
    isRemote,
  }: any) {
    try {
      const subcomp = isImported
        ? bundle.components.get(component.imports[node.tagName])
        : null;
      const start = isRoot
        ? this.template(
          `
      (function({%params%}) {
          let p = pos.slice();
          let o = null;
`,
          {
            params,
          },
        )
        : "";
      const end = isRoot
        ? this.template(
          `
          return {%nId%};
          });
          `,
          {
            nId,
          },
        )
        : "";
      let nodeSuperCreation = "";
      if (isRoot) {
        const idList: [string, string][] = [];
        getNodeCreations(idList);
        const constants = idList.map(([k, v]: [string, string]) => `${k} = ${v}`);
        nodeSuperCreation = `const ${constants};`;
      }
      const reuseStatement = component.context.reuse;
      return this.template(
        `
              {% start %}
              {% nodeSuperCreation %}
              {% setAwait %}
              {% setOgone.isOgone %}
              {% setNodeAwait %}
              at({% nId %},'${idComponent}', '');
              {% setAttributes %}
              {% nodesPragma %}
              {% storeRender %}
              {% recycleWebcomponent %}
              {%end%}`,
        {
          nId,
          end,
          start,
          idComponent,
          nodeSuperCreation,
          isAsyncNode,
          isImported,
          isRemote,
          component,
          subcomp,
          isTemplate: isTemplate || !!isImported && !!subcomp,
          isAsync: !!isImported && !!subcomp && subcomp.type === "async",
          isRouter: !!isImported && !!subcomp && subcomp.type === "router",
          isStore: !!isImported && !!subcomp && subcomp.type === "store",
          recycleWebcomponent: isRoot && reuseStatement ? `
          Ogone.recycleWebComponent({% nId %}, {
            id: '${idComponent}',
            name: '${reuseStatement.split(':')[0]}',
            extends: '${reuseStatement.split(':')[1]}',
            component: ctx,
            isSync: ${component.context.engine.includes(ComponentEngine.TemplateSyncWithWebcomponent)},
          });
          ` : '',
          setAwait: node.attributes && node.attributes.await
            ? `at({%nId%},'await', '');`
            : "",
          // force the component to wait for resolution
          setNodeAwait: isOgone && node.attributes && node.attributes.nodeAwait && !isRoot
            ? `ctx.promises.push(new Promise((rs) => {
            ${/*force render of the customElement*/ ''}
            {%nId%}.connectedCallback();
            for(let n of {%nId%}.ogone.nodes) {
              n.addEventListener('load', () => {
                rs();
              });
            }
          }));`
            : "",
          setAttributes: !(nodeIsDynamic && !isRoot && !isImported)
            ? setAttributes
            : "",
          storeRender: !!isImported && !!subcomp && subcomp.type === "store" ? '{%nId%}.connectedCallback();' : '',
          nodesPragma: nodesPragma.length
            ? `l++; ${nodesPragma}  l--; ${appending}`
            : "",
          setOgone: {
            isOgone: isOgone
              ? `
            o = {
              isRoot: false,
              originalNode: true,
              {%setOgone.tagname%}
              {%setOgone.tree%}
              {%setOgone.positionLevelIndex%}
              {%setOgone.inheritedCTX%}
              {%setOgone.flags%},
              isTemplate: {% isTemplate %},
              isAsync: {% isAsync %},
              isRouter: {% isRouter %},
              isStore: {% isStore %},
              isAsyncNode: {% isAsyncNode %},
              isImported: {% isImported %},
              isRemote: {% isRemote %},
              extends: '{% setOgone.extends %}',
              uuid: '{% component.uuid %}',
              {%setOgone.positionInParentComponent%}
              {% setOgone.nodeProps %}
            };
              Ogone.setOgone({%nId%}, o); o = null;`
              : "",
            inheritedCTX: isImported && subcomp ? "" : "component: ctx,",
            flags: `flags: ${flags}`,
            tagname: isImported ? `name: "${node.tagName}",` : "",
            tree: isImported || nodeIsDynamic ? `tree: "${query}",` : "",
            extends: isTemplate || isImported ? `-nt` : `-${node.id}`,
            positionLevelIndex: !isImported
              ? "position: p, level: l, index: i,"
              : "",
            positionInParentComponent: isImported && subcomp
              ? `positionInParentComponent: p, levelInParentComponent: l, parentComponent: ctx, parentCTXId: '${idComponent}-${node.id}', props: (${JSON.stringify(props)}),
            uuid: '${subcomp.uuid}',
            routes: ${JSON.stringify(subcomp.routes)},
            namespace: '${subcomp.namespace ? subcomp.namespace : ""}',
            requirements: (${subcomp && subcomp.requirements
                ? JSON.stringify(subcomp.requirements)
                : null
              }),
            dependencies: ${JSON.stringify(node.dependencies)},`
              : "",
            nodeProps: props.length && !isTemplate && !isImported && !isRoot ? `nodeProps: (${JSON.stringify(props)}),` : '',
          },
        },
      );
    } catch (err) {
      this.error(`XMLJSXOutputBuilder: ${err.message}
${err.stack}`);
    }
  }
  protected setNodesPragma(expressions: DOMParserExpressions) {
    try {
      const nodes = Object.values(expressions).reverse();
      let pragma: null | DOMParserPragmaDescription = null;
      for (let node of nodes) {
        if (node.tagName === 'head') {
          continue;
        }
        const params =
          "ctx, pos = [], i = 0, l = 0, ap = (p,n) => {p.append(n);}, h = (...a) => document.createElement(...a), at = (n,a,b) => n.setAttribute(a,b)";
        if (node.nodeType === 1 && node.tagName !== "style") {
          const nodeIsDynamic = !!Object.keys(node.attributes).find((
            attr: string,
          ) =>
            attr.startsWith(":") ||
            attr.startsWith("--") ||
            attr.startsWith("@") ||
            attr.startsWith("&") ||
            attr.startsWith("_")
          );
          const nId = `n${nodeIsDynamic ? "d" : ""}${node.id}`;
          node.id = nId;
          let setAttributes = Object.entries(node.attributes)
            .filter(([key, value]) =>
              !(key.startsWith(":") ||
                key.startsWith("--") ||
                key.startsWith("@") ||
                key.startsWith("&") ||
                key.startsWith("o-") ||
                key.startsWith("_"))
            )
            .map(([key, value]) =>
              key !== "ref"
                ? `at(${nId},'${key}', '${value}');`
                : `ctx.refs['${value}'] = ${nId};`
            )
            .join("");
          pragma = (bundle: Bundle, component: Component, isRoot: boolean) => {
            let identifier: string[] = [];
            const idComponent: string = component.uuid;
            const imports = Object.keys(component.imports);
            const isImported = imports.includes(node.tagName || "");
            const isTemplate = node.tagName === null;
            const isRouter = isTemplate && component.type === "router";
            const isStore = isTemplate && component.type === "store";
            const isAsync = isTemplate && component.type === "async";
            const isRemote = !!component.remote;
            let nodesPragma = node.childNodes.filter((child) => child.pragma).map(
              (
                child,
                i,
                arr,
              ) => {
                // return the pragma
                return child.pragma
                  ? child.pragma(bundle, component, false).value
                  : "";
              },
            ).join("");
            let appending = node.childNodes.filter((child) =>
              child.pragma && child.pragma(bundle, component, false).id
            ).map((child) =>
              child.pragma
                ? `ap(${nId},${child.pragma(bundle, component, false).id});`
                : ""
            ).join("\n");
            let extensionId: string | null = "";
            if (isImported && component.imports[node.tagName as string]) {
              const newcomponent = bundle.components.get(
                component.imports[node.tagName as string],
              );
              if (newcomponent) extensionId = newcomponent.uuid;
            }
            const props = Object.entries(node.attributes).filter(([key]) =>
              key.startsWith(":")
            ).map(([key, value]) => {
              return [key.replace(/^\:/, ""), value];
            });
            let nodeCreation = `const ${nId} = h('${node.tagName}');`;
            identifier[0] = `${nId}`;
            identifier[1] = `h('${node.tagName}')`;
            if (nodeIsDynamic && !isImported && !isRoot) {
              // create a custom element if the element as a flag or prop or event;
              identifier[1] = `h("${idComponent}-${node.id}")`;
            } else if (isImported) {
              identifier[1] = `h('template', { is: '${extensionId}-nt'})`;
            }
            nodeCreation = `const ${nId} = ${identifier[1]};`;
            const flags = this.parseFlags(
              (node as unknown) as XMLNodeDescription,
              { nodeIsDynamic, isImported },
            );
            let query = node.tagName;
            if (nodeIsDynamic || isImported) {
              let parentN: any = node.parentNode;
              while (parentN) {
                query += `<${parentN.tagName}`;
                parentN = parentN.parentNode;
              }
              query = query?.split("<").reverse().join(">");
            }
            const isOgone = isImported || nodeIsDynamic && !isImported && !isRoot;
            const opts = {
              bundle,
              component,
              query,
              props,
              flags,
              params,
              nodeCreation,
              isOgone,
              node,
              nId,
              getNodeCreations(idList: string[][]) {
                idList.push(identifier);
                node.childNodes.filter((child) => child.pragma)
                  .map((child) => {
                    if (child.pragma) {
                      const id = child.pragma(bundle, component, false);
                      if (id.getNodeCreations) {
                        id.getNodeCreations(idList);
                      }
                    }
                  });
              },
              isImported,
              idComponent,
              nodeIsDynamic,
              isRoot,
              setAttributes,
              nodesPragma,
              appending,
              isTemplate,
              isAsync,
              isRouter,
              isStore,
              isAsyncNode: !isTemplate && !isImported && !!node.flags &&
                !!node.flags.await,
              isRemote,
            };
            /**
               * all we set in this function
               * will be usefull after the node is connected
               * we will use the method connectedCalback and use the properties
               */
            if (isRoot) {
              return this.renderPragma(opts);
            }
            return {
              id: nId,
              identifier,
              getNodeCreations(idList: string[][]) {
                idList.push(identifier);
                node.childNodes.filter((child) => child.pragma)
                  .map((child) => {
                    if (child.pragma) {
                      const id = child.pragma(bundle, component, false);
                      if (id.getNodeCreations) {
                        id.getNodeCreations(idList);
                      }
                    }
                  });
              },
              value: this.renderPragma(opts),
            };
          };
        }
        if (node.nodeType === 3) {
          const nId = `t${node.id}`;
          node.id = nId;
          pragma = (bundle: Bundle, component: Component, isRoot: boolean) => {
            const idComponent = component.uuid;
            const isEvaluated = node.rawText.indexOf("${") > -1;
            const saveText = isEvaluated
              ? `
                  const {%getContextConstant%} = Ogone.contexts['{%contextId%}'] ? Ogone.contexts['{%contextId%}'].bind(ctx.data) : null; /* getContext function */
                  const {%textConstant%} = '{%evaluatedString%}';
                  const p{%textConstant%} = p.slice();
                  /*removes txt position and root position*/
                  p{%textConstant%}[l-2]=i;
                  ctx.texts.push((k) => {
                    if ({% dependencies %} typeof k === 'string' && {%textConstant%}.indexOf(k) < 0) return true;
                    if (!{%getContextConstant%}) return false;
                    const v = {%getContextConstant%}({
                      getText: {%textConstant%},
                      position: p{%textConstant%},
                    });
                    if ({%nId%}.data !== v && v) {%nId%}.data = v.length ? v : ' ';
                    return true
                  });
                `
              : "";
            if (!isEvaluated) {
              return {
                id: nId,
                getNodeCreations: (idList: string[][]) =>
                  idList.push(
                    [nId, `\`${node.rawText.replace(/\n/gi, " ").trim()}\``],
                  ),
                value: " /**/",
              };
            }
            return {
              id: nId,
              // const ${nId} = new Text('${isEvaluated ? " " : node.rawText}');
              getNodeCreations: (idList: string[][]) =>
                idList.push(
                  [nId, `new Text('${isEvaluated ? " " : node.rawText}')`],
                ),
              value: this.template(
                `
                  {%saveText%}`,
                {
                  nId,
                  saveText,
                  contextId: `${idComponent}-${node.id}`,
                  getContextConstant: `g${nId}`,
                  textConstant: `t${nId}`,
                  dependencies:
                    node.parentNode && node.parentNode.dependencies.length
                      ? `!${JSON.stringify(node.parentNode?.dependencies)
                      }.includes(k) && `
                      : "",
                  evaluatedString: `\`${node.rawText.replace(/\n/gi, " ")
                    // preserve regular expressions
                    .replace(/\\/gi, "\\\\")
                    // preserve quotes
                    .replace(/\'/gi, "\\'").trim()
                    }\``,
                },
              ),
            };
          };
        }
        node.pragma = pragma;
      }
    } catch (err) {
      this.error(`XMLJSXOutputBuilder: ${err.message}
${err.stack}`);
    }
  }

  private parseFlags(
    node: XMLNodeDescription,
    opts: XMLNodeDescriberDescription,
  ): null | string {
    try {
      let result: ParseFlagsOutput = {
        if: "",
        then: "",
        defer: "",
        await: "",
        style: "",
        class: "",
        html: "",
        catch: "",
        events: [],
        elseIf: "",
        finally: "",
        spread: "",
        else: false,
      };
      const { nodeIsDynamic, isImported } = opts;
      if (nodeIsDynamic || isImported) {
        const { attributes } = node;
        const keys = Object.keys(attributes);
        for (let key of keys) {
          for (let flag of this.flags) {
            switch (true) {
              case key.startsWith(flag) &&
                !key.match(/(\-){2}(\w+\:)([^\s]*)+/):
                throw this.getSyntaxEventException(flag);
              case key.startsWith(flag):
                const m = key.match(
                  /(\-){2}(\w+\:)([^\s]*)+/,
                );
                if (m) {
                  const [input, t, ev, caseName] = m;
                  const infos: any = {
                    type: flag.slice(2),
                    case: `${ev}${caseName}`,
                    filter: null,
                    target: null,
                  };
                  if (flag.startsWith("--key")) {
                    infos.target = "document";
                  }
                  if (node.attributes[key] !== true) {
                    infos.filter = node.attributes[key];
                  }
                  result.events.push(infos);
                }
                break;
            }
          }
        }
        for (let key of keys) {
          switch (true) {
            case key === "--router-go":
              result.events.push({
                type: "click",
                name: "router-go",
                eval: attributes[key],
              });
              break;
            case key === "--router-dev-tool":
              result.events.push({
                type: "click",
                name: "router-dev-tool",
                eval: attributes[key],
              });
              break;
            case key.startsWith("--event:") && key.split(':').length === 3:
              const name = key.slice(2);
              const tokens = key.split(':');
              result.events.push({
                name: "event",
                type: tokens[1],
                case: name,
                eval: tokens[2],
              });
              node.hasFlag = true;
              break;
            case key === "--class":
              result.class = `${attributes[key]}`;
              node.hasFlag = true;
              break;
            case key === "--style":
              result.style = `${attributes[key]}`;
              node.hasFlag = true;
              break;
            case key === "--if":
              result.if = `${attributes[key]}`;
              node.hasFlag = true;
              break;
            case key === "--else":
              result.else = true;
              node.hasFlag = true;
              break;
            case key === "--else-if":
              result.elseIf = `${attributes[key]}`;
              node.hasFlag = true;
              break;
            case key === "--html":
              result.html = `${attributes[key]}`;
              node.hasFlag = true;
              break;
            case key === "--await":
              result.await = attributes[key] === true ? true : `${attributes[key]}`;
              if (isImported) {
                node.attributes.await = true;
              } else if (!node.attributes.nodeAwait) {
                node.attributes.nodeAwait = true;
              }
              node.hasFlag = true;
              break;
            case key === "--defer":
              result.defer = `${attributes[key]}`;
              node.hasFlag = true;
              break;
            case key === "--spread":
              result.spread = `${attributes[key]}`;
              node.hasFlag = true;
              break;
            case key.startsWith("--then:"):
              result.then = key.slice(2);
              node.hasFlag = true;
              break;
            case key.startsWith("--catch:"):
              result.catch = key.slice(2);
              node.hasFlag = true;
              break;
            case key.startsWith("--finally:"):
              result.finally = key.slice(2);
              node.hasFlag = true;
              break;
            case key === "--bind":
              result.bind = attributes[key] as string;
              node.hasFlag = true;
          }
        }
        // flags that starts with --
        node.hasFlag = true;
        node.flags = result;
        return JSON.stringify(result);
      }
      return null;
    } catch (err) {
      this.error(`XMLJSXOutputBuilder: ${err.message}
${err.stack}`);
    }
  }
  private getSyntaxEventException(event: string) {
    try {
      return this.error(
        `wrong syntax of ${event} event. it should be: ${event}:case`,
        { returns: true },
      );
    } catch (err) {
      this.error(`XMLJSXOutputBuilder: ${err.message}
${err.stack}`);
    }
  }
}
