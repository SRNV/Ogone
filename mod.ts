import { serve } from "./deps.ts";
import Ogone from "./src/ogone/index.ts";
import { existsSync } from "./utils/exists.ts";
import EnvServer from "./lib/env/EnvServer.ts";
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
   * @property modules
   * @description path to all modules, this is usefull for the hmr
   */
  modules: string;
  /**
   * @property head
   * @description insert tags in the <head> of the html
   */
  head?: string;
  /**
   * @property build
   * @description output destination for production
   */
  build?: string;
  /**
   * @property serve
   * @description should ogone serve after building the application
   */
  serve?: boolean;
  /**
   * @property compileCSS
   * @description should ogone compile the css inside the static folder
   * requires static folder to be provided
   */
  compileCSS?: boolean;
  /**
   * @property minifyCSS
   * @description should ogone minify the CSS ? including multiple spaces, tabs erased, and new lines erased
   */
  minifyCSS?: boolean;
  /**
   * @property devtool
   * @description if you want to use devtool.
   */
  devtool?: boolean;
  /**
   * @property controllers
   * @description paths to the controllers
   */
  controllers?: string[];
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
      `[Ogone] can't find entrypoint, please specify a correct path. input: ${Ogone.config.entrypoint}`,
    );
  }
  if (!modulesPath || !existsSync(modulesPath.slice(1))) {
    server.close();
    throw new Error(
      "[Ogone] can't find modules, please specify in options a correct path: run({ modules: '/path/to/modules' }). \nnote: the path should be absolute",
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
  if (opts.build) {
    if (!existsSync(opts.build)) {
      throw new Error(
        `[Ogone] build: can\'t find given path.\n\tinput: ${opts.build}`,
      );
    }
    const stats = Deno.statSync(opts.build);
    if (stats.isFile) {
      throw new Error(
        `[Ogone] build: build destination should be a directory. \n\tinput: ${opts.build}`,
      );
    }
    //start compilation of o3 files
    EnvServer.setEnv("production");
    EnvServer.setDevTool(false);
    EnvServer.compile(Ogone.config.entrypoint, true)
      .then(async () => {
        //start compilation of o3 files
        const b = await EnvServer.getBuild();
        /*
        // TODO WAIT FOR DENO TO FIX COMPILER API
        const application = `${opts.build}/index.html`;
        Deno.writeTextFileSync(application, b);
        console.warn(
          "[Ogone] your application successfully rendered.",
          application,
        );
        if (opts.serve) {
          EnvServer.serve(application, server, opts.port);
        } else {
          server.close();
          Deno.exit();
        }
        */
      });
  } else {
    //start compilation of o3 files
    EnvServer.setDevTool(Ogone.config.devtool);
    EnvServer.compile(Ogone.config.entrypoint, true)
      .then(() => {
        // Ogone is now ready to serve
        EnvServer.use(server, port);
      });
  }
}

const OgoneAPI: OgoneAPIType = {
  run,
};
export default OgoneAPI;