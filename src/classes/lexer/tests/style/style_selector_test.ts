import { OgoneLexer, ContextTypes } from '../../OgoneLexer.ts';
import { assertEquals, assert } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test('ogone-lexer can retrieve selectors', () => {
  const content = `
  div ,
  ul,
  li {
    color: blue;
  }
  `;
  const lexer = new OgoneLexer((reason, cursor, context) => {
      console.warn(context);
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'stylesheet' });
  if (contexts && contexts.length) {
    // TODO
     console.warn(contexts);
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleCharset} context`);
  }
});

Deno.test('ogone-lexer can retrieve classes', () => {
  const content = `
  .container {
    color: blue;
  }
  `;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'stylesheet' });
  if (contexts && contexts.length) {
    // console.warn(contexts);
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleCharset} context`);
  }
});