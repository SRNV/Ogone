import { Utils } from "../classes/Utils.ts";
import { Commands } from '../enums/cli-comands.ts';
import { Messages } from "../enums/cli-messages.ts";
import { Flags } from "../enums/flags.ts";
import o3 from '../mod.ts';

export class OgoneCLI extends Utils {
  public static async init(): Promise<void> {
    const command = Deno.args[0];
    switch(command) {
      case Commands.CREATE:
        break;
      case Commands.RUN:
        const path = Deno.args[1];
        let devtool = Deno.args.includes(Flags.DEVTOOL);
        o3.run({
          entrypoint: path,
          devtool,
        });
        break;
      default:
        console.log(Messages.GLOBAL_HELP);
        Deno.exit(1);
    }
  }
}
if (import.meta.main) {
  OgoneCLI.init();
}