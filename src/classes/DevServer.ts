import { serve } from '../../deps.ts';
import DevBundler from './DevBundler.ts';
import OgoneSandBox from "./OgoneSandBox/OgoneSandBox.ts";
/**
 * a class to serve SPA/SSR/SSG
 * in development environment
 */
function random(min: number, max: number): number {
  return Math.round(Math.random() * (max - min)) + min;
}
export default class DevServer extends DevBundler {
  private static port: number = 3043;
  private static HMRport: number = DevServer.port;
  private static hostname: string = 'localhost';
  /**
   * start development services for Single Page Applications
   * TCP server
   */
  static async serveSPA(): Promise<void> {
    const application = await DevServer.buildApplicationSPA();
    if (!application) {
      return;
    }
    const server = serve({ hostname: this.hostname, port: this.port });
    DevServer.message(`Listening on http://${this.hostname}:${this.port}`);
    setTimeout(() => {
      OgoneSandBox.typecheckSession();
    }, 0);
    for await (const req of server) {
      req.respond({ body: application.dom });
    }
  }
}