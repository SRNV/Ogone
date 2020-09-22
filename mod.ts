import Ogone from "./classes/Ogone.ts";
import type { OgoneConfiguration } from "./.d.ts";
import { Configuration } from "./classes/Configuration.ts";

export default {
  async run(opts: OgoneConfiguration): Promise<void> {
    Configuration.setConfig(opts);
    await new Ogone(opts);
  },
};
