import Ogone from "../index.ts";
import { existsSync } from "../../../utils/exists.ts";
import jsThis from "../../lib/js-this/switch.js";

function startRecursiveInspectionOfComponent(textFile, p) {
  const splitTextUseFirstPart = textFile.split(/\<([a-zA-Z0-9]*)+/i)[0];
  const tokens = jsThis(splitTextUseFirstPart, { onlyDeclarations: true });
  Ogone.files.push(p);
  if (tokens.body && tokens.body.use) {
    Object.values(tokens.body.use)
      .forEach(({ path, as }) => {
        if (path === p) return;
        if (existsSync(path)) {
          const file = Deno.readTextFileSync(path);
          startRecursiveInspectionOfComponent(file, path);
        } else {
          const ComponentNotFoundException = new Error(`[Ogone] component not found. input: ${path}`);
          throw ComponentNotFoundException;
        }
      });
  }
}
export default function oInspect() {
  const { entrypoint } = Ogone.config;
  if (existsSync(entrypoint)) {
    const rootComponentFile = Deno.readTextFileSync(entrypoint);
    startRecursiveInspectionOfComponent(rootComponentFile, entrypoint);
  } else {
    const OgoneSrcFileNotFoundException = new Error(
      `[Ogone] entrypoint file doesn't exist \n\t${entrypoint}`,
    );
    throw OgoneSrcFileNotFoundException;
  }
}
