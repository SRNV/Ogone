import Ogone from "./Ogone.ts";
// import HMR from "../lib/hmr/index.ts";
import Env from "./Env.ts";
import { Configuration } from "./Configuration.ts";
import Workers from '../enums/workers.ts';
export default class EnvServer extends Env {
  public async startDevelopment(): Promise<void> {
    this.serviceDev.postMessage({
      type: Workers.INIT_MESSAGE_SERVICE_DEV,
      application: this.application,
      controllers: Ogone.controllers,
      Configuration: {
        ...Configuration
      },
    });
    this.serviceDev.addEventListener('message', async (event) => {
      switch (event.data.type) {
        case Workers.SERVICE_DEV_READY:
          // start type checking of all typed components
          if (this.bundle) {
            await this.TSXContextCreator.read(this.bundle);
            this.success('no type error found.');
          }
          break;
        case Workers.SERVICE_DEV_GET_PORT:
          this.lspWebsocketClient.postMessage({
            type: Workers.LSP_SEND_PORT,
            data: event.data.data
          })
          break;
      }
    });
  }
}
