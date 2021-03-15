import { Utils } from "../classes/Utils.ts";
import Workers from "../enums/workers.ts";

export default {};
self.onmessage = async (ev: any): Promise<void> => {
  const { type, files } = ev.data;
  switch (type) {
    case Workers.WS_INIT:
      Utils.infos('HMR - initialization');
      const watcher = Deno.watchFs(Deno.cwd(), { recursive: true });
      for await (let event of watcher) {
        if (event.kind === 'modify') {
          event.paths.forEach((path) => {
            self.postMessage({
              path,
              type: Workers.WS_FILE_UPDATED,
              isOgone: path.endsWith('.o3'),
            });
          });
        }
      }
  }
};