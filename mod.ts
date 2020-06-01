import { serve } from "https://deno.land/std@v0.42.0/http/server.ts";
import { getHeaderContentTypeOf } from "./utils/extensions-resolution.ts";
import renderApp from "./src/renderApp.ts";
import { browserBuild, template } from "./src/browser/readfiles.ts";
import Ogone from "./src/ogone/index.ts";
import { existsSync } from "./utils/exists.ts";
import compile from "./src/ogone/compilation/index.ts";
import HMR from "./src/lib/hmr/index.ts";

interface OgoneOptions {
  /**
   * @property entrypoint
   * @description path to the root component, this one has to be an untyped component
   */
  entrypoint: string;

  /**
   * @property port
   * @description which port to use for development
   */
  port: number;

  /**
   * @property static
   * @description allow user to serve files to client
   */
  static?: string;

  /**
   * @property static
   * @description allow user to serve files to client
   */
  modules: string;
}
type OgoneAPIType = {
  /**
   * @function run
   * @description run the application in development
   */
  run: (opts: OgoneOptions) => Promise<void>;
};

async function run(opts: OgoneOptions): Promise<void> {
  Ogone.config = opts || Ogone.config;
  const port: number = Ogone.config.port;
  const modulesPath: string = Ogone.config.modules;
  // open the server
  const server = serve({ port });

  // start rendering Ogone system
  if (!Ogone.config.entrypoint || !existsSync(Ogone.config.entrypoint)) {
    server.close();
    throw new Error(
      "[Ogone] can't find entrypoint, please specify a correct path",
    );
  }
  if (!modulesPath || !existsSync(modulesPath.slice(1))) {
    server.close();
    throw new Error(
      "[Ogone] can't find modules, please specify in options a correct path: run({ modules: '/path/to/modules' })",
    );
  }
  if (!Ogone.config.modules.startsWith("/")) {
    server.close();
    throw new Error(
      "[Ogone] modules path has to start with: /",
    );
  }
  if (!("port" in Ogone.config) || typeof Ogone.config.port !== "number") {
    throw new Error(
      "[Ogone] please provide a port for the server. it has to be a number.",
    );
  }
  //start compilation of o3 files
  await compile(Ogone.config.entrypoint);
  const stylesDev = Array.from(Ogone.components.entries())
    .map((
      [p, component],
    ) =>
      `<style id="${component.uuid}">
  ${component.style.join("\n")}
</style>`
    ).join("\n");
  const stylesProd = Array.from(Ogone.components.entries()).map((
    [p, component],
  ) => component.style.join("\n")).join("\n");
  const esm = Array.from(Ogone.components.entries()).map(([p, component]) =>
    component.esmExpressions
  ).join("\n");
  const style = stylesDev ? stylesDev : `<style>${(stylesProd)}</style>`;
  const rootComponent = Ogone.components.get(Ogone.config.entrypoint);
  if (
    rootComponent && ["router", "store", "async"].includes(rootComponent.type)
  ) {
    const RootNodeTypeErrorException = new TypeError(
      `[Ogone] the component provided in the entrypoint option has type: ${rootComponent.type}, entrypoint option only supports normal component`,
    );
    throw RootNodeTypeErrorException;
  }
  const scriptDev = `
  ${browserBuild}
  ${Ogone.datas.join("\n")}
  ${Ogone.contexts.reverse().join("\n")}
  ${Ogone.classes.reverse().join("\n")}
  ${Ogone.customElements.join("\n")}
  Promise.all([
    ${esm}
  ]).then(() => {
    document.body.append(
      document.createElement("template", {
        is: "${rootComponent.uuid}-nt",
      })
    );
  });
  `;
  const scriptProd = `
  ${browserBuild}
  ${esm}
  ${Ogone.datas.join("\n")}
  ${Ogone.contexts.reverse().join("\n")}
  ${Ogone.classes.reverse().join("\n")}
  ${Ogone.customElements.join("\n")}
  `;
  // in production DOM has to be
  // <template is="${rootComponent.uuid}-nt"></template>
  const DOMDev = ` `;
  const DOMProd = `<template is="${rootComponent.uuid}-nt"></template>;`;
  let head = `
    ${style}
    <script type="module">
      ${(scriptDev || scriptProd).trim()}
    </script>`;
  let body = template
    .replace(/%%head%%/, head)
    .replace(/%%dom%%/, (DOMDev || DOMProd));

  // Ogone is now ready to serve
  console.warn(`[Ogone] Success http://localhost:${port}/`);
  for await (const req of server) {
    const pathToPublic: string = `${Deno.cwd()}/${req.url}`;
    let isUrlFile: boolean = existsSync(pathToPublic);
    switch (true) {
      case req.url.startsWith(Ogone.config.modules):
        const denoReqUrl = req.url.slice(1).split("?")[0];
        HMR(denoReqUrl);
        req.respond({
          body: Deno.readTextFileSync(denoReqUrl),
          headers: new Headers([
            getHeaderContentTypeOf(denoReqUrl),
            ["X-Content-Type-Options", "nosniff"],
          ]),
        });
        break;
      case isUrlFile && req.url.startsWith("/public/"):
        req.respond({
          body: Deno.readTextFileSync(pathToPublic),
          headers: new Headers([
            getHeaderContentTypeOf(req.url),
            ["X-Content-Type-Options", "nosniff"],
          ]),
        });
        break;
      default:
        req.respond({ body: renderApp(body) });
        break;
    }
  }
}
const OgoneAPI: OgoneAPIType = {
  run,
};
export default OgoneAPI;
