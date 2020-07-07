import { existsSync } from "../../../../utils/exists.ts";
import jsThis from "../../../../lib/js-this/switch.ts";
import { Bundle } from "../../../../.d.ts";
import { join, relative, absolute, fetchRemoteRessource } from "../../../../deps.ts";

async function startRecursiveInspectionOfComponent(
  textFile: string,
  p: string,
  bundle: Bundle,
  opts: any = {
    remote: false,
    baseUrl: '',
    current: '',
  }
) {
  const splitTextUseFirstPart = textFile.split(/\<([a-zA-Z0-9]*)+/i)[0];
  const tokens = jsThis(splitTextUseFirstPart, { onlyDeclarations: true });
  if (opts && opts.remote) {
    bundle.remotes.push({
      file: textFile,
      base: opts.base,
      path: opts.current,
    });
  } else {
    // only push if it's a local component
    bundle.files.push(p);
  }
  if (tokens.body && tokens.body.use) {
    for await (let c of Object.values(tokens.body.use)) {
      const { path, type }: any = c;
      if (path === p) return;

      if (type === "remote") {
        console.warn('[Ogone] Downloading', path);
        const file = await fetchRemoteRessource(path);
        if (file) {
          await startRecursiveInspectionOfComponent(file, path, bundle, {
            remote: true,
            base: path.match(/(http|https|ws|wss|ftp|tcp|fttp)(\:\/{2}[^\/]+)/gi)[0],
            current: path,
          });
        } else {
          throw new Error(`[Ogone] unreachable remote component.\t\t\ninput: ${path}`);
        }
      } else if ( type === "absolute" && existsSync(path)) {
        // absolute  and local
        const file = Deno.readTextFileSync(path);
        startRecursiveInspectionOfComponent(file, path, bundle);
      } else if (opts.remote && type === "relative" && opts.base) {
        // relative and remote
        const newPath = `${opts.current.split('://')[0]}://${absolute(opts.current.split('://')[1], path)}`;
        console.warn('[Ogone] Downloading', newPath);
        const file = await fetchRemoteRessource(newPath);
        if (file) {
          await startRecursiveInspectionOfComponent(file, newPath, bundle, {
            ...opts,
            current: newPath,
          });
        } else {
          throw new Error(`[Ogone] unreachable remote component.\t\t\ninput: ${newPath}`);
        }
      } else if (!opts.remote && type === "relative") {
        const newPath = join(p, path);
        if (existsSync(newPath)) {
          const file = Deno.readTextFileSync(newPath);
          startRecursiveInspectionOfComponent(file, newPath, bundle);
        }
      } else {
        const ComponentNotFoundException = new Error(
          `[Ogone] component not found. input: ${path}`,
        );
        throw ComponentNotFoundException;
      }
    }
  }
}
export default async function oInspect(entrypoint: string, bundle: Bundle) {
  if (existsSync(entrypoint)) {
    const rootComponentFile = Deno.readTextFileSync(entrypoint);
    await startRecursiveInspectionOfComponent(
      rootComponentFile,
      entrypoint,
      bundle,
    );
  } else {
    const OgoneSrcFileNotFoundException = new Error(
      `[Ogone] entrypoint file doesn't exist \n\t${entrypoint}`,
    );
    throw OgoneSrcFileNotFoundException;
  }
}
