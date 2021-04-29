import { OgoneLexer, ContextTypes } from '../OgoneLexer.ts';
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test('ogone-lexer can retrieve nested css', () => {
  const content = `
  <proto>
    declare:
      public data: myType = 'something';
  </proto>`;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const protocol = contexts.find((context) => context.type === ContextTypes.Protocol);
    if (!protocol) {
      throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.Protocol} context`);
    }
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.Protocol} context`);
  }
});