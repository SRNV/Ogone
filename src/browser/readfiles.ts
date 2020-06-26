import components from "./component.ts";
import ogone from "./ogone.ts";
import router from "./router.ts";
import oscillator from "./oscillator.ts";
import websocket from "./websocket.ts";
import devTool from "./dev-tool.ts";

export const browserBuild = (isProduction: boolean, opts?: any): string => {
  if (isProduction) {
    return [
      components,
      ogone,
      router,
    ].join("\n")
  }
  return [
    components,
    ogone,
    router,
    oscillator,
    websocket,
    opts.hasDevtool ? devTool : '',
  ].join("\n")
};

export const template: string = `
<html>
  <head>
      %%head%%
  </head>
  <body>
      %%dom%%
  </body>
</html>
`;
