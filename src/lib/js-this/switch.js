import getTypedExpression from "./src/typedExpressions.js";
import elements from "./src/elements.js";
import computedExp from "./src/computed.js";
import renderExpressions from "./src/render/renderExpressions.js";
import renderEsm from "./src/render/renderEsm.js";
import cjsElements from "./src/cjsElements.js";
import renderNullifiedValues from "./src/render/renderNullifiedValues.js";
import renderComputed from "./src/render/computed.js";
import renderInvalidation from "./src/render/invalidations.js";
import renderSetterExpression from "./src/render/setter-expression.js";
import renderO3Syntax from "./src/render/o3-syntax-render.js";
import yamelize from "./src/render/yamelize.js";
import parseCases from "./src/caseParser.ts";

function recursiveTranslate(expressions, prog) {
  let str = prog;
  if (str.indexOf("§§") > -1) {
    Object.entries(expressions)
      .filter(([key]) => str.indexOf(key) > -1)
      .reverse()
      .forEach(([key, value]) => {
        str = str.replace(key, value);
      });
  }
  return str.indexOf("§§") > -1 ? recursiveTranslate(expressions, str) : str;
}
function jsThis(str, opts) {
  let typedExpressions = getTypedExpression();
  let expressions = {
    "§§endExpression0§§": "\n",
  };
  let prog = `\n${str}`;
  prog = renderNullifiedValues(typedExpressions, expressions, prog);
  if (prog.indexOf("def:") > -1 && opts && opts.data === true) {
    prog = yamelize(typedExpressions, expressions, prog);
  }
  if (opts && opts.parseCases) {
    prog = renderExpressions(
      typedExpressions,
      expressions,
      elements,
      prog,
      "block",
    );
    prog = renderExpressions(
      typedExpressions,
      expressions,
      elements,
      prog,
      "parentheses",
    );
    prog = parseCases(typedExpressions, expressions, prog);
    // we return directly cause parseCases impact the other parsing algos
    return {
      value: prog,
      body: typedExpressions,
    };
  }
  prog = renderExpressions(typedExpressions, expressions, elements, prog);
  if (opts && opts.cjs) {
    prog = renderExpressions(typedExpressions, expressions, cjsElements, prog);
  }

  if (opts && opts.esm) {
    prog = renderEsm(typedExpressions, expressions, prog);
  }

  if (opts && opts.onlyDeclarations) {
    prog = renderO3Syntax(typedExpressions, expressions, prog, "declarations");
    return {
      value: prog,
      body: typedExpressions,
    };
  }
  if (opts && opts.reactivity) {
    prog = renderComputed(typedExpressions, expressions, computedExp, prog);
    prog = renderSetterExpression(typedExpressions, expressions, prog);
    prog = renderInvalidation(typedExpressions, expressions, prog);
    if (opts.casesAreLinkables) {
      // let the developper use 'run case' feature
      prog = renderO3Syntax(typedExpressions, expressions, prog, "linkCases");
    }
  }

  // update blocks and parentheses

  Object.entries(typedExpressions.parentheses).forEach(([key, value]) => {
    typedExpressions.parentheses[key] = renderExpressions(
      typedExpressions,
      expressions,
      elements,
      value,
      "block",
    );
    if (opts && opts.cjs) {
      typedExpressions.parentheses[key] = renderExpressions(
        typedExpressions,
        expressions,
        cjsElements,
        typedExpressions.parentheses[key],
      );
    }

    if (opts && opts.esm) {
      typedExpressions.parentheses[key] = renderEsm(
        typedExpressions,
        expressions,
        typedExpressions.parentheses[key],
      );
    }
    if (opts.reactivity) {
      typedExpressions.parentheses[key] = renderComputed(
        typedExpressions,
        expressions,
        computedExp,
        typedExpressions.parentheses[key],
      );
      typedExpressions.parentheses[key] = renderSetterExpression(
        typedExpressions,
        expressions,
        typedExpressions.parentheses[key],
      );
      typedExpressions.parentheses[key] = renderInvalidation(
        typedExpressions,
        expressions,
        typedExpressions.parentheses[key],
      );
      if (opts.casesAreLinkables) {
        // let the developper use 'run case' feature
        typedExpressions.parentheses[key] = renderO3Syntax(
          typedExpressions,
          expressions,
          typedExpressions.parentheses[key],
          "linkCases"
        );
      }
    }
  });
  Object.entries(typedExpressions.blocks).forEach(([key, value]) => {
    typedExpressions.blocks[key] = renderExpressions(
      typedExpressions,
      expressions,
      elements,
      value,
      "endLine",
    );
    if (opts && opts.cjs) {
      typedExpressions.blocks[key] = renderExpressions(
        typedExpressions,
        expressions,
        cjsElements,
        typedExpressions.blocks[key],
      );
    }

    if (opts && opts.esm) {
      typedExpressions.blocks[key] = renderEsm(
        typedExpressions,
        expressions,
        typedExpressions.blocks[key],
      );
    }
    if (opts.reactivity) {
      typedExpressions.blocks[key] = renderComputed(
        typedExpressions,
        expressions,
        computedExp,
        typedExpressions.blocks[key],
      );
      typedExpressions.blocks[key] = renderSetterExpression(
        typedExpressions,
        expressions,
        typedExpressions.blocks[key],
      );
      typedExpressions.blocks[key] = renderInvalidation(
        typedExpressions,
        expressions,
        typedExpressions.blocks[key],
      );
      if (opts.casesAreLinkables) {
        // let the developper use 'run case' feature
        typedExpressions.blocks[key] = renderO3Syntax(
          typedExpressions,
          expressions,
          typedExpressions.blocks[key],
          "linkCases"
        );
      }
    }
  });

  Object.entries(typedExpressions).forEach(([key, value]) => {
    Object.entries(typedExpressions[key]).forEach(([key2, value2]) => {
      if (
        ![
          "properties",
          "use",
          "data",
          "imports",
          "exports",
          "require",
          "switch",
        ]
          .includes(key)
      ) {
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
  if (prog.indexOf("§§") > -1) {
    Object.entries(expressions)
      .filter(([key]) => prog.indexOf(key) > -1)
      .reverse()
      .forEach(([key, value]) => {
        prog = prog.replace(key, value);
      });
  }
  if (prog.indexOf("§§") > -1) {
    prog = recursiveTranslate(expressions, prog);
  }
  return {
    value: prog,
    body: typedExpressions,
  };
}

export default jsThis;