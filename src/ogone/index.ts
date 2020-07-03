import { existsSync } from "../../utils/exists.ts";

const json = existsSync("./ogone.config.json")
  ? Deno.readTextFileSync("./ogone.config.json")
  : "{}";
const config = JSON.parse(json);

export default {
  config,
  files: [],
  directories: [],
  controllers: {} as { [key: string]: any },
  main: `${Deno.cwd()}${config.entrypoint}`,
  pragma: "self.h",
};
