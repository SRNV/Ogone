import Ogone from "./classes/main/index.ts";
import { Configuration } from "./classes/config/index.ts";

export default {
  async run(opts: Configuration): Promise<void> {
    await new Ogone(opts);
  },
};
