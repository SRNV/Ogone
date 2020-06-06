import { serve } from "https://deno.land/std@v0.42.0/http/server.ts";
import Ogone from "./src/ogone/index.ts";
import { existsSync } from "./utils/exists.ts";
import EnvServer from './src/lib/env/EnvServer.ts';
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
  EnvServer.compile(Ogone.config.entrypoint, true)
    .then(() => {
      // Ogone is now ready to serve
      EnvServer.use(server, port);
    });
}
const OgoneAPI: OgoneAPIType = {
  run,
};
export default OgoneAPI;
