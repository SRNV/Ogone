let i = 0;
const openComment = '<!--';
const closeComment = '-->';
function getUniquekey(id='') {
  i++;
  // critical all regexp are based on this line
  return `-::${i}${id}-`;
}
function getRootnode(html, expressions) {
  let result;
  const keysOfExp = Object.keys(expressions);
  keysOfExp.filter((key) => html.indexOf(key) > -1)
    .forEach((key) => {
      result = expressions[key];
      result.type = 'root';
      delete result.attributes;
      delete result.id;
    })
  return result;
}
function parseNodes(html, expressions) {
  let result = html;
  Object.entries(expressions)
    .filter(([key, value]) => value.type === 'node')
    .forEach(([key, value]) => {
      const { expression, rawAttrs } = value;
      // get rawAttrs
      const attrRE = /([a-zA-Z0-9\$\_\[\]\:\-]*)+(\-\:{2}\d*attr\-)/gi;
      const attrbooleanRE = /\s+([a-zA-Z0-9\$\-]*)(?!\:)\s*/gi;
      const matches = rawAttrs.match(attrRE);
      const matchesBoolean = rawAttrs.match(attrbooleanRE);

      matches?.forEach((attr) => {
        const attrIDRE = /([a-zA-Z0-9\$\_\[\]\:\-]*)+(\-\:{2}\d*attr\-)/;
        const [input, attributeName, id] = attr.match(attrIDRE);
        const { value } = expressions[id];
        expressions[key].attributes[attributeName] = value;
      })
      matchesBoolean?.filter((attr) => !expressions[key].attributes[attr.trim()] && attr.trim().length)
        .forEach((attr) => {
          expressions[key].attributes[attr.trim()] = true;
        });
      //result = result.replace(key, expression);
    });
  const keysOfExp = Object.keys(expressions);
  // start parsing Nodes by reversed array
  Object.entries(expressions)
    .reverse()
    .filter(([key, value]) => value.type === 'node')
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
            .filter((k) => innerHTML.indexOf(k) > -1 &&
            expressions[k])
            .sort((a, b) => innerHTML.indexOf(a) - innerHTML.indexOf(b))
            .forEach((k) => {
              expressions[key].childNodes.push(expressions[k]);
            });
        // get attrs
          keysOfExp
          .filter((k) => node.rawAttrs.indexOf(k) > -1 &&
          expressions[k].type === 'attr')
          .forEach((k) => {
            node.rawAttrs = node.rawAttrs.replace(k, expressions[k].expression);
          });
          result = result.replace(outerContent, opening);
          delete expressions[key].closingTag;
          delete expressions[key].key;
          delete expressions[key].autoclosing;
          delete expressions[key].closing;
          delete expressions[key].expression;
          // delete expressions[key].rawAttrs;
          delete expressions[key].id;
        });
    })
  return result;
}
function parseTextNodes(html, expression) {
  let result = html;
  const regexp = /(\<)\-::\d*node\-(\>)/;
  const textnodes = result.split(regexp);
  textnodes
    .filter((content) => content.trim().length)
    .forEach((content) => {
      const key = getUniquekey('text');
      expression[key] = {
        type: 'text',
        value: content,
        expression: content,
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
      const key = `<${getUniquekey('node')}>`;
      if (!!slash) {
        // get the openning tag by tagname, id -1 and closingTag === null
        const tag = Object.entries(expression)
          .reverse()
          .find(([k, v]) => v.type === 'node'
            && v.tagName.trim() === tagName.trim()
            && v.id < i
            && v.closingTag === null
            && !v.closing
            && !v.autoclosing)[1];
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
          type: 'node',
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
  const templates = ['${', '}'];
  const [ beginTemplate, traillingTemplate] = templates;
  result.split(/[^\\](\$\{)/)
    .filter((content, id, arr) => content.indexOf('}') > -1 && arr[id -1] === beginTemplate)
    .forEach((content) => {
        let str = content.split(/(?<!\\)(\})/gi)[0];
        const allTemplate = `${beginTemplate}${str}${traillingTemplate}`;
        const key = getUniquekey('templ');
        expression[key] = {
            expression: allTemplate,
            value: str,
            type: 'template',
        };
        result = result.replace(allTemplate, key);
    })
  return result;
}
function preserveLitterals(html, expression) {
  let result = html;
  result.split(/((?<!\\)`)/)
    .filter((content) => content !== '`')
    .forEach((content) => {
        let str = content.split(/((?<!\\)`)/);
        str.forEach((contentOfStr) => {
          const allLit = `\`${contentOfStr}\``;
          if (result.indexOf(allLit) < 0) return;
          const key = getUniquekey('str');
          expression[key] = {
            expression: allLit,
            value: contentOfStr,
            type: 'string',
          };
          result = result.replace(allLit, key);
        })
    })
  return result;
}
function preserveStringsAttrs(html, expression) {
  let result = html;
  const quotes = ['="', '"'];
  const [ beginQuote, closinQuote] = quotes;
  result.split(beginQuote)
  .filter((content) => /[^\\](")/.test(content))
  .forEach((content) => {
      let str = content.split(/(?<!\\)(")/gi)[0];
      const allstring = `${beginQuote}${str}${closinQuote}`;
      const key = getUniquekey('attr');
      expression[key] = {
        expression: allstring,
        value: str,
        type: 'attr',
      };
      result = result.replace(allstring, key);
  })
  return result;
}
function preserveComments(html, expression) {
  let result = html
  result.split(openComment)
    .filter(open => open.indexOf(closeComment) > -1)
    .forEach((open) => {
      let comment = open.split(closeComment)[0];
      let key = getUniquekey('com');
      const allComment = `${openComment}${comment}${closeComment}`;
      result = result.replace(allComment, key);
      expression[key] = {
        expression: allComment,
        value: comment,
        nodeType: 8,
        type: 'comment',
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
      let rawText = value
      while(rawText.match(/\-\:{2}\d*/)) {
        for (let key of Object.keys(expressions)) {
          rawText = rawText.replace(key, expressions[key].expression);
        }
      }
      node.rawText = rawText;
    }
  }
}
export default function parse(html) {
  let begin = performance.now();
  let result = {
    comments: {}
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
  // delete last useless props and set rawtext to textnodes
  cleanNodes(expressions);
  // critical this will say to o3 that is the rootNode
  result.tagName = null;
  return result;
}
