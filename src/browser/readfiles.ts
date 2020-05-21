export const browserBuild = ([
  // readTextFileSync uses absolute path;
  Deno.readTextFileSync("./src/browser/component.js"),
  Deno.readTextFileSync("./src/browser/ogone.js"),
  Deno.readTextFileSync("./src/browser/router.js"),
  Deno.readTextFileSync("./src/browser/websocket.js"),
]).join("\n");
export const template = Deno.readTextFileSync("./src/browser/index.html");
