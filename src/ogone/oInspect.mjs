import fs from 'fs';
import path from 'path';
import Ogone from './index.js';

function startRecursiveInspection(p) {
  const stats = fs.statSync(p);
  if (stats.isFile()) {
    Ogone.files.push(p);
  }
  if (stats.isDirectory()) {
    const dir = fs.readdirSync(p);
    Ogone.directories.push(p);
    dir.forEach((f) => {
      const pathTo = path.join(p, f);
      startRecursiveInspection(pathTo);
    });
  }
};
export default function oInspect(config) {
  const { src } = Ogone.config;
  const pathToSrc = path.join(process.cwd(), src);
  if (fs.existsSync(pathToSrc)) {
    startRecursiveInspection(pathToSrc);
  } else {
    const OgoneSrcFileNotFoundException = new Error(`[Ogone] src file doesn't exist \n\t${pathToSrc}`)
    throw OgoneSrcFileNotFoundException;
  }
}