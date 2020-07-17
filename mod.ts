import Ogone from "./classes/main/index.ts";
import { OgoneConfiguration } from "./.d.ts";
import { Configuration } from "./classes/config/index.ts";

export default {
  async run(opts: OgoneConfiguration): Promise<void> {
    Configuration.setConfig(opts);
    await new Ogone(opts);
  },
};
