import Ogone from "./Ogone.ts";
// import HMR from "../lib/hmr/index.ts";
import Env from "./Env.ts";
import { Configuration } from "./Configuration.ts";
import Workers from '../enums/workers.ts';
import OgoneWorkers from "./OgoneWorkers.ts";
export default class EnvServer extends Env {
  public async startDevelopment(): Promise<void> {
    OgoneWorkers.serviceDev.postMessage({
      type: Workers.INIT_MESSAGE_SERVICE_DEV,
      application: this.application,
      controllers: Ogone.controllers,
      Configuration: {
        ...Configuration
      },
    });
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
  }
}
