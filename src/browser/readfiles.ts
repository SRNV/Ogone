import components from "./component.ts";
import ogone from "./ogone.ts";
import router from "./router.ts";
import websocket from "./websocket.ts";
import devTool from "./dev-tool/index.ts";

export const browserBuild = (isProduction: boolean, opts?: any): string => {
  if (isProduction) {
    return [
      components,
      ogone,
      router,
    ].join("\n");
  }
  return [
    components,
    ogone,
    router,
    // TODO fix HMR
    // use std websokect
    // websocket,
    opts.hasDevtool ? devTool({}) : "",
  ].join("\n");
};

export const template: string = `
<html>
  <head>
      {{ head }}
      {{ script }}
  </head>
  <body>
      {{ dom }}
  </body>
</html>
`;
