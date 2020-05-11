export const browserBuild = ([
  // readTextFileSync uses absolute path;
  Deno.readTextFileSync('./break/src/browser/component.js'),
  Deno.readTextFileSync('./break/src/browser/ogone.js'),
  // Deno.readTextFileSync('./break/src/browser/nodeManager.js'),
  Deno.readTextFileSync('./break/src/browser/websocket.js'),
]).join('\n');
export const template = Deno.readTextFileSync('./break/src/browser/index.html');