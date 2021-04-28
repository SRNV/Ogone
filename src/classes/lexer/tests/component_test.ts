import { OgoneLexer, ContextTypes, SupportedFlags } from '../OgoneLexer.ts';
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);
// TODO
Deno.test('ogone-lexer can parse a basic component', () => {
  const lexer = new OgoneLexer((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `
import component A from './b.o3';

<template>
  <div> $\{this.basic} </div>
</template>
<proto>
  declare:
    public basic: string = 'this is a basic component';
</proto>
  `;
  const contexts = lexer.parse(content, url);
  if (contexts && contexts.length) {
    try {
      // console.warn(contexts);
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error('OgoneLexer - Failed to retrieve Node Context');
  }
});
