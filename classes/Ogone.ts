import { Configuration } from "./Configuration.ts";
import { serve } from "../deps.ts";
import { existsSync } from "../utils/exists.ts";
import EnvServer from "./EnvServer.ts";
import type { OgoneConfiguration } from "../.d.ts";
import messages from "../chore/messages.ts";

export default class Ogone extends EnvServer {
  static files: string[] = [];
  static directories: string[] = [];
  static controllers: { [key: string]: any } = {};
  static main: string = "";
  public readonly contributorMessage: { [k: string]: string } = messages;
  static readonly allowedTypes = [
    // controls the location of the web page
    "router",
    // controls data of the application
    "store",
    // controls the request to the gateway
    "controller",
    // to use promise to rule the component
    "async",
    "component",
  ];
  constructor(opts: OgoneConfiguration) {
    super();
    if (!opts) {
      this.error("run method is expecting for 1 argument, got 0.");
    }
    Configuration.setConfig(opts);
    Ogone.main = `${Deno.cwd()}${Configuration.entrypoint}`;
    const port: number = Configuration.port;
    const modulesPath: string = Configuration.modules;
    // open the server
    const server = serve({ port });

    // start rendering Ogone system
    if (!Configuration.entrypoint || !existsSync(Configuration.entrypoint)) {
      server.close();
      this.error(
        `can't find entrypoint, please specify a correct path. input: ${Configuration.entrypoint}`,
      );
    }
    if (!modulesPath || !existsSync(modulesPath.slice(1))) {
      server.close();
      this.error(
        "can't find modules, please specify in options a correct path: run({ modules: '/path/to/modules' }). \nnote: the path should be absolute",
      );
    }
    if (!Configuration.modules.startsWith("/")) {
      server.close();
      this.error(
        "modules path has to start with: /",
      );
    }
    if (!("port" in Configuration) || typeof Configuration.port !== "number") {
      this.error(
        "please provide a port for the server. it has to be a number.",
      );
    }
    // message for contributions, ideas, issues and any help.
    Object.entries(this.contributorMessage)
      .map(([version, message]: any) => this.message(`[${version}] ${message}`))
    if (opts.build) {
      if (!existsSync(opts.build)) {
        Deno.mkdirSync(opts.build);
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
      this.compile(Configuration.entrypoint, true)
        .then(async () => {
          //start compilation of o3 files
          const b = await this.getBuild();
          const application = `${opts.build}/index.html`;
          Deno.writeTextFileSync(application, b as string);
          this.success(
            `your application successfully rendered. ${application}`,
          );
          if (opts.serve) {
            this.runService(application, server, opts.port);
          } else {
            server.close();
            Deno.exit();
          }
        });
    } else {
      //start compilation of o3 files
      this.setDevTool(Configuration.devtool as boolean);
      this.compile(Configuration.entrypoint, true)
        .then(() => {

          // Ogone is now ready to serve
          this.use(server, port);
        });
    }
  }
}
