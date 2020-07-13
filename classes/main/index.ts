import { Configuration } from "../config/index.ts";
import { serve } from "../../deps.ts";
import { existsSync } from "../../utils/exists.ts";
import EnvServer from "../env/EnvServer.ts";

export default class Ogone extends EnvServer {
  constructor(opts: Configuration) {
    super(opts);
    if (!opts) {
      this.error("run method is expecting for 1 argument, got 0.");
    }
    const port: number = this.port;
    const modulesPath: string = this.modules;
    // open the server
    const server = serve({ port });

    // start rendering Ogone system
    if (!this.entrypoint || !existsSync(this.entrypoint)) {
      server.close();
      this.error(
        `can't find entrypoint, please specify a correct path. input: ${this.entrypoint}`,
      );
    }
    if (!modulesPath || !existsSync(modulesPath.slice(1))) {
      server.close();
      this.error(
        "can't find modules, please specify in options a correct path: run({ modules: '/path/to/modules' }). \nnote: the path should be absolute",
      );
    }
    if (!this.modules.startsWith("/")) {
      server.close();
      this.error(
        "modules path has to start with: /",
      );
    }
    if (!("port" in Configuration) || typeof this.port !== "number") {
      this.error(
        "please provide a port for the server. it has to be a number.",
      );
    }
    if (opts.build) {
      if (!existsSync(opts.build)) {
        this.error(
          `build: can\'t find given path.\n\tinput: ${opts.build}`,
        );
      }
      const stats = Deno.statSync(opts.build);
      if (stats.isFile) {
        this.error(
          `build: build destination should be a directory. \n\tinput: ${opts.build}`,
        );
      }
      //start compilation of o3 files
      this.setEnv("production");
      this.setDevTool(false);
      this.compile(this.entrypoint, true)
        .then(async () => {
          //start compilation of o3 files
          const b = await this.getBuild();
          /*
          // TODO WAIT FOR DENO TO FIX COMPILER API
          const application = `${opts.build}/index.html`;
          Deno.writeTextFileSync(application, b);
          this.warn(
            `your application successfully rendered. ${application}`,
          );
          if (opts.serve) {
            this.runService(application, server, opts.port);
          } else {
            server.close();
            Deno.exit();
          }
          */
        });
    } else {
      //start compilation of o3 files
      this.setDevTool(this.devtool as boolean);
      this.compile(this.entrypoint, true)
        .then(() => {
          // Ogone is now ready to serve
          this.use(server, port);
        });
    }
  }
}
