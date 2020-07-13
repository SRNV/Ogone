import { Utils } from "../utils/index.ts";
export default abstract class Configuration extends Utils {
  /**
   * @property entrypoint
   * @description path to the root component, this one has to be an untyped component
   */
  public entrypoint: string;

  /**
   * @property port
   * @description which port to use for development
   */
  public port: number;

  /**
   * @property static
   * @description allow user to serve files to client
   */
  public ["static"]?: string;

  /**
   * @property modules
   * @description path to all modules, this is usefull for the hmr
   */
  public modules: string;
  /**
   * @property head
   * @description insert tags in the <head> of the html
   */
  public head?: string;
  /**
   * @property build
   * @description output destination for production
   */
  public build?: string;
  /**
   * @property serve
   * @description should ogone serve after building the application
   */
  public serve?: boolean;
  /**
   * @property compileCSS
   * @description should ogone compile the css inside the static folder
   * requires public folder to be provided
   */
  public compileCSS?: boolean;
  /**
   * @property minifyCSS
   * @description should ogone minify the CSS ? including multiple spaces, tabs erased, and new lines erased
   */
  public minifyCSS?: boolean;
  /**
   * @property devtool
   * @description if you want to use devtool.
   */
  public devtool?: boolean;
  /**
   * @property controllers
   * @description paths to the controllers
   */
  public controllers?: string[];
  /**
   * @property types
   * @description paths to the types for the typescript compiler
   */
  public types?: string[];
  /**
   * @param {typeof Configuration} config
   * set the current global configuration of the compiler
   */
  constructor(config: Omit<Configuration, "prototype">) {
    super();
    if (!config) {
      throw this.error(
        `no configuration provided to class Configuration\n${import.meta.url}`,
      );
    }
    this.entrypoint = config.entrypoint;
    this.port = config.port;
    this.static = config.static;
    this.modules = config.modules;
    this.head = config.head;
    this.controllers = config.controllers;
    this.devtool = config.devtool;
    this.minifyCSS = config.minifyCSS;
    this.compileCSS = config.compileCSS;
    this.build = config.build;
    this.serve = config.serve;
    this.types = config.types;
  }
}
