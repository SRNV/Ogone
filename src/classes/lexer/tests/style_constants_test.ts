import { OgoneLexer, ContextTypes } from '../OgoneLexer.ts';
import { assertEquals, assert } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

// TODO retrieve all types inside StyleSheetTypeAssignment
/**
 * being able to type a variable
 * with the statements
 * @const
 *  and
 * @export const
 * we should be able to expose primitive types
 */
Deno.test('ogone-lexer stylesheet supports @const statement', () => {
  const content = `@const myVar: type = #000000;`;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'stylesheet' });
  if (contexts && contexts.length) {
    const constant = contexts.find((context) => context.type === ContextTypes.StyleSheetConst);
    if (!constant) {
      throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetConst} context`);
    }
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetConst} context`);
  }
});

/*

Deno.test('ogone-lexer stylesheet supports @export statement', () => {
  const content = `
  <template>
    <style>
      @export const myVar: type = #000000;
    </style>
  </template>`;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const constant = contexts.find((context) => context.type === ContextTypes.StyleSheetConst);
    if (!constant) {
      throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetConst} context`);
    }
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetConst} context`);
  }
});
*/