import DOMElementDescriber from '../src/classes/DOMElementDescriber.ts';
import { assertEquals } from '../deps.ts';

Deno.test('DOMDescriber can parse arrow functions', () => {
  const test = DOMElementDescriber.getArrowFunctionDescription((number, i, array = [1, 0]) => 10);
  assertEquals(test, {
    index: "i",
    currentValue: "number",
    array: "array",
    arrayValue: "[1, 0]"
  });
});

Deno.test('DOMDescriber doesn\'t parse normal functions', () => {
  const test = DOMElementDescriber.getArrowFunctionDescription(function(number, i, array = [1, 0]) {
    return 10
  });
  assertEquals(test, null);
});

Deno.test('DOMDescriber only accept three argument', () => {
  const test0 = DOMElementDescriber.getArrowFunctionDescription(() => 0);
  const test1 = DOMElementDescriber.getArrowFunctionDescription((n: unknown) => 0);
  const test2 = DOMElementDescriber.getArrowFunctionDescription((n: unknown, i: number) => 0);
  const test4 = DOMElementDescriber.getArrowFunctionDescription((n: unknown, i: number, a: unknown[], x: null) => 0);
  assertEquals(test0, null);
  assertEquals(test1, null);
  assertEquals(test2, null);
  assertEquals(test4, null);
});