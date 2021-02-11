import Ogone from "../main/OgoneBase.ts";
import Env from "./Env.ts";
import { Configuration } from "./Configuration.ts";
import Workers from '../enums/workers.ts';
import OgoneWorkers from "./OgoneWorkers.ts";
import { existsSync } from "../../utils/exists.ts";
import type {
  OgoneConfiguration,
} from "../ogone.main.d.ts";
import messages from "../../docs/chore/messages.ts";
import { Flags } from "../enums/flags.ts";
import TSXContextCreator from './TSXContextCreator.ts';

export default class EnvServer extends Env {
  public readonly contributorMessage: { [k: string]: string } = messages;
  run(opts: OgoneConfiguration) {
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
            */
          }).then(() => {
            // message for any interested developer.
            this.infos('Love Ogone\'s project ? Join the discord here: https://discord.gg/gCnGzh2wMc');
          });
      } else {
        //start compilation of o3 files
        this.setDevTool(Configuration.devtool as boolean);
        this.listenHMRWebsocket();
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
      this.error(`Ogone: ${err.message}
${err.stack}`);
    }
  }
  public async startDevelopment(): Promise<void> {
    try {
      TSXContextCreator.cleanDistFolder();
      await this.initServer();
      OgoneWorkers.serviceDev.addEventListener('message', async (event) => {
        switch (event.data.type) {
          case Workers.SERVICE_DEV_READY:
            // start type checking of all typed components
            if (this.bundle) {
              await this.TSXContextCreator.read(this.bundle);
            }
            break;
          case Workers.SERVICE_DEV_GET_PORT:
            OgoneWorkers.lspWebsocketClientWorker.postMessage({
              type: Workers.LSP_SEND_PORT,
              port: event.data.port
            })
            break;
        }
      });
    } catch (err) {
      this.error(`EnvServer: ${err.message}
${err.stack}`);
    }
  }
}
