import fs from 'fs';
import path from 'path';
const prog = `
  const _ = require('lodash');
  import __ from 'lodash';
  import a, {} from 'esprima';
  export default {};
`;
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
const nodeModules = fs.readdirSync(nodeModulesPath, 'utf8');
const currentDirectoryPath = process.cwd();
const jsThis = require('./js-this/switch.js');

function isCjsModule(content) {
  let result = content.replace(/"([^\"]*)+"/gi, '');
  result = content.replace(/'([^\']*)+'/gi, '');
  result = content.replace(/`([^\`]*)+`/gi, '');
  return /[^\.](require\(|module\b)/.test(result);
}
function isEsmModule(content) {
  let result = content.replace(/"([^\"]*)+"/gi, '');
  result = content.replace(/'([^\']*)+'/gi, '');
  result = content.replace(/`([^\`]*)+`/gi, '');
  return /[^\.](import|export|from)[^\.]/.test(result) && !/\brequire\(/gi.test(result);
}
function pathIsDirectory(...item) {
  const p = path.join(...item.filter((i) => i));
  const stats = fs.statSync(p);
  return stats.isDirectory();
}
function getMainOfPackage(dir) {
  const packageDPath = path.join(dir, 'package.json');
  if (fs.existsSync(packageDPath)) {
    const packageDSTR = fs.readFileSync(packageDPath);
    const packageDContent = JSON.parse(packageDSTR);
    const { main } = packageDContent;
    return main
  } else {
    return null;
  }
}
function getpackage(p, opts) {
  const { parentPath } = opts;
  const isRelative = p.startsWith('./') || p.startsWith('../');
  const isAbsolute = p.startsWith('/');
  const isFromSource = p.startsWith('@/');
  const directory = path.dirname(parentPath || `${currentDirectoryPath}/node_modules/`);
  const nodeModulePath = `${currentDirectoryPath}/node_modules/${p.split('/')[0]}`;
  const modulePath = `${currentDirectoryPath}/node_modules/${p}`;
  const relativePath = path.join(directory, p);
  const absoluteModulePath = path.join(currentDirectoryPath, p);
  let packagePath = path.join(nodeModulePath, `/package.json`);
  let modulePackagePath = path.join(modulePath, `/package.json`);
  let currentDirectoryPackageAbsolutePath = path.join(currentDirectoryPath, `/package.json`);
  console.warn(modulePackagePath)
  let pkg;
  switch(true) {
    case !isAbsolute &&
      !isRelative &&
      !isFromSource &&
      fs.existsSync(nodeModulePath) && fs.existsSync(packagePath):
    pkg = fs.readFileSync(packagePath, 'utf8');
      return {
        cwd: false,
        pkg: JSON.parse(pkg),
        path: nodeModulePath,
      };
    case !isAbsolute &&
      !isRelative &&
      !isFromSource &&
      fs.existsSync(modulePath) && fs.existsSync(modulePackagePath):
    pkg = fs.readFileSync(modulePackagePath, 'utf8');
      return {
        cwd: false,
        pkg: JSON.parse(pkg),
        path: modulePath,
      };
    case isAbsolute && fs.existsSync(absoluteModulePath) && fs.existsSync(currentDirectoryPackageAbsolutePath):
    pkg = fs.readFileSync(currentDirectoryPackageAbsolutePath, 'utf8');
      return {
        cwd: true,
        pkg: JSON.parse(pkg),
        path: absoluteModulePath,
      };
  }
}
function getScript(pathToModule) {
  const fileExist = fs.existsSync(pathToModule);
  if (fileExist) {
    const content = fs.readFileSync(pathToModule, 'utf8');
    const body = jsThis(content, { esm: isEsmModule(content), cjs: true, reactivity: false })
    return body;
  }
}
function readPackage(mod = currentDirectoryPath, isNodeModule) {
  console.warn(`[Ogone] ${mod}`);
  const pack = getpackage(mod, isNodeModule || false);
  if (pack.pkg) {
    console.warn(pack.pkg.main, pack.pkg.type, pack.pkg.exports)
  } else {
    console.warn(pack)
  }
  return;
  if (pack) {
    let pathToModule = '';
    if (pack.pkg) {
      const { main } = pack.pkg;
      pathToModule = path.join(pack.path, main);
    } else {
      pathToModule = pack.path;
    }
    console.warn(0)
    const item = getScript(pathToModule);
    if (item.body && item.body.require && item.body.require.length) {
      item.body.require.forEach((p) => {
        console.warn(p)
        const isRelative = p.startsWith('./') || p.startsWith('../');
        const directory = path.dirname(pathToModule);
        const relative = path.join(directory, p);
        if (!['path', 'fs'].includes(p)) {
          readPackage(relative, !isRelative);
        }
      })
    }
  }
}
// readPackage();
const { body, value } = jsThis(prog, { esm: true, cjs: true, reactivity: false })
if (body.imports) {
  Object.entries(body.imports)
    .forEach(([name, item]) => {
      switch(true) {
        case item.default !== null:
          readPackage(item.default, {
            parentPath: currentDirectoryPath,
          });
      }
    })
}