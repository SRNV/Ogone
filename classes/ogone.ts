import { Configuration } from './config/index.ts';
import { Utils } from './utils/index.ts';
import EnvServer from './env/EnvServer.ts';
import { Parser } from './parser/index.ts';
import Api from './api/index.ts';

export default abstract class Ogone extends Api {
  /**
   * @name Config
   * the Configuration of Ogone
   */
  public static Config: Configuration = Configuration;
  /**
   * @name Utils
   * print messages to console
   */
  public static Utils: Utils = Utils;
  /**
   * @name Env
   */
  public static Env: EnvServer = EnvServer;
  /**
   * @name Parser
   * parses .o3 files
   * parses XML with dom-parser
   */
  public static Parser: Parser = Parser;
}