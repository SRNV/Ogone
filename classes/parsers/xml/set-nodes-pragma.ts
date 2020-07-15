import { Utils } from "../../../classes/utils/index.ts";
import {
  XMLNodeDescription,
  XMLNodeDescriberDescription,
  DOMParserIterator,
  DOMParserExp,
  DOMParserExpressions,
  XMLAttrsNodeDescription,
  DOMParserPragmaDescription,
  ParseFlagsOutput,
} from "../../../.d.ts";
/**
 * @class
 * @name XMLPragma
 * @extends Utils
 * @description
 * XMLPragma class to render the specific, minimalist and custom JSX for Ogone
 */
export default class XMLPragma extends Utils {
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
    nodeCreation,
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
  }: any) {
    const start = isRoot
      ? this.template(
        `
      (function({{params}}) {
          let p = pos;
`,
        {
          params,
        },
      )
      : "";
    const end = isRoot
      ? this.template(
        `
          return {{nId}};
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
    return this.template(
      `
              {{start}}
              {{nodeSuperCreation}}
              {{position.slice}}
              {{setAwait}}
              {{setOgone.isOgone}}
              at({{nId}},'${idComponent}', '');
              {{setAttributes}}
              {{nodesPragma}}
              {{end}}`,
      {
        nId,
        end,
        start,
        idComponent,
        nodeSuperCreation,
        position: {
          slice: isOgone ? ` if (p) { p = pos.slice(); p[l] = i; }` : "",
        },
        setAwait: node.attributes && node.attributes.await
          ? `at({{nId}},'await', '');`
          : "",
        setAttributes: !(nodeIsDynamic && !isRoot && !isImported)
          ? setAttributes
          : "",
        nodesPragma: nodesPragma.length
          ? `l++; ${nodesPragma} l--; ${appending}`
          : "",
        setOgone: {
          isOgone: isOgone
            ? `{{nId}}.setOgone({
                            isRoot: false,
                            {{setOgone.tagname}}
                            {{setOgone.tree}}
                            {{setOgone.positionLevelIndex}}
                            {{setOgone.positionInParentComponent}}
                            {{setOgone.inheritedCTX}}
                            {{setOgone.flags}},
                          });`
            : "",
          inheritedCTX: nodeIsDynamic && !isImported || node.tagName === null
            ? "component: ctx,"
            : "",
          flags: `flags: ${flags}`,
          tagname: isImported ? `name: "${node.tagName}",` : "",
          tree: isImported || nodeIsDynamic ? `tree: "${query}",` : "",
          positionLevelIndex: !isImported
            ? "position: p, level: l, index: i,"
            : "",
          positionInParentComponent: isImported
            ? `positionInParentComponent: p, levelInParentComponent: l, parentComponent: ctx, parentCTXId: '${idComponent}-${node.id}', props: (${
              JSON.stringify(props)
            }),
                    dependencies: ${
              JSON.stringify(
                Object.values(node.attributes).filter((v) =>
                  typeof v !== "boolean"
                ),
              )
            },
                    `
            : "",
        },
      },
    );
  }
  protected setNodesPragma(expressions: DOMParserExpressions) {
    const nodes = Object.values(expressions).reverse();
    let pragma: null | DOMParserPragmaDescription = null;
    for (let node of nodes) {
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
        pragma = (
          idComponent: string,
          isRoot = true,
          imports = [],
          getId: ((id: string) => string | null) | undefined,
        ) => {
          let identifier: string[] = [];
          const isImported = imports.includes(node.tagName || "");
          let nodesPragma = node.childNodes.filter((child) => child.pragma).map(
            (
              child,
              i,
              arr,
            ) => {
              // return the pragma
              return child.pragma
                ? child.pragma(idComponent, false, imports, getId).value
                : "";
            },
          ).join("");
          let appending = node.childNodes.filter((child) =>
            child.pragma && child.pragma(idComponent, false, imports, getId).id
          ).map((child) =>
            child.pragma
              ? `ap(${nId},${
                child.pragma(idComponent, false, imports, getId).id
              });`
              : ""
          ).join("\n");
          let extensionId: string | null = "";
          if (isImported && getId && node.tagName) {
            extensionId = getId(node.tagName);
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
                    const id = child.pragma(idComponent, false, imports, getId);
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
                    const id = child.pragma(idComponent, false, imports, getId);
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
        pragma = (idComponent) => {
          const isEvaluated = node.rawText.indexOf("${") > -1;
          const saveText = isEvaluated
            ? `
                  const {{getContextConstant}} = Ogone.contexts['{{contextId}}'] ? Ogone.contexts['{{contextId}}'].bind(ctx.data) : null; /* getContext function */
                  const {{textConstant}} = '{{evaluatedString}}';
                  ctx.texts.push((k) => {
                    if (typeof k == 'string' && {{textConstant}}.indexOf(k) < 0) return true;
                    if (!{{getContextConstant}}) return false;
                    const v = {{getContextConstant}}({
                      getText: {{textConstant}},
                      position: p,
                    });
                    if ({{nId}}.data !== v) {{nId}}.data = v.length ? v : ' ';
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
                  if (p) {
                    p = pos.slice();
                    p[l] = i;
                  }
                  {{saveText}}`,
              {
                nId,
                saveText,
                contextId: `${idComponent}-${node.id}`,
                getContextConstant: `g${nId}`,
                textConstant: `t${nId}`,
                evaluatedString: `\`${
                  node.rawText.replace(/\n/gi, " ")
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
  }

  private parseFlags(
    node: XMLNodeDescription,
    opts: XMLNodeDescriberDescription,
  ): null | string {
    let result: ParseFlagsOutput = {
      if: "",
      then: "",
      defer: "",
      await: "",
      style: "",
      class: "",
      catch: "",
      events: [],
      elseIf: "",
      finally: "",
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
          case key === "--await":
            result.await = attributes[key] === true ? "" : `${attributes[key]}`;
            if (isImported) {
              node.attributes.await = true;
            }
            node.hasFlag = true;
            break;
          case key === "--defer":
            result.defer = `${attributes[key]}`;
            node.hasFlag = true;
            break;
          case key.startsWith("--then"):
            result.then = key.slice(2);
            node.hasFlag = true;
            break;
          case key.startsWith("--catch"):
            result.catch = key.slice(2);
            node.hasFlag = true;
            break;
          case key.startsWith("--finally"):
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
  }
  private getSyntaxEventException(event: string) {
    return this.error(
      `wrong syntax of ${event} event. it should be: ${event}:case`,
      { returns: true },
    );
  }
}
