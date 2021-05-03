import { OgoneLexer, ContextTypes, SupportedStyleSheetAtRuleConstantTypes } from '../../OgoneLexer.ts';
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
Deno.test('ogone-lexer stylesheet supports @const statement, and it can retrieve the name of the const and its type', () => {
  const constName = 'myColor'
  const content = ` @const ${constName}<hex>= #001000;`;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'stylesheet' });
  if (contexts && contexts.length) {
    const err = new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`);
    const errName = new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConstName} context`);
    const constant = contexts.find((context) => context.type === ContextTypes.StyleSheetAtRuleConst);
    if (!constant) {
      throw err;
    }
    const constantName = constant.related.find((context) => context.type === ContextTypes.StyleSheetAtRuleConstName);
    if (!constantName) {
      throw errName;
    }
    assertEquals(constantName.source, constName);
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`);
  }
});

Deno.test('ogone-lexer stylesheet supports @const statement, and it can retrieve the name of the const and its type 2 (in component)', () => {
  const constName = 'myColor'
  const content = `
  <template>
    <style>
      @const ${constName}<hex>= #001000;
    </style>
  </template>`;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const err = new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`);
    const errName = new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConstName} context`);
    const constant = contexts.find((context) => context.type === ContextTypes.StyleSheetAtRuleConst);
    if (!constant) {
      throw err;
    }
    const constantName = constant.related.find((context) => context.type === ContextTypes.StyleSheetAtRuleConstName);
    if (!constantName) {
      throw errName;
    }
    assertEquals(constantName.source, constName);
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`);
  }
});

Deno.test('ogone-lexer stylesheet supports @export statement', () => {
  const content = `@export const myVar<hex> = #000000;`;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'stylesheet' });
  if (contexts && contexts.length) {
    const constant = contexts.find((context) => context.type === ContextTypes.StyleSheetAtRuleConst);
    if (!constant) {
      throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`);
    }
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`);
  }
});
// TODO implement types tests
