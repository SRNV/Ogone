import { OgoneLexer, ContextTypes } from '../OgoneLexer.ts';
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test('ogone-lexer supports textnodes', () => {
  const content = "import a from 'v';<div>here a textnode</div><!--not a textnode --> here another one";
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const textnodes = contexts.filter((context) => context.type === ContextTypes.TextNode);
    const [text1, text2] = textnodes;
    assertEquals(text1.source, 'here a textnode');
    assertEquals(text2.source, 'here another one');
    assertEquals(text1.position, { start: 23, end: 38, line: 0, column: 23 });
    assertEquals(text2.position, { start: 67, end: 83, line: 0, column: 67 });
    assertEquals(textnodes.length, 2);
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.TextNode} context`);
  }
});

Deno.test('ogone-lexer supports textnodes with template', () => {
  const source = 'here a textnode ${template} '
  const content = `import a from 'v';<div>${source}</div>`;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const textnodes = contexts.filter((context) => context.type === ContextTypes.TextNode);
    const [text1] = textnodes;
    const template = text1.children.find((context) => context.type === ContextTypes.StringTemplateQuoteEval);
    if (!template) {
      throw new Error('failed to retrieve the template inside the textnode');
    }
    assertEquals(text1.source, source);
    assertEquals(template.source, '${template}');
    assertEquals(template.position, { start: 39, end: 50, line: 0, column: 39 });
    assertEquals(text1.position, { start: 23, end: 51, line: 0, column: 23 });
    assertEquals(textnodes.length, 1);
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.TextNode} context`);
  }
});

Deno.test('ogone-lexer should use onError function when an unsupported textnode is parsed', () => {
  // malformed import statement
  const content = "impot a from 'v';";
  let result = false;
  new OgoneLexer((reason, cursor, context) => {
    result = context.type === ContextTypes.Unexpected
      && context.source === content;
    assertEquals(context.position, { start: 0, line: 0, column: 0, end: 1 });
  })
  .parse(content, { type: 'component' });
  if (!result) {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.TextNode} context`);
  }
});

Deno.test('ogone-lexer supports textnodes using < but not starting a new node', () => {
  const source = 'is a correct textnode <<<<';
  const content = `<div> ${source}</div>`;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const textnodes = contexts.filter((context) => context.type === ContextTypes.TextNode);
    const [text1] = textnodes;
    assertEquals(text1.source, source);
  } else {
    throw new Error(`OgoneLexer - Failed to retrieve ${ContextTypes.TextNode} context`);
  }
});