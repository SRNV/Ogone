import { OgoneLexer, ContextTypes, SupportedFlags } from '../OgoneLexer.ts';
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test('ogone-lexer can parse attribute unquoted', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const source = 'a=value';
  const content = `<div ${source}></div>`;
  const contexts = lexer.parse(content, url);
  if (contexts && contexts.length) {
    try {
      const attribute = contexts.find((context) => context.type === ContextTypes.Attribute);
      const attributeName = contexts.find((context) => context.type === ContextTypes.AttributeName);
      const attributeUnquoted = contexts.find((context) => context.type === ContextTypes.AttributeValueUnquoted);
      if (attribute
        && attributeName
        && attributeUnquoted) {
          const target = {
            type: ContextTypes.Attribute,
            source,
            position: { start: 5, end: 12, line: 0, column: 5 },
          };
          const unquotedPosition = { start: 7, end: 12, line: 0, column: 7 };
          const attributeNamePosition = { start: 5, end: 6, line: 0, column: 5 };
          assertEquals(target.type, attribute.type);
          assertEquals(target.source, attribute.source);
          assertEquals(target.position, attribute.position);
          assertEquals(attribute.children[0].source, 'value');
          assertEquals(attribute.related[0].source, 'a');
          assertEquals(attributeName.position, attributeNamePosition);
          assertEquals(attributeUnquoted.position, unquotedPosition);
      } else {
        throw new Error('OgoneLexer - test failed');
      }
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error('OgoneLexer - test failed');
  }
});