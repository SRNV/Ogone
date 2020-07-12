import { serve } from "../../deps.ts";
import Ogone from "../../src/ogone/index.ts";
import { existsSync } from "../../utils/exists.ts";
import EnvServer from "../../lib/env/EnvServer.ts";
import { Configuration } from '../../classes/config/index.ts';
import { Utils } from '../../classes/utils/index.ts';
type OgoneOptions = Omit<typeof Configuration, 'setConfig' | 'prototype'>;

export default abstract class Api {
    public static async run(opts: OgoneOptions): Promise<void> {
        Configuration.setConfig(opts || Ogone.config);
        const port: number = Configuration.port;
        const modulesPath: string = Configuration.modules;
        // open the server
        const server = serve({ port });

        // start rendering Ogone system
        if (!Configuration.entrypoint || !existsSync(Configuration.entrypoint)) {
          server.close();
          Utils.error(
            `can't find entrypoint, please specify a correct path. input: ${Configuration.entrypoint}`,
          );
        }
        if (!modulesPath || !existsSync(modulesPath.slice(1))) {
          server.close();
          Utils.error(
            "can't find modules, please specify in options a correct path: run({ modules: '/path/to/modules' }). \nnote: the path should be absolute",
          );
        }
        if (!Configuration.modules.startsWith("/")) {
          server.close();
          Utils.error(
            "modules path has to start with: /",
          );
        }
        if (!("port" in Configuration) || typeof Configuration.port !== "number") {
          Utils.error(
            "please provide a port for the server. it has to be a number.",
          );
        }
        if (opts.build) {
          if (!existsSync(opts.build)) {
            Utils.error(
              `build: can\'t find given path.\n\tinput: ${opts.build}`,
            );
          }
          const stats = Deno.statSync(opts.build);
          if (stats.isFile) {
            Utils.error(
              `build: build destination should be a directory. \n\tinput: ${opts.build}`,
            );
          }
          //start compilation of o3 files
          EnvServer.setEnv("production");
          EnvServer.setDevTool(false);
          EnvServer.compile(Configuration.entrypoint, true)
            .then(async () => {
              //start compilation of o3 files
              const b = await EnvServer.getBuild();
              /*
              // TODO WAIT FOR DENO TO FIX COMPILER API
              const application = `${opts.build}/index.html`;
              Deno.writeTextFileSync(application, b);
              console.warn(
                "your application successfully rendered.",
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
          EnvServer.setDevTool(Configuration.devtool as boolean);
          EnvServer.compile(Configuration.entrypoint, true)
            .then(() => {
              // Ogone is now ready to serve
              EnvServer.use(server, port);
            });
        }
      }
}