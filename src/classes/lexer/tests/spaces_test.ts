import { OgoneLexer, ContextTypes } from '../OgoneLexer.ts';
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test('ogone-lexer supports spaces', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(' ', { type: 'component' });
  if (contexts && contexts.length) {
    const [space] = contexts;
    assertEquals(space.type, ContextTypes.Space);
    assertEquals(space.position.line, 0);
    assertEquals(space.position.column, 0);
    assertEquals(space.position.start, 0);
    assertEquals(space.position.end, 1);
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Space context');
  }
});

Deno.test('ogone-lexer supports multiple spaces', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse('  ', { type: 'component' });
  if (contexts && contexts.length) {
    const [space] = contexts;
    assertEquals(space.type, ContextTypes.MultipleSpaces);
    assertEquals(space.position.line, 0);
    assertEquals(space.position.column, 0);
    assertEquals(space.position.start, 0);
    assertEquals(space.position.end, 2);
  } else {
    throw new Error('OgoneLexer - Failed to retrieve MultipleSpaces context');
  }
});

Deno.test('ogone-lexer supports line break', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(`
  `, { type: 'component' });
  if (contexts && contexts.length) {
    const [lineBreak] = contexts;
    assertEquals(lineBreak.type, ContextTypes.LineBreak);
    assertEquals(lineBreak.position.line, 0);
    assertEquals(lineBreak.position.column, 0);
    assertEquals(lineBreak.position.start, 0);
    assertEquals(lineBreak.position.end, 1);
  } else {
    throw new Error('OgoneLexer - Failed to retrieve MultipleSpaces context');
  }
});