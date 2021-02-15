import { colors } from "../../deps/deps.ts";
import getDeepTranslation from '../../utils/template-recursive.ts';
import { absolute } from '../../deps/deps.ts';
import { Flags } from "../enums/flags.ts";
import Workers from "../enums/workers.ts";
import { Configuration } from "./Configuration.ts";

const FIFOMessages: string[] = [];
export abstract class Utils {
  protected getDeepTranslation = getDeepTranslation;
  private static client = new WebSocket('ws://localhost:3441/');
  protected static getDeepTranslation = getDeepTranslation;
  protected absolute = absolute;
  trace(message: string) {
    if (Deno.args.includes(Flags.TRACE)) {
      this.message(`${this.constructor.name} ${message}`);
    }
  }
  static trace(message: string) {
    if (Deno.args.includes(Flags.TRACE)) {
      this.message(`${this.constructor.name} ${message}`);
    }
  }
  public warn(message: string, opts?: { [k: string]: any }): void {
    const { bgYellow, bold, black, yellow } = colors;
    this.message(`${bgYellow(bold(black("   WARN  ")))} ${yellow(message)}`);
  }
  public error(message: string, opts?: { [k: string]: any }): never {
    const { bgRed, red, bold, yellow } = colors;
    const m: string = this.message(
      `${bgRed("  ERROR  ")} ${red(message)}\n${
      yellow(
        `\n\t\tfeeling like it's an issue ?\n\t\tplease report on https://github.com/SRNV/Ogone/issues/new?assignees=&modifiers=&template=bug_report.md&title=`,
      )
      }`,
      { returns: true },
    ) as string;
    if (Configuration.OgoneDesignerOpened) {
      this.notify({
        type: Workers.LSP_ERROR,
        message: m,
      });
    }
    const e = new Error(m);
    console.error(e.stack);
    Deno.exit(1);
  }
  static error(message: string, opts?: { [k: string]: any }): never {
    const { bgRed, red, bold, yellow } = colors;
    const m: string = this.message(
      `${bgRed("  ERROR  ")} ${red(message)}\n${
      yellow(
        `\n\t\tfeeling like it's an issue ?\n\t\tplease report on https://github.com/SRNV/Ogone/issues/new?assignees=&modifiers=&template=bug_report.md&title=`,
      )
      }`,
      { returns: true },
    ) as string;
    if (Configuration.OgoneDesignerOpened) {
      this.notify({
        type: Workers.LSP_ERROR,
        message: m,
      });
    }
    Deno.exit(1);
    throw new Error(m);
  }
  public success(message: string, opts?: { [k: string]: any }): void {
    const { bgBlack, white, bold, green } = colors;
    this.message(`${bgBlack(bold(green(" SUCCESS ")))} ${white(message)}`);
  }
  public static success(message: string, opts?: { [k: string]: any }): void {
    const { bgBlack, white, bold, green } = colors;
    this.message(`${bgBlack(bold(green(" SUCCESS ")))} ${white(message)}`);
  }
  public infos(message: string, opts?: { [k: string]: any }): void {
    const { bgBlack, bold, blue } = colors;
    this.message(`${bgBlack(bold(blue("  INFOS  ")))} ${blue(message)}`);
  }
  public static infos(message: string, opts?: { [k: string]: any }): void {
    const { bgBlack, bold, blue } = colors;
    this.message(`${bgBlack(bold(blue("  INFOS  ")))} ${blue(message)}`);
  }
  public message(message: string, opts?: { [k: string]: any }): void | string {
    const { cyan, bold } = colors;
    const name = bold(cyan(" [Ogone] "));
    if (opts && opts.returns) {
      return `${name} ${message}`;
    } else {
      console.log(name, message);
      return;
    }
  }
  public static message(message: string, opts?: { [k: string]: any }): void | string {
    const { cyan, bold, white } = colors;
    const name = bold(cyan(" [Ogone] "));
    if (opts && opts.returns) {
      return `${name} ${message}`;
    } else {
      console.log(name, message);
      return;
    }
  }
  protected template(tmpl: string, data: any): string {
    let result = tmpl;
    const fn = new Function(
      "__value",
      ...Object.keys(data),
      `try { return eval('('+ __value + ')'); } catch(err) { throw err; }`,
    );
    const values = Object.values(data);
    while (
      result.indexOf("{%") > -1 && result.indexOf("%}") > -1
    ) {
      if (result.indexOf("{%") > result.indexOf("%}")) {
        result = result.replace("%}", "% }");
      }
      const start = result.indexOf("{%");
      const end = result.indexOf("%}") + 2;
      const substrContent = result.substring(start + 2, end - 2).trim();
      const partStart = result.substring(0, start);
      const partEnd = result.substring(end);
      result = partStart + fn(substrContent, ...values) + partEnd;
    }
    return result;
  }
  protected static template(tmpl: string, data: any): string {
    let result = tmpl;
    const fn = new Function(
      "__value",
      ...Object.keys(data),
      `try { return eval('('+ __value + ')'); } catch(err) { throw err; }`,
    );
    const values = Object.values(data);
    while (
      result.indexOf("{%") > -1 && result.indexOf("%}") > -1
    ) {
      if (result.indexOf("{%") > result.indexOf("%}")) {
        result = result.replace("%}", "% }");
      }
      const start = result.indexOf("{%");
      const end = result.indexOf("%}") + 2;
      const substrContent = result.substring(start + 2, end - 2).trim();
      const partStart = result.substring(0, start);
      const partEnd = result.substring(end);
      result = partStart + fn(substrContent, ...values) + partEnd;
    }
    return result;
  }
  static notify(data: Object): void {
    if (Utils.client.readyState !== 1) {
      FIFOMessages.push(JSON.stringify(data));
    } else {
      FIFOMessages.forEach((message) => {
        Utils.client.send(message);
      });
      FIFOMessages.splice(0);
      Utils.client.send(JSON.stringify(data));
    }
  }
  private notify = Utils.notify.bind(this);
  static exposeSession(port?: number, entrypoint?: string): void {
    const { cyan, blue } = colors;
    this.success(`
    App: ${cyan(entrypoint || Configuration.entrypoint)}
    Running here: ${cyan(`http://localhost:${port || Configuration.port || 8080}/`)}

    - Love Ogone's project ? Join the discord here: ${cyan(`https://discord.gg/gCnGzh2wMc`)}
    - Releases: ${cyan(`https://github.com/SRNV/Ogone/releases`)}
    - Github: ${cyan(`https://github.com/SRNV/Ogone`)}
    - Projects: ${cyan(`https://github.com/SRNV/Ogone/projects`)}
    `);
  }
  public exposeSession = Utils.exposeSession.bind(this);
}