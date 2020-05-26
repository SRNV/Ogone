import iterator from "../src/lib/iterator.js";
import { assertEquals } from "https://raw.githubusercontent.com/denoland/deno/master/std/testing/asserts.ts";

Deno.test("- iterator increments", () => {
  const def = iterator.next().value;
  const a = iterator.next().value;
  const b = iterator.next().value;
  assertEquals(a, b - 1);
});
