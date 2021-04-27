import { OgoneLexer, ContextTypes, SupportedFlags } from '../OgoneLexer.ts';
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test('lexer can parse a basic component', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `
  import component A from './b.o3';

  <template></template>
  <proto>
  </proto>
  `;
  const contexts = lexer.parse(content, url);
  if (contexts && contexts.length) {
    try {
      console.warn(contexts);
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});