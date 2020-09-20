import { Configuration } from "../config/index.ts";
import { serve } from "../../deps.ts";
import { existsSync } from "../../utils/exists.ts";
import EnvServer from "../env/EnvServer.ts";
import type { OgoneConfiguration } from "../../.d.ts";

export default class Ogone extends EnvServer {
  static files: string[] = [];
  static directories: string[] = [];
  static controllers: { [key: string]: any } = {};
  static main: string = "";
  public readonly contributorMessage: string = `0.24.0: Ogone is actively looking for collaborators.
    Any advice, any problem report related to the development, to the use of Ogone, will be studied and will get a response as soon as possible.
    note that if you come across a bug but don't report it, it may never be resolved.
    Thank you for your interest, and your participation in this project.
    a problem, a question or an idea ? please open an issue on the Ogone github repo: https://github.com/SRNV/Ogone/issues`;
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
          // message for contributions, ideas, issues and any help.
          this.message(this.contributorMessage);
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
          // message for contributions, ideas, issues and any help.
          this.message(this.contributorMessage);
          // Ogone is now ready to serve
          this.use(server, port);
        });
    }
  }
}
