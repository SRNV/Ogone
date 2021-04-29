import { OgoneLexer, ContextTypes, SupportedFlags } from '../OgoneLexer.ts';
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test('ogone-lexer can retrieve node flags', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<proto
    ${SupportedFlags.join('\n    ')}
    not-a-flag
    ></proto>`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    try {
      const { length } = SupportedFlags;
      const { length: parsedFlagsLength } = contexts.filter((context) => context.type === ContextTypes.Flag);
      assertEquals(length, parsedFlagsLength);
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Flag Context');
  }
});

Deno.test('ogone-lexer flag name is accessible through related', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const source = 'then:flag:name';
  const content = `<proto --${source}></proto>`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    try {
      const flag = contexts.find((context) => context.type === ContextTypes.Flag);
      if (!flag) {
        throw new Error(`Failed to retrieve flags value`);
      }
      const [flagName]  = flag.related;
      assertEquals(flagName.type, ContextTypes.FlagName);
      assertEquals(flagName.source, source);
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Flag Context');
  }
});

Deno.test('ogone-lexer can retrieve flags value', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<proto --if={true}></proto>`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    try {
      const flag = contexts.find((context) => context.type === ContextTypes.Flag);
      if (!flag) {
        throw new Error(`Failed to retrieve flags value`);
      }
      const target = {
        type: ContextTypes.Flag,
        source: '--if={true}',
        position: { start: 7, end: 18, line: 0, column: 7 },
        children: [
          {
            type: 'CurlyBraces',
            source: '{true}',
          }
        ],
        related: [
          {
            type: 'FlagName',
            source: 'if',
          }
        ],
      }
      assertEquals(target.position, flag.position);
      assertEquals(target.source, flag.source);
      assertEquals(target.type, flag.type);
      assertEquals(target.children[0].source, flag.children[0].source);
      assertEquals(target.related[0].source, flag.related[0].source);
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Flag Context');
  }
});

Deno.test('ogone-lexer can retrieve spread value', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<proto { ...this.spread }></proto>`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    try {
      const flag = contexts.find((context) => context.type === ContextTypes.FlagSpread);
      if (!flag) {
        throw new Error(`Failed to retrieve spread value`);
      }
      assertEquals(flag.position, { start: 7, end: 25, line: 0, column: 7 });
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Flag Context');
  }
});

Deno.test('ogone-lexer can retrieve spread value on a auto-closing tag', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<proto { ...this.spread }/>`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    try {
      const flag = contexts.find((context) => context.type === ContextTypes.FlagSpread);
      if (!flag) {
        throw new Error(`Failed to retrieve spread value`);
      }
      assertEquals(flag.position, { start: 7, end: 25, line: 0, column: 7 });
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Flag Context');
  }
});

Deno.test('ogone-lexer can retrieve spread value without spaces', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `<proto {...this.spread}/>`;
  const contexts = lexer.parse(content,  { type: 'component' });
  if (contexts && contexts.length) {
    try {
      const flag = contexts.find((context) => context.type === ContextTypes.FlagSpread);
      if (!flag) {
        throw new Error(`Failed to retrieve spread value`);
      }
      assertEquals(flag.position, { start: 7, end: 23, line: 0, column: 7 });
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Flag Context');
  }
});
