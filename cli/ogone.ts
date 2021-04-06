import { Utils } from "../src/classes/Utils.ts";
import { Commands } from '../src/enums/cli-commands.ts';
import { Messages } from "../src/enums/cli-messages.ts";
import { Flags } from "../src/enums/flags.ts";
import o3 from '../mod.ts';

export class OgoneCLI extends Utils {
  public static async init(): Promise<void> {
    const command = Deno.args[0];
    switch (command) {
      case Commands.CREATE:
        break;
      case Commands.BUILD: {
        const [, entrypoint, build] = Deno.args;
        o3.run({
          entrypoint,
          build,
        });
      }
      case Commands.DEPLOY: {
        const [, entrypoint, build] = Deno.args;
        o3.run({
          entrypoint,
          build,
          deploySPA: true,
        });
      }
      case Commands.LINT:
        break;
      case Commands.FMT:
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