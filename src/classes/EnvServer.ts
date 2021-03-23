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
import HMR from './HMR.ts';

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
          .then(async (bundle) => {
            let app = await this.renderBundleAndBuildForProduction(
              Configuration.entrypoint,
              bundle,
              opts.build!
            );
            await this.build(app);
            this.success(`Application built for production: ${opts.build}`);
            Deno.exit(0);
          })
      } else {
        //start compilation of o3 files
        this.setDevTool(Configuration.devtool as boolean);
        this.listenHMRWebsocket();
        this.compile(Configuration.entrypoint, true)
        .then(async () => {
          // Ogone is now ready to serve
          this.startDevelopment();
        })
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
            setTimeout(() => {
              HMR.postMessage({
                type: 'server',
                port: event.data.port,
              });
            }, 2000);
            this.listenLSPHSEServer(event.data.port);
            break;
        }
      });
    } catch (err) {
      this.error(`EnvServer: ${err.message}
${err.stack}`);
    }
  }
}
