import { OgoneLexer, ContextTypes } from '../OgoneLexer.ts';
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);
Deno.test('ogone-lexer supports nodes', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<div></div>`;
  const contexts = lexer.parse(content, url);
  if (contexts && contexts.length) {
    const [tagname, node,] = contexts;
    assertEquals(tagname.source, 'div');
    assertEquals(tagname.type, ContextTypes.NodeName);
    assertEquals(tagname.position, { start: 1, end: 4, line: 0, column: 1 });
    assertEquals(node.position, { start: 0, end: 5, line: 0, column: 0 });
    assertEquals(node.related.includes(tagname), true);
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});
Deno.test('ogone-lexer can retrieve node names: template', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<template></template>`;
  const contexts = lexer.parse(content, url);
  if (contexts && contexts.length) {
    const [tagname, node,] = contexts;
    assertEquals(tagname.source, 'template');
    assertEquals(tagname.type, ContextTypes.NodeName);
    assertEquals(tagname.position, { start: 1, end: 9, line: 0, column: 1 });
    assertEquals(node.position, { start: 0, end: 10, line: 0, column: 0 });
    assertEquals(node.related.includes(tagname), true);
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});
Deno.test('ogone-lexer can retrieve node names: proto', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<proto></proto>`;
  const contexts = lexer.parse(content, url);
  if (contexts && contexts.length) {
    const [tagname, node,] = contexts;
    assertEquals(tagname.source, 'proto');
    assertEquals(tagname.type, ContextTypes.NodeName);
    assertEquals(tagname.position, { start: 1, end: 6, line: 0, column: 1 });
    assertEquals(node.position, { start: 0, end: 7, line: 0, column: 0 });
    assertEquals(node.related.includes(tagname), true);
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});
Deno.test('ogone-lexer tagname is accessible through the related property', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<proto></proto>`;
  const contexts = lexer.parse(content, url);
  if (contexts && contexts.length) {
    try {
      const [, node,] = contexts;
      const [tagname] = node.related;
      assertEquals(tagname.source, 'proto');
      assertEquals(tagname.type, ContextTypes.NodeName);
      assertEquals(tagname.position, { start: 1, end: 6, line: 0, column: 1 });
      assertEquals(node.position, { start: 0, end: 7, line: 0, column: 0 });
      assertEquals(node.related.includes(tagname), true);
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});

Deno.test('ogone-lexer should use the onError function when a node isnt finished', () => {
  let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    result = true;
  });
  const content = `<div`;
  const contexts = lexer.parse(content, url);
  if (!result) {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});

Deno.test('ogone-lexer shouldnt consider this as a node', () => {
  let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    result = true;
  });
  const content = `<:div`;
  const contexts = lexer.parse(content, url);
  if (!result || contexts.length) {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});

Deno.test('ogone-lexer shouldnt consider this as a node 2', () => {
  let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    result = true;
  });
  const content = `<!div`;
  const contexts = lexer.parse(content, url);
  if (!result || contexts.length) {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});

Deno.test('ogone-lexer shouldnt consider this as a node 3', () => {
  let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    result = true;
  });
  const content = `< div`;
  const contexts = lexer.parse(content, url);
  if (!result || contexts.length) {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});

Deno.test('ogone-lexer should use onError when anything is typed on a closing node', () => {
  let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    result = true;
  });
  const content = `<div></div nothing should appear here >`;
  const contexts = lexer.parse(content, url);
  if (!result) {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});

Deno.test('ogone-lexer should fail when anything is typed on a closing node 2', () => {
  let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    result = true;
  });
  const content = `<div></div a>`;
  const contexts = lexer.parse(content, url);
  if (!result) {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});

Deno.test('ogone-lexer should support line breaks into closing tag', () => {
  let supported = true;
  const content = `<div></div


    >`;
  new OgoneLexer((reason, cursor, context) => {
    supported = false;
  }).parse(content, url);
  if (!supported) {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});

Deno.test('ogone-lexer should use onError function when a node is not closed', () => {
  let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    result = true;
  });
  const content = `<div></div><div><p><p></p></p>`;
  const contexts = lexer.parse(content, url);
  if (!result) {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});
