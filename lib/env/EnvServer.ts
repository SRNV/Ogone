import { Server } from "https://deno.land/std@v0.42.0/http/server.ts";
import { getHeaderContentTypeOf } from "./../../utils/extensions-resolution.ts";
import Ogone from "./../../src/ogone/index.ts";
import { existsSync } from "./../../utils/exists.ts";
import HMR from "../hmr/index.ts";
import Env from "./Env.ts";

/**
 * Abstract class to manage the environments of your application
 * extends class Env
 * @method use
 * @method setBundle
 * @method getBuild
 * @property application
 */
export default abstract class EnvServer extends Env {
  private static async control(req: any): Promise<boolean> {
    const ns = req.url.slice(1).split('/')[0];
    if (req.url.indexOf('/') > -1 && req.url.startsWith(`/${ns}/`)) {
      const controller = Ogone.controllers.get(ns);
      if (controller) {
        const route = req.url.replace(`/${ns}`, '');
        const t = req.method;
        let response = await controller.runtime(`${t}:${route}`, req);
        if (response) {
          switch (true) {
            case typeof response === 'object':
              response = JSON.stringify(response);
              break;
          }
          req.respond({
            body: response,
          });
          return true;
        }
      }
    }
    return false;
  }
  /** use a server to render your ogone app.
   * takes 2 arguments (server: Server, port: number) => Promise<void>
   * ```ts
   * EnvServer.use(server, 8080);
   * ```
   * @param server the server to use
   * @param port a number for the port
   *
   */
  public static async use(server: Server, port: number = 8000): Promise<void> {
    console.warn(`[Ogone] Success http://localhost:${port}/`);
    for await (const req of server) {
      const pathToPublic: string = `${Deno.cwd()}/${req.url}`;
      const controllerRendered = await this.control(req);
      if (controllerRendered) {
        continue;
      }
      let isUrlFile: boolean = existsSync(pathToPublic);
      switch (true) {
        case req.url.startsWith(Ogone.config.modules):
          const denoReqUrl = req.url.slice(1).split("?")[0];
          HMR(denoReqUrl);
          req.respond({
            body: await Env.resolveAndReadText(denoReqUrl),
            headers: new Headers([
              getHeaderContentTypeOf(denoReqUrl),
              ["X-Content-Type-Options", "nosniff"],
            ]),
          });
          break;
        case isUrlFile && req.url.startsWith("/public/"):
          req.respond({
            body: Deno.readTextFileSync(pathToPublic),
            headers: new Headers([
              getHeaderContentTypeOf(req.url),
              ["X-Content-Type-Options", "nosniff"],
            ]),
          });
          break;
        default:
          req.respond({ body: Env.application });
          break;
      }
    }
  }
  public static async serve(pathToApplication: string, server: Server, port: number = 8000) {
    if (!existsSync(pathToApplication)) {
      throw new Error(`[Ogone] application not found. input: ${pathToApplication}`);
    }
    if (!pathToApplication.endsWith('.html')) {
      throw new Error(`[Ogone] this version of Ogone only supports HTML for production. input: ${pathToApplication}`);
    }
    const application = Deno.readTextFileSync(pathToApplication);
    console.warn(`[Ogone] Service running. check it here http://localhost:${port}/`);
    for await (const req of server) {
      const pathToPublic: string = `${Deno.cwd()}/${req.url}`;
      const controllerRendered = await this.control(req);
      if (controllerRendered) {
        continue;
      }
      let isUrlFile: boolean = existsSync(pathToPublic);
      switch (true) {
        case req.url.startsWith(Ogone.config.modules):
          const denoReqUrl = req.url.slice(1).split("?")[0];
          req.respond({
            body: await Env.resolveAndReadText(denoReqUrl),
            headers: new Headers([
              getHeaderContentTypeOf(denoReqUrl),
              ["X-Content-Type-Options", "nosniff"],
            ]),
          });
          break;
        case isUrlFile && req.url.startsWith("/public/"):
          req.respond({
            body: Deno.readTextFileSync(pathToPublic),
            headers: new Headers([
              getHeaderContentTypeOf(req.url),
              ["X-Content-Type-Options", "nosniff"],
            ]),
          });
          break;
        default:
          req.respond({ body: application });
          break;
      }
    }
  }
}
