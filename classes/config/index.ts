export abstract class Configuration {
  /**
   * @property entrypoint
   * @description path to the root component, this one has to be an untyped component
   */
  static entrypoint: string;

  /**
   * @property port
   * @description which port to use for development
   */
  static port: number;

  /**
   * @property static
   * @description allow user to serve files to client
   */
  static static?: string;

  /**
   * @property modules
   * @description path to all modules, this is usefull for the hmr
   */
  static modules: string;
  /**
   * @property head
   * @description insert tags in the <head> of the html
   */
  static head?: string;
  /**
   * @property build
   * @description output destination for production
   */
  static build?: string;
  /**
   * @property serve
   * @description should ogone serve after building the application
   */
  static serve?: boolean;
  /**
   * @property compileCSS
   * @description should ogone compile the css inside the static folder
   * requires static folder to be provided
   */
  static compileCSS?: boolean;
  /**
   * @property minifyCSS
   * @description should ogone minify the CSS ? including multiple spaces, tabs erased, and new lines erased
   */
  static minifyCSS?: boolean;
  /**
   * @property devtool
   * @description if you want to use devtool.
   */
  static devtool?: boolean;
  /**
   * @property controllers
   * @description paths to the controllers
   */
  static controllers?: string[];
    /**
   * @property types
   * @description paths to the types for the typescript compiler
   */
  static types?: string[];
  /**
   * @param {typeof Configuration} config
   * set the current global configuration of the compiler
   */
  static setConfig(config: Omit<typeof Configuration, 'setConfig' | 'prototype'>): void {
    if (!config) return;
    Configuration.entrypoint = config.entrypoint;
    Configuration.port = config.port;
    Configuration.static = config.static;
    Configuration.modules = config.modules;
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