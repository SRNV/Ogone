import { Configuration } from '../config/index.ts';
import { colors } from '../../deps.ts';

export abstract class Utils extends Configuration {
  static warn(message: string, opts?: { [k: string]: any }): void {
    const { bgYellow, bold, black, yellow } = colors;
    Utils.message(`${bgYellow(bold(black('   WARN  ')))} ${yellow(message)}`);
  }
  static error(message: string, opts?: { [k: string]: any }): void {
    const { bgRed, red, bold } = colors;
    const m: string = Utils.message(`${bgRed(' ERROR ')} ${red(message)}`, { returns: true }) as string;
    throw new Error(m);
  }
  static success(message: string, opts?: { [k: string]: any }): void {
    const { bgRed, bgBlack, white, bold, green } = colors;
    Utils.message(`${bgBlack(bold(green(' SUCCESS ')))} ${white(message)}`);
  }
  static message(message: string, opts?: { [k: string]: any }): void | string {
    const { cyan, bold, white } = colors;
    const name = bold(cyan(' [Ogone] '));
    if (opts && opts.returns) {
      return `${name} ${message}`;
    } else {
      console.log(name, message);
      return;
    }
  }
}