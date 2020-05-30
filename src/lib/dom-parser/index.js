import parseDirectives from "./parseDirectives.js";
import templateReplacer from "../../../utils/template-recursive.ts";

let i = 0;
const openComment = "<!--";
const closeComment = "-->";
function getUniquekey(id = "") {
  i++;
  // critical all regexp are based on this line
  return `§§${i}${id}§§`;
}
function setElementSiblings(node) {
  if (node.childNodes && node.childNodes.length) {
    node.childNodes.forEach((child, i, arr) => {
      // define here sibblings elements
      if (arr[i - 1]) {
        child.previousElementSibling = arr[i - 1];
      } else {
        child.previousElementSibling = null;
      }
      if (arr[i + 1]) {
        child.nextElementSibling = arr[i + 1];
      } else {
        child.nextElementSibling = null;
      }
      // recursive for childNodes
      setElementSiblings(child);
    });
  }
}
function getRootnode(html, expressions) {
  let result;
  const keysOfExp = Object.keys(expressions);
  keysOfExp.filter((key) => html.indexOf(key) > -1)
    .forEach((key) => {
      result = expressions[key];
      result.type = "root";
      delete result.id;
    });
  return result;
}
function parseNodes(html, expressions) {
  let result = html;
  Object.entries(expressions)
    .filter(([key, value]) => value.type === "node")
    .forEach(([key, value]) => {
      const { expression, rawAttrs } = value;
      // we need to pad for the regexp
      // critical modifications here
      let rawAttrsPadded = `${rawAttrs} `;
      // get rawAttrs
      const attrRE = /([^§\s]*)+(§{2}\d*attr§§)/gi;
      const attrbooleanRE = /(?<!(§{2}))(([^§\s]*)+)\s/gi;
      const matches = rawAttrsPadded.match(attrRE);
      const matchesBoolean = rawAttrsPadded.match(attrbooleanRE);
      matches?.forEach((attr) => {
        const attrIDRE = /([^§\s]*)+(§{2}\d*attr§§)/;
        const [input, attributeName, id] = attr.match(attrIDRE);
        const { value } = expressions[id];
        expressions[key].attributes[attributeName] = value;
      });
      matchesBoolean?.filter((attr) =>
        !expressions[key].attributes[attr.trim()] && attr.trim().length
      )
        .forEach((attr) => {
          expressions[key].attributes[attr.trim()] = true;
        });
    });

  const keysOfExp = Object.keys(expressions);
  // start parsing Nodes by reversed array
  Object.entries(expressions)
    .reverse()
    .filter(([key, value]) => value.type === "node")
    .forEach(([key, node]) => {
      const opening = node.key;
      const { closingTag } = node;
      const open = result.split(opening);
      open.filter((content) => content.indexOf(closingTag) > -1)
        .forEach((content) => {
          let innerHTML = content.split(closingTag)[0];
          const outerContent = `${opening}${innerHTML}${closingTag}`;
          // get Textnodes
          keysOfExp
            .filter((k) =>
              innerHTML.indexOf(k) > -1 &&
              expressions[k]
            )
            .sort((a, b) => innerHTML.indexOf(a) - innerHTML.indexOf(b))
            .forEach((k) => {
              expressions[key].childNodes.push(expressions[k]);
              expressions[k].parentNode = expressions[key];
            });
          // get attrs
          keysOfExp
            .filter((k) =>
              node.rawAttrs.indexOf(k) > -1 &&
              expressions[k].type === "attr"
            )
            .forEach((k) => {
              node.rawAttrs = node.rawAttrs.replace(
                k,
                expressions[k].expression,
              );
            });
          result = result.replace(outerContent, opening);
          delete expressions[key].closingTag;
          delete expressions[key].key;
          delete expressions[key].autoclosing;
          delete expressions[key].closing;
          delete expressions[key].expression;
        });
    });
  return result;
}
function parseTextNodes(html, expression) {
  let result = html;
  const regexp = /(\<)§§\d*node§§(\>)/;
  const textnodes = result.split(regexp);
  textnodes
    .filter((content) => content.trim().length)
    .forEach((content) => {
      const key = getUniquekey("text");
      expression[key] = {
        type: "text",
        value: content,
        expression: content,
        id: i,
        nodeType: 3,
      };
      result = result.replace(`>${content}<`, `>${key}<`);
    });
  return result;
}
function preserveNodes(html, expression) {
  let result = html;
  const regexp = /<(\/){0,1}([a-zA-Z][^>\s]*)([^\>]*)+(\/){0,1}>/gi;
  const matches = result.match(regexp);
  matches?.forEach((node) => {
    const regexpID = /<(\/){0,1}([a-zA-Z][^>\s\/]*)([^\>\/]*)+(\/){0,1}>/;
    const id = node.match(regexpID);
    if (id) {
      const [input, slash, tagName, attrs, closingSlash] = id;
      const key = `<${getUniquekey("node")}>`;
      if (!!slash) {
        // get the openning tag by tagname, id -1 and closingTag === null
        const tag = Object.entries(expression)
          .reverse()
          .find(([k, v]) =>
            v.type === "node" &&
            v.tagName.trim() === tagName.trim() &&
            v.id < i &&
            v.closingTag === null &&
            !v.closing &&
            !v.autoclosing
          )[1];
        if (tag && expression[tag.key]) {
          // set the key of the closing tag
          expression[tag.key].closingTag = key;
        }
      } else {
        // if it's not a closing tag register it
        expression[key] = {
          key,
          tagName,
          id: i,
          rawAttrs: attrs,
          attributes: {},
          closing: !!slash,
          autoclosing: !!closingSlash,
          type: "node",
          nodeType: 1,
          closingTag: null,
          expression: input,
          childNodes: [],
        };
      }
      result = result.replace(input, key);
    }
  });
  return result;
}
function preserveTemplates(html, expression) {
  let result = html;
  const templates = ["${", "}"];
  const [beginTemplate, traillingTemplate] = templates;
  result.split(/[^\\](\$\{)/)
    .filter((content, id, arr) =>
      content.indexOf("}") > -1 && arr[id - 1] === beginTemplate
    )
    .forEach((content) => {
      let str = content.split(/(?<!\\)(\})/gi)[0];
      const allTemplate = `${beginTemplate}${str}${traillingTemplate}`;
      const key = getUniquekey("templ");
      expression[key] = {
        expression: allTemplate,
        value: str,
        type: "template",
      };
      result = result.replace(allTemplate, key);
    });
  return result;
}
function preserveLitterals(html, expression) {
  let result = html;
  result.split(/((?<!\\)`)/)
    .filter((content) => content !== "`")
    .forEach((content) => {
      let str = content.split(/((?<!\\)`)/);
      str.forEach((contentOfStr) => {
        const allLit = `\`${contentOfStr}\``;
        if (result.indexOf(allLit) < 0) return;
        const key = getUniquekey("str");
        expression[key] = {
          expression: allLit,
          value: contentOfStr,
          type: "string",
        };
        result = result.replace(allLit, key);
      });
    });
  return result;
}
function preserveStringsAttrs(html, expression) {
  let result = html;
  const regEmptyStr = /\=\"\"/gi;
  const quotes = ['="', '"'];
  const [beginQuote, closinQuote] = quotes;
  const matchesEmpty = result.match(regEmptyStr);
  matchesEmpty?.forEach((match) => {
    const key = getUniquekey("attr");
    result = result.replace(match, key);
    expression[key] = {
      expression: match,
      value: match,
      type: "attr",
    };
  });
  result.split(beginQuote)
    .filter((content) => /[^\\](")/.test(content))
    .forEach((content) => {
      let str = content.split(/(?<!\\)(")/gi)[0];
      const allstring = `${beginQuote}${str}${closinQuote}`;
      const key = getUniquekey("attr");
      expression[key] = {
        expression: allstring,
        value: str,
        type: "attr",
      };
      result = result.replace(allstring, key);
    });
  return result;
}
function preserveComments(html, expression) {
  let result = html;
  result.split(openComment)
    .filter((open) => open.indexOf(closeComment) > -1)
    .forEach((open) => {
      let comment = open.split(closeComment)[0];
      let key = getUniquekey("com");
      const allComment = `${openComment}${comment}${closeComment}`;
      result = result.replace(allComment, "");
      expression[key] = {
        expression: allComment,
        value: comment,
        nodeType: 8,
        type: "comment",
      };
    });
  return result;
}
function cleanNodes(expressions) {
  for (let key of Object.keys(expressions)) {
    delete expressions[key].type;
  }
  const nodes = Object.values(expressions);
  for (let node of nodes) {
    if (node.nodeType === 3) {
      const { value } = node;
      let rawText = value;
      rawText = templateReplacer(
        rawText,
        expressions,
        (key) => expressions[key].expression,
      );
      node.rawText = rawText;
    }
  }
}
function setNodesPragma(expressions) {
  const nodes = Object.values(expressions).reverse();
  let pragma = "";
  for (let node of nodes) {
    const params = "ctx, position = [], index = 0, level = 0";
    if (node.nodeType === 1 && node.tagName !== "style") {
      const nId = `n${node.id}`;
      node.id = nId;
      let nodeIsDynamic = !!Object.keys(node.attributes).find((attr) =>
        attr.startsWith(":") ||
        attr.startsWith("--") ||
        attr.startsWith("@") ||
        attr.startsWith("&") ||
        attr.startsWith("_")
      );
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
            ? `${nId}.setAttribute('${key}', '${value}');`
            : `ctx.refs['${value}'] = ${nId};`
        )
        .join("");
      pragma = (idComponent, isRoot = true, imports = [], getId) => {
        const isImported = imports.includes(node.tagName);
        const callComponent = isRoot
          ? ";"
          : "(ctx, position.slice(), index, level + 1)";
        let nodesPragma = node.childNodes.filter((child) => child.pragma).map((
          child,
          i,
          arr,
        ) => {
          // return the pragma
          return child.pragma(idComponent, false, imports, getId);
        }).join(",");
        let appending = `${nId}.append(${nodesPragma});`;
        let extensionId = "";
        if (isImported) {
          extensionId = getId(node.tagName);
        }
        const props = Object.entries(node.attributes).filter(([key]) =>
          key.startsWith(":")
        ).map(([key, value]) => {
          return [key.replace(/^\:/, ""), value];
        });
        let nodeCreation =
          `const ${nId} = document.createElement('${node.tagName}');`;
        if (nodeIsDynamic && !isImported && !isRoot) {
          // create a custom element if the element as a directive or prop or event;
          nodeCreation =
            `const ${nId} = document.createElement('${node.tagName}', { is: '${idComponent}-${node.id}' });`;
        } else if (isImported) {
          nodeCreation =
            `const ${nId} = document.createElement('template', { is: '${extensionId}-nt'});`;
        }
        const directives = parseDirectives(node, { nodeIsDynamic, isImported });
        /**
           * all we set in this function
           * will be usefull after the node is connected
           * we will use the method connectedCalback and use the properties
           */
        return `
        (function(${params}) {
          ${nodeCreation}
          if (position) position[level] = index;
          ${
          node.attributes && node.attributes.await
            ? `${nId}.setAttribute('await', '');`
            : ""
        }
          ${
          isImported || nodeIsDynamic && !isImported && !isRoot
            ? `${nId}.setOgone({
              ${!isImported ? "position, level, index," : ""}
              ${isImported ? `positionInParentComponent: position,` : ""}
              ${isImported ? `levelInParentComponent: level,` : ""}
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
              directives: ${directives},
            });`
            : ""
        }
          ${nId}.setAttribute('${idComponent}', '');
          ${setAttributes}
          ${nodesPragma.length ? appending : ""}
          return ${nId};
        })${callComponent}`;
      };
    }
    if (node.nodeType === 3) {
      const nId = `t${node.id}`;
      node.id = nId;
      pragma = (idComponent) => {
        const isEvaluated = node.rawText.indexOf("${") > -1;
        const registerText = isEvaluated
          ? `
          const g = Ogone.contexts['${idComponent}-${node.id}'].bind(ctx.data); /* getContext function */
          const txt = '\`${
            node.rawText.replace(/\n/gi, " ")
              // preserve regular expressions
              .replace(/\\/gi, "\\\\")
              // preserve quotes
              .replace(/\'/gi, "\\'").trim()
          }\`';
          function r(key) {
            if (key instanceof String && txt.indexOf(key) < 0) return true;
            const v = g({
              getText: txt,
              position,
            });
            if (${nId}.data && ${nId}.data !== v) ${nId}.data = v;
            return true;
          };
          ctx.texts.push(r);
        `
          : "";
        if (!isEvaluated) {
          return `\`${node.rawText.replace(/\n/gi, " ").trim()}\``;
        }
        return `
      (function(${params}) {
        const ${nId} = new Text('${isEvaluated ? " " : node.rawText}');
        ${registerText}
        return ${nId};
      })(ctx, position.slice())`;
      };
    }
    node.pragma = pragma;
  }
}
export default function parse(html) {
  let result = {
    comments: {},
  };
  let expressions = {};
  let str = `<template>${html}</template>`;
  // preserve comments
  str = preserveComments(str, expressions);
  // preserve strings of attrs
  str = preserveStringsAttrs(str, expressions);
  str = preserveLitterals(str, expressions);
  // preserve templates ${}
  str = preserveTemplates(str, expressions);
  // preserve nodes
  str = preserveNodes(str, expressions);
  // parse text nodes
  str = parseTextNodes(str, expressions);
  // parse nodes
  str = parseNodes(str, expressions);

  // get rootNode
  result = getRootnode(str, expressions);
  result.id = "t";
  // delete last useless props and set rawtext to textnodes
  cleanNodes(expressions);
  // set to all nodes the jsx pragma
  setNodesPragma(expressions);
  // set next/previous element sibling
  setElementSiblings(result);
  // critical this will say to o3 that is the rootNode
  result.tagName = null;
  return result;
}
