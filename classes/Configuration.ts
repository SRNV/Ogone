import type { OgoneConfiguration } from "../.d.ts";
export abstract class Configuration {
  /**
   * @property entrypoint
   * @description path to the root component, this one has to be an untyped component
   */
  public static entrypoint: string = "/index.o3";

  /**
   * @property port
   * @description which port to use for development
   */
  public static port: number = 0;

  /**
   * @property static
   * @description allow user to serve files to client
   */
  public static ["static"]?: string = "/public";

  /**
   * @property modules
   * @description path to all modules, this is usefull for the hmr
   */
  public static modules: string = "/modules";
  /**
   * @property head
   * @description insert tags in the <head> of the html
   */
  public static head?: string;
  /**
   * @property build
   * @description output destination for production
   */
  public static build?: string;
  /**
   * @property serve
   * @description should ogone serve after building the application
   */
  public static serve?: boolean;
  /**
   * @property compileCSS
   * @description should ogone compile the css inside the static folder
   * requires public folder to be provided
   */
  public static compileCSS?: boolean;
  /**
   * @property minifyCSS
   * @description should ogone minify the CSS ? including multiple spaces, tabs erased, and new lines erased
   */
  public static minifyCSS?: boolean;
  /**
   * @property devtool
   * @description if you want to use devtool.
   */
  public static devtool?: boolean;
  /**
   * @property controllers
   * @description paths to the controllers
   */
  public static controllers?: string[];
  /**
   * @property types
   * @description paths to the types for the typescript compiler
   */
  public static types?: string[];
  /**
   * @param {typeof Configuration} config
   * set the current global configuration of the compiler
   */
  static setConfig(config: OgoneConfiguration) {
    if (!config) {
      throw new TypeError(
        `no configuration provided to class Configuration\n${import.meta.url}`,
      );
    }
    Configuration.entrypoint = config.entrypoint;
    Configuration.port = config.port ? config.port : 0;
    Configuration.static = config.static;
    Configuration.head = config.head;
    Configuration.controllers = config.controllers;
    Configuration.devtool = config.devtool;
    Configuration.minifyCSS = config.minifyCSS;
    Configuration.compileCSS = config.compileCSS;
    Configuration.build = config.build;
    Configuration.serve = config.serve;
    Configuration.types = config.types;
  }
}
