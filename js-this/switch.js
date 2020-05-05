const beautify = require('js-beautify');
const beautifyOptions = require('../beautify.config');
const getTypedExpression = require('./src/typedExpressions');
const expressions = require('./src/expressions')
const elements = require('./src/elements');
const computedExp = require('./src/computed');
const renderExpressions = require('./src/render/renderExpressions');
const renderEsm = require('./src/render/renderEsm');
const cjsElements = require('./src/cjsElements');
const renderNullifiedValues = require('./src/render/renderNullifiedValues');
const renderComputed = require('./src/render/computed');
const renderInvalidation = require('./src/render/invalidations');
const renderSetterExpression = require('./src/render/setter-expression');
const renderO3Syntax = require('./src/render/o3-syntax-render');
const yamelize = require('./src/render/yamelize');

function recursiveTranslate(expressions, prog) {
  let str = prog;
  if (str.indexOf('§§') > -1) {
    Object.entries(expressions)
      .filter(([key]) => str.indexOf(key) > -1)
      .reverse()
      .forEach(([key, value]) => {
        str = str.replace(key, value);
      });
  }
  return str.indexOf('§§') > -1 ? recursiveTranslate(expressions, str) : str;
}
function jsThis(str, opts) {
  let typedExpressions = getTypedExpression();
  let expressions = {
    '§§endExpression0§§': '\n',
  };
  let prog = `\n${str}`;
  prog = renderNullifiedValues(typedExpressions, expressions, prog);
  if (prog.indexOf('this:') > -1 && opts && opts.data === true) {
    prog = yamelize(typedExpressions, expressions, prog);
  }

  prog = renderExpressions(typedExpressions, expressions, elements, prog);
  if (opts && opts.cjs) {
    prog = renderExpressions(typedExpressions, expressions, cjsElements, prog);
  }

  if (opts && opts.esm) {
    prog = renderEsm(typedExpressions, expressions, prog);
  }

  if (opts && opts.onlyDeclarations) {
    prog = renderO3Syntax(typedExpressions, expressions, prog, 'declarations');
    return {
      value: beautify(prog, beautifyOptions),
      body: typedExpressions,
    };
  }
  if (opts.reactivity) {
    prog = renderComputed(typedExpressions, expressions, computedExp, prog);
    prog = renderSetterExpression(typedExpressions, expressions, prog);
    prog = renderInvalidation(typedExpressions, expressions, prog)
  }

  // update blocks and parentheses

  Object.entries(typedExpressions.parentheses).forEach(([key, value]) => {
    typedExpressions.parentheses[key] = renderExpressions(typedExpressions, expressions, elements, value, 'block');
    if (opts && opts.cjs) {
      typedExpressions.parentheses[key] =  renderExpressions(typedExpressions, expressions, cjsElements, typedExpressions.parentheses[key]);
    }
  
    if (opts && opts.esm) {
      typedExpressions.parentheses[key] = renderEsm(typedExpressions, expressions, typedExpressions.parentheses[key]);
    }
    if (opts.reactivity) {
      typedExpressions.parentheses[key] = renderComputed(typedExpressions, expressions, computedExp, typedExpressions.parentheses[key]);
      typedExpressions.parentheses[key] = renderSetterExpression(typedExpressions, expressions, typedExpressions.parentheses[key]);
      typedExpressions.parentheses[key] = renderInvalidation(typedExpressions, expressions, typedExpressions.parentheses[key]);
    }
  });
  Object.entries(typedExpressions.blocks).forEach(([key, value]) => {
    typedExpressions.blocks[key] = renderExpressions(typedExpressions, expressions, elements, value, 'endLine');
    if (opts && opts.cjs) {
      typedExpressions.blocks[key] =  renderExpressions(typedExpressions, expressions, cjsElements, typedExpressions.blocks[key]);
    }
  
    if (opts && opts.esm) {
      typedExpressions.blocks[key] = renderEsm(typedExpressions, expressions, typedExpressions.blocks[key]);
    }
    if (opts.reactivity) {
      typedExpressions.blocks[key] = renderComputed(typedExpressions, expressions, computedExp, typedExpressions.blocks[key]);
      typedExpressions.blocks[key] = renderSetterExpression(typedExpressions, expressions, typedExpressions.blocks[key]);
      typedExpressions.blocks[key] = renderInvalidation(typedExpressions, expressions, typedExpressions.blocks[key]);
    }
  });

  Object.entries(typedExpressions).forEach(([key, value]) => {
    Object.entries(typedExpressions[key]).forEach(([key2, value2]) => {
      if (!['properties', 'use', 'data', 'imports', 'exports', 'require'].includes(key)) {
        // dont set expressions for Ogone tools
        expressions[key2] = value2;
      }
    });
  });
  Object.entries(expressions).reverse().forEach(([key, value]) => {
    Object.entries(expressions).reverse().forEach(([key2, value2]) => {
      expressions[key] = value.replace(key2, value2);
    });
  });
  if (prog.indexOf('§§') > -1) {
    Object.entries(expressions)
      .filter(([key]) => prog.indexOf(key) > -1)
      .reverse()
      .forEach(([key, value]) => {
        prog = prog.replace(key, value);
      });
  }
  if (prog.indexOf('§§') > -1) {
    prog = recursiveTranslate(expressions, prog)
  }
  return {
    value: beautify(prog, beautifyOptions),
    body: typedExpressions,
  };
}

module.exports = jsThis;