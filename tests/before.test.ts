import beforeCase from "../src/lib/js-this/src/render/before-case.js";
import getTypedExpression from "../src/lib/js-this/src/typedExpressions.js";
import renderNullifiedValues from "../src/lib/js-this/src/render/renderNullifiedValues.js";
import {
  assertEquals,
  assertThrows,
  assertStrContains,
  assertArrayContains,
  fail,
} from "https://raw.githubusercontent.com/denoland/deno/master/std/testing/asserts.ts";

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
  case 'init':
    setTimeout(() => {
      // should trigger the then case of parent
    }, 0);
      Async.resolve(true);
  break;
`);
  if (r.value.indexOf(beforeEachExpression) > -1) {
    fail("beforeCase didn't erased before-each statement");
  }
});

Deno.test("- beforeCase should erase before-each statements and get the content of the statement", () => {
  const exactContent = `const { content,a } = Refs;
		content.style.background = 'red';
		new Map().forEach(() => {
			console.warn('test')
		})
		`;
  const beforeEachExpression = `
      before-each:
    ${exactContent}
    `;
  const r = renderBeforeCasesExpressions(`
	  def:
    user: null
${beforeEachExpression}

  case 'init':
    setTimeout(() => {
      // should trigger the then case of parent
    }, 0);
      Async.resolve(true);
  break;
`);
  if (r.value.indexOf(beforeEachExpression) > -1) {
    fail("beforeCase didn't erased before-each statement");
  }
  assertEquals(
    r.typedExpressions.switch.before.each.trim(),
    exactContent.trim(),
  );
});
