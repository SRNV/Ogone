import { OgoneLexer, ContextTypes } from '../OgoneLexer.ts';
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test('ogone-lexer supports comments', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = '//';
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const [comment] = contexts;
    assertEquals(comment.type, ContextTypes.Comment);
    assertEquals(comment.position.line, 0);
    assertEquals(comment.position.column, 0);
    assertEquals(comment.position.start, 0);
    assertEquals(comment.position.end, content.length);
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Comment context');
  }
});

Deno.test('ogone-lexer supports multiple comments', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `
  // 1
  // 2
  // 3
  `;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const [,, comment,, comment2,, comment3] = contexts;
    assertEquals(comment.type, ContextTypes.Comment);
    assertEquals(comment2.type, ContextTypes.Comment);
    assertEquals(comment3.type, ContextTypes.Comment);

    assertEquals(comment.source, '// 1\n');
    assertEquals(comment2.source, '// 2\n');
    assertEquals(comment3.source, '// 3\n');
  } else {
    throw new Error('OgoneLexer - Failed to retrieve MultipleComments context');
  }
});

Deno.test('ogone-lexer supports comment blocks', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `/** supported! */`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const [commentBlock] = contexts;
    assertEquals(commentBlock.type, ContextTypes.CommentBlock);
    assertEquals(commentBlock.source, content.trim());
  } else {
    throw new Error('OgoneLexer - Failed to retrieve MultipleComments context');
  }
});

Deno.test('ogone-lexer supports comment blocks with multi lines', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `
/**
 * we will use this lexer in different engine
 * it shouldn't import anything
 * to make it isomorphic with Node and Deno
 */
  `;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const commentBlock = contexts.find((comment) => comment.type === ContextTypes.CommentBlock);
    if (!commentBlock) {
      throw new Error('Failed to retrieve the comment block')
    }
    assertEquals(commentBlock.source, content.trim());
    assertEquals(commentBlock.position, { start: 1, end: 130, line: 1, column: 0 });
  } else {
    throw new Error('OgoneLexer - Failed to retrieve MultipleComments context');
  }
});
Deno.test('ogone-lexer should use the onError function when a html comment isnt finished', () => {
  let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    result = true;
  });
  const content = `<!--`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (!result) {
    throw new Error('OgoneLexer - Failed to retrieve Space context');
  }
});

Deno.test('ogone-lexer not a comment', () => {
    let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    result = true;
  });
  const content = `<! --`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (!result || contexts.length) {
    throw new Error('OgoneLexer - Failed to retrieve Space context');
  }
});


Deno.test('ogone-lexer not a comment 2', () => {
    let result = false;
  const lexer = new OgoneLexer((reason, cursor, context) => {
    result = true;
  });
  const content = `<!- -`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (!result || contexts.length) {
    throw new Error('OgoneLexer - Failed to retrieve Space context');
  }
});


Deno.test('ogone-lexer supports html comments', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<!-- -->`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const [comment] = contexts;
    assertEquals(comment.type, ContextTypes.HTMLComment);
    assertEquals(comment.position, { start: 0, end: 8, line: 0, column: 0 });
    assertEquals(comment.source, content);
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Space context');
  }
});

Deno.test('ogone-lexer - only one html comment', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<!-- 'nothing else' "// " -->`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length && contexts.length === 1) {
    const [comment] = contexts;
    assertEquals(comment.type, ContextTypes.HTMLComment);
    assertEquals(comment.position, { start: 0, end: 29, line: 0, column: 0 });
    assertEquals(comment.source, content);
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Space context');
  }
});
Deno.test('ogone-lexer supports compact html comments', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<!---->`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length && contexts.length === 1) {
    const [comment] = contexts;
    assertEquals(comment.type, ContextTypes.HTMLComment);
    assertEquals(comment.position, { start: 0, end: 7, line: 0, column: 0 });
    assertEquals(comment.source, content);
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Space context');
  }
});
Deno.test('ogone-lexer supports multiple comments', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<!---->
<!---->
<!--
    with line breaks
-->`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    const [comment,,comment2,,comment3] = contexts;
    assertEquals(comment.type, ContextTypes.HTMLComment);
    assertEquals(comment2.type, ContextTypes.HTMLComment);
    assertEquals(comment3.type, ContextTypes.HTMLComment);
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Space context');
  }
});