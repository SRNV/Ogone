import iterator from "../lib/iterator.ts";
import { assertEquals } from "../deps.ts";

Deno.test("- iterator increments", () => {
  const def = iterator.next().value;
  const a = iterator.next().value;
  const b = iterator.next().value;
  assertEquals(a, b - 1);
});
