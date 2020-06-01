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
/*
Deno.test('- jsThis can parse missing string', () => {
  assertThrows(() => {
renderUsePath(`
      use @/path/to/comp.o3 as component;
    `)
  }, Error)
});
*/