import devTool from "./dev-tool/index.ts";
const components = Deno.readTextFileSync(new URL('./component.ts', import.meta.url));
const websocket = Deno.readTextFileSync(new URL('./websocket.ts', import.meta.url));
const ogone = Deno.readTextFileSync(new URL('./ogone.ts', import.meta.url));
const router = Deno.readTextFileSync(new URL('./router.ts', import.meta.url));
interface OgoneRuntime {
  ogone: string;
  components: string;
  router: string;
  devTool?: string;
}
export const browserBuild = (isProduction: boolean, opts?: any): OgoneRuntime => {
  if (isProduction) {
    return {
      components,
      ogone,
      router,
      devTool: '',
    }
  }
  return {
    components,
    ogone,
    router,
    devTool: opts.hasDevtool ? devTool({}) : "",
  }
};

export const template: string = `
<html>
  <head>
      {% head %}
      {% script %}
  </head>
  <body>
      {% dom %}
  </body>
</html>
`;
