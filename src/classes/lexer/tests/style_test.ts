import { OgoneLexer, ContextTypes } from '../OgoneLexer.ts';
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test('ogone-lexer can retrieve nested css', () => {
  const content = `
  <template>
    <style>
      .container {
        color: red;
        .container:hover {
          color: blue;
          ul,
          li {
            color: yellow;
          }
        }
      }
    </style>
  </template>`;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const stylesheet = contexts.find((context) => context.type === ContextTypes.StyleSheet);
    if (!stylesheet) {
      throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheet} context`);
    }
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheet} context`);
  }
});

Deno.test('ogone-lexer can parse at-rules', () => {
  const content = `
  <template>
    <style>
      @media screen and (min-width: 100px) {}
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

/**
 * being able to type a variable
 * with the statements
 * @const
 *  and
 * @export const
 * we should be able to expose primitive types
 */
Deno.test('ogone-lexer stylesheet supports @const statement', () => {
  const content = `
  <template>
    <style>
      @const myVar: type = #000000;
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