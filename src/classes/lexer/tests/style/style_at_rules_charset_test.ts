import { OgoneLexer, ContextTypes } from '../../OgoneLexer.ts';
import { assertEquals, assert } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test('ogone-lexer can parse @charset', () => {
  const content = `@charset 'utf-8';`;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'stylesheet' });
  if (contexts && contexts.length) {
    const charset = contexts.find((context) => context.type === ContextTypes.StyleSheetAtRuleCharset);
    if (!charset) {
      throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleCharset} context`);
    }
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleCharset} context`);
  }
});