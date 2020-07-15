import { colors } from "../../deps.ts";

export abstract class Utils {
  public warn(message: string, opts?: { [k: string]: any }): void {
    const { bgYellow, bold, black, yellow } = colors;
    this.message(`${bgYellow(bold(black("   WARN  ")))} ${yellow(message)}`);
  }
  public error(message: string, opts?: { [k: string]: any }): void {
    const { bgRed, red, bold } = colors;
    const m: string = this.message(
      `${bgRed("  ERROR  ")} ${red(message)}`,
      { returns: true },
    ) as string;
    throw new Error(m);
  }
  public success(message: string, opts?: { [k: string]: any }): void {
    const { bgRed, bgBlack, white, bold, green } = colors;
    this.message(`${bgBlack(bold(green(" SUCCESS ")))} ${white(message)}`);
  }
  private message(message: string, opts?: { [k: string]: any }): void | string {
    const { cyan, bold, white } = colors;
    const name = bold(cyan(" [Ogone] "));
    if (opts && opts.returns) {
      return `${name} ${message}`;
    } else {
      console.log(name, message);
      return;
    }
  }
  protected template(tmpl: string, data: Object): string {
    let result = tmpl;
    const fn = new Function(
      "__value",
      ...Object.keys(data),
      `try { return eval('('+ __value + ')'); } catch(err) { throw err; }`,
    );
    const values = Object.values(data);
    while (
      result.indexOf("{{") > -1 && result.indexOf("}}") > -1 &&
      result.indexOf("{{") < result.indexOf("}}")
    ) {
      const start = result.indexOf("{{");
      const end = result.indexOf("}}") + 2;
      const substrContent = result.substring(start + 2, end - 2).trim();
      const partStart = result.substring(0, start);
      const partEnd = result.substring(end);
      result = partStart + fn(substrContent, ...values) + partEnd;
    }
    return result;
  }
}
