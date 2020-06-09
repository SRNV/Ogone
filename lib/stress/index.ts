import { existsSync } from "./../../utils/exists.ts";
import { join } from "https://raw.githubusercontent.com/denoland/deno/master/std/path/mod.ts";
const stressMap: string[] = [];

interface StressOptions {
  root: string;
}
const [cmd, option] = Deno.args;
if (cmd === "--stress") {
  if (option) {
    stressMode({
      root: option,
    });
  } else {
    throw new Error(
      "[Ogone] Stress Mode: no root specified. usage: ... --stress <path-to-tests>",
    );
  }
}
function read(path: string): void {
  if (!existsSync(path)) return;
  const stats = Deno.statSync(path);
  if (stats.isFile) {
    console.warn(`[Ogone] Stress mode: ${path}`);
    stressMap.push(path);
  }
  if (stats.isDirectory) {
    const dir = Deno.readDirSync(path);
    for (const dirEntry of dir) {
      const { name } = dirEntry;
      const subpath = join(path, name);
      if (name.match(/((_|.)test.(js|ts))$/i)) {
        read(subpath);
      } else {
        const stats = Deno.statSync(subpath);
        if (stats.isDirectory) {
          read(subpath);
        }
      }
    }
  }
}
function runTests() {
  console.warn("[Ogone] Stress mode: running.");
  stressMap.forEach((path) => {
    Deno.run({
      cmd: ["deno", "test", "--failfast", path],
    });
  });
}
export default async function stressMode(opts: StressOptions) {
  /*
  const status = await Deno.permissions.query({ name: "read" });
  if (status.state !== "granted") {
    throw new Error("[Ogone] need read permission");
  }
  */
  if (existsSync(opts.root)) {
    const stress = Deno.watchFs(Deno.cwd());
    console.warn(`[Ogone] Stress mode enabled: using ${opts.root}`);
    read(opts.root);
    runTests();
    for await (const event of stress) {
      const { kind } = event;
      if (kind === "access") {
        console.log("[Ogone] Stress mode: ", ...event.paths);
        runTests();
      }
    }
  } else {
    throw new Error(
      `[Ogone] ${opts.root} is not a file or directory. please specify in options a existing file or directory.`,
    );
  }
}
