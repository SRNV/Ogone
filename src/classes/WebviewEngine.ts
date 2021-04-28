import { join, existsSync } from '../../deps/deps.ts';
import { Configuration } from './Configuration.ts';
import { Utils } from './Utils.ts';
/**
 * this class should creates all the files
 * that are needed for editors
 */
export default class WebviewEngine extends Utils {
  static subDistFolderURL = './.ogone/channel';
  /**
   * port file
   * should be updated by Ogone
   */
  static portFileURL = join(WebviewEngine.subDistFolderURL, 'port');
  /**
   * application file
   * should be updated by Ogone
   */
  static applicationFileURL = join(WebviewEngine.subDistFolderURL, 'application');
  /**
   * component file
   * should be updated by the Editor
   */
  static componentTextFileURL = join(WebviewEngine.subDistFolderURL, 'component.json');
  static watcher?: ReturnType<typeof Deno.watchFs>;
  static application: string = '<script>setTimeout(() => window.location.reload(), 1000);</script>';
  /**
   * all clients that are subscribed to the WebviewEngine reactions
   */
  private static clients: Map<string, Function> = new Map();
  static initFolder() {
    if (!existsSync(this.subDistFolderURL)) {
      Deno.mkdirSync(this.subDistFolderURL);
    }
    Deno.writeTextFileSync(this.componentTextFileURL, '{}');
    Deno.writeTextFileSync(this.applicationFileURL, 'application file');
    this.watch();
  }
  /**
   * watch the componentTextFile
   * that need to be updated by the extension
   */
  static async watch() {
    this.watcher = Deno.watchFs(this.componentTextFileURL);
    for await (let event of this.watcher) {
      const { kind } = event;
      if (kind === 'access') {
        this.clients.forEach((client) => {
          const text = Deno.readTextFileSync(this.componentTextFileURL);
          client(text);
        });
      }
    }
  }
  /**
   * will update the port file
   * under the .ogone folder in the workspace
   */
  static updateDevServerPortFile(port?: number) {
    try {
      Deno.writeTextFileSync(this.portFileURL, port && port.toString() || Configuration.port.toString());
    } catch (err) {
      this.error(`WebviewEngine: ${err.message}`);
    }
  }
  /**
   * will update the application file
   * which will contain the script for the webview
   */
  static updateDevServerApplicationFile(source: string) {
    try {
      Deno.writeTextFileSync(this.applicationFileURL, source);
      this.application = source;
    } catch (err) {
      this.error(`WebviewEngine: ${err.message}`);
    }
  }
  /**
   * will update the application file
   * which will contain the script for the webview
   */
  static getApplication() {
    try {
      if (!existsSync(this.applicationFileURL)) return this.application;
      return Deno.readTextFileSync(this.applicationFileURL);
    } catch (err) {
      this.error(`WebviewEngine: ${err.message}`);
    }
  }
  /**
   * save the function into the client
   */
  static subscribe(uuid: string = '', client: Function) {
    this.clients.set(uuid, client);
  }
  /**
   * removes the client from the registry
   */
  static remove(uuid: string): boolean {
    return this.clients.delete(uuid);
  }
}