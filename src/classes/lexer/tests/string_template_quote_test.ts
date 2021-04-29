import { OgoneLexer, ContextTypes } from '../OgoneLexer.ts';
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test('ogone-lexer supports template quotes', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = "` test support `";
  const contexts = lexer.parse(content,  { type: 'lexer' });
  if (contexts && contexts.length) {
    const [doubleQuote] = contexts;
    assertEquals(doubleQuote.type, ContextTypes.StringTemplateQuote);
    assertEquals(doubleQuote.source, content);
    assertEquals(doubleQuote.position.start, 0);
    assertEquals(doubleQuote.position.line, 0);
    assertEquals(doubleQuote.position.column, 0);
    assertEquals(doubleQuote.position.end, 16);
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StringTemplateQuote} context`);
  }
});

Deno.test('ogone-lexer should not use escaped template quotes to close quotes', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = "` test support \\` should display the whole string`";
  const contexts = lexer.parse(content,  { type: 'lexer' });
  if (contexts && contexts.length) {
    const [doubleQuote] = contexts;
    assertEquals(doubleQuote.type, ContextTypes.StringTemplateQuote);
    assertEquals(doubleQuote.source, content);
    assertEquals(doubleQuote.position.start, 0);
    assertEquals(doubleQuote.position.line, 0);
    assertEquals(doubleQuote.position.column, 0);
    assertEquals(doubleQuote.position.end, 50);
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StringTemplateQuote} context`);
  }
});

Deno.test('ogone-lexer should use the onError function, when the StringTemplateQuote is not finished', () => {
  let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    // true because the quote isn't closed
    result = true;
  });
  const content = "`";
  const contexts = lexer.parse(content,  { type: 'lexer' });
  if (contexts && contexts.length) {
    assertEquals(result, true);
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StringTemplateQuote} context`);
  }
});

Deno.test('ogone-lexer should use the onError function, when the StringTemplateQuoteEval is not finished', () => {
  let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    // true because the quote isn't closed
    result = true;
  });
  const content = "`${";
  const contexts = lexer.parse(content,  { type: 'lexer' });
  if (contexts && contexts.length) {
    assertEquals(result, true);
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StringTemplateQuote} context`);
  }
});

Deno.test('ogone-lexer supports template concatenation inside template quotes', () => {
  let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = "`${supported}`";
  const contexts = lexer.parse(content,  { type: 'lexer' });
  if (contexts && contexts.length) {
    const [templateEval, templateQuote] = contexts;
    assertEquals(true, templateQuote.children.includes(templateEval));
    assertEquals(templateQuote.type, ContextTypes.StringTemplateQuote);
    assertEquals(templateEval.type, ContextTypes.StringTemplateQuoteEval);
    assertEquals(templateEval.source, content.slice(1, -1));
    assertEquals(templateEval.position.start, 1);
    assertEquals(templateEval.position.end, 13);
    assertEquals(templateEval.position.line, 0);
    assertEquals(templateEval.position.column, 1);
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StringTemplateQuote} context`);
  }
});


Deno.test('ogone-lexer supports recursive template concatenation', () => {
  let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = "`${supported `test ${name}`}`";
  const contexts = lexer.parse(content,  { type: 'lexer' });
  if (contexts && contexts.length) {
    const [space, templateQuoteEval, templateQuote, templateQuoteEvalOnTop, templateQuoteOnTop] = contexts;
    assertEquals(true, templateQuote.children.includes(templateQuoteEval));
    assertEquals(true, templateQuoteOnTop.children.includes(templateQuoteEvalOnTop));
    assertEquals(templateQuoteEval.source, '${name}');
    assertEquals(templateQuoteEvalOnTop.source, '${supported `test ${name}`}');

    assertEquals(templateQuote.source, '`test ${name}`');
    assertEquals(templateQuoteOnTop.source, content);

    assertEquals(templateQuoteOnTop.position, { start: 0, end: 29, line: 0, column: 0 });
    assertEquals(templateQuoteEvalOnTop.position, { start: 1, end: 28, line: 0, column: 1 });
    assertEquals(templateQuote.position, { start: 13, end: 27, line: 0, column: 13 });
    assertEquals(templateQuoteEval.position, { start: 19, end: 26, line: 0, column: 19 });
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.StringTemplateQuote} context`);
  }
});