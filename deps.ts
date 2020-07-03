// TODO link deps.ts to project
export { existsSync } from "https://deno.land/std@v0.58.0/fs/exists.ts";
export { serve } from "https://deno.land/std@v0.58.0/http/server.ts";
export { join } from "https://raw.githubusercontent.com/denoland/deno/master/std/path/mod.ts";
export { Server } from "https://deno.land/std@v0.58.0/http/server.ts";
export {
  WebSocket,
  WebSocketServer,
} from "https://deno.land/x/websocket/mod.ts";
export { YAML } from "https://raw.githubusercontent.com/eemeli/yaml/master/src/index.js";
export * as SUI from "https://raw.githubusercontent.com/jeanlescure/short_uuid/master/mod.ts";
export {
  assertEquals,
  assertThrows,
  assertStrContains,
  assertArrayContains,
  fail,
} from "https://raw.githubusercontent.com/denoland/deno/master/std/testing/asserts.ts";
export { compile as sassCompiler } from "https://deno.land/x/sass/mod.ts";
import { parse } from "https://raw.githubusercontent.com/divy-work/denolus/master/src/parser/index.ts";
import { compile } from "https://raw.githubusercontent.com/divy-work/denolus/master/src/compiler/index.ts";

export function denolusCompiler(code: string) {
  return compile(parse(code));
}
