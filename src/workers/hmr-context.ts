import { Utils } from "../classes/Utils.ts";
import Workers from "../enums/workers.ts";
Utils.infos('worker for HMR system created.');

export default {};
self.onmessage = async (ev: any): Promise<void> => {
  const { type, files } = ev.data;
  switch (type) {
    case Workers.WS_INIT:
      Utils.infos('HMR - initialization');
      const watcher = Deno.watchFs(Deno.cwd(), { recursive: true });
      for await (let event of watcher) {
        if (event.kind === 'access') {
          event.paths
            .filter((path) => path.endsWith('.o3'))
            .forEach((path) => {
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