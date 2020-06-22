import getTypedExpression from "../lib/js-this/src/typedExpressions.ts";
import renderNullifiedValues from "../lib/js-this/src/render/renderNullifiedValues.js";
import yamelize from "../lib/js-this/src/render/yamelize.js";
import {
  assertEquals,
  assertThrows,
  assertStrContains,
  assertArrayContains,
  fail,
} from "https://raw.githubusercontent.com/denoland/deno/master/std/testing/asserts.ts";

function renderDefExpression(str: string, opts?: any): string {
  let typedExpressions = getTypedExpression();
  let expressions = {
    "§§endExpression0§§": "\n",
  };
  let prog = `\n${str}`;
  prog = renderNullifiedValues(typedExpressions, expressions, prog);
  prog = yamelize(typedExpressions, expressions, prog);
  return prog;
}
Deno.test("- yamelize should erase def expression", () => {
  const def = renderDefExpression(`
    def: name: Rudy
    case '': break;
  `);
  if (def.indexOf("def: name: Rudy") > -1) {
    fail("def statement is not erased by yamelize");
  }
});
Deno.test("- yamelize should erase def expression 2", () => {
  const defExp = `
    def:
        test: l
        test2: i&


        t:
            - name: a
            - name: b
            - name: a
            - name: b`;
  const def = renderDefExpression(`
  ${defExp}
    case '': break;
  `);
  if (def.indexOf(defExp) > -1) fail("def statement is not erased by yamelize");
});
Deno.test("- yamelize should erase def expression 3", () => {
  const defExp = `
    def:
        name: Rudy
        pseudo: SRNV`;
  const def = renderDefExpression(`
    case '': break;
${defExp}
    default: break;
  `);
  if (def.indexOf(defExp) > -1) fail("def statement is not erased by yamelize");
});
Deno.test("- yamelize should erase def expression 4", () => {
  const defExp = `
    def:
        name: R
        case: inyaml`;
  const def = renderDefExpression(`
    case '': break;
${defExp}
default: wont be in yaml
    default: return;
  `);
  if (def.indexOf(defExp) > -1) {
    fail("def statement is not erased by yamelize");
  }
});
Deno.test("- yamelize shouldn't parse second def expression inside the quotes", () => {
  const defExp = `
    def:
        name: R
        case: inyaml`;
try {
  const def = renderDefExpression(`
    case '': break;
${defExp}
default:
  'don\'t parse that def:'
  `);
} catch(e) {
  fail("def statement is parsed");
}
});
