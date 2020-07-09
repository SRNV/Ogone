import parseFlags from "./parseFlags.ts";
import {
  XMLNodeDescription,
  DOMParserIterator,
  DOMParserExp,
  DOMParserExpressions,
  XMLAttrsNodeDescription,
  DOMParserPragmaDescription,
  ParseFlagsOutput,
} from "../../.d.ts";

function renderPragma({
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
  appending
}: any) {
  const start = isRoot ? `
    (function(${params}) {

        let p = pos;
    `: '';
  const end = isRoot ? `
    return ${nId};
    });
    ` : '';
    let nodeSuperCreation = '';
    if (isRoot) {
      const idList: [string, string][] = [];
      getNodeCreations(idList);
      const constants = idList.map(([k, v]: [string, string]) => `${k} = ${v}`);
      nodeSuperCreation = `const ${constants};`;
    }
  return `
        ${start}
        ${nodeSuperCreation}
        ${isOgone ?
      `
          if (p) {
            p = pos.slice();
            p[l] = i;
          }
          `
      : ''}
        ${
    node.attributes && node.attributes.await
      ? `at(${nId},'await', '');`
      : ""
    }
        ${
    isOgone
      ? `${nId}.setOgone({
            isRoot: false,
            ${isImported ? `name: "${node.tagName}",` : ""}
            ${isImported || nodeIsDynamic ? `tree: "${query}",` : ""}
            ${!isImported ? "position: p, level: l, index: i," : ""}
            ${isImported ? `positionInParentComponent: p,` : ""}
            ${isImported ? `levelInParentComponent: l,` : ""}
            ${isImported ? `parentComponent: ctx,` : ""}
            ${isImported ? `parentCTXId: '${idComponent}-${node.id}',` : ""}
            ${
      isImported
        ? `dependencies: ${
        JSON.stringify(
          Object.values(node.attributes).filter((v) =>
            typeof v !== "boolean"
          ),
        )
        },`
        : ""
      }
            ${
      nodeIsDynamic && !isImported || node.tagName === null
        ? "component: ctx,"
        : ""
      }
            ${isImported ? `props: (${JSON.stringify(props)}),` : ""}
            ${node.tagName === null ? `renderChildNodes: true,` : ""}
            flags: ${flags},
          });`
      : ""
    }
        at(${nId},'${idComponent}', '');
        ${!(nodeIsDynamic && !isRoot && !isImported) ? setAttributes : ""}
        ${nodesPragma.length ? 'l++;' : ""}
        ${nodesPragma.length ? nodesPragma : ""}
        ${nodesPragma.length ? 'l--;' : ""}
        ${nodesPragma.length ? appending : ""}
        ${end}

    `;
}
export default function setNodesPragma(expressions: DOMParserExpressions) {
  const nodes = Object.values(expressions).reverse();
  let pragma: null | DOMParserPragmaDescription = null;
  for (let node of nodes) {
    const params = "ctx, pos = [], i = 0, l = 0, ap = (p,n) => {p.append(n);}, h = (...a) => document.createElement(...a), at = (n,a,b) => n.setAttribute(a,b)";
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
        let nodesPragma = node.childNodes.filter((child) => child.pragma).map((
          child,
          i,
          arr,
        ) => {
          // return the pragma
          return child.pragma
            ? child.pragma(idComponent, false, imports, getId).value
            : "";
        }).join("");
        let appending = node.childNodes.filter((child) => child.pragma && child.pragma(idComponent, false, imports, getId).id).map((child) => child.pragma
          ? `ap(${nId},${child.pragma(idComponent, false, imports, getId).id});`
          : "").join('\n');
        let extensionId: string | null = "";
        if (isImported && getId && node.tagName) {
          extensionId = getId(node.tagName);
        }
        const props = Object.entries(node.attributes).filter(([key]) =>
          key.startsWith(":")
        ).map(([key, value]) => {
          return [key.replace(/^\:/, ""), value];
        });
        let nodeCreation =
          `const ${nId} = h('${node.tagName}');`;
        identifier[0] = `${nId}`;
        identifier[1] = `h('${node.tagName}')`;
        if (nodeIsDynamic && !isImported && !isRoot) {
          // create a custom element if the element as a flag or prop or event;
          identifier[1] = `h("${idComponent}-${node.id}")`;
        } else if (isImported) {
          identifier[1] = `h('template', { is: '${extensionId}-nt'})`;
        }
        nodeCreation =
          `const ${nId} = ${identifier[1]};`;
        const flags = parseFlags(
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
          appending
        };
        /**
           * all we set in this function
           * will be usefull after the node is connected
           * we will use the method connectedCalback and use the properties
           */
        if (isRoot) {
          return renderPragma(opts);
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
          value: renderPragma(opts),
        };
      };
    }
    if (node.nodeType === 3) {
      const nId = `t${node.id}`;
      node.id = nId;
      pragma = (idComponent) => {
        const isEvaluated = node.rawText.indexOf("${") > -1;
        const registerText = isEvaluated
          ? `
            const g${nId} = Ogone.contexts['${idComponent}-${node.id}'] ? Ogone.contexts['${idComponent}-${node.id}'].bind(ctx.data) : null; /* getContext function */
            const t${nId} = '\`${
          node.rawText.replace(/\n/gi, " ")
            // preserve regular expressions
            .replace(/\\/gi, "\\\\")
            // preserve quotes
            .replace(/\'/gi, "\\'").trim()
          }\`';
            ctx.texts.push((k) => {
              if (typeof k == 'string' && t${nId}.indexOf(k) < 0) return true;
              if (!g${nId}) return false;
              const v = g${nId}({
                getText: t${nId},
                position: p,
              });
              if (${nId}.data !== v) ${nId}.data = v.length ? v : ' ';
              return true
            });
          `
          : "";
        if (!isEvaluated) {
          return {
            id: nId,
            getNodeCreations: (idList: string[][]) => idList.push([nId, `\`${node.rawText.replace(/\n/gi, " ").trim()}\``]),
            // `const ${nId} = \`${node.rawText.replace(/\n/gi, " ").trim()}\`;`
            value: ' /**/',
          };
        }
        return {
          id: nId,
          // const ${nId} = new Text('${isEvaluated ? " " : node.rawText}');
          getNodeCreations: (idList: string[][]) => idList.push([nId, `new Text('${isEvaluated ? " " : node.rawText}')`]),
          value: `
            if (p) {
              p = pos.slice();
              p[l] = i;
            }
            ${registerText}`
        };
      };
    }
    node.pragma = pragma;
  }
};