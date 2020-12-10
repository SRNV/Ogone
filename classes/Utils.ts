import { colors } from "../deps.ts";
import getDeepTranslation from '../utils/template-recursive.ts';
import { absolute } from '../deps.ts';

export abstract class Utils {
  protected getDeepTranslation = getDeepTranslation;
  protected static getDeepTranslation = getDeepTranslation;
  protected absolute = absolute;
  public warn(message: string, opts?: { [k: string]: any }): void {
    const { bgYellow, bold, black, yellow } = colors;
    this.message(`${bgYellow(bold(black("   WARN  ")))} ${yellow(message)}`);
  }
  public error(message: string, opts?: { [k: string]: any }): void {
    const { bgRed, red, bold, yellow } = colors;
    const m: string = this.message(
      `${bgRed("  ERROR  ")} ${red(message)}\n${
      yellow(
        `\n\t\tfeeling like it's an issue ?\n\t\tplease report on https://github.com/SRNV/Ogone/issues/new?assignees=&modifiers=&template=bug_report.md&title=`,
      )
      }`,
      { returns: true },
    ) as string;
    throw new Error(m);
  }
  static error(message: string, opts?: { [k: string]: any }): void {
    const { bgRed, red, bold, yellow } = colors;
    const m: string = this.message(
      `${bgRed("  ERROR  ")} ${red(message)}\n${
      yellow(
        `\n\t\tfeeling like it's an issue ?\n\t\tplease report on https://github.com/SRNV/Ogone/issues/new?assignees=&modifiers=&template=bug_report.md&title=`,
      )
      }`,
      { returns: true },
    ) as string;
    throw new Error(m);
  }
  public success(message: string, opts?: { [k: string]: any }): void {
    const { bgRed, bgBlack, white, bold, green } = colors;
    this.message(`${bgBlack(bold(green(" SUCCESS ")))} ${white(message)}`);
  }
  public message(message: string, opts?: { [k: string]: any }): void | string {
    const { cyan, bold, white } = colors;
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
}
