import { existsSync } from "../../../../utils/exists.ts";
import jsThis from "../../../../lib/js-this/switch.ts";
import { Bundle } from '../../../../.d.ts';

function startRecursiveInspectionOfComponent(textFile: string, p: string, bundle: Bundle) {
  const splitTextUseFirstPart = textFile.split(/\<([a-zA-Z0-9]*)+/i)[0];
  const tokens = jsThis(splitTextUseFirstPart, { onlyDeclarations: true });
  bundle.files.push(p);
  if (tokens.body && tokens.body.use) {
    Object.values(tokens.body.use)
      // @ts-ignore
      .forEach(({ path }) => {
        if (path === p) return;
        if (existsSync(path)) {
          const file = Deno.readTextFileSync(path);
          startRecursiveInspectionOfComponent(file, path, bundle);
        } else {
          const ComponentNotFoundException = new Error(
            `[Ogone] component not found. input: ${path}`,
          );
          throw ComponentNotFoundException;
        }
      });
  }
}
export default function oInspect(entrypoint: string, bundle: Bundle) {
  if (existsSync(entrypoint)) {
    const rootComponentFile = Deno.readTextFileSync(entrypoint);
    startRecursiveInspectionOfComponent(
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
