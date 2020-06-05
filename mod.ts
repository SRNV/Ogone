import { serve } from "https://deno.land/std@v0.42.0/http/server.ts";
import { getHeaderContentTypeOf } from "./utils/extensions-resolution.ts";
import renderApp from "./src/renderApp.ts";
import Ogone from "./src/ogone/index.ts";
import { existsSync } from "./utils/exists.ts";
import compile from "./src/ogone/compilation/index.ts";
import HMR, { HCR } from "./src/lib/hmr/index.ts";
import Env from "./src/lib/env/Env.ts";

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
  const bundle = await compile(Ogone.config.entrypoint);
  Env.setBundle(bundle);
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
        req.respond({ body: renderApp(Env.application) });
        break;
    }
  }
}
const OgoneAPI: OgoneAPIType = {
  run,
};
export default OgoneAPI;
