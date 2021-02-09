import { existsSync } from "../../deps/deps.ts";
import { walkSync } from "../../deps/walk.ts";
import { Utils } from "../classes/Utils.ts";
import Workers from "../enums/workers.ts";

export default {};
self.onmessage = async (ev: any): Promise<void> => {
  const { type, files } = ev.data;
  switch (type) {
    case Workers.WS_INIT:
      Utils.infos('HMR initialization');
      const watcher = Deno.watchFs(Deno.cwd(), { recursive: true });
      for await (let event of watcher) {
        if (event.kind === 'modify') {
          event.paths.forEach((path) => {
            self.postMessage({
              type: Workers.WS_FILE_UPDATED,
              path: path,
              isOgone: path.endsWith('.o3'),
            });
          });
        }
      }
  }
};