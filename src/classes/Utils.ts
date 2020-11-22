import { colors } from '../../deps.ts';
interface PatternOptions {
  data: { [k: string]:  string };
  open?: string;
  close?: string;
}
/**
 * a class to extend
 * delivers some utils methods
 */
export default abstract class Utils {
  static build = Deno.build;
  static message(message: string, opts?: { [k: string]: unknown }): void | string {
    const { cyan, bold, white } = colors;
    const name = bold(cyan(' [Ogone] '));
    if (opts && opts.returns) {
      return `${name} ${message}`;
    } else {
      console.log(name, message);
      return;
    }
  }
  protected static renderPattern(pattern: string, options: PatternOptions): string {
    let result = pattern;
    const open = '"{{', close = '}}"';
    const { data } = options;
    const fn = new Function(
      '__value',
      ...Object.keys(data),
      `try { return eval(__value ); } catch(err) { throw err; }`,
    );
    const values = Object.values(data);
    while (
      result.indexOf(open) > -1 && result.indexOf(close) > -1
    ) {
      const start = result.indexOf(open);
      const end = result.indexOf(close) + 3;
      const substrContent = result.substring(start + 3, end - 3).trim();
      const partStart = result.substring(0, start);
      const partEnd = result.substring(end);
      result = partStart + fn(substrContent, ...values) + partEnd;
    }
    return result;
  }
}
