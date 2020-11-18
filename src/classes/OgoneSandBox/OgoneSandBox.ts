import { fs } from "../../../deps.ts";
import OgoneSandBoxFileSystem from './OgoneSandBoxFileSystem.ts';
import { OgoneSandBoxDocument } from './OgoneSandBoxFileSystem.ts';

/**
 * class to build parallel folder
 * the goal is to render all the modules in one time
 * using transpilOgonely to transform the module before fetching it
 */

export default class OgoneSandBox extends OgoneSandBoxFileSystem {
  /**
   * creates a new folder ogone/ at the same level of Deno.cwd()
   */
  static async startSession(): Promise<void> {
    const location = this.sandBoxLocation;
    if (!fs.existsSync(location)) {
      Deno.mkdirSync(location);
    } else {
      Deno.removeSync(location, { recursive: true });
    }
    const paths = fs.walkSync(this.currentLocation, {
      includeDirs: true,
      includeFiles: true,
      skip: [/(.+?)(\b\.git|\b\.gitignore|\b\.vscode|\btsconfig\.json|\bnode_modules)(?:\/|$)/i]
    });
    for (let document of paths) {
      try {
        const { source: sandBoxPath, importable } = this.getSandBoxMirrorPath(document.path);
        // save all paths
        // this is to save the files that ogone is creating in the sandbox
        // should be removed after the session is closed
        this.paths.push(sandBoxPath);
        this.paths.push(importable);
        if (document.isFile) {
          if (this.isJSXFile(document.path)) {
            await this.saveSandBoxedFile({
              path: document.path,
              sandBoxPath,
              importable,
            })
          } else {
            // copy the file in the sandbox
            Deno.copyFileSync(document.path, sandBoxPath);
          }
        } else if (document.isDirectory && !fs.existsSync(sandBoxPath)) {
          // creates a directory in the sandbox
          Deno.mkdirSync(sandBoxPath);
        }
      } catch (err) {
        throw err;
      }
    }
    this.addTsConfig();
  }
  /**
  /**
   * run the session by using Deno.run
   * this should be used after the ogone sandbox is created
   */
  static async renderSession(): Promise<OgoneSandBoxDocument[]> {
    const entries = this.mapFiles.entries();
    const a = Array.from(entries);
    for await (let [filePath, item] of a) {
      const module = await this.getSandBoxMirrorModule(filePath);
      item.module = module;
    }
    return a.map(([filePath, item]) => item);
  }
}