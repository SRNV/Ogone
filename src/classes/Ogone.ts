import { Configuration } from "./Configuration.ts";
import { serve } from "../../deps/deps.ts";
import { existsSync } from "../../utils/exists.ts";
import EnvServer from "./EnvServer.ts";
import type { OgoneConfiguration } from "../.d.ts";
import messages from "../../docs/chore/messages.ts";
import { Flags } from "../enums/flags.ts";

export default class Ogone extends EnvServer {
  static files: string[] = [];
  static directories: string[] = [];
  static controllers: { [key: string]: any } = {};
  static main: string = "";
  public readonly contributorMessage: { [k: string]: string } = messages;
  static readonly allowedTypes = [
    // first component (root component)
    "app",
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
    try {
      if (!opts) {
        this.error("run method is expecting for 1 argument, got 0.");
      }
      Configuration.setConfig(opts);
      Ogone.main = `${Deno.cwd()}${Configuration.entrypoint}`;
      // message for contributions, ideas, issues and any help.
      if (Deno.args.includes(Flags.RELEASE)) {
        Object.entries(this.contributorMessage)
          .map(([version, message]: any) => this.message(`[${version}] ${message}`))
      }

      if (opts.build) {
        if (!existsSync(opts.build)) {
          Deno.mkdirSync(opts.build);
        }
        if (Deno.build.os !== "windows") {
          Deno.chmodSync(opts.build, 0o777);
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
            /*
            TODO use workers for build
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
            */
          }).then(() => {
            // message for any interested developer.
            this.infos('Love Ogone\'s project ? Join the discord here: https://discord.gg/gCnGzh2wMc');
          });
      } else {
        //start compilation of o3 files
        this.setDevTool(Configuration.devtool as boolean);
        this.listenLSPWebsocket();
        this.compile(Configuration.entrypoint, true)
          .then(() => {
            // Ogone is now ready to serve
            this.startDevelopment();
          }).then(() => {
            // message for any interested developer.
            this.infos('Love Ogone\'s project ? Join the discord here: https://discord.gg/gCnGzh2wMc');
          });
      }
    } catch (err) {
      this.error(`Ogone: ${err.message}`);
    }
  }
}
