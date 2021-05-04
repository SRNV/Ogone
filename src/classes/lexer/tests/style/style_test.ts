import { OgoneLexer, ContextTypes } from '../../OgoneLexer.ts';
import { assertEquals, assert } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test('ogone-lexer can retrieve nested css', () => {
  const content = `
  <template>
    <style>
    /** comments */
      @charset 'utf-8';
    </style>
  </template>`;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    console.warn(context);
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
  const content = ` @media screen and (min-width: 100px) {} `;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'stylesheet' });
  if (contexts && contexts.length) {
    const atrule = contexts.find((context) => context.type === ContextTypes.StyleSheetAtRule);
    if (!atrule) {
      throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`);
    }
    const name = atrule.related.find((context) =>
      context.type === ContextTypes.StyleSheetAtRuleName
      && context.source === 'media');
    if (!name) {
      throw new Error(`OgoneLexer - Failed to retrieve the name of the at rule`);
    }
    assertEquals(name.position, { start: 2, end: 7, line: 0, column: 2 });
    assertEquals(atrule.position, { start: 2, end: 40, line: 0, column: 2 });
    assert(atrule.source.endsWith('}'))
    assert(atrule.children.find((ctx) => ctx.type === ContextTypes.StyleSheetCurlyBraces));
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`);
  }
});
