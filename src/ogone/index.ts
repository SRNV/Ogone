import { existsSync } from "../../utils/exists.ts";

const json = existsSync("./ogone.config.json")
  ? Deno.readTextFileSync("./ogone.config.json")
  : "{}";
const config = JSON.parse(json);

export default {
  config,
  files: [],
  directories: [],
  components: new Map(),
  main: `${Deno.cwd()}${config.entrypoint}`,
  sockets: [],
  pragma: "self.h",
  onmessage: [],
  onclose: [],
  templates: [],
  contexts: [],
  customElements: [],
  classes: [],
  datas: [],
};
