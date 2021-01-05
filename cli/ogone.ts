import { Utils } from "../classes/Utils.ts";
import { Commands } from '../enums/cli-comands.ts';
import { Messages } from "../enums/cli-messages.ts";
import o3 from '../mod.ts';

export class OgoneCLI extends Utils {
  public static async init(): Promise<void> {
    const command = Deno.args[0];
    console.warn(Deno.args);
    switch(command) {
      case Commands.CREATE:
        break;
      case Commands.RUN:
        const path = Deno.args[1];
        o3.run({
          entrypoint: path,
        });
        break;
      default:
        console.log(Messages.GLOBAL_HELP);
        Deno.exit(1);
        break;
    }
  }
}
if (import.meta.main) {
  OgoneCLI.init();
}