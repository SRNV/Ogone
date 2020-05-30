import jsThis from "../src/lib/js-this/switch.js";
import getTypedExpression from "../src/lib/js-this/src/typedExpressions.js";
import renderNullifiedValues from "../src/lib/js-this/src/render/renderNullifiedValues.js";
import {
  assertEquals,
  assertThrows,
  assertStrContains,
  assertArrayContains,
  fail,
} from "https://raw.githubusercontent.com/denoland/deno/master/std/testing/asserts.ts";

function renderOgoneTokens(declarations: any) {
  return jsThis(declarations, {
    onlyDeclarations: true,
  });
}
function renderImports(declarations: any) {
  return jsThis(declarations, {
    esm: true,
  });
}
function renderScript(proto: any) {
  return jsThis(
    proto,
    {
      data: true,
      reactivity: true,
      casesAreLinkables: true,
      beforeCases: true,
    },
  );
}
function renderUsePath(declarations: any) {
  return Object.values(jsThis(declarations, { onlyDeclarations: true }).body.use);
}
Deno.test('- jsThis can parse use statements', () => {
  const [infos, infos2] = renderUsePath(`
    use @/path/to/comp.o3 as 'component';
    use @/second.o3 as 'should-be-parsed';
  `);
  assertEquals(infos, {
    path:  "path/to/comp.o3",
    as: "'component'",
  });
  assertEquals(infos2, {
    path:  "second.o3",
    as: "'should-be-parsed'",
  });
});
Deno.test('- jsThis can parse wrong use statements', () => {
  assertThrows(() => {
    renderUsePath(`
      use @/path/to/comp.o3 as 'component';
      use
        @/second.o3 as
        'should-be-parsed';
    `)
  })
});
Deno.test('- jsThis can parse missing string', () => {
  assertThrows(() => {
renderUsePath(`
      use @/path/to/comp.o3 as component;
    `)
  }, Error)
});
/*
function renderBeforeCasesExpressions(str: string): any {
  let typedExpressions = getTypedExpression();
  let expressions = {
    "§§endExpression0§§": "\n",
  };
  let prog = `\n${str}`;
  prog = renderNullifiedValues(typedExpressions, expressions, prog);
  prog = beforeCase(typedExpressions, expressions, prog);
  return {
    value: prog,
    typedExpressions,
  };
}
Deno.test("- beforeCase should erase before-each statements", () => {
  const beforeEachExpression = `
      before-each:
    const { content } = Refs;
    `;
  const r = renderBeforeCasesExpressions(`
${beforeEachExpression}
  def:
    user: null
  default:
    setTimeout(() => {
      // should trigger the then case of parent
    }, 0);
      Async.resolve(true);
  break;
`);
  if (r.value.indexOf(beforeEachExpression) > -1: any) {
    fail("beforeCase didn't erased before-each statement");
  }
});

Deno.test("- beforeCase should erase before-each statements and get the content of the statement", () => {
  const exactContent = `const { content,a } = Refs;
		content.style.background = 'red';
		new Map().forEach(() => {
			console.warn('test')
		});
    this.position => {
      return \`x,y\`
    };
		`;
  const beforeEachExpression = `
      before-each:
    ${exactContent}
    `;
  const r = renderBeforeCasesExpressions(`
	  def:
    user: null
${beforeEachExpression}

  default:
    setTimeout(() => {
      // should trigger the then case of parent
    }, 0);
      Async.resolve(true);
  break;
`);
  if (r.value.indexOf(beforeEachExpression) > -1: any) {
    fail("beforeCase didn't erased before-each statement");
  }
  assertEquals(
    r.typedExpressions.switch.before.each.trim(),
    exactContent.trim(),
  );
});
*/
