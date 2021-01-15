const mod4 = function() {
    const noColor = globalThis.Deno?.noColor ?? true;
    let enabled = !noColor;
    function setColorEnabled(value) {
        if (noColor) {
            return;
        }
        enabled = value;
    }
    function getColorEnabled() {
        return enabled;
    }
    function code(open, close) {
        return {
            open: `\x1b[${open.join(";")}m`,
            close: `\x1b[${close}m`,
            regexp: new RegExp(`\\x1b\\[${close}m`, "g")
        };
    }
    function run(str, code1) {
        return enabled ? `${code1.open}${str.replace(code1.regexp, code1.open)}${code1.close}` : str;
    }
    function reset(str) {
        return run(str, code([
            0
        ], 0));
    }
    function bold(str) {
        return run(str, code([
            1
        ], 22));
    }
    function dim(str) {
        return run(str, code([
            2
        ], 22));
    }
    function italic(str) {
        return run(str, code([
            3
        ], 23));
    }
    function underline(str) {
        return run(str, code([
            4
        ], 24));
    }
    function inverse(str) {
        return run(str, code([
            7
        ], 27));
    }
    function hidden(str) {
        return run(str, code([
            8
        ], 28));
    }
    function strikethrough(str) {
        return run(str, code([
            9
        ], 29));
    }
    function black(str) {
        return run(str, code([
            30
        ], 39));
    }
    function red(str) {
        return run(str, code([
            31
        ], 39));
    }
    function green(str) {
        return run(str, code([
            32
        ], 39));
    }
    function yellow(str) {
        return run(str, code([
            33
        ], 39));
    }
    function blue(str) {
        return run(str, code([
            34
        ], 39));
    }
    function magenta(str) {
        return run(str, code([
            35
        ], 39));
    }
    function cyan(str) {
        return run(str, code([
            36
        ], 39));
    }
    function white(str) {
        return run(str, code([
            37
        ], 39));
    }
    function gray(str) {
        return run(str, code([
            90
        ], 39));
    }
    function bgBlack(str) {
        return run(str, code([
            40
        ], 49));
    }
    function bgRed(str) {
        return run(str, code([
            41
        ], 49));
    }
    function bgGreen(str) {
        return run(str, code([
            42
        ], 49));
    }
    function bgYellow(str) {
        return run(str, code([
            43
        ], 49));
    }
    function bgBlue(str) {
        return run(str, code([
            44
        ], 49));
    }
    function bgMagenta(str) {
        return run(str, code([
            45
        ], 49));
    }
    function bgCyan(str) {
        return run(str, code([
            46
        ], 49));
    }
    function bgWhite(str) {
        return run(str, code([
            47
        ], 49));
    }
    function clampAndTruncate(n, max = 255, min = 0) {
        return Math.trunc(Math.max(Math.min(n, max), min));
    }
    function rgb8(str, color) {
        return run(str, code([
            38,
            5,
            clampAndTruncate(color)
        ], 39));
    }
    function bgRgb8(str, color) {
        return run(str, code([
            48,
            5,
            clampAndTruncate(color)
        ], 49));
    }
    function rgb24(str, color) {
        if (typeof color === "number") {
            return run(str, code([
                38,
                2,
                color >> 16 & 255,
                color >> 8 & 255,
                color & 255
            ], 39));
        }
        return run(str, code([
            38,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 39));
    }
    function bgRgb24(str, color) {
        if (typeof color === "number") {
            return run(str, code([
                48,
                2,
                color >> 16 & 255,
                color >> 8 & 255,
                color & 255
            ], 49));
        }
        return run(str, code([
            48,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 49));
    }
    const ANSI_PATTERN = new RegExp([
        "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
        "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
    ].join("|"), "g");
    function stripColor(string) {
        return string.replace(ANSI_PATTERN, "");
    }
    const setColorEnabled1 = setColorEnabled;
    const getColorEnabled1 = getColorEnabled;
    const reset1 = reset;
    const bold1 = bold;
    const dim1 = dim;
    const italic1 = italic;
    const underline1 = underline;
    const inverse1 = inverse;
    const hidden1 = hidden;
    const strikethrough1 = strikethrough;
    const black1 = black;
    const red1 = red;
    const green1 = green;
    const yellow1 = yellow;
    const blue1 = blue;
    const magenta1 = magenta;
    const cyan1 = cyan;
    const white1 = white;
    const gray1 = gray;
    const bgBlack1 = bgBlack;
    const bgRed1 = bgRed;
    const bgGreen1 = bgGreen;
    const bgYellow1 = bgYellow;
    const bgBlue1 = bgBlue;
    const bgMagenta1 = bgMagenta;
    const bgCyan1 = bgCyan;
    const bgWhite1 = bgWhite;
    const rgb81 = rgb8;
    const bgRgb81 = bgRgb8;
    const rgb241 = rgb24;
    const bgRgb241 = bgRgb24;
    const stripColor1 = stripColor;
    return {
        setColorEnabled: setColorEnabled,
        getColorEnabled: getColorEnabled,
        reset: reset,
        bold: bold,
        dim: dim,
        italic: italic,
        underline: underline,
        inverse: inverse,
        hidden: hidden,
        strikethrough: strikethrough,
        black: black,
        red: red,
        green: green,
        yellow: yellow,
        blue: blue,
        magenta: magenta,
        cyan: cyan,
        white: white,
        gray: gray,
        bgBlack: bgBlack,
        bgRed: bgRed,
        bgGreen: bgGreen,
        bgYellow: bgYellow,
        bgBlue: bgBlue,
        bgMagenta: bgMagenta,
        bgCyan: bgCyan,
        bgWhite: bgWhite,
        rgb8: rgb8,
        bgRgb8: bgRgb8,
        rgb24: rgb24,
        bgRgb24: bgRgb24,
        stripColor: stripColor
    };
}();
const { red: red1 , green: green1 , white: white1 , blue , gray: gray1 , yellow , bgRed  } = mod4;
function exampleFormat(txt) {
    return gray1(txt.replace(/(\<([^>]*)+(\/){0,1}\>)/g, blue('<$2>')));
}
const __default = {
    "0.27.0": `${red1('BREAKING: use statement is no more supported, please use instead the syntax : import component ComponentName from \'...\'')}`,
    "0.28.0": `\n            - ${red1(`BREAKING: ${white1('introduction of the app type,')} the root component (the first component of your application) will now have to be on type app.\n                this allows a better configuration of your application\n                by adding a head element for example.`)}\n                example:${exampleFormat(`\n                  <template>\n                    <head>\n                      // SEO\n                    </head>\n                    // anything you want\n                  </template>\n                  <proto ${green1('type="app"')}>\n                  </proto>`)}\n\n            - ${red1(`BREAKING: ${white1('Ogone is changing it\'s style,')} we will now use curly braces for props and flags, instead of quotes`)}:\n                basically this means instead of typing this:\n                  ${red1(':item="this.item"')}\n                you will now have to type this:\n                  ${green1('item={this.item}')}\n\n                same thing for the flags:\n                  ${red1('--for="item of this.array"')}\n                you will now have to type this:\n                  ${green1('--for={item of this.array}')}\n\n                dynamic transformation can be done with your IDE using the following regexp:\n                  ${blue('/(?<=\\s)(:|\-{2})(.+?)((=)(["\'`])(.*?)(\\5))/')}\n                replacing the result by:\n                  ${blue('$2$4{$6}')}\n\n            - ${red1(`BREAKING: ${white1('the require syntax for props is no more supported,')} use instead the inherit statement like following`)}:\n                ${exampleFormat(`\n                ${bgRed('require prop as string;')}\n                <proto>\n                  declare:\n                    ${green1('public inherit prop: string = "";')}\n                  // or with def\n                  def:\n                    ${green1('inherit prop: ""')}\n                </proto>`)}\n\n            - ${blue('chore')}: Ogone will start using workers, the first one is set for the local server.\n            - ${blue('chore')}: specifying the port on configurtion is no more required.\n\n            - ${green1('feat')}: Ogone CLI is landed\n              start using it by the following command:\n                ${green1(`\n                  deno install -Afq --unstable https://deno.land/x/ogone@0.28.0/cli/ogone.ts\n                  deno install -Afq --unstable https://x.nest.land/Ogone@0.28.0/cli/ogone.ts\n                `)}\n\n              you can now run your application like following:\n\n                ${green1(`ogone run <path_to_component>`)}\n\n              more as to be done...\n\n            - ${green1('feat')}: using curly braces on components allows us to spread any object.\n                this is the same as adding the spread flag (${green1('--spread')})\n                example:${exampleFormat(`\n                  <MyComponent ${green1('{...this.property}')} />\n                  or\n                  <MyComponent ${green1('--spread={...this.property}')} />`)}\n                duplicate is not allowed\n\n            - ${green1('feat')}: Ogone will now let you choose the type of reaction you want by setting the (${green1('engine')}) attribute to your proto element\n                example:${exampleFormat(`\n                  <proto ${green1('engine="inline-reaction"')} /> will change your script by adding a function after all assignment.\n                    ${yellow('[optional]')} is set by default if the ${green1('def')} modifier is used.\n\n                  <proto ${green1('engine="proxy-reaction"')} /> will tell to Ogone to use a proxy.\n                    ${yellow('[optional]')} is set by default if the ${green1('declare')} modifier is used.`)}\n\n            - ${green1('feat')}: start tuning your webcomponents with Ogone, by using the attribute (${green1('is')}) on the template element.\n                example:\n                  ${exampleFormat(`<template ${green1('is="my-awesome-webcomponent"')} />`)}\n\n                you can also set the attribute (${green1('engine')}) to your proto element and add the argument (${green1('sync-template')})\n                this will tell to Ogone to update the webcomponent's data when the component is updated.\n                example: ${exampleFormat(`\n                  <template ${green1('is="my-awesome-webcomponent"')} />\n                  <proto ${green1('engine="sync-template proxy-reaction"')}>\n                    // ...\n                  </proto>`)}\n\n                  if your custom element is an extension of an element, please consider using arguments like following,\n                  where element is the tag you want:\n                  ${exampleFormat(`\n                  <template ${green1('is="my-custom-element:element"')} />\n                  <proto ${green1('engine="sync-template proxy-reaction"')}>\n                    // ...\n                  </proto>`)}\n                by default Ogone uses the method (${green1('attributeChangedCallback')}) when any property is updated.\n                your webcomponent can also expose the following methods as callback:\n                 - beforeUpdate\n                 - beforeDestroy\n\n            - ${green1('feat')}: Great news for Visual Studio Code users, Ogone will now let build your components with a new dev tool\n              passing the flag ${green1('--open-designer')} will open a webview in your IDE\n              you will be able to see your component while your building it.\n  `
};
const importMeta = {
    url: "file:///home/rudy/Documents/Perso/Ogone/src/classes/Configuration.ts",
    main: false
};
class Configuration {
    static entrypoint = "/index.o3";
    static port = 0;
    static ["static"] = "/public";
    static modules = "/modules";
    static OgoneDesignerOpened = false;
    static setConfig(config) {
        try {
            if (!config) {
                throw new TypeError(`no configuration provided to class Configuration\n${importMeta.url}`);
            }
            Configuration.entrypoint = config.entrypoint;
            Configuration.port = config.port ? config.port : 0;
            Configuration.static = config.static;
            Configuration.head = config.head;
            Configuration.controllers = config.controllers;
            Configuration.devtool = config.devtool;
            Configuration.minifyCSS = config.minifyCSS;
            Configuration.compileCSS = config.compileCSS;
            Configuration.build = config.build;
            Configuration.serve = config.serve;
            Configuration.types = config.types;
        } catch (err) {
            Utils1.error(`Configuration: ${err.message}`);
        }
    }
}
var Flags;
(function(Flags1) {
    Flags1["DEVTOOL"] = '--devtool';
    Flags1["TRACE"] = '--ogone-trace';
    Flags1["DESIGNER"] = '--open-designer';
    Flags1["RELEASE"] = '--release';
})(Flags || (Flags = {
}));
const { lstat , lstatSync  } = Deno;
function existsSync(filePath) {
    try {
        lstatSync(filePath);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
const importMeta1 = {
    url: "file:///home/rudy/Documents/Perso/Ogone/src/classes/OgoneWorkers.ts",
    main: false
};
class OgoneWorkers {
    static serviceDev = new Worker(new URL("../workers/server-dev.ts", importMeta1.url).href, {
        type: "module",
        deno: true
    });
    static lspWebsocketClientWorker = new Worker(new URL("../workers/lsp-websocket-client.ts", importMeta1.url).href, {
        type: "module",
        deno: true
    });
}
var Workers;
(function(Workers1) {
    Workers1["SERVICE_DEV_READY"] = "SERVICE_DEV_READY";
    Workers1["INIT_MESSAGE_SERVICE_DEV"] = "INIT_MESSAGE_SERVICE_DEV";
    Workers1["SERVICE_DEV_GET_PORT"] = "SERVICE_DEV_GET_PORT";
    Workers1["LSP_SEND_PORT"] = "LSP_SEND_PORT";
    Workers1["LSP_OPEN_WEBVIEW"] = "LSP_OPEN_WEBVIEW";
    Workers1["LSP_UPDATE_CURRENT_COMPONENT"] = "LSP_UPDATE_CURRENT_COMPONENT";
    Workers1["LSP_UPDATE_SERVER_COMPONENT"] = "LSP_UPDATE_SERVER_COMPONENT";
    Workers1["LSP_CURRENT_COMPONENT_RENDERED"] = "LSP_CURRENT_COMPONENT_RENDERED";
    Workers1["LSP_SEND_COMPONENT_INFORMATIONS"] = "LSP_SEND_COMPONENT_INFORMATIONS";
    Workers1["LSP_SEND_ROOT_COMPONENT_FILE"] = "LSP_SEND_ROOT_COMPONENT_FILE";
    Workers1["LSP_ERROR"] = "LSP_ERROR";
    Workers1["LSP_CLOSE"] = "LSP_CLOSE";
})(Workers || (Workers = {
}));
const navigator = globalThis.navigator;
let isWindows = false;
if (globalThis.Deno != null) {
    isWindows = Deno.build.os == "windows";
} else if (navigator?.appVersion != null) {
    isWindows = navigator.appVersion.includes("Win");
}
function assertPath(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
function isPosixPathSeparator(code) {
    return code === 47;
}
function isPathSeparator(code) {
    return isPosixPathSeparator(code) || code === 92;
}
function isWindowsDeviceRoot(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator1) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0, len = path.length; i <= len; ++i){
        if (i < len) code = path.charCodeAt(i);
        else if (isPathSeparator1(code)) break;
        else code = 47;
        if (isPathSeparator1(code)) {
            if (lastSlash === i - 1 || dots === 1) {
            } else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format(sep, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep + base;
}
const mod1 = function() {
    const sep = "/";
    const delimiter = ":";
    function resolve(...pathSegments) {
        let resolvedPath = "";
        let resolvedAbsolute = false;
        for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
            let path;
            if (i >= 0) path = pathSegments[i];
            else {
                if (globalThis.Deno == null) {
                    throw new TypeError("Resolved a relative path without a CWD.");
                }
                path = Deno.cwd();
            }
            assertPath(path);
            if (path.length === 0) {
                continue;
            }
            resolvedPath = `${path}/${resolvedPath}`;
            resolvedAbsolute = path.charCodeAt(0) === 47;
        }
        resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
        if (resolvedAbsolute) {
            if (resolvedPath.length > 0) return `/${resolvedPath}`;
            else return "/";
        } else if (resolvedPath.length > 0) return resolvedPath;
        else return ".";
    }
    function normalize(path) {
        assertPath(path);
        if (path.length === 0) return ".";
        const isAbsolute = path.charCodeAt(0) === 47;
        const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
        path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator);
        if (path.length === 0 && !isAbsolute) path = ".";
        if (path.length > 0 && trailingSeparator) path += "/";
        if (isAbsolute) return `/${path}`;
        return path;
    }
    function isAbsolute(path) {
        assertPath(path);
        return path.length > 0 && path.charCodeAt(0) === 47;
    }
    function join(...paths) {
        if (paths.length === 0) return ".";
        let joined;
        for(let i = 0, len = paths.length; i < len; ++i){
            const path = paths[i];
            assertPath(path);
            if (path.length > 0) {
                if (!joined) joined = path;
                else joined += `/${path}`;
            }
        }
        if (!joined) return ".";
        return normalize(joined);
    }
    function relative(from, to) {
        assertPath(from);
        assertPath(to);
        if (from === to) return "";
        from = resolve(from);
        to = resolve(to);
        if (from === to) return "";
        let fromStart = 1;
        const fromEnd = from.length;
        for(; fromStart < fromEnd; ++fromStart){
            if (from.charCodeAt(fromStart) !== 47) break;
        }
        const fromLen = fromEnd - fromStart;
        let toStart = 1;
        const toEnd = to.length;
        for(; toStart < toEnd; ++toStart){
            if (to.charCodeAt(toStart) !== 47) break;
        }
        const toLen = toEnd - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for(; i <= length; ++i){
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === 47) {
                        return to.slice(toStart + i + 1);
                    } else if (i === 0) {
                        return to.slice(toStart + i);
                    }
                } else if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === 47) {
                        lastCommonSep = i;
                    } else if (i === 0) {
                        lastCommonSep = 0;
                    }
                }
                break;
            }
            const fromCode = from.charCodeAt(fromStart + i);
            const toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode) break;
            else if (fromCode === 47) lastCommonSep = i;
        }
        let out = "";
        for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
            if (i === fromEnd || from.charCodeAt(i) === 47) {
                if (out.length === 0) out += "..";
                else out += "/..";
            }
        }
        if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
        else {
            toStart += lastCommonSep;
            if (to.charCodeAt(toStart) === 47) ++toStart;
            return to.slice(toStart);
        }
    }
    function toNamespacedPath(path) {
        return path;
    }
    function dirname(path) {
        assertPath(path);
        if (path.length === 0) return ".";
        const hasRoot = path.charCodeAt(0) === 47;
        let end = -1;
        let matchedSlash = true;
        for(let i = path.length - 1; i >= 1; --i){
            if (path.charCodeAt(i) === 47) {
                if (!matchedSlash) {
                    end = i;
                    break;
                }
            } else {
                matchedSlash = false;
            }
        }
        if (end === -1) return hasRoot ? "/" : ".";
        if (hasRoot && end === 1) return "//";
        return path.slice(0, end);
    }
    function basename(path, ext = "") {
        if (ext !== undefined && typeof ext !== "string") {
            throw new TypeError('"ext" argument must be a string');
        }
        assertPath(path);
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path) return "";
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;
            for(i = path.length - 1; i >= 0; --i){
                const code = path.charCodeAt(i);
                if (code === 47) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                } else {
                    if (firstNonSlashEnd === -1) {
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        if (code === ext.charCodeAt(extIdx)) {
                            if ((--extIdx) === -1) {
                                end = i;
                            }
                        } else {
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end) end = firstNonSlashEnd;
            else if (end === -1) end = path.length;
            return path.slice(start, end);
        } else {
            for(i = path.length - 1; i >= 0; --i){
                if (path.charCodeAt(i) === 47) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                } else if (end === -1) {
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1) return "";
            return path.slice(start, end);
        }
    }
    function extname(path) {
        assertPath(path);
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        for(let i = path.length - 1; i >= 0; --i){
            const code = path.charCodeAt(i);
            if (code === 47) {
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46) {
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            return "";
        }
        return path.slice(startDot, end);
    }
    function format(pathObject) {
        if (pathObject === null || typeof pathObject !== "object") {
            throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
        }
        return _format("/", pathObject);
    }
    function parse(path) {
        assertPath(path);
        const ret = {
            root: "",
            dir: "",
            base: "",
            ext: "",
            name: ""
        };
        if (path.length === 0) return ret;
        const isAbsolute1 = path.charCodeAt(0) === 47;
        let start;
        if (isAbsolute1) {
            ret.root = "/";
            start = 1;
        } else {
            start = 0;
        }
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        let preDotState = 0;
        for(; i >= start; --i){
            const code = path.charCodeAt(i);
            if (code === 47) {
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46) {
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            if (end !== -1) {
                if (startPart === 0 && isAbsolute1) {
                    ret.base = ret.name = path.slice(1, end);
                } else {
                    ret.base = ret.name = path.slice(startPart, end);
                }
            }
        } else {
            if (startPart === 0 && isAbsolute1) {
                ret.name = path.slice(1, startDot);
                ret.base = path.slice(1, end);
            } else {
                ret.name = path.slice(startPart, startDot);
                ret.base = path.slice(startPart, end);
            }
            ret.ext = path.slice(startDot, end);
        }
        if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
        else if (isAbsolute1) ret.dir = "/";
        return ret;
    }
    function fromFileUrl(url) {
        return new URL(String(url)).pathname;
    }
    return {
        sep,
        delimiter,
        resolve,
        normalize,
        isAbsolute,
        join,
        relative,
        toNamespacedPath,
        dirname,
        basename,
        extname,
        format,
        parse,
        fromFileUrl
    };
}();
class DenoStdInternalError extends Error {
    constructor(message1){
        super(message1);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
const mod2 = function() {
    const sep = "\\";
    const delimiter = ";";
    function resolve(...pathSegments) {
        let resolvedDevice = "";
        let resolvedTail = "";
        let resolvedAbsolute = false;
        for(let i = pathSegments.length - 1; i >= -1; i--){
            let path;
            if (i >= 0) {
                path = pathSegments[i];
            } else if (!resolvedDevice) {
                if (globalThis.Deno == null) {
                    throw new TypeError("Resolved a drive-letter-less path without a CWD.");
                }
                path = Deno.cwd();
            } else {
                if (globalThis.Deno == null) {
                    throw new TypeError("Resolved a relative path without a CWD.");
                }
                path = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
                if (path === undefined || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                    path = `${resolvedDevice}\\`;
                }
            }
            assertPath(path);
            const len = path.length;
            if (len === 0) continue;
            let rootEnd = 0;
            let device = "";
            let isAbsolute = false;
            const code = path.charCodeAt(0);
            if (len > 1) {
                if (isPathSeparator(code)) {
                    isAbsolute = true;
                    if (isPathSeparator(path.charCodeAt(1))) {
                        let j = 2;
                        let last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            const firstPart = path.slice(last, j);
                            last = j;
                            for(; j < len; ++j){
                                if (!isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j < len && j !== last) {
                                last = j;
                                for(; j < len; ++j){
                                    if (isPathSeparator(path.charCodeAt(j))) break;
                                }
                                if (j === len) {
                                    device = `\\\\${firstPart}\\${path.slice(last)}`;
                                    rootEnd = j;
                                } else if (j !== last) {
                                    device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                    rootEnd = j;
                                }
                            }
                        }
                    } else {
                        rootEnd = 1;
                    }
                } else if (isWindowsDeviceRoot(code)) {
                    if (path.charCodeAt(1) === 58) {
                        device = path.slice(0, 2);
                        rootEnd = 2;
                        if (len > 2) {
                            if (isPathSeparator(path.charCodeAt(2))) {
                                isAbsolute = true;
                                rootEnd = 3;
                            }
                        }
                    }
                }
            } else if (isPathSeparator(code)) {
                rootEnd = 1;
                isAbsolute = true;
            }
            if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
                continue;
            }
            if (resolvedDevice.length === 0 && device.length > 0) {
                resolvedDevice = device;
            }
            if (!resolvedAbsolute) {
                resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
                resolvedAbsolute = isAbsolute;
            }
            if (resolvedAbsolute && resolvedDevice.length > 0) break;
        }
        resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
        return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
    }
    function normalize(path) {
        assertPath(path);
        const len = path.length;
        if (len === 0) return ".";
        let rootEnd = 0;
        let device;
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                isAbsolute = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                return `\\\\${firstPart}\\${path.slice(last)}\\`;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            return "\\";
        }
        let tail;
        if (rootEnd < len) {
            tail = normalizeString(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator);
        } else {
            tail = "";
        }
        if (tail.length === 0 && !isAbsolute) tail = ".";
        if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
            tail += "\\";
        }
        if (device === undefined) {
            if (isAbsolute) {
                if (tail.length > 0) return `\\${tail}`;
                else return "\\";
            } else if (tail.length > 0) {
                return tail;
            } else {
                return "";
            }
        } else if (isAbsolute) {
            if (tail.length > 0) return `${device}\\${tail}`;
            else return `${device}\\`;
        } else if (tail.length > 0) {
            return device + tail;
        } else {
            return device;
        }
    }
    function isAbsolute(path) {
        assertPath(path);
        const len = path.length;
        if (len === 0) return false;
        const code = path.charCodeAt(0);
        if (isPathSeparator(code)) {
            return true;
        } else if (isWindowsDeviceRoot(code)) {
            if (len > 2 && path.charCodeAt(1) === 58) {
                if (isPathSeparator(path.charCodeAt(2))) return true;
            }
        }
        return false;
    }
    function join(...paths) {
        const pathsCount = paths.length;
        if (pathsCount === 0) return ".";
        let joined;
        let firstPart = null;
        for(let i = 0; i < pathsCount; ++i){
            const path = paths[i];
            assertPath(path);
            if (path.length > 0) {
                if (joined === undefined) joined = firstPart = path;
                else joined += `\\${path}`;
            }
        }
        if (joined === undefined) return ".";
        let needsReplace = true;
        let slashCount = 0;
        assert(firstPart != null);
        if (isPathSeparator(firstPart.charCodeAt(0))) {
            ++slashCount;
            const firstLen = firstPart.length;
            if (firstLen > 1) {
                if (isPathSeparator(firstPart.charCodeAt(1))) {
                    ++slashCount;
                    if (firstLen > 2) {
                        if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                        else {
                            needsReplace = false;
                        }
                    }
                }
            }
        }
        if (needsReplace) {
            for(; slashCount < joined.length; ++slashCount){
                if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
            }
            if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
        }
        return normalize(joined);
    }
    function relative(from, to) {
        assertPath(from);
        assertPath(to);
        if (from === to) return "";
        const fromOrig = resolve(from);
        const toOrig = resolve(to);
        if (fromOrig === toOrig) return "";
        from = fromOrig.toLowerCase();
        to = toOrig.toLowerCase();
        if (from === to) return "";
        let fromStart = 0;
        let fromEnd = from.length;
        for(; fromStart < fromEnd; ++fromStart){
            if (from.charCodeAt(fromStart) !== 92) break;
        }
        for(; fromEnd - 1 > fromStart; --fromEnd){
            if (from.charCodeAt(fromEnd - 1) !== 92) break;
        }
        const fromLen = fromEnd - fromStart;
        let toStart = 0;
        let toEnd = to.length;
        for(; toStart < toEnd; ++toStart){
            if (to.charCodeAt(toStart) !== 92) break;
        }
        for(; toEnd - 1 > toStart; --toEnd){
            if (to.charCodeAt(toEnd - 1) !== 92) break;
        }
        const toLen = toEnd - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for(; i <= length; ++i){
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === 92) {
                        return toOrig.slice(toStart + i + 1);
                    } else if (i === 2) {
                        return toOrig.slice(toStart + i);
                    }
                }
                if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === 92) {
                        lastCommonSep = i;
                    } else if (i === 2) {
                        lastCommonSep = 3;
                    }
                }
                break;
            }
            const fromCode = from.charCodeAt(fromStart + i);
            const toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode) break;
            else if (fromCode === 92) lastCommonSep = i;
        }
        if (i !== length && lastCommonSep === -1) {
            return toOrig;
        }
        let out = "";
        if (lastCommonSep === -1) lastCommonSep = 0;
        for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
            if (i === fromEnd || from.charCodeAt(i) === 92) {
                if (out.length === 0) out += "..";
                else out += "\\..";
            }
        }
        if (out.length > 0) {
            return out + toOrig.slice(toStart + lastCommonSep, toEnd);
        } else {
            toStart += lastCommonSep;
            if (toOrig.charCodeAt(toStart) === 92) ++toStart;
            return toOrig.slice(toStart, toEnd);
        }
    }
    function toNamespacedPath(path) {
        if (typeof path !== "string") return path;
        if (path.length === 0) return "";
        const resolvedPath = resolve(path);
        if (resolvedPath.length >= 3) {
            if (resolvedPath.charCodeAt(0) === 92) {
                if (resolvedPath.charCodeAt(1) === 92) {
                    const code = resolvedPath.charCodeAt(2);
                    if (code !== 63 && code !== 46) {
                        return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                    }
                }
            } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
                if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                    return `\\\\?\\${resolvedPath}`;
                }
            }
        }
        return path;
    }
    function dirname(path) {
        assertPath(path);
        const len = path.length;
        if (len === 0) return ".";
        let rootEnd = -1;
        let end = -1;
        let matchedSlash = true;
        let offset = 0;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                rootEnd = offset = 1;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                return path;
                            }
                            if (j !== last) {
                                rootEnd = offset = j + 1;
                            }
                        }
                    }
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    rootEnd = offset = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            return path;
        }
        for(let i = len - 1; i >= offset; --i){
            if (isPathSeparator(path.charCodeAt(i))) {
                if (!matchedSlash) {
                    end = i;
                    break;
                }
            } else {
                matchedSlash = false;
            }
        }
        if (end === -1) {
            if (rootEnd === -1) return ".";
            else end = rootEnd;
        }
        return path.slice(0, end);
    }
    function basename(path, ext = "") {
        if (ext !== undefined && typeof ext !== "string") {
            throw new TypeError('"ext" argument must be a string');
        }
        assertPath(path);
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (path.length >= 2) {
            const drive = path.charCodeAt(0);
            if (isWindowsDeviceRoot(drive)) {
                if (path.charCodeAt(1) === 58) start = 2;
            }
        }
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path) return "";
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;
            for(i = path.length - 1; i >= start; --i){
                const code = path.charCodeAt(i);
                if (isPathSeparator(code)) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                } else {
                    if (firstNonSlashEnd === -1) {
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        if (code === ext.charCodeAt(extIdx)) {
                            if ((--extIdx) === -1) {
                                end = i;
                            }
                        } else {
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end) end = firstNonSlashEnd;
            else if (end === -1) end = path.length;
            return path.slice(start, end);
        } else {
            for(i = path.length - 1; i >= start; --i){
                if (isPathSeparator(path.charCodeAt(i))) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                } else if (end === -1) {
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1) return "";
            return path.slice(start, end);
        }
    }
    function extname(path) {
        assertPath(path);
        let start = 0;
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        if (path.length >= 2 && path.charCodeAt(1) === 58 && isWindowsDeviceRoot(path.charCodeAt(0))) {
            start = startPart = 2;
        }
        for(let i = path.length - 1; i >= start; --i){
            const code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46) {
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            return "";
        }
        return path.slice(startDot, end);
    }
    function format(pathObject) {
        if (pathObject === null || typeof pathObject !== "object") {
            throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
        }
        return _format("\\", pathObject);
    }
    function parse(path) {
        assertPath(path);
        const ret = {
            root: "",
            dir: "",
            base: "",
            ext: "",
            name: ""
        };
        const len = path.length;
        if (len === 0) return ret;
        let rootEnd = 0;
        let code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                rootEnd = 1;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                rootEnd = j;
                            } else if (j !== last) {
                                rootEnd = j + 1;
                            }
                        }
                    }
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            if (len === 3) {
                                ret.root = ret.dir = path;
                                return ret;
                            }
                            rootEnd = 3;
                        }
                    } else {
                        ret.root = ret.dir = path;
                        return ret;
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            ret.root = ret.dir = path;
            return ret;
        }
        if (rootEnd > 0) ret.root = path.slice(0, rootEnd);
        let startDot = -1;
        let startPart = rootEnd;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        let preDotState = 0;
        for(; i >= rootEnd; --i){
            code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46) {
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            if (end !== -1) {
                ret.base = ret.name = path.slice(startPart, end);
            }
        } else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
            ret.ext = path.slice(startDot, end);
        }
        if (startPart > 0 && startPart !== rootEnd) {
            ret.dir = path.slice(0, startPart - 1);
        } else ret.dir = ret.root;
        return ret;
    }
    function fromFileUrl(url) {
        return new URL(String(url)).pathname.replace(/^\/*([A-Za-z]:)(\/|$)/, "$1/").replace(/\//g, "\\");
    }
    return {
        sep,
        delimiter,
        resolve,
        normalize,
        isAbsolute,
        join,
        relative,
        toNamespacedPath,
        dirname,
        basename,
        extname,
        format,
        parse,
        fromFileUrl
    };
}();
const path1 = isWindows ? mod2 : mod1;
const { basename , delimiter , dirname , extname , format , fromFileUrl , isAbsolute , join , normalize , parse , relative , resolve: resolve1 , sep , toNamespacedPath ,  } = path1;
const SEP = isWindows ? "\\" : "/";
const SEP_PATTERN = isWindows ? /[\\/]+/ : /\/+/;
function getDeepTranslation1(str = "", template, callback) {
    let result = str;
    if (!template) return result;
    while(Object.keys(template).find((key)=>result.indexOf(key) > -1
    )){
        const key = Object.keys(template).find((key1)=>result.indexOf(key1) > -1
        );
        if (key) {
            const index = result.indexOf(key);
            const firstPart = result.substring(0, index);
            const secondPart = result.substring(index + key.length, result.length);
            result = `${firstPart}${callback ? callback(key) : template[key]}${secondPart}`;
        }
    }
    return result;
}
function absolute1(base, relative1) {
    const stack = base.split("/"), parts = relative1.split("/");
    stack.pop();
    for(let i = 0; i < parts.length; i++){
        if (parts[i] == ".") {
            continue;
        }
        if (parts[i] == "..") {
            stack.pop();
        } else {
            stack.push(parts[i]);
        }
    }
    return stack.join("/");
}
async function fetchRemoteRessource(p) {
    const a = await fetch(p);
    if (a.status < 400) {
        const b = await a.blob();
        const c = await b.text();
        return c;
    } else {
        return null;
    }
}
const FIFOMessages = [];
class Utils {
    getDeepTranslation = getDeepTranslation1;
    static client = new WebSocket('ws://localhost:3441/');
    static getDeepTranslation = getDeepTranslation1;
    absolute = absolute1;
    trace(message) {
        if (Deno.args.includes(Flags.TRACE)) {
            this.message(`${this.constructor.name} ${message}`);
        }
    }
    static trace(message) {
        if (Deno.args.includes(Flags.TRACE)) {
            this.message(`${this.constructor.name} ${message}`);
        }
    }
    warn(message, opts) {
        const { bgYellow , bold , black , yellow: yellow1  } = mod4;
        this.message(`${bgYellow(bold(black("   WARN  ")))} ${yellow1(message)}`);
    }
    error(message, opts) {
        const { bgRed: bgRed1 , red: red1 , bold , yellow: yellow1  } = mod4;
        const m = this.message(`${bgRed1("  ERROR  ")} ${red1(message)}\n${yellow1(`\n\t\tfeeling like it's an issue ?\n\t\tplease report on https://github.com/SRNV/Ogone/issues/new?assignees=&modifiers=&template=bug_report.md&title=`)}`, {
            returns: true
        });
        if (Configuration.OgoneDesignerOpened) {
            this.notify({
                type: Workers.LSP_ERROR,
                message: m
            });
        }
        throw new Error(m);
    }
    static error(message, opts) {
        const { bgRed: bgRed1 , red: red1 , bold , yellow: yellow1  } = mod4;
        const m = this.message(`${bgRed1("  ERROR  ")} ${red1(message)}\n${yellow1(`\n\t\tfeeling like it's an issue ?\n\t\tplease report on https://github.com/SRNV/Ogone/issues/new?assignees=&modifiers=&template=bug_report.md&title=`)}`, {
            returns: true
        });
        if (Configuration.OgoneDesignerOpened) {
            this.notify({
                type: Workers.LSP_ERROR,
                message: m
            });
        }
        throw new Error(m);
    }
    success(message, opts) {
        const { bgBlack , white: white1 , bold , green: green1  } = mod4;
        this.message(`${bgBlack(bold(green1(" SUCCESS ")))} ${white1(message)}`);
    }
    static success(message, opts) {
        const { bgBlack , white: white1 , bold , green: green1  } = mod4;
        this.message(`${bgBlack(bold(green1(" SUCCESS ")))} ${white1(message)}`);
    }
    infos(message, opts) {
        const { bgBlack , bold , blue: blue1  } = mod4;
        this.message(`${bgBlack(bold(blue1("  INFOS  ")))} ${blue1(message)}`);
    }
    static infos(message, opts) {
        const { bgBlack , bold , blue: blue1  } = mod4;
        this.message(`${bgBlack(bold(blue1("  INFOS  ")))} ${blue1(message)}`);
    }
    message(message, opts) {
        const { cyan , bold  } = mod4;
        const name = bold(cyan(" [Ogone] "));
        if (opts && opts.returns) {
            return `${name} ${message}`;
        } else {
            console.log(name, message);
            return;
        }
    }
    static message(message, opts) {
        const { cyan , bold , white: white1  } = mod4;
        const name = bold(cyan(" [Ogone] "));
        if (opts && opts.returns) {
            return `${name} ${message}`;
        } else {
            console.log(name, message);
            return;
        }
    }
    template(tmpl, data) {
        let result = tmpl;
        const fn = new Function("__value", ...Object.keys(data), `try { return eval('('+ __value + ')'); } catch(err) { throw err; }`);
        const values = Object.values(data);
        while(result.indexOf("{%") > -1 && result.indexOf("%}") > -1){
            if (result.indexOf("{%") > result.indexOf("%}")) {
                result = result.replace("%}", "% }");
            }
            const start = result.indexOf("{%");
            const end = result.indexOf("%}") + 2;
            const substrContent = result.substring(start + 2, end - 2).trim();
            const partStart = result.substring(0, start);
            const partEnd = result.substring(end);
            result = partStart + fn(substrContent, ...values) + partEnd;
        }
        return result;
    }
    static template(tmpl, data) {
        let result = tmpl;
        const fn = new Function("__value", ...Object.keys(data), `try { return eval('('+ __value + ')'); } catch(err) { throw err; }`);
        const values = Object.values(data);
        while(result.indexOf("{%") > -1 && result.indexOf("%}") > -1){
            if (result.indexOf("{%") > result.indexOf("%}")) {
                result = result.replace("%}", "% }");
            }
            const start = result.indexOf("{%");
            const end = result.indexOf("%}") + 2;
            const substrContent = result.substring(start + 2, end - 2).trim();
            const partStart = result.substring(0, start);
            const partEnd = result.substring(end);
            result = partStart + fn(substrContent, ...values) + partEnd;
        }
        return result;
    }
    static notify(data) {
        if (Utils.client.readyState !== 1) {
            FIFOMessages.push(JSON.stringify(data));
        } else {
            FIFOMessages.forEach((message2)=>{
                Utils.client.send(message2);
            });
            FIFOMessages.splice(0);
            Utils.client.send(JSON.stringify(data));
        }
    }
    notify = Utils.notify.bind(this);
}
const Utils1 = Utils;
class MapPosition extends Utils {
    static mapTokens = new Map();
    static mapNodes = new Map();
    static getColumn(text, position, startIndex = 0) {
        try {
            const array = text.split('\n');
            let i = 0;
            let currentLine = this.getLine(text, position);
            const currentColumn = array.map((line, index)=>{
                const part1 = array.slice(0, index).join('\n').length;
                const result = line.slice(0, i - line.length);
                i = part1 - line.length;
                return part1 <= position.start ? currentLine === index + 1 ? result : '' : '';
            });
            const result = currentColumn.find((line)=>line.length
            )?.length || 0;
            return result - startIndex > 0 ? result - startIndex : 0;
        } catch (err) {
            this.error(`MapPosition: ${err.message}`);
        }
    }
    static getLine(text, position, startIndex = 0) {
        try {
            const array = text.split('\n');
            const currentLine = array.find((line, index)=>{
                const part1 = array.slice(0, index).join('\n').length;
                return part1 > position.start;
            });
            const result = currentLine && array.indexOf(currentLine) || 0;
            return result;
        } catch (err) {
            this.error(`MapPosition: ${err.message}`);
        }
    }
}
function savePosition(id, start, end) {
    return MapPosition.mapTokens.set(id, {
        start,
        end
    });
}
const __default1 = function(opts) {
    const { typedExpressions , expressions , value , name , array , before ,  } = opts;
    let result = before ? before(value) : value;
    array.forEach((item)=>{
        if (name && !item.name) return;
        if (name && item.name && name !== item.name) return;
        if (item.open && item.close && item.id && item.pair) {
            while(!((result.split(item.open).length - 1) % 2) && result.indexOf(item.open) > -1 && result.indexOf(item.close) > -1 && result.match(item.reg)){
                const matches = result.match(item.reg);
                const value1 = matches ? matches[0] : null;
                if (matches && value1) {
                    const newId = item.id(value1, matches, typedExpressions, expressions);
                    result = result.replace(item.reg, newId);
                    const start = getDeepTranslation1(result.slice(0, result.indexOf(newId)), expressions).length;
                    const end = getDeepTranslation1(value1, expressions).length + start;
                    savePosition(newId, start, end);
                }
            }
            return;
        }
        if (item.open && item.close && item.id && !item.pair) {
            while(result.indexOf(item.open) > -1 && result.indexOf(item.close) > -1 && result.match(item.reg)){
                const matches = result.match(item.reg);
                const value1 = matches ? matches[0] : null;
                if (matches && value1) {
                    const newId = item.id(value1, matches, typedExpressions, expressions);
                    result = result.replace(item.reg, newId);
                    const start = getDeepTranslation1(result.slice(0, result.indexOf(newId)), expressions).length;
                    const end = getDeepTranslation1(value1, expressions).length + start;
                    savePosition(newId, start, end);
                }
            }
            return;
        }
        if (item.open === false && item.close === false && item.id) {
            while(result.match(item.reg)){
                const matches = result.match(item.reg);
                const value1 = matches ? matches[0] : null;
                if (matches && value1) {
                    const newId = item.id(value1, matches, typedExpressions, expressions);
                    result = result.replace(item.reg, newId);
                    const start = getDeepTranslation1(result.slice(0, result.indexOf(newId)), expressions).length;
                    const end = getDeepTranslation1(value1, expressions).length + start;
                    savePosition(newId, start, end);
                }
            }
        }
        if (item.split && item.splittedId) {
            while(result.indexOf(item.split[0]) > -1 && result.indexOf(item.split[1]) > -1 && result.indexOf(item.split[0]) < result.indexOf(item.split[1])){
                const part1 = result.substring(result.indexOf(item.split[0]), result.indexOf(item.split[1]) + 2);
                result = result.replace(part1, item.splittedId(result, expressions));
            }
        }
    });
    return result;
};
class ModuleErrors extends Utils {
    static checkDiagnostics(component, diagnostics, onError) {
        try {
            const { blue: blue1 , red: red1 , gray: gray1 ,  } = mod4;
            function renderChainedDiags(chainedDiags) {
                let result = ``;
                const { red: red2  } = mod4;
                if (chainedDiags && chainedDiags.length) {
                    for (const d of chainedDiags){
                        const diag = d;
                        result += red2(`TS${d.code} [ERROR] `);
                        result += `${d && d.messageText}\n`;
                    }
                }
                return result;
            }
            if (diagnostics && diagnostics.length) {
                let errors = '';
                if (onError) {
                    onError();
                }
                for (const d of diagnostics.filter((d1)=>d1.start
                )){
                    const diag = d;
                    const start = d.start && d.start.character || 0;
                    const end = d.end && d.end.character || 0;
                    const underline = red1(`${' '.repeat(start)}^${'~'.repeat(end - start - 1)}`);
                    let sourceline = d && d.sourceLine || '';
                    sourceline = gray1(sourceline.substring(0, start)) + red1(sourceline.substring(start, end)) + gray1(sourceline.substring(end));
                    errors += `\n        ${red1(`TS${d && d.code} [ERROR]`)} ${blue1(d && d.messageChain && d.messageChain.messageText || d && d.messageText || '')}\n        ${blue1(renderChainedDiags(d && d.messageChain && d.messageChain.next || []))}\n          ${sourceline}\n          ${underline}\n        at ${blue1(d && d.fileName || '')}:${d.start && d.start.line + 1 || ''}:${d.start && d.start.character || ''}`;
                }
                this.ShowErrors(`${component.file}\n${errors}`);
                if (!Configuration.OgoneDesignerOpened) {
                    Deno.exit(1);
                }
            } else {
                return;
            }
        } catch (err) {
            this.error(`ModuleErrors: ${err.message}`);
        }
    }
    static ShowErrors(message, opts) {
        try {
            const { bgRed: bgRed1 , red: red1 , bold , yellow: yellow1  } = mod4;
            const m = ModuleErrors.message(`${bgRed1("  ERROR  ")} ${red1(message)}`, {
                returns: true
            });
            if (Configuration.OgoneDesignerOpened) {
                OgoneWorkers.lspWebsocketClientWorker.postMessage({
                    type: Workers.LSP_ERROR,
                    message: m
                });
            }
            console.error(m);
        } catch (err) {
            this.error(`ModuleErrors: ${err.message}`);
        }
    }
}
const importMeta2 = {
    url: "file:///home/rudy/Documents/Perso/Ogone/src/classes/TSXContextCreator.ts",
    main: false
};
class TSXContextCreator1 extends Utils {
    async read(bundle, opts = {
    }) {
        try {
            const { checkOnly  } = opts;
            let hasError = false;
            this.warn(`Type checking.`);
            const entries = Array.from(bundle.components.entries());
            for await (const [key, component] of entries){
                if (checkOnly && component.isTyped && (component.file === checkOnly || component.file.endsWith(checkOnly) || checkOnly && checkOnly.endsWith(component.file))) {
                    const diagnosticError = await this.createContext(bundle, component);
                    if (diagnosticError) {
                        hasError = diagnosticError;
                    }
                } else if (!checkOnly && component.isTyped) {
                    const diagnosticError = await this.createContext(bundle, component);
                    if (diagnosticError) {
                        hasError = diagnosticError;
                    }
                }
            }
            if (!hasError) {
                this.success('no type error found.');
            }
        } catch (err) {
            this.error(`TSXContextCreator: ${err.message}`);
        }
    }
    async createContext(bundle, component) {
        try {
            const { green: green1 , gray: gray1  } = mod4;
            const baseUrl = new URL(importMeta2.url);
            baseUrl.pathname = component.file;
            const p = new URL(`/${component.file}.tsx`, baseUrl).pathname;
            const newpath = join(Deno.cwd(), `.${p}`);
            const startPerf = performance.now();
            const { protocol  } = component.context;
            Deno.writeTextFileSync(newpath, protocol);
            const { diagnostics: diags  } = await Deno.emit(newpath, {
                compilerOptions: {
                    module: "esnext",
                    target: "esnext",
                    noImplicitThis: false,
                    noFallthroughCasesInSwitch: false,
                    allowJs: false,
                    removeComments: false,
                    experimentalDecorators: true,
                    noImplicitAny: true,
                    allowUnreachableCode: false,
                    jsx: "react",
                    jsxFactory: "h",
                    jsxFragmentFactory: "hf",
                    lib: [
                        "dom",
                        "esnext"
                    ],
                    inlineSourceMap: false,
                    inlineSources: false,
                    alwaysStrict: false,
                    sourceMap: false,
                    strictFunctionTypes: true
                }
            });
            Deno.removeSync(newpath);
            ModuleErrors.checkDiagnostics(component, diags);
            if (diags && diags.length) {
                return true;
            } else {
                this.success(`${green1(component.file)} - ${gray1(Math.round(performance.now() - startPerf) + ' ms')}`);
                return false;
            }
        } catch (err) {
            this.error(`TSXContextCreator: ${err.message}`);
        }
    }
}
var BoilerPlate;
(function(BoilerPlate1) {
    BoilerPlate1["ROOT_COMPONENT_PREVENT_COMPONENT_TYPE_ERROR"] = `\n    import component Subject from "{% filePath %}";\n    <template>\n      <Subject />\n    </template>\n    <proto type="app" engine="no-strict-tagname">\n    </proto>\n    `;
})(BoilerPlate || (BoilerPlate = {
}));
class MapFile {
    static files = new Map();
}
const __default2 = (opts)=>`\nfunction createSVGComponent(opts) {\n    const { href, position, className, style } = opts;\n    const isNotNaN = !Number.isNaN(position.x) && Number.isNaN(position.y);\n    const container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');\n    const lineToParent = document.createElementNS('http://www.w3.org/2000/svg', 'line');\n    const figure = document.createElementNS('http://www.w3.org/2000/svg', 'use');\n    figure.setAttribute('href', href);\n    if (isNotNaN) {\n      figure.setAttribute('x', position.x);\n      figure.setAttribute('y', position.y);\n    }\n    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'use');\n    shadow.setAttribute('href', href);\n    if (isNotNaN) {\n      shadow.setAttribute('x', position.x);\n      shadow.setAttribute('y', position.y + 15);\n    }\n    function setPosition(coord) {\n      if ((!coord || Number.isNaN(coord.x)) && isNotNaN) {\n        shadow.setAttribute('x', position.x);\n        shadow.setAttribute('y', position.y + 15);\n        figure.setAttribute('x', position.x);\n        figure.setAttribute('y', position.y);\n      } else if (!Number.isNaN(coord.x) && !Number.isNaN(coord.y)) {\n        shadow.setAttribute('x', coord.x);\n        shadow.setAttribute('y', coord.y + 15);\n        figure.setAttribute('x', coord.x);\n        figure.setAttribute('y', coord.y);\n      }\n    }\n    if (className) {\n      figure.setAttribute('class', className);\n      shadow.setAttribute('class', className+'-shadow');\n    }\n    if (style) {\n      figure.setAttribute('style', style);\n    }\n    container.append(shadow);\n    container.append(figure);\n    container.append(lineToParent);\n    return {\n      figure,\n      element: container,\n      setPosition,\n      lineToParent,\n    };\n  }\n`
;
const __default3 = (opts)=>`\nfunction getPointAroundElementFromOrigin(opts) {\n    const { destination, origin, radius, decay = 0 } = opts;\n    const { cos, sin, atan2 } = Math;\n    let result = {\n      x: 0,\n      y: 0,\n    };\n    const rad = atan2(\n      destination.y - origin.y,\n      destination.x - origin.x\n    ) + decay;\n    result.x = destination.x + (radius * cos(rad));\n    result.y = destination.y + (radius * sin(rad));\n    return result;\n  }\n`
;
const __default4 = (opts)=>`\nfunction setChildNodeAroundParent(opts) {\n    const { PI, round, cos, sin } = Math;\n    const { parent, minRadius = 0, maxRadius = 0, child, minRadian = 0, maxRadian = PI } = opts;\n    let result = {\n      x: 0,\n      y: 0,\n    };\n    let radius = minRadius * parent.childs.length;\n    if (radius > maxRadius) {\n      radius = maxRadius;\n    } else if (radius < minRadius) {\n      radius = minRadius;\n    }\n    let percent = (parent.childs.indexOf(child) / (parent.childs.length ? parent.childs.length - 1 : 1));\n    if (Number.isNaN(percent)) {\n      percent = 1;\n    }\n    let radian = maxRadian * percent + minRadian;\n    result.x = parent.position.x + round(radius  * cos(radian));\n    result.y = parent.position.y + round(radius  * sin(radian));\n    return result;\n  }\n`
;
const __default5 = (opts)=>`\nbody {\n    background: #424242;\n    color: rgb(60%, 60%, 60%);\n    padding: 0px;\n    font-family: sans-serif;\n  }\n  *::selection {\n    background: var(--o-primary);\n    color: var(--o-background);\n  }\n  pre {tab-size: 3;}\n\n  *:root {\n    --o-secondary: #61c3aa;\n    --o-primary: #b5b0fa;\n    --o-black: #202229;\n    --o-grey: #808080;\n    --o-dark-blue: #3b6879;\n    --o-error: #ff0076;\n    --o-warning: #f9f694;\n    --o-success: #94f9c6;\n    --o-info: #b5e4ff;\n    --o-background: white;\n    --o-header: #333333;\n  }\n  /* width */\n  ::-webkit-scrollbar {\n    width: 7px;\n  }\n\n  /* Track */\n  ::-webkit-scrollbar-track {\n    background: var(--o-black);\n  }\n\n  /* Handle */\n  ::-webkit-scrollbar-thumb {\n    background: var(--o-grey);\n  }\n\n  /* Handle on hover */\n  ::-webkit-scrollbar-thumb:hover {\n    background: var(--o-primary);\n  }\n  .ogone-logo {\n    position: fixed;\n    z-index: -200;\n    bottom: -5px;\n    left: -10px;\n    opacity: .4;\n  }\n  .dev-tool-viewer {\n    position: fixed;\n    z-index: 1;\n    left: 0;\n    top: 0;\n    width: 100%;\n    height: 100%;\n    overflow: visible;\n  }\n  svg {\n    overflow: visible;\n  }\n  .dev-tool-informations {\n    user-select: none;\n    z-index: 2;\n    font-family: sans-serif;\n    background: #333333;\n    color: #777777;\n    width: 100vw;\n    position: fixed;\n    left: 0;\n    bottom: 0;\n    padding: 5px;\n  }\n  .diagnostics {\n    display: flex;\n    flex-direction: column;\n    background: #333333;\n    color: white;\n    width: 300px;\n    position: fixed;\n    right: 0;\n    height: 100%;\n    top: 0;\n    z-index: 5000;\n    transform: translateX(100%);\n    transition: 0.5s ease;\n    overflow-y: auto;\n  }\n  .diagnostics-open {\n    transform: translateX(0%);\n    transition: 0.5s ease;\n  }\n  .diagnostics-panel {\n    background: #232323;\n    flex: 0;\n    border-top: 1px solid #525252;\n    color: #9c9c9c;\n    white-space: pre-line;\n    letter-spacing: 1px;\n    font-size: 10pt;\n    transition: 0.5s ease;\n    overflow-x: hidden;\n    overflow-y: scroll;\n  }\n  .diagnostics-container {\n    margin: 5px;\n    background: #333333;\n    padding: 10px;\n    border: 1px solid #525252;\n    word-break: break-word;\n    filter: drop-shadow(0px 4px 1px black);\n  }\n  .diagnostics-panel-open {\n    flex: 2;\n  }\n  .diagnostics > h5.title {\n    margin-left: 10px;\n    color: #adadad;\n    font-weight: 400;\n    letter-spacing: 4px;\n    flex: 0;\n    user-select: none;\n    cursor: pointer;\n  }\n  .devtool-modifier {\n    position: fixed;\n    z-index: 2000;\n    background: #333333d6;\n    color: #ababab;\n    padding: 10px;\n    left: 642px;\n    font-family: sans-serif;\n    top: 171px;\n    pointer-events: none;\n    display: none;\n    user-select: none;\n  }\n  .diagnostics-root,\n  .diagnostics-element,\n  .diagnostics-async,\n  .diagnostics-router,\n  .diagnostics-store,\n  .diagnostics-component {\n    flex: 0;\n    padding: 7px;\n  }\n  .diagnostics-root {\n    background: #b5b0fa;\n  }\n  .diagnostics-component {\n    background: #61c3aa;\n  }\n  .diagnostics-async {\n    background: #eee47f;\n  }\n  .diagnostics-store {\n    background: #b5e4ff;\n  }\n  .diagnostics-router {\n    background: orange;\n  }\n  .diagnostics-element {\n    background: #777777;\n  }\n  .diagnostics-tree-type-figure {\n    width: auto;\n    height: 0px;\n    padding: 3px;\n    border-radius: 0;\n    margin-right: 10px;\n    border: 1px solid;\n  }\n  details.diagnostics-data-details {\n    background: #00000023;\n  }\n  div.diagnostics-data-container,\n  details.diagnostics-data-details {\n    padding-left: 15px;\n    margin-top: 5px;\n    margin-bottom: 5px;\n    cursor: pointer;\n  }\n  span.boolean, span.null, span.number {\n    color: #f680f7;\n  }\n  span.function {\n    color: #80e0f7;\n  }\n  span.string {\n    color: #61c3aa;\n  }\n  span.constructor {\n    color: #e576e6;\n  }\n  span.string, span.number, span.boolean, span.function {\n    margin-left: 10px;\n  }\n  details.diagnostics-data-details.array > summary {\n    color: #585858;\n  }\n  details:not([open]) > summary.object::after {\n    content: " {...}";\n  }\n  details:not([open]) > summary.array::after {\n    content: " [...]";\n  }\n`
;
const __default6 = (opts)=>`\n  svg * {\n    transform-origin: center;\n  }\n  @keyframes dash-slide {\n    from {\n      stroke-dashoffset: 0%;\n    }\n    to {\n      stroke-dashoffset: 50%;\n    }\n  }\n  @keyframes reaction {\n    from {\n      fill: orange;\n    }\n    to {\n      fill: #484848;\n    }\n  }\n  line {\n    animation: dash-slide;\n    animation-iteration-count: infinite;\n    animation-duration: 10s;\n    animation-direction: alternate;\n  }\n  .reaction {\n    animation: reaction;\n    animation-iteration-count: infinite;\n    animation-duration: 0.5s;\n    animation-direction: alternate;\n  }\n  .component {\n    stroke: #61c3aa;\n    stroke-width: 5px;\n    fill: #484848;\n  }\n  .async {\n    stroke: #eee47f;\n    stroke-width: 5px;\n    fill: #484848;\n  }\n  .async-shadow {\n    stroke: #33291a;\n    stroke-width: 5px;\n    fill: #33291a;\n  }\n  .store {\n    stroke: #b5e4ff;\n    stroke-width: 10px;\n    fill: #484848;\n  }\n  .router {\n    stroke: orange;\n    stroke-width: 7px;\n    fill: #484848;\n  }\n  .component-shadow, .store-shadow, .router-shadow {\n    stroke: #25423a;\n    stroke-width: 5px;\n    fill: #25423a;\n  }\n  .root {\n    stroke: #b5b0fa;\n    stroke-width: 5px;\n    fill: #484848;\n  }\n  .root-shadow {\n    stroke: #302f46;\n    stroke-width: 5px;\n    fill: #302f46;\n  }\n  .element {\n    stroke: #333333;\n    stroke-width: 5px;\n    fill: #484848;\n  }\n  .element-shadow {\n    stroke:#232323;\n    stroke-width: 5px;\n    fill:#232323;\n  }\n  .root,\n  .root-shadow,\n  .component,\n  .component-shadow,\n  .router,\n  .router-shadow,\n  .store,\n  .store-shadow,\n  .async,\n  .async-shadow,\n  .element,\n  .element-shadow {\n    cursor: pointer;\n    transform-origin: center;\n    stroke-linejoin: round;\n    stroke-linecap: round;\n  }\n  .root:hover,\n  .component:hover,\n  .async:hover,\n  .router:hover,\n  .store:hover,\n  .element:hover {\n    fill: #686868;\n  }\n  line.store, line.router {\n    stroke-dashoffset: 837;\n    stroke-dasharray: 34;\n  }\n  line.component {\n    stroke-width: 5;\n    stroke: #61c3aa;\n  }\n  line.async {\n    stroke-width: 5;\n    stroke: #808080;\n    stroke-dashoffset: 837;\n    stroke-dasharray: 11;\n  }\n  .async.resolved {\n    stroke-width: 5;\n    stroke: #eee47f;\n    stroke-dashoffset: 837;\n    stroke-dasharray: none;\n  }\n  line.element {\n    stroke: #999999;\n  }\n`
;
const __default7 = (opts)=>`\nOgone.DevTool.document.title = '[Ogone] Dev Tool';\nconst diagnostics = document.createElement('div');\ndiagnostics.classList.add('diagnostics');\nconst informations = new Text('[Ogone] Dev Tool');\nconst informationsContainer = Ogone.DevTool.document.createElement('div');\ninformationsContainer.classList.add('dev-tool-informations');\ninformationsContainer.append(informations);\nOgone.DevTool.document.body.style.background = '#424242';\n\nOgone.DevTool.document.head.innerHTML += \`\n<style>\n    ${__default5(opts)}\n    <style>\n\`;\nOgone.DevTool.document.body.innerHTML = \`\n<?xml version="1.0" encoding="UTF-8"?>\n<svg class="ogone-logo" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="93pt" height="103pt" viewBox="0 0 93 103" version="1.1">\n    <g id="surface1">\n    <path style=" stroke:none;fill-rule:nonzero;fill:rgb(60%,60%,60%);fill-opacity:1;" d="M 41.375 7.59375 L 78.195312 47.851562 C 78.726562 48.445312 78.957031 49.265625 78.792969 50.054688 L 75.078125 67.144531 C 74.746094 68.6875 75.941406 70.167969 77.53125 70.167969 C 78.460938 70.167969 79.324219 69.640625 79.753906 68.820312 L 90.304688 48.476562 C 90.734375 47.6875 90.667969 46.703125 90.171875 45.945312 L 68.210938 13.308594 C 67.914062 12.882812 67.515625 12.554688 67.015625 12.355469 L 44.128906 3.613281 C 41.671875 2.660156 39.617188 5.652344 41.375 7.59375 Z M 41.375 7.59375 "/>\n    <path style=" stroke:none;fill-rule:nonzero;fill:rgb(60%,60%,60%);fill-opacity:1;" d="M 2.996094 80.847656 L 41.011719 41.707031 C 41.574219 41.113281 41.804688 40.324219 41.671875 39.535156 L 38.457031 22.347656 C 38.15625 20.804688 39.417969 19.359375 41.011719 19.421875 C 41.9375 19.457031 42.800781 19.980469 43.199219 20.835938 L 53.152344 41.476562 C 53.550781 42.296875 53.449219 43.25 52.917969 43.972656 L 29.996094 75.917969 C 29.699219 76.347656 29.265625 76.640625 28.769531 76.839844 L 5.648438 84.925781 C 3.160156 85.777344 1.171875 82.722656 2.996094 80.847656 Z M 2.996094 80.847656 "/>\n    <path style=" stroke:none;fill-rule:nonzero;fill:rgb(60%,60%,60%);fill-opacity:1;" d="M 31.058594 96.855469 L 58.390625 49.757812 C 58.789062 49.066406 58.824219 48.214844 58.492188 47.492188 L 51.195312 31.550781 C 50.53125 30.105469 51.394531 28.429688 52.953125 28.101562 C 53.878906 27.902344 54.84375 28.230469 55.441406 28.953125 L 70.136719 46.636719 C 70.699219 47.324219 70.863281 48.277344 70.53125 49.132812 L 56.070312 85.613281 C 55.871094 86.105469 55.539062 86.5 55.109375 86.796875 L 34.609375 100.171875 C 32.417969 101.621094 29.730469 99.121094 31.058594 96.855469 Z M 31.058594 96.855469 "/>\n    </g>\n</svg>\`;\nconst logo = Ogone.DevTool.document.querySelector('.ogone-logo');\nconst viewer = Ogone.DevTool.document.createElementNS('http://www.w3.org/2000/svg', 'svg');\nviewer.classList.add('dev-tool-viewer');\nconst container = Ogone.DevTool.document.createElementNS('http://www.w3.org/2000/svg', 'svg');\ncontainer.classList.add('dev-tool-container');\nlet containerx = 0;\nlet containery = 0;\nlet actualScale = 0.4;\nviewer.style.transform = \`scale(\${actualScale})\`;\n// keyboard control\nOgone.DevTool.addEventListener('keydown', (ev) => {\n  switch(true) {\n    case ev.key.endsWith('Left'):\n      container.setAttribute('x', containerx+=-20);\n      break;\n      case ev.key.endsWith('Right'):\n      container.setAttribute('x', containerx+=+20);\n      break;\n      case ev.key.endsWith('Up'):\n      container.setAttribute('y', containery+=-20);\n      break;\n    case ev.key.endsWith('Down'):\n      container.setAttribute('y', containery+=+20);\n      break;\n  }\n  logo.style.transform = \`scale(2.2) translateX(\${-containerx/50}px) translateY(\${-containery/50}px)\`;\n  Ogone.ComponentCollectionManager.updateDevToolView(ev);\n});\n// wheel control\nOgone.DevTool.addEventListener('wheel', (ev) => {\n  if (!ev.ctrlKey) {\n    container.setAttribute('x', containerx +=+ (ev.deltaX/ 5));\n    container.setAttribute('y', containery +=+ (ev.deltaY/ 5));\n  } else {\n    let value = actualScale +=- (ev.deltaY + ev.deltaX)/60;\n    if (value >= 3) {\n      actualScale = 3;\n      value = 3;\n    }\n    if (value <= 0.1) {\n      actualScale = 0.1;\n      value = 0.1;\n    }\n    viewer.style.transform = \`scale(\${value})\`;\n  }\n  informations.data = \`zoom: \${actualScale}, x: \${containerx}, y: \${containery}\`;\n  logo.style.transform = \`scale(2.2) translateX(\${-containerx/50}px) translateY(\${-containery/50}px)\`;\n  Ogone.ComponentCollectionManager.updateDevToolView(ev);\n})\nOgone.DevTool.addEventListener('mousemove', (ev) => {\n  Ogone.ComponentCollectionManager.updateDevToolView(ev);\n});\nconst componentDef = Ogone.DevTool.document.createElementNS('http://www.w3.org/2000/svg', 'g');\ncomponentDef.classList.add('dev-tool-component');\ncomponentDef.setAttribute('id', 'component');\nconst dynamicNodeDef = Ogone.DevTool.document.createElementNS('http://www.w3.org/2000/svg', 'g');\ndynamicNodeDef.classList.add('dev-tool-node');\ndynamicNodeDef.setAttribute('id', 'element');\nconst figure = Ogone.DevTool.document.createElementNS('http://www.w3.org/2000/svg', 'rect');\nfigure.setAttribute('rx', '7');\nfigure.setAttribute('width', '50');\nfigure.setAttribute('height', '50');\nfigure.setAttribute('x', '0');\nfigure.setAttribute('y', '0');\nconst circle = Ogone.DevTool.document.createElementNS('http://www.w3.org/2000/svg', 'rect');\ncircle.setAttribute('rx', '200');\ncircle.setAttribute('width', '50');\ncircle.setAttribute('height', '50');\ncircle.setAttribute('x', '0');\ncircle.setAttribute('y', '0');\nconst style = Ogone.DevTool.document.createElement('style');\nstyle.innerHTML = \` ${__default6(opts)} \`;\n\nconst defs = Ogone.DevTool.document.createElementNS('http://www.w3.org/2000/svg', 'defs');\ncomponentDef.append(figure);\ndynamicNodeDef.append(circle);\ndefs.append(componentDef);\ndefs.append(dynamicNodeDef);\nviewer.append(style);\nviewer.append(defs);\nviewer.append(container);\nOgone.DevTool.document.body.append(informationsContainer);\nOgone.DevTool.document.body.append(diagnostics);\nOgone.DevTool.document.body.append(viewer);\nOgone.ComponentCollectionManager.container = container;\nOgone.DiagnosticsPanelManager.diagnostics = diagnostics;\nOgone.ComponentCollectionManager.informations = informations;\n`
;
const __default8 = (opts)=>`\nfunction openOgoneDevTool() {\n    Ogone.DevTool = window.open('', 'Ogone Dev Tool', devTool_window_parameters);\n    if (!Ogone.DevTool) {\n      Ogone.displayError('Dev Tool is blocked', 'Ogone Dev Tool has been blocked by the browser. please allow pop-up to have access to Dev Tool', {\n        message: 'allow pop-up',\n      });\n    }\n  ${__default7(opts)}\n  Ogone.ComponentCollectionManager.setModifiers();\n}\n`
;
const __default9 = (opts)=>`\nOgone.DiagnosticsPanelManager = new (class {\n    constructor() {\n        this.renderedDiagnosticsPanel = false;\n        this.panels = null; // array\n        this.diagnostics = null; // HTMLElement\n        this.compContainer = null; // HTMLDivElement\n        this.treeContainer = null; // HTMLDivElement\n        this.itemTypeNode = null // HTMLDivElement\n        this.itemName = null // HTMLDivElement\n        this.data = null;\n        this.actualItem = null; // ComponentCollectionManager\n    }\n    set subject(item) {\n      this.renderCompPanel(item);\n      this.renderTreePanel(item);\n    }\n    renderDiagnostics(item) {\n      if (!item) return;\n      this.setDiagnosticsPanel();\n      this.data = JSON.stringify(item.ctx.data, null, '  ');\n      this.subject = item;\n    }\n    setDiagnosticsPanel() {\n      if (!this.renderedDiagnosticsPanel) {\n        this.renderedDiagnosticsPanel = true;\n        const el = Ogone.DevTool.document.createElement('div');\n        el.classList.add('diagnostics-panel');\n        this.panels = [\n          {\n            title: 'Tree',\n            open: true,\n            el: el.cloneNode(true),\n          },\n          {\n            title: 'Component',\n            open: false,\n            el: el.cloneNode(true),\n          },\n          {\n            title: 'Diagnostics',\n            open: false,\n            el: el.cloneNode(true),\n          },\n          {\n            title: 'Application',\n            open: false,\n            el: el.cloneNode(true),\n          },\n          {\n            title: 'DOM Actions',\n            open: false,\n            el: el.cloneNode(true),\n          },\n          {\n            title: 'Files',\n            open: false,\n            el: el.cloneNode(true),\n          },\n        ];\n        if (this.diagnostics) {\n          const openClose = (title) => {\n            this.panels.forEach((p) => {\n              if (title) {\n                if (p.title !== title) {\n                  p.el.classList.remove('diagnostics-panel-open');\n                  p.open = false;\n                } else if(p.title === title && p.open) {\n                  p.el.classList.remove('diagnostics-panel-open');\n                  p.open = false;\n                } else {\n                  p.el.classList.add('diagnostics-panel-open');\n                  p.open = true;\n                }\n              } else if (p.open) {\n                p.el.classList.add('diagnostics-panel-open');\n                p.open = true;\n              }\n            })\n          }\n          this.itemTypeNode = Ogone.DevTool.document.createElement('div');\n          this.itemName = Ogone.DevTool.document.createElement('div');\n          this.diagnostics.prepend(this.itemTypeNode);\n          this.diagnostics.prepend(this.itemName);\n          this.panels.forEach((p) => {\n            const h5 = Ogone.DevTool.document.createElement('h5');\n            h5.classList.add('title');\n            h5.addEventListener('click', () => {\n              openClose(p.title);\n            });\n            const text = new Text(' ');\n            text.data = p.title;\n            h5.append(text);\n            this.diagnostics.append(h5);\n            this.diagnostics.append(p.el);\n          });\n          openClose();\n        }\n      }\n    }\n    renderTreePanel(item) {\n      if (!this.treeContainer) {\n        this.treeContainer = Ogone.DevTool.document.createElement('div');\n        this.treeContainer.classList.add('diagnostics-container');\n      }\n      if (this.treeContainer) {\n        const panel = this.panels.find((p) => p.title === 'Tree');\n        panel.el.innerHTML = '';\n        this.treeContainer.innerHTML = '';\n        panel.el.append(this.treeContainer);\n        let parent = item.parent;\n        const name = this.treeContainer.cloneNode();\n        const typeFigure = Ogone.DevTool.document.createElement('span');\n        typeFigure.classList.add('diagnostics-tree-type-figure');\n        name.append(typeFigure);\n        name.append(item.type === 'root' ? 'root-component' :\`$\{item.name}\`);\n        name.addEventListener('mousemove', () => {\n          Ogone.ComponentCollectionManager.treeRendering(item.key, true);\n        });\n        name.addEventListener('mouseleave', () => {\n          Ogone.ComponentCollectionManager.treeRendering(item.key, false);\n        });\n        this.treeContainer.append(name);\n        let precedingClone = name;\n        while(parent) {\n          const { key } = parent;\n          const clone = Ogone.DevTool.document.createElement('div');\n          clone.classList.add('diagnostics-container');\n          precedingClone.style.cursor = 'pointer';\n          precedingClone.insertAdjacentElement('beforebegin', clone);\n          const cloneTypeFigure = typeFigure.cloneNode();\n          cloneTypeFigure.classList.add(\`diagnostics-$\{parent.type}\`);\n          clone.append(cloneTypeFigure);\n          clone.append(parent.type === 'root' ? 'root-component' :\`$\{parent.name}\`);\n          clone.addEventListener('mousemove', () => {\n            Ogone.ComponentCollectionManager.treeRendering(key, true);\n          });\n          clone.addEventListener('mouseleave', () => {\n            Ogone.ComponentCollectionManager.treeRendering(key, false);\n          });\n          clone.addEventListener('click', () => {\n            this.renderDiagnostics(\n              Ogone.ComponentCollectionManager.getItem(key)\n            );\n          });\n          parent = parent.parent;\n          precedingClone = clone;\n        }\n        typeFigure.classList.add(\`diagnostics-$\{item.type}\`);\n      }\n    }\n    recursiveDetails(obj, prop = 'undefined') {\n      const details = Ogone.DevTool.document.createElement('details');\n      const summary = Ogone.DevTool.document.createElement('summary');\n      const span = Ogone.DevTool.document.createElement('span');\n      const div = Ogone.DevTool.document.createElement('div');\n      const constructName = Ogone.DevTool.document.createElement('span');\n      summary.append(prop);\n      details.append(summary);\n      span.classList.add(typeof obj);\n      constructName.classList.add('constructor');\n      details.classList.add('diagnostics-data-details');\n      div.classList.add('diagnostics-data-container');\n      switch(true) {\n        case typeof obj === 'function':\n          span.append('fn');\n          div.append(prop, span);\n          return div;\n        case Array.isArray(obj):\n          constructName.append(\`$\{obj.constructor.name} ($\{obj.length})\`);\n          summary.classList.add('array');\n          details.append(constructName, ' [');\n          obj.forEach((value, i) => {\n            const detail = this.recursiveDetails(value, i);\n            detail.classList.add('array');\n            details.append(\n              detail\n            );\n          });\n          details.append(']');\n          break;\n        case typeof obj === 'object':\n          summary.classList.add(typeof obj);\n          constructName.append(obj.constructor.name);\n          details.append(constructName, ' {');\n          Object.entries(obj).forEach(([key, value]) => {\n            const detail = this.recursiveDetails(value, key)\n            detail.classList.add('object');\n            details.append(\n              detail\n            );\n          });\n          details.append('}');\n          break;\n        case typeof obj === 'string':\n          span.append(obj);\n          div.append(prop, span);\n          return div;\n        case typeof obj === 'boolean':\n          span.append(obj);\n          div.append(prop, span);\n          return div;\n        default:\n          span.append(obj);\n          div.append(prop, span);\n          return div;\n      }\n      return details;\n    }\n    renderCompPanel(item) {\n      if (!this.compContainer) {\n        this.compContainer = Ogone.DevTool.document.createElement('div');\n        this.compContainer.classList.add('diagnostics-container');\n        const panel = this.panels.find((p) => p.title === 'Component');\n        panel.el.append(this.compContainer);\n      }\n      if (this.compContainer) {\n        this.compContainer.innerHTML = '';\n        Object.entries(item.ctx.data)\n          .forEach(([key, value]) => {\n            let element = this.recursiveDetails(value, key);\n            this.compContainer.append(\n              element\n            );\n            item.ctx.react.push((dependency) => {\n              if (this.actualItem !== item) return false;\n              let newelement = this.recursiveDetails(item.ctx.data[key], key);\n              if (dependency.indexOf(key) > -1) {\n                element.replaceWith(newelement);\n                element = newelement\n              }\n              return this.actualItem === item;\n            })\n          });\n        this.itemTypeNode.className = \`diagnostics-$\{item.type}\`;\n        this.itemName.innerHTML = '';\n        this.itemName.append(item.type === 'root' ? '< root-component >' : \`< $\{item.name} >\`);\n      }\n    }\n})();\n`
;
const __default10 = (opts)=>`\nOgone.ComponentCollectionManager = new (class {\n    constructor() {\n      this.collection = new Map();\n      this.container = null;\n      this.informations = null;\n      this.isReady = false;\n      this.renderedDiagnosticsPanel = false;\n    }\n    getItem(key) {\n        return this.collection.get(key);\n    }\n    read(infos) {\n      if (!this.collection.has(infos.key)) {\n        this.subscribe(infos);\n        if (Ogone.router.devtoolIsOpen) {\n          this.update(infos.key);\n        }\n      } else {\n        this.update(infos.key);\n      }\n    }\n    subscribe(infos) {\n      let node;\n      infos.childs = [];\n      let parent = this.getItem(infos.parentNodeKey);\n      infos.position = {\n        x: 0,\n        y: 0,\n        delta: 0,\n      };\n      if (infos.type === 'root') {\n        infos.position = {\n          x: (720/2),\n          y: 50,\n        };\n        node = createSVGComponent({\n          href: '#component',\n          position: infos.position,\n          className: infos.type,\n          modifier: infos.name || 'Root-Component',\n        });\n      } else if (infos.type !== 'element') {\n        node = createSVGComponent({\n          href: '#component',\n          position: infos.position,\n          className: infos.type,\n          modifier: infos.name || 'Root-Component',\n        });\n      } else {\n        node = createSVGComponent({\n          href: '#element',\n          position: infos.position,\n          className: infos.type,\n          modifier: infos.name,\n        });\n      }\n      const item = {\n          ...infos,\n          parent,\n          node,\n      };\n      this.collection.set(item.key, item);\n      if (parent) {\n        parent.childs.push(item);\n      }\n      this.saveReaction(item.key);\n    }\n    setModifiers() {\n      this.collection.forEach((item) => {\n        this.setModifier(item.key);\n      })\n    }\n    setModifier(key) {\n      if (!Ogone.DevTool) return;\n      const modifier = Ogone.DevTool.document.createElement('div');\n      modifier.classList.add('devtool-modifier');\n      const text = new Text(' ');\n      modifier.append(text);\n      Ogone.DevTool.document.body.append(modifier);\n      Ogone.DevTool.updateView = Ogone.DevTool.updateView || [];\n      Ogone.DevTool.updateView.push((ev) => {\n        const item = this.getItem(key);\n        if (!item || !item.node || !Ogone.DevTool) return;\n        const { figure } = item.node;\n        if (!figure) return;\n        if (!figure.getBoundingClientRect) return;\n        const { sqrt, round } = Math;\n        const bcr = figure.getBoundingClientRect();\n        const lbcr = modifier.getBoundingClientRect();\n        modifier.style.left = \`$\{round(bcr.x - (lbcr.width/2) + (bcr.width / 2))}px\`;\n        modifier.style.top = \`$\{round(bcr.y - (bcr.height * 1.7))}px\`;\n        const a = ev.clientX - bcr.x;\n        const b = ev.clientY - bcr.y;\n        const hyp = sqrt(a**2 + b**2);\n        let name = item.type === 'root' ? '<root-component>' :\`<$\{item.name}>\`;\n        if (text.data !== name) {\n          text.data = name;\n        }\n        if (hyp < bcr.height * 2) {\n          modifier.style.display  = 'block';\n        } else {\n          modifier.style.display = '';\n        }\n        return !!figure && figure.isConnected;\n      });\n    }\n    saveReaction(key) {\n      const item = this.getItem(key);\n      if (item && item.ctx && item.node && item.type !== 'element') {\n        let timeout;\n        item.ctx.react.push(() => {\n          if (item.node) {\n            clearTimeout(timeout);\n            item.node.figure.classList.add('reaction');\n            timeout = setTimeout(() => {\n              item.node.figure.classList.remove('reaction');\n            }, 1000);\n          }\n          return item.node && this.collection.has(item.key);\n        })\n\n      }\n    }\n    update(key) {\n      const item = this.getItem(key);\n      if (item && item.node) {\n        Ogone.ComponentCollectionManager.render();\n      }\n    }\n    updateDevToolView(ev) {\n      if (!this.isReady) return;\n      Ogone.DevTool.updateView.forEach((f, i, arr) => {\n        if (f && !f(ev)) delete arr[i];\n      })\n    }\n    render() {\n      const collection = Array.from(this.collection);\n      const { PI, sin, cos, round, atan2 } = Math;\n      collection.forEach(([,item]) => {\n        let parent = item.parent;\n        if (parent && parent.position && !parent.parent) {\n          const { x, y } = setChildNodeAroundParent({\n            parent,\n            minRadius: 90,\n            maxRadius: 1000,\n            maxRadian: PI,\n            child: item,\n          });\n          item.position.x = x;\n          item.position.y = y;\n          item.position.delta = parent.position.delta;\n        }\n        if (item.node) {\n          if (this.container && !this.container.contains(item.node.element)) {\n            this.container.append(item.node.element);\n            item.node.element.addEventListener('mouseover', () => {\n              this.informations.data = \`$\{item.type}: $\{item.name} - id: $\{item.key} parent: $\{item.parentNodeKey}\`;\n            });\n            item.node.element.addEventListener('dblclick', () => {\n              if (Ogone.DiagnosticsPanelManager.actualItem === item) {\n                Ogone.DiagnosticsPanelManager.diagnostics.classList.toggle('diagnostics-open');\n              } else {\n                Ogone.DiagnosticsPanelManager.actualItem = item;\n                Ogone.DiagnosticsPanelManager.diagnostics.classList.add('diagnostics-open');\n              }\n              if (Ogone.DiagnosticsPanelManager.diagnostics.classList.contains('diagnostics-open')) {\n                Ogone.DiagnosticsPanelManager.renderDiagnostics(item);\n              }\n            });\n            item.node.element.addEventListener('click', () => {\n              if (Ogone.DiagnosticsPanelManager.diagnostics.classList.contains('diagnostics-open')) {\n                Ogone.DiagnosticsPanelManager.renderDiagnostics(item);\n                Ogone.DiagnosticsPanelManager.actualItem = item;\n              }\n            });\n            item.node.element.addEventListener('mousemove', () => {\n              Ogone.ComponentCollectionManager.treeRendering(item.key, true);\n            });\n            item.node.element.addEventListener('mouseleave', () => {\n              Ogone.ComponentCollectionManager.treeRendering(item.key, false);\n            });\n          }\n          item.node.setPosition(item.position);\n        }\n      });\n      function orientItem(item) {\n        if (item.parent && item.parent.parent) {\n          const parent = item.parent;\n          const greatParent = item.parent.parent;\n          const rad = atan2(\n            parent.position.y - greatParent.position.y,\n            parent.position.x - greatParent.position.x,\n          );\n          const radDecay = ((PI * 0.12) * (parent.childs.length));\n          const { x, y } = setChildNodeAroundParent({\n            parent,\n            minRadius: 90 + (60 * item.childs.length),\n            maxRadius: 1000 + (60 * item.childs.length),\n            minRadian: rad * 2/3,\n            maxRadian: PI - (PI - rad/2),\n            child: item,\n          });\n          item.position.x = x;\n          item.position.y = y;\n          item.position.delta = parent.position.delta;\n        }\n        if (item.node) {\n          item.node.setPosition(item.position);\n        }\n      }\n      collection.forEach(([, item]) => {\n        if (item.childs.length) {\n          item.childs.forEach((c) => {\n            orientItem(c)\n          })\n        }\n        orientItem(item);\n      });\n      collection.forEach(([, item]) => {\n        let parent = item.parent;\n        if (item.node && parent) {\n          const pointAroundParent = getPointAroundElementFromOrigin({\n            destination: parent.position,\n            origin: item.position,\n            radius: 70,\n            decay: PI,\n          });\n          const pointAroundChild = getPointAroundElementFromOrigin({\n            origin: parent.position,\n            destination: item.position,\n            radius: 70,\n            decay: PI,\n          });\n          if (!(Number.isNaN(pointAroundChild.x) && Number.isNaN(pointAroundChild.y))) {\n            item.node.lineToParent.setAttribute('x1', pointAroundChild.x + 50/2);\n            item.node.lineToParent.setAttribute('y1', pointAroundChild.y + 50/2);\n          }\n          if (!(Number.isNaN(pointAroundParent.x) && Number.isNaN(pointAroundParent.y))) {\n            item.node.lineToParent.setAttribute('x2', pointAroundParent.x + 50/2);\n            item.node.lineToParent.setAttribute('y2', pointAroundParent.y + 50/2);\n          }\n          item.node.lineToParent.classList.add(item.type);\n        }\n      })\n      this.isReady = true;\n    }\n    treeRendering(key, styling) {\n      const item = this.getItem(key);\n      if (!item) return;\n      let target = item;\n      while(target) {\n        if (styling) {\n          target.node.figure.style.stroke = '#ceff50';\n          target.node.lineToParent.style.stroke = '#ceff50';\n          target.node.lineToParent.style.strokeWidth = '10px';\n          target.node.figure.style.strokeWidth = '10px';\n        } else {\n          target.node.figure.style.stroke = '';\n          target.node.lineToParent.style.stroke = '';\n          target.node.lineToParent.style.strokeWidth = '';\n          target.node.figure.style.strokeWidth = '';\n        }\n        target = target.parent;\n      }\n    }\n    destroy(key) {\n      const item = this.getItem(key);\n      if (item && item.node && item.node.element) {\n        item.node.element.remove();\n        item.node.figure.remove();\n      }\n      if (item && item.childs.length) {\n        item.childs.forEach((c, i, arr) => {\n          this.destroy(c.key)\n        });\n        item.childs.splice(0);\n        let parent = this.getItem(item.parentNodeKey ? item.parentNodeKey : '');\n        if (!parent && item.parentCTX) {\n          parent = this.getItem(item.parentCTX.key);\n        }\n        if (parent) {\n          parent.childs.splice(\n            parent.childs.indexOf(item),\n            1\n          );\n        }\n      }\n      this.collection.delete(key);\n    }\n})()\n`
;
const __default11 = (opts)=>`\nlet devTool_window_parameters = "menubar=no,scrollbars=no,status=no,dependent=yes";\n\n// get the figure and the container node for the representation of the component/node\n${__default2(opts)}\n\n// place a point around an other one\n${__default3(opts)}\n\n// creating the arc representation of chlinodes\n${__default4(opts)}\n\n${__default8(opts)}\n${__default9(opts)}\n${__default10(opts)}\nwindow.addEventListener('DOMContentLoaded',() => Ogone.ComponentCollectionManager.render());\nwindow.addEventListener('unload',() => Ogone.DevTool.close());\nif (Ogone.router) {\n  Ogone.router.openDevTool = () => {\n    openOgoneDevTool();\n    Ogone.ComponentCollectionManager.render();\n    Ogone.router.devtoolIsOpen = true;\n  };\n}\n`
;
const importMeta3 = {
    url: "file:///home/rudy/Documents/Perso/Ogone/src/browser/readfiles.ts",
    main: false
};
const components1 = Deno.readTextFileSync(new URL('./component.ts', importMeta3.url));
const websocket = Deno.readTextFileSync(new URL('./websocket.ts', importMeta3.url));
const ogone = Deno.readTextFileSync(new URL('./ogone.ts', importMeta3.url));
const router = Deno.readTextFileSync(new URL('./router.ts', importMeta3.url));
const browserBuild = (isProduction, opts)=>{
    if (isProduction) {
        return {
            components: components1,
            ogone,
            router,
            devTool: ''
        };
    }
    return {
        components: components1,
        ogone,
        router,
        devTool: opts.hasDevtool ? __default11({
        }) : ""
    };
};
const template1 = `\n<html>\n  <head>\n      {% head %}\n      {% script %}\n  </head>\n  <body>\n      {% dom %}\n  </body>\n</html>\n`;
class YAMLError extends Error {
    constructor(message2 = "(unknown reason)", mark = ""){
        super(`${message2} ${mark}`);
        this.mark = mark;
        this.name = this.constructor.name;
    }
    toString(_compact) {
        return `${this.name}: ${this.message} ${this.mark}`;
    }
}
function compileList(schema, name, result) {
    const exclude = [];
    for (const includedSchema of schema.include){
        result = compileList(includedSchema, name, result);
    }
    for (const currentType of schema[name]){
        for(let previousIndex = 0; previousIndex < result.length; previousIndex++){
            const previousType = result[previousIndex];
            if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
                exclude.push(previousIndex);
            }
        }
        result.push(currentType);
    }
    return result.filter((type, index)=>!exclude.includes(index)
    );
}
function compileMap(...typesList) {
    const result = {
        fallback: {
        },
        mapping: {
        },
        scalar: {
        },
        sequence: {
        }
    };
    for (const types of typesList){
        for (const type of types){
            if (type.kind !== null) {
                result[type.kind][type.tag] = result["fallback"][type.tag] = type;
            }
        }
    }
    return result;
}
class Schema {
    constructor(definition){
        this.explicit = definition.explicit || [];
        this.implicit = definition.implicit || [];
        this.include = definition.include || [];
        for (const type of this.implicit){
            if (type.loadKind && type.loadKind !== "scalar") {
                throw new YAMLError("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
            }
        }
        this.compiledImplicit = compileList(this, "implicit", []);
        this.compiledExplicit = compileList(this, "explicit", []);
        this.compiledTypeMap = compileMap(this.compiledImplicit, this.compiledExplicit);
    }
    static create() {
    }
}
const DEFAULT_RESOLVE = ()=>true
;
const DEFAULT_CONSTRUCT = (data)=>data
;
function checkTagFormat(tag) {
    return tag;
}
class Type {
    kind = null;
    constructor(tag1, options){
        this.tag = checkTagFormat(tag1);
        if (options) {
            this.kind = options.kind;
            this.resolve = options.resolve || DEFAULT_RESOLVE;
            this.construct = options.construct || DEFAULT_CONSTRUCT;
            this.instanceOf = options.instanceOf;
            this.predicate = options.predicate;
            this.represent = options.represent;
            this.defaultStyle = options.defaultStyle;
            this.styleAliases = options.styleAliases;
        }
    }
    resolve = ()=>true
    ;
    construct = (data)=>data
    ;
}
function resolveYamlNull(data) {
    const max = data.length;
    return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
    return null;
}
function isNull(object) {
    return object === null;
}
const nil = new Type("tag:yaml.org,2002:null", {
    construct: constructYamlNull,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isNull,
    represent: {
        canonical () {
            return "~";
        },
        lowercase () {
            return "null";
        },
        uppercase () {
            return "NULL";
        },
        camelcase () {
            return "Null";
        }
    },
    resolve: resolveYamlNull
});
function resolveYamlBoolean(data) {
    const max = data.length;
    return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
    return data === "true" || data === "True" || data === "TRUE";
}
const bool = new Type("tag:yaml.org,2002:bool", {
    construct: constructYamlBoolean,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isBoolean,
    represent: {
        lowercase (object) {
            return object ? "true" : "false";
        },
        uppercase (object) {
            return object ? "TRUE" : "FALSE";
        },
        camelcase (object) {
            return object ? "True" : "False";
        }
    },
    resolve: resolveYamlBoolean
});
function isHexCode(c) {
    return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
    return 48 <= c && c <= 55;
}
function isDecCode(c) {
    return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
    const max = data.length;
    let index = 0;
    let hasDigits = false;
    if (!max) return false;
    let ch = data[index];
    if (ch === "-" || ch === "+") {
        ch = data[++index];
    }
    if (ch === "0") {
        if (index + 1 === max) return true;
        ch = data[++index];
        if (ch === "b") {
            index++;
            for(; index < max; index++){
                ch = data[index];
                if (ch === "_") continue;
                if (ch !== "0" && ch !== "1") return false;
                hasDigits = true;
            }
            return hasDigits && ch !== "_";
        }
        if (ch === "x") {
            index++;
            for(; index < max; index++){
                ch = data[index];
                if (ch === "_") continue;
                if (!isHexCode(data.charCodeAt(index))) return false;
                hasDigits = true;
            }
            return hasDigits && ch !== "_";
        }
        for(; index < max; index++){
            ch = data[index];
            if (ch === "_") continue;
            if (!isOctCode(data.charCodeAt(index))) return false;
            hasDigits = true;
        }
        return hasDigits && ch !== "_";
    }
    if (ch === "_") return false;
    for(; index < max; index++){
        ch = data[index];
        if (ch === "_") continue;
        if (ch === ":") break;
        if (!isDecCode(data.charCodeAt(index))) {
            return false;
        }
        hasDigits = true;
    }
    if (!hasDigits || ch === "_") return false;
    if (ch !== ":") return true;
    return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
}
function constructYamlInteger(data) {
    let value = data;
    const digits = [];
    if (value.indexOf("_") !== -1) {
        value = value.replace(/_/g, "");
    }
    let sign = 1;
    let ch = value[0];
    if (ch === "-" || ch === "+") {
        if (ch === "-") sign = -1;
        value = value.slice(1);
        ch = value[0];
    }
    if (value === "0") return 0;
    if (ch === "0") {
        if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
        if (value[1] === "x") return sign * parseInt(value, 16);
        return sign * parseInt(value, 8);
    }
    if (value.indexOf(":") !== -1) {
        value.split(":").forEach((v)=>{
            digits.unshift(parseInt(v, 10));
        });
        let valueInt = 0;
        let base = 1;
        digits.forEach((d)=>{
            valueInt += d * base;
            base *= 60;
        });
        return sign * valueInt;
    }
    return sign * parseInt(value, 10);
}
function isInteger(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && object % 1 === 0 && !isNegativeZero(object);
}
const __int = new Type("tag:yaml.org,2002:int", {
    construct: constructYamlInteger,
    defaultStyle: "decimal",
    kind: "scalar",
    predicate: isInteger,
    represent: {
        binary (obj) {
            return obj >= 0 ? `0b${obj.toString(2)}` : `-0b${obj.toString(2).slice(1)}`;
        },
        octal (obj) {
            return obj >= 0 ? `0${obj.toString(8)}` : `-0${obj.toString(8).slice(1)}`;
        },
        decimal (obj) {
            return obj.toString(10);
        },
        hexadecimal (obj) {
            return obj >= 0 ? `0x${obj.toString(16).toUpperCase()}` : `-0x${obj.toString(16).toUpperCase().slice(1)}`;
        }
    },
    resolve: resolveYamlInteger,
    styleAliases: {
        binary: [
            2,
            "bin"
        ],
        decimal: [
            10,
            "dec"
        ],
        hexadecimal: [
            16,
            "hex"
        ],
        octal: [
            8,
            "oct"
        ]
    }
});
const YAML_FLOAT_PATTERN = new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?" + "|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?" + "|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*" + "|[-+]?\\.(?:inf|Inf|INF)" + "|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat(data) {
    if (!YAML_FLOAT_PATTERN.test(data) || data[data.length - 1] === "_") {
        return false;
    }
    return true;
}
function constructYamlFloat(data) {
    let value = data.replace(/_/g, "").toLowerCase();
    const sign = value[0] === "-" ? -1 : 1;
    const digits = [];
    if ("+-".indexOf(value[0]) >= 0) {
        value = value.slice(1);
    }
    if (value === ".inf") {
        return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    }
    if (value === ".nan") {
        return NaN;
    }
    if (value.indexOf(":") >= 0) {
        value.split(":").forEach((v)=>{
            digits.unshift(parseFloat(v));
        });
        let valueNb = 0;
        let base = 1;
        digits.forEach((d)=>{
            valueNb += d * base;
            base *= 60;
        });
        return sign * valueNb;
    }
    return sign * parseFloat(value);
}
const SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
    if (isNaN(object)) {
        switch(style){
            case "lowercase":
                return ".nan";
            case "uppercase":
                return ".NAN";
            case "camelcase":
                return ".NaN";
        }
    } else if (Number.POSITIVE_INFINITY === object) {
        switch(style){
            case "lowercase":
                return ".inf";
            case "uppercase":
                return ".INF";
            case "camelcase":
                return ".Inf";
        }
    } else if (Number.NEGATIVE_INFINITY === object) {
        switch(style){
            case "lowercase":
                return "-.inf";
            case "uppercase":
                return "-.INF";
            case "camelcase":
                return "-.Inf";
        }
    } else if (isNegativeZero(object)) {
        return "-0.0";
    }
    const res = object.toString(10);
    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || isNegativeZero(object));
}
const __float = new Type("tag:yaml.org,2002:float", {
    construct: constructYamlFloat,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isFloat,
    represent: representYamlFloat,
    resolve: resolveYamlFloat
});
const str1 = new Type("tag:yaml.org,2002:str", {
    construct (data) {
        return data !== null ? data : "";
    },
    kind: "scalar"
});
const seq = new Type("tag:yaml.org,2002:seq", {
    construct (data) {
        return data !== null ? data : [];
    },
    kind: "sequence"
});
const map = new Type("tag:yaml.org,2002:map", {
    construct (data) {
        return data !== null ? data : {
        };
    },
    kind: "mapping"
});
const BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
    if (data === null) return false;
    let code;
    let bitlen = 0;
    const max = data.length;
    const map1 = BASE64_MAP;
    for(let idx = 0; idx < max; idx++){
        code = BASE64_MAP.indexOf(data.charAt(idx));
        if (code > 64) continue;
        if (code < 0) return false;
        bitlen += 6;
    }
    return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
    const input = data.replace(/[\r\n=]/g, "");
    const max = input.length;
    const map1 = BASE64_MAP;
    const result = [];
    let bits = 0;
    for(let idx = 0; idx < max; idx++){
        if (idx % 4 === 0 && idx) {
            result.push(bits >> 16 & 255);
            result.push(bits >> 8 & 255);
            result.push(bits & 255);
        }
        bits = bits << 6 | BASE64_MAP.indexOf(input.charAt(idx));
    }
    const tailbits = max % 4 * 6;
    if (tailbits === 0) {
        result.push(bits >> 16 & 255);
        result.push(bits >> 8 & 255);
        result.push(bits & 255);
    } else if (tailbits === 18) {
        result.push(bits >> 10 & 255);
        result.push(bits >> 2 & 255);
    } else if (tailbits === 12) {
        result.push(bits >> 4 & 255);
    }
    return new Deno.Buffer(new Uint8Array(result));
}
function representYamlBinary(object) {
    const max = object.length;
    const map1 = BASE64_MAP;
    let result = "";
    let bits = 0;
    for(let idx = 0; idx < max; idx++){
        if (idx % 3 === 0 && idx) {
            result += BASE64_MAP[bits >> 18 & 63];
            result += BASE64_MAP[bits >> 12 & 63];
            result += BASE64_MAP[bits >> 6 & 63];
            result += BASE64_MAP[bits & 63];
        }
        bits = (bits << 8) + object[idx];
    }
    const tail = max % 3;
    if (tail === 0) {
        result += BASE64_MAP[bits >> 18 & 63];
        result += BASE64_MAP[bits >> 12 & 63];
        result += BASE64_MAP[bits >> 6 & 63];
        result += BASE64_MAP[bits & 63];
    } else if (tail === 2) {
        result += BASE64_MAP[bits >> 10 & 63];
        result += BASE64_MAP[bits >> 4 & 63];
        result += BASE64_MAP[bits << 2 & 63];
        result += BASE64_MAP[64];
    } else if (tail === 1) {
        result += BASE64_MAP[bits >> 2 & 63];
        result += BASE64_MAP[bits << 4 & 63];
        result += BASE64_MAP[64];
        result += BASE64_MAP[64];
    }
    return result;
}
function isBinary(obj) {
    const buf = new Deno.Buffer();
    try {
        if (0 > buf.readFromSync(obj)) return true;
        return false;
    } catch  {
        return false;
    } finally{
        buf.reset();
    }
}
const binary = new Type("tag:yaml.org,2002:binary", {
    construct: constructYamlBinary,
    kind: "scalar",
    predicate: isBinary,
    represent: representYamlBinary,
    resolve: resolveYamlBinary
});
const _hasOwnProperty = Object.prototype.hasOwnProperty;
const _toString = Object.prototype.toString;
function resolveYamlOmap(data) {
    const objectKeys = [];
    let pairKey = "";
    let pairHasKey = false;
    for (const pair of data){
        pairHasKey = false;
        if (_toString.call(pair) !== "[object Object]") return false;
        for(pairKey in pair){
            if (_hasOwnProperty.call(pair, pairKey)) {
                if (!pairHasKey) pairHasKey = true;
                else return false;
            }
        }
        if (!pairHasKey) return false;
        if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
        else return false;
    }
    return true;
}
function constructYamlOmap(data) {
    return data !== null ? data : [];
}
const omap = new Type("tag:yaml.org,2002:omap", {
    construct: constructYamlOmap,
    kind: "sequence",
    resolve: resolveYamlOmap
});
const _toString1 = Object.prototype.toString;
function resolveYamlPairs(data) {
    const result = new Array(data.length);
    for(let index = 0; index < data.length; index++){
        const pair = data[index];
        if (_toString1.call(pair) !== "[object Object]") return false;
        const keys = Object.keys(pair);
        if (keys.length !== 1) return false;
        result[index] = [
            keys[0],
            pair[keys[0]]
        ];
    }
    return true;
}
function constructYamlPairs(data) {
    if (data === null) return [];
    const result = new Array(data.length);
    for(let index = 0; index < data.length; index += 1){
        const pair = data[index];
        const keys = Object.keys(pair);
        result[index] = [
            keys[0],
            pair[keys[0]]
        ];
    }
    return result;
}
const pairs = new Type("tag:yaml.org,2002:pairs", {
    construct: constructYamlPairs,
    kind: "sequence",
    resolve: resolveYamlPairs
});
const _hasOwnProperty1 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
    if (data === null) return true;
    for(const key in data){
        if (_hasOwnProperty1.call(data, key)) {
            if (data[key] !== null) return false;
        }
    }
    return true;
}
function constructYamlSet(data) {
    return data !== null ? data : {
    };
}
const set = new Type("tag:yaml.org,2002:set", {
    construct: constructYamlSet,
    kind: "mapping",
    resolve: resolveYamlSet
});
const YAML_DATE_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" + "-([0-9][0-9])" + "-([0-9][0-9])$");
const YAML_TIMESTAMP_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" + "-([0-9][0-9]?)" + "-([0-9][0-9]?)" + "(?:[Tt]|[ \\t]+)" + "([0-9][0-9]?)" + ":([0-9][0-9])" + ":([0-9][0-9])" + "(?:\\.([0-9]*))?" + "(?:[ \\t]*(Z|([-+])([0-9][0-9]?)" + "(?::([0-9][0-9]))?))?$");
function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
}
function constructYamlTimestamp(data) {
    let match = YAML_DATE_REGEXP.exec(data);
    if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match === null) throw new Error("Date resolve error");
    const year = +match[1];
    const month = +match[2] - 1;
    const day = +match[3];
    if (!match[4]) {
        return new Date(Date.UTC(year, month, day));
    }
    const hour = +match[4];
    const minute = +match[5];
    const second = +match[6];
    let fraction = 0;
    if (match[7]) {
        let partFraction = match[7].slice(0, 3);
        while(partFraction.length < 3){
            partFraction += "0";
        }
        fraction = +partFraction;
    }
    let delta = null;
    if (match[9]) {
        const tzHour = +match[10];
        const tzMinute = +(match[11] || 0);
        delta = (tzHour * 60 + tzMinute) * 60000;
        if (match[9] === "-") delta = -delta;
    }
    const date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta) date.setTime(date.getTime() - delta);
    return date;
}
function representYamlTimestamp(date) {
    return date.toISOString();
}
const timestamp = new Type("tag:yaml.org,2002:timestamp", {
    construct: constructYamlTimestamp,
    instanceOf: Date,
    kind: "scalar",
    represent: representYamlTimestamp,
    resolve: resolveYamlTimestamp
});
function resolveYamlMerge(data) {
    return data === "<<" || data === null;
}
const merge = new Type("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: resolveYamlMerge
});
class State {
    constructor(schema = DEFAULT_SCHEMA){
        this.schema = schema;
    }
}
const mod3 = function() {
    const Schema1 = Schema;
    const nil1 = nil;
    const bool1 = bool;
    const __int1 = __int;
    const __float1 = __float;
    const Schema2 = Schema;
    const str1 = str1;
    const seq1 = seq;
    const map1 = map;
    const failsafe = new Schema({
        explicit: [
            str1,
            seq,
            map
        ]
    });
    const failsafe1 = failsafe;
    const failsafe2 = failsafe;
    const json = new Schema({
        implicit: [
            nil,
            bool,
            __int,
            __float
        ],
        include: [
            failsafe
        ]
    });
    const Schema3 = Schema;
    const binary1 = binary;
    const omap1 = omap;
    const pairs1 = pairs;
    const set1 = set;
    const timestamp1 = timestamp;
    const merge1 = merge;
    const Schema4 = Schema;
    const json1 = json;
    const json2 = json;
    const core = new Schema({
        include: [
            json
        ]
    });
    const core1 = core;
    const core2 = core;
    const def = new Schema({
        explicit: [
            binary,
            omap,
            pairs,
            set
        ],
        implicit: [
            timestamp,
            merge
        ],
        include: [
            core
        ]
    });
    const CORE_SCHEMA = core;
    const def1 = def;
    const DEFAULT_SCHEMA = def;
    const FAILSAFE_SCHEMA = failsafe;
    const JSON_SCHEMA = json;
    const State1 = State;
    const _hasOwnProperty2 = Object.prototype.hasOwnProperty;
    function compileStyleMap(schema1, map2) {
        if (typeof map2 === "undefined" || map2 === null) return {
        };
        let type1;
        const result = {
        };
        const keys = Object.keys(map2);
        let tag1, style;
        for(let index = 0, length = keys.length; index < length; index += 1){
            tag1 = keys[index];
            style = String(map2[tag1]);
            if (tag1.slice(0, 2) === "!!") {
                tag1 = `tag:yaml.org,2002:${tag1.slice(2)}`;
            }
            type1 = schema1.compiledTypeMap.fallback[tag1];
            if (type1 && typeof type1.styleAliases !== "undefined" && _hasOwnProperty2.call(type1.styleAliases, style)) {
                style = type1.styleAliases[style];
            }
            result[tag1] = style;
        }
        return result;
    }
    class DumperState extends State {
        tag = null;
        result = "";
        duplicates = [];
        usedDuplicates = [];
        constructor({ schema: schema1 , indent: indent1 = 2 , noArrayIndent =false , skipInvalid =false , flowLevel =-1 , styles =null , sortKeys =false , lineWidth =80 , noRefs =false , noCompatMode =false , condenseFlow =false  }){
            super(schema1);
            this.indent = Math.max(1, indent1);
            this.noArrayIndent = noArrayIndent;
            this.skipInvalid = skipInvalid;
            this.flowLevel = flowLevel;
            this.styleMap = compileStyleMap(this.schema, styles);
            this.sortKeys = sortKeys;
            this.lineWidth = lineWidth;
            this.noRefs = noRefs;
            this.noCompatMode = noCompatMode;
            this.condenseFlow = condenseFlow;
            this.implicitTypes = this.schema.compiledImplicit;
            this.explicitTypes = this.schema.compiledExplicit;
        }
    }
    const DumperState1 = DumperState;
    const DumperState2 = DumperState;
    const _toString2 = Object.prototype.toString;
    const _hasOwnProperty3 = Object.prototype.hasOwnProperty;
    const CHAR_TAB = 9;
    const CHAR_LINE_FEED = 10;
    const CHAR_SPACE = 32;
    const CHAR_EXCLAMATION = 33;
    const CHAR_DOUBLE_QUOTE = 34;
    const CHAR_SHARP = 35;
    const CHAR_PERCENT = 37;
    const CHAR_AMPERSAND = 38;
    const CHAR_SINGLE_QUOTE = 39;
    const CHAR_ASTERISK = 42;
    const CHAR_COMMA = 44;
    const CHAR_MINUS = 45;
    const CHAR_COLON = 58;
    const CHAR_GREATER_THAN = 62;
    const CHAR_QUESTION = 63;
    const CHAR_COMMERCIAL_AT = 64;
    const CHAR_LEFT_SQUARE_BRACKET = 91;
    const CHAR_RIGHT_SQUARE_BRACKET = 93;
    const CHAR_GRAVE_ACCENT = 96;
    const CHAR_LEFT_CURLY_BRACKET = 123;
    const CHAR_VERTICAL_LINE = 124;
    const CHAR_RIGHT_CURLY_BRACKET = 125;
    const ESCAPE_SEQUENCES = {
    };
    ESCAPE_SEQUENCES[0] = "\\0";
    ESCAPE_SEQUENCES[7] = "\\a";
    ESCAPE_SEQUENCES[8] = "\\b";
    ESCAPE_SEQUENCES[9] = "\\t";
    ESCAPE_SEQUENCES[10] = "\\n";
    ESCAPE_SEQUENCES[11] = "\\v";
    ESCAPE_SEQUENCES[12] = "\\f";
    ESCAPE_SEQUENCES[13] = "\\r";
    ESCAPE_SEQUENCES[27] = "\\e";
    ESCAPE_SEQUENCES[34] = '\\"';
    ESCAPE_SEQUENCES[92] = "\\\\";
    ESCAPE_SEQUENCES[133] = "\\N";
    ESCAPE_SEQUENCES[160] = "\\_";
    ESCAPE_SEQUENCES[8232] = "\\L";
    ESCAPE_SEQUENCES[8233] = "\\P";
    const DEPRECATED_BOOLEANS_SYNTAX = [
        "y",
        "Y",
        "yes",
        "Yes",
        "YES",
        "on",
        "On",
        "ON",
        "n",
        "N",
        "no",
        "No",
        "NO",
        "off",
        "Off",
        "OFF",
    ];
    const YAMLError1 = YAMLError;
    function isNothing(subject) {
        return typeof subject === "undefined" || subject === null;
    }
    function isArray(value) {
        return Array.isArray(value);
    }
    function isBoolean(value) {
        return typeof value === "boolean" || value instanceof Boolean;
    }
    function isNull1(value) {
        return value === null;
    }
    function isNumber(value) {
        return typeof value === "number" || value instanceof Number;
    }
    function isString(value) {
        return typeof value === "string" || value instanceof String;
    }
    function isSymbol(value) {
        return typeof value === "symbol";
    }
    function isUndefined(value) {
        return value === undefined;
    }
    function isObject(value) {
        return value !== null && typeof value === "object";
    }
    function isError(e) {
        return e instanceof Error;
    }
    function isFunction(value) {
        return typeof value === "function";
    }
    function isRegExp(value) {
        return value instanceof RegExp;
    }
    function toArray(sequence) {
        if (isArray(sequence)) return sequence;
        if (isNothing(sequence)) return [];
        return [
            sequence
        ];
    }
    function repeat(str2, count) {
        let result = "";
        for(let cycle = 0; cycle < count; cycle++){
            result += str2;
        }
        return result;
    }
    function isNegativeZero(i) {
        return i === 0 && Number.NEGATIVE_INFINITY === 1 / i;
    }
    const repeat1 = repeat;
    const repeat2 = repeat;
    function encodeHex(character) {
        const string = character.toString(16).toUpperCase();
        let handle;
        let length;
        if (character <= 255) {
            handle = "x";
            length = 2;
        } else if (character <= 65535) {
            handle = "u";
            length = 4;
        } else if (character <= 4294967295) {
            handle = "U";
            length = 8;
        } else {
            throw new YAMLError("code point within a string may not be greater than 0xFFFFFFFF");
        }
        return `\\${handle}${repeat("0", length - string.length)}${string}`;
    }
    function indentString(string, spaces) {
        const ind = repeat(" ", spaces), length = string.length;
        let position = 0, next = -1, result = "", line;
        while(position < length){
            next = string.indexOf("\n", position);
            if (next === -1) {
                line = string.slice(position);
                position = length;
            } else {
                line = string.slice(position, next + 1);
                position = next + 1;
            }
            if (line.length && line !== "\n") result += ind;
            result += line;
        }
        return result;
    }
    function generateNextLine(state, level) {
        return `\n${repeat(" ", state.indent * level)}`;
    }
    function testImplicitResolving(state, str2) {
        let type1;
        for(let index = 0, length = state.implicitTypes.length; index < length; index += 1){
            type1 = state.implicitTypes[index];
            if (type1.resolve(str2)) {
                return true;
            }
        }
        return false;
    }
    function isWhitespace(c) {
        return c === 32 || c === 9;
    }
    function isPrintable(c) {
        return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== 65279 || 65536 <= c && c <= 1114111;
    }
    function isPlainSafe(c) {
        return isPrintable(c) && c !== 65279 && c !== 44 && c !== 91 && c !== 93 && c !== 123 && c !== 125 && c !== 58 && c !== 35;
    }
    function isPlainSafeFirst(c) {
        return isPrintable(c) && c !== 65279 && !isWhitespace(c) && c !== 45 && c !== 63 && c !== 58 && c !== 44 && c !== 91 && c !== 93 && c !== 123 && c !== 125 && c !== 35 && c !== 38 && c !== 42 && c !== 33 && c !== 124 && c !== 62 && c !== 39 && c !== 34 && c !== 37 && c !== 64 && c !== 96;
    }
    function needIndentIndicator(string) {
        const leadingSpaceRe = /^\n* /;
        return leadingSpaceRe.test(string);
    }
    const STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
    function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth1, testAmbiguousType) {
        const shouldTrackWidth = lineWidth1 !== -1;
        let hasLineBreak = false, hasFoldableLine = false, previousLineBreak = -1, plain = isPlainSafeFirst(string.charCodeAt(0)) && !isWhitespace(string.charCodeAt(string.length - 1));
        let __char, i;
        if (singleLineOnly) {
            for(i = 0; i < string.length; i++){
                __char = string.charCodeAt(i);
                if (!isPrintable(__char)) {
                    return 5;
                }
                plain = plain && isPlainSafe(__char);
            }
        } else {
            for(i = 0; i < string.length; i++){
                __char = string.charCodeAt(i);
                if (__char === 10) {
                    hasLineBreak = true;
                    if (shouldTrackWidth) {
                        hasFoldableLine = hasFoldableLine || i - previousLineBreak - 1 > lineWidth1 && string[previousLineBreak + 1] !== " ";
                        previousLineBreak = i;
                    }
                } else if (!isPrintable(__char)) {
                    return 5;
                }
                plain = plain && isPlainSafe(__char);
            }
            hasFoldableLine = hasFoldableLine || shouldTrackWidth && i - previousLineBreak - 1 > lineWidth1 && string[previousLineBreak + 1] !== " ";
        }
        if (!hasLineBreak && !hasFoldableLine) {
            return plain && !testAmbiguousType(string) ? 1 : 2;
        }
        if (indentPerLevel > 9 && needIndentIndicator(string)) {
            return 5;
        }
        return hasFoldableLine ? 4 : 3;
    }
    function foldLine(line, width) {
        if (line === "" || line[0] === " ") return line;
        const breakRe = / [^ ]/g;
        let match;
        let start = 0, end, curr = 0, next = 0;
        let result = "";
        while(match = breakRe.exec(line)){
            next = match.index;
            if (next - start > width) {
                end = curr > start ? curr : next;
                result += `\n${line.slice(start, end)}`;
                start = end + 1;
            }
            curr = next;
        }
        result += "\n";
        if (line.length - start > width && curr > start) {
            result += `${line.slice(start, curr)}\n${line.slice(curr + 1)}`;
        } else {
            result += line.slice(start);
        }
        return result.slice(1);
    }
    function dropEndingNewline(string) {
        return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
    }
    function foldString(string, width) {
        const lineRe = /(\n+)([^\n]*)/g;
        let result = (()=>{
            let nextLF = string.indexOf("\n");
            nextLF = nextLF !== -1 ? nextLF : string.length;
            lineRe.lastIndex = nextLF;
            return foldLine(string.slice(0, nextLF), width);
        })();
        let prevMoreIndented = string[0] === "\n" || string[0] === " ";
        let moreIndented;
        let match;
        while(match = lineRe.exec(string)){
            const prefix = match[1], line = match[2];
            moreIndented = line[0] === " ";
            result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
            prevMoreIndented = moreIndented;
        }
        return result;
    }
    function escapeString(string) {
        let result = "";
        let __char, nextChar;
        let escapeSeq;
        for(let i = 0; i < string.length; i++){
            __char = string.charCodeAt(i);
            if (__char >= 55296 && __char <= 56319) {
                nextChar = string.charCodeAt(i + 1);
                if (nextChar >= 56320 && nextChar <= 57343) {
                    result += encodeHex((__char - 55296) * 1024 + nextChar - 56320 + 65536);
                    i++;
                    continue;
                }
            }
            escapeSeq = ESCAPE_SEQUENCES[__char];
            result += !escapeSeq && isPrintable(__char) ? string[i] : escapeSeq || encodeHex(__char);
        }
        return result;
    }
    function blockHeader(string, indentPerLevel) {
        const indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
        const clip = string[string.length - 1] === "\n";
        const keep = clip && (string[string.length - 2] === "\n" || string === "\n");
        const chomp = keep ? "+" : clip ? "" : "-";
        return `${indentIndicator}${chomp}\n`;
    }
    function writeScalar(state, string, level, iskey) {
        state.dump = (()=>{
            if (string.length === 0) {
                return "''";
            }
            if (!state.noCompatMode && DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
                return `'${string}'`;
            }
            const indent1 = state.indent * Math.max(1, level);
            const lineWidth1 = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent1);
            const singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
            function testAmbiguity(str2) {
                return testImplicitResolving(state, str2);
            }
            switch(chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth1, testAmbiguity)){
                case 1:
                    return string;
                case 2:
                    return `'${string.replace(/'/g, "''")}'`;
                case 3:
                    return `|${blockHeader(string, state.indent)}${dropEndingNewline(indentString(string, indent1))}`;
                case 4:
                    return `>${blockHeader(string, state.indent)}${dropEndingNewline(indentString(foldString(string, lineWidth1), indent1))}`;
                case 5:
                    return `"${escapeString(string)}"`;
                default:
                    throw new YAMLError("impossible error: invalid scalar style");
            }
        })();
    }
    function writeFlowSequence(state, level, object) {
        let _result = "";
        const _tag = state.tag;
        for(let index = 0, length = object.length; index < length; index += 1){
            if (writeNode(state, level, object[index], false, false)) {
                if (index !== 0) _result += `,${!state.condenseFlow ? " " : ""}`;
                _result += state.dump;
            }
        }
        state.tag = _tag;
        state.dump = `[${_result}]`;
    }
    function writeBlockSequence(state, level, object, compact = false) {
        let _result = "";
        const _tag = state.tag;
        for(let index = 0, length = object.length; index < length; index += 1){
            if (writeNode(state, level + 1, object[index], true, true)) {
                if (!compact || index !== 0) {
                    _result += generateNextLine(state, level);
                }
                if (state.dump && 10 === state.dump.charCodeAt(0)) {
                    _result += "-";
                } else {
                    _result += "- ";
                }
                _result += state.dump;
            }
        }
        state.tag = _tag;
        state.dump = _result || "[]";
    }
    function writeFlowMapping(state, level, object) {
        let _result = "";
        const _tag = state.tag, objectKeyList = Object.keys(object);
        let pairBuffer, objectKey, objectValue;
        for(let index = 0, length = objectKeyList.length; index < length; index += 1){
            pairBuffer = state.condenseFlow ? '"' : "";
            if (index !== 0) pairBuffer += ", ";
            objectKey = objectKeyList[index];
            objectValue = object[objectKey];
            if (!writeNode(state, level, objectKey, false, false)) {
                continue;
            }
            if (state.dump.length > 1024) pairBuffer += "? ";
            pairBuffer += `${state.dump}${state.condenseFlow ? '"' : ""}:${state.condenseFlow ? "" : " "}`;
            if (!writeNode(state, level, objectValue, false, false)) {
                continue;
            }
            pairBuffer += state.dump;
            _result += pairBuffer;
        }
        state.tag = _tag;
        state.dump = `{${_result}}`;
    }
    function writeBlockMapping(state, level, object, compact = false) {
        const _tag = state.tag, objectKeyList = Object.keys(object);
        let _result = "";
        if (state.sortKeys === true) {
            objectKeyList.sort();
        } else if (typeof state.sortKeys === "function") {
            objectKeyList.sort(state.sortKeys);
        } else if (state.sortKeys) {
            throw new YAMLError("sortKeys must be a boolean or a function");
        }
        let pairBuffer = "", objectKey, objectValue, explicitPair;
        for(let index = 0, length = objectKeyList.length; index < length; index += 1){
            pairBuffer = "";
            if (!compact || index !== 0) {
                pairBuffer += generateNextLine(state, level);
            }
            objectKey = objectKeyList[index];
            objectValue = object[objectKey];
            if (!writeNode(state, level + 1, objectKey, true, true, true)) {
                continue;
            }
            explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
            if (explicitPair) {
                if (state.dump && 10 === state.dump.charCodeAt(0)) {
                    pairBuffer += "?";
                } else {
                    pairBuffer += "? ";
                }
            }
            pairBuffer += state.dump;
            if (explicitPair) {
                pairBuffer += generateNextLine(state, level);
            }
            if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
                continue;
            }
            if (state.dump && 10 === state.dump.charCodeAt(0)) {
                pairBuffer += ":";
            } else {
                pairBuffer += ": ";
            }
            pairBuffer += state.dump;
            _result += pairBuffer;
        }
        state.tag = _tag;
        state.dump = _result || "{}";
    }
    function detectType(state, object, explicit = false) {
        const typeList = explicit ? state.explicitTypes : state.implicitTypes;
        let type1;
        let style;
        let _result;
        for(let index = 0, length = typeList.length; index < length; index += 1){
            type1 = typeList[index];
            if ((type1.instanceOf || type1.predicate) && (!type1.instanceOf || typeof object === "object" && object instanceof type1.instanceOf) && (!type1.predicate || type1.predicate(object))) {
                state.tag = explicit ? type1.tag : "?";
                if (type1.represent) {
                    style = state.styleMap[type1.tag] || type1.defaultStyle;
                    if (_toString2.call(type1.represent) === "[object Function]") {
                        _result = type1.represent(object, style);
                    } else if (_hasOwnProperty3.call(type1.represent, style)) {
                        _result = type1.represent[style](object, style);
                    } else {
                        throw new YAMLError(`!<${type1.tag}> tag resolver accepts not "${style}" style`);
                    }
                    state.dump = _result;
                }
                return true;
            }
        }
        return false;
    }
    function writeNode(state, level, object, block, compact, iskey = false) {
        state.tag = null;
        state.dump = object;
        if (!detectType(state, object, false)) {
            detectType(state, object, true);
        }
        const type1 = _toString2.call(state.dump);
        if (block) {
            block = state.flowLevel < 0 || state.flowLevel > level;
        }
        const objectOrArray = type1 === "[object Object]" || type1 === "[object Array]";
        let duplicateIndex = -1;
        let duplicate = false;
        if (objectOrArray) {
            duplicateIndex = state.duplicates.indexOf(object);
            duplicate = duplicateIndex !== -1;
        }
        if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
            compact = false;
        }
        if (duplicate && state.usedDuplicates[duplicateIndex]) {
            state.dump = `*ref_${duplicateIndex}`;
        } else {
            if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
                state.usedDuplicates[duplicateIndex] = true;
            }
            if (type1 === "[object Object]") {
                if (block && Object.keys(state.dump).length !== 0) {
                    writeBlockMapping(state, level, state.dump, compact);
                    if (duplicate) {
                        state.dump = `&ref_${duplicateIndex}${state.dump}`;
                    }
                } else {
                    writeFlowMapping(state, level, state.dump);
                    if (duplicate) {
                        state.dump = `&ref_${duplicateIndex} ${state.dump}`;
                    }
                }
            } else if (type1 === "[object Array]") {
                const arrayLevel = state.noArrayIndent && level > 0 ? level - 1 : level;
                if (block && state.dump.length !== 0) {
                    writeBlockSequence(state, arrayLevel, state.dump, compact);
                    if (duplicate) {
                        state.dump = `&ref_${duplicateIndex}${state.dump}`;
                    }
                } else {
                    writeFlowSequence(state, arrayLevel, state.dump);
                    if (duplicate) {
                        state.dump = `&ref_${duplicateIndex} ${state.dump}`;
                    }
                }
            } else if (type1 === "[object String]") {
                if (state.tag !== "?") {
                    writeScalar(state, state.dump, level, iskey);
                }
            } else {
                if (state.skipInvalid) return false;
                throw new YAMLError(`unacceptable kind of an object to dump ${type1}`);
            }
            if (state.tag !== null && state.tag !== "?") {
                state.dump = `!<${state.tag}> ${state.dump}`;
            }
        }
        return true;
    }
    function inspectNode(object, objects, duplicatesIndexes) {
        if (object !== null && typeof object === "object") {
            const index = objects.indexOf(object);
            if (index !== -1) {
                if (duplicatesIndexes.indexOf(index) === -1) {
                    duplicatesIndexes.push(index);
                }
            } else {
                objects.push(object);
                if (Array.isArray(object)) {
                    for(let idx = 0, length = object.length; idx < length; idx += 1){
                        inspectNode(object[idx], objects, duplicatesIndexes);
                    }
                } else {
                    const objectKeyList = Object.keys(object);
                    for(let idx = 0, length = objectKeyList.length; idx < length; idx += 1){
                        inspectNode(object[objectKeyList[idx]], objects, duplicatesIndexes);
                    }
                }
            }
        }
    }
    function getDuplicateReferences(object, state) {
        const objects = [], duplicatesIndexes = [];
        inspectNode(object, objects, duplicatesIndexes);
        const length = duplicatesIndexes.length;
        for(let index = 0; index < length; index += 1){
            state.duplicates.push(objects[duplicatesIndexes[index]]);
        }
        state.usedDuplicates = new Array(length);
    }
    function dump(input, options1) {
        options1 = options1 || {
        };
        const state = new DumperState(options1);
        if (!state.noRefs) getDuplicateReferences(input, state);
        if (writeNode(state, 0, input, true, true)) return `${state.dump}\n`;
        return "";
    }
    const dump1 = dump;
    const dump2 = dump;
    function stringify(obj, options1) {
        return dump(obj, options1);
    }
    const YAMLError2 = YAMLError;
    const _hasOwnProperty4 = Object.prototype.hasOwnProperty;
    const CONTEXT_FLOW_IN = 1;
    const CONTEXT_FLOW_OUT = 2;
    const CONTEXT_BLOCK_IN = 3;
    const CONTEXT_BLOCK_OUT = 4;
    const CHOMPING_CLIP = 1;
    const CHOMPING_STRIP = 2;
    const CHOMPING_KEEP = 3;
    const PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
    const PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
    const PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
    const PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
    const PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
    function _class(obj) {
        return Object.prototype.toString.call(obj);
    }
    function isEOL(c) {
        return c === 10 || c === 13;
    }
    function isWhiteSpace(c) {
        return c === 9 || c === 32;
    }
    function isWsOrEol(c) {
        return c === 9 || c === 32 || c === 10 || c === 13;
    }
    function isFlowIndicator(c) {
        return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
    }
    function fromHexCode(c) {
        if (48 <= c && c <= 57) {
            return c - 48;
        }
        const lc = c | 32;
        if (97 <= lc && lc <= 102) {
            return lc - 97 + 10;
        }
        return -1;
    }
    function escapedHexLen(c) {
        if (c === 120) {
            return 2;
        }
        if (c === 117) {
            return 4;
        }
        if (c === 85) {
            return 8;
        }
        return 0;
    }
    function fromDecimalCode(c) {
        if (48 <= c && c <= 57) {
            return c - 48;
        }
        return -1;
    }
    function simpleEscapeSequence(c) {
        return c === 48 ? "\x00" : c === 97 ? "\x07" : c === 98 ? "\x08" : c === 116 ? "\x09" : c === 9 ? "\x09" : c === 110 ? "\x0A" : c === 118 ? "\x0B" : c === 102 ? "\x0C" : c === 114 ? "\x0D" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? "\x22" : c === 47 ? "/" : c === 92 ? "\x5C" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
    }
    function charFromCodepoint(c) {
        if (c <= 65535) {
            return String.fromCharCode(c);
        }
        return String.fromCharCode((c - 65536 >> 10) + 55296, (c - 65536 & 1023) + 56320);
    }
    const simpleEscapeCheck = new Array(256);
    const simpleEscapeMap = new Array(256);
    for(let i = 0; i < 256; i++){
        simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
        simpleEscapeMap[i] = simpleEscapeSequence(i);
    }
    class Mark {
        constructor(name, buffer, position1, line1, column){
            this.name = name;
            this.buffer = buffer;
            this.position = position1;
            this.line = line1;
            this.column = column;
        }
        getSnippet(indent = 4, maxLength = 75) {
            if (!this.buffer) return null;
            let head = "";
            let start = this.position;
            while(start > 0 && "\x00\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(start - 1)) === -1){
                start -= 1;
                if (this.position - start > maxLength / 2 - 1) {
                    head = " ... ";
                    start += 5;
                    break;
                }
            }
            let tail = "";
            let end = this.position;
            while(end < this.buffer.length && "\x00\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(end)) === -1){
                end += 1;
                if (end - this.position > maxLength / 2 - 1) {
                    tail = " ... ";
                    end -= 5;
                    break;
                }
            }
            const snippet = this.buffer.slice(start, end);
            return `${repeat(" ", indent)}${head}${snippet}${tail}\n${repeat(" ", indent + this.position - start + head.length)}^`;
        }
        toString(compact) {
            let snippet, where = "";
            if (this.name) {
                where += `in "${this.name}" `;
            }
            where += `at line ${this.line + 1}, column ${this.column + 1}`;
            if (!compact) {
                snippet = this.getSnippet();
                if (snippet) {
                    where += `:\n${snippet}`;
                }
            }
            return where;
        }
    }
    const Mark1 = Mark;
    const Mark2 = Mark;
    function generateError(state, message3) {
        return new YAMLError(message3, new Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart));
    }
    function throwError(state, message3) {
        throw generateError(state, message3);
    }
    function throwWarning(state, message3) {
        if (state.onWarning) {
            state.onWarning.call(null, generateError(state, message3));
        }
    }
    const directiveHandlers = {
        YAML (state, _name, ...args) {
            if (state.version !== null) {
                return throwError(state, "duplication of %YAML directive");
            }
            if (args.length !== 1) {
                return throwError(state, "YAML directive accepts exactly one argument");
            }
            const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
            if (match === null) {
                return throwError(state, "ill-formed argument of the YAML directive");
            }
            const major = parseInt(match[1], 10);
            const minor = parseInt(match[2], 10);
            if (major !== 1) {
                return throwError(state, "unacceptable YAML version of the document");
            }
            state.version = args[0];
            state.checkLineBreaks = minor < 2;
            if (minor !== 1 && minor !== 2) {
                return throwWarning(state, "unsupported YAML version of the document");
            }
        },
        TAG (state, _name, ...args) {
            if (args.length !== 2) {
                return throwError(state, "TAG directive accepts exactly two arguments");
            }
            const handle = args[0];
            const prefix = args[1];
            if (!PATTERN_TAG_HANDLE.test(handle)) {
                return throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
            }
            if (_hasOwnProperty4.call(state.tagMap, handle)) {
                return throwError(state, `there is a previously declared suffix for "${handle}" tag handle`);
            }
            if (!PATTERN_TAG_URI.test(prefix)) {
                return throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
            }
            if (typeof state.tagMap === "undefined") {
                state.tagMap = {
                };
            }
            state.tagMap[handle] = prefix;
        }
    };
    function captureSegment(state, start, end, checkJson) {
        let result;
        if (start < end) {
            result = state.input.slice(start, end);
            if (checkJson) {
                for(let position1 = 0, length = result.length; position1 < length; position1++){
                    const character = result.charCodeAt(position1);
                    if (!(character === 9 || 32 <= character && character <= 1114111)) {
                        return throwError(state, "expected valid JSON character");
                    }
                }
            } else if (PATTERN_NON_PRINTABLE.test(result)) {
                return throwError(state, "the stream contains non-printable characters");
            }
            state.result += result;
        }
    }
    const isObject1 = isObject;
    function mergeMappings(state, destination, source, overridableKeys) {
        if (!isObject(source)) {
            return throwError(state, "cannot merge mappings; the provided source object is unacceptable");
        }
        const keys = Object.keys(source);
        for(let i1 = 0, len = keys.length; i1 < len; i1++){
            const key = keys[i1];
            if (!_hasOwnProperty4.call(destination, key)) {
                destination[key] = source[key];
                overridableKeys[key] = true;
            }
        }
    }
    function storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
        if (Array.isArray(keyNode)) {
            keyNode = Array.prototype.slice.call(keyNode);
            for(let index = 0, quantity = keyNode.length; index < quantity; index++){
                if (Array.isArray(keyNode[index])) {
                    return throwError(state, "nested arrays are not supported inside keys");
                }
                if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
                    keyNode[index] = "[object Object]";
                }
            }
        }
        if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
            keyNode = "[object Object]";
        }
        keyNode = String(keyNode);
        if (result === null) {
            result = {
            };
        }
        if (keyTag === "tag:yaml.org,2002:merge") {
            if (Array.isArray(valueNode)) {
                for(let index = 0, quantity = valueNode.length; index < quantity; index++){
                    mergeMappings(state, result, valueNode[index], overridableKeys);
                }
            } else {
                mergeMappings(state, result, valueNode, overridableKeys);
            }
        } else {
            if (!state.json && !_hasOwnProperty4.call(overridableKeys, keyNode) && _hasOwnProperty4.call(result, keyNode)) {
                state.line = startLine || state.line;
                state.position = startPos || state.position;
                return throwError(state, "duplicated mapping key");
            }
            result[keyNode] = valueNode;
            delete overridableKeys[keyNode];
        }
        return result;
    }
    function readLineBreak(state) {
        const ch = state.input.charCodeAt(state.position);
        if (ch === 10) {
            state.position++;
        } else if (ch === 13) {
            state.position++;
            if (state.input.charCodeAt(state.position) === 10) {
                state.position++;
            }
        } else {
            return throwError(state, "a line break is expected");
        }
        state.line += 1;
        state.lineStart = state.position;
    }
    function skipSeparationSpace(state, allowComments, checkIndent) {
        let lineBreaks = 0, ch = state.input.charCodeAt(state.position);
        while(ch !== 0){
            while(isWhiteSpace(ch)){
                ch = state.input.charCodeAt(++state.position);
            }
            if (allowComments && ch === 35) {
                do {
                    ch = state.input.charCodeAt(++state.position);
                }while (ch !== 10 && ch !== 13 && ch !== 0)
            }
            if (isEOL(ch)) {
                readLineBreak(state);
                ch = state.input.charCodeAt(state.position);
                lineBreaks++;
                state.lineIndent = 0;
                while(ch === 32){
                    state.lineIndent++;
                    ch = state.input.charCodeAt(++state.position);
                }
            } else {
                break;
            }
        }
        if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
            throwWarning(state, "deficient indentation");
        }
        return lineBreaks;
    }
    function testDocumentSeparator(state) {
        let _position = state.position;
        let ch = state.input.charCodeAt(_position);
        if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
            _position += 3;
            ch = state.input.charCodeAt(_position);
            if (ch === 0 || isWsOrEol(ch)) {
                return true;
            }
        }
        return false;
    }
    function writeFoldedLines(state, count) {
        if (count === 1) {
            state.result += " ";
        } else if (count > 1) {
            state.result += repeat("\n", count - 1);
        }
    }
    function readPlainScalar(state, nodeIndent, withinFlowCollection) {
        const kind = state.kind;
        const result = state.result;
        let ch = state.input.charCodeAt(state.position);
        if (isWsOrEol(ch) || isFlowIndicator(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
            return false;
        }
        let following;
        if (ch === 63 || ch === 45) {
            following = state.input.charCodeAt(state.position + 1);
            if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
                return false;
            }
        }
        state.kind = "scalar";
        state.result = "";
        let captureEnd, captureStart = captureEnd = state.position;
        let hasPendingContent = false;
        let line1 = 0;
        while(ch !== 0){
            if (ch === 58) {
                following = state.input.charCodeAt(state.position + 1);
                if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
                    break;
                }
            } else if (ch === 35) {
                const preceding = state.input.charCodeAt(state.position - 1);
                if (isWsOrEol(preceding)) {
                    break;
                }
            } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && isFlowIndicator(ch)) {
                break;
            } else if (isEOL(ch)) {
                line1 = state.line;
                const lineStart = state.lineStart;
                const lineIndent = state.lineIndent;
                skipSeparationSpace(state, false, -1);
                if (state.lineIndent >= nodeIndent) {
                    hasPendingContent = true;
                    ch = state.input.charCodeAt(state.position);
                    continue;
                } else {
                    state.position = captureEnd;
                    state.line = line1;
                    state.lineStart = lineStart;
                    state.lineIndent = lineIndent;
                    break;
                }
            }
            if (hasPendingContent) {
                captureSegment(state, captureStart, captureEnd, false);
                writeFoldedLines(state, state.line - line1);
                captureStart = captureEnd = state.position;
                hasPendingContent = false;
            }
            if (!isWhiteSpace(ch)) {
                captureEnd = state.position + 1;
            }
            ch = state.input.charCodeAt(++state.position);
        }
        captureSegment(state, captureStart, captureEnd, false);
        if (state.result) {
            return true;
        }
        state.kind = kind;
        state.result = result;
        return false;
    }
    function readSingleQuotedScalar(state, nodeIndent) {
        let ch, captureStart, captureEnd;
        ch = state.input.charCodeAt(state.position);
        if (ch !== 39) {
            return false;
        }
        state.kind = "scalar";
        state.result = "";
        state.position++;
        captureStart = captureEnd = state.position;
        while((ch = state.input.charCodeAt(state.position)) !== 0){
            if (ch === 39) {
                captureSegment(state, captureStart, state.position, true);
                ch = state.input.charCodeAt(++state.position);
                if (ch === 39) {
                    captureStart = state.position;
                    state.position++;
                    captureEnd = state.position;
                } else {
                    return true;
                }
            } else if (isEOL(ch)) {
                captureSegment(state, captureStart, captureEnd, true);
                writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
                captureStart = captureEnd = state.position;
            } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
                return throwError(state, "unexpected end of the document within a single quoted scalar");
            } else {
                state.position++;
                captureEnd = state.position;
            }
        }
        return throwError(state, "unexpected end of the stream within a single quoted scalar");
    }
    function readDoubleQuotedScalar(state, nodeIndent) {
        let ch = state.input.charCodeAt(state.position);
        if (ch !== 34) {
            return false;
        }
        state.kind = "scalar";
        state.result = "";
        state.position++;
        let captureEnd, captureStart = captureEnd = state.position;
        let tmp;
        while((ch = state.input.charCodeAt(state.position)) !== 0){
            if (ch === 34) {
                captureSegment(state, captureStart, state.position, true);
                state.position++;
                return true;
            }
            if (ch === 92) {
                captureSegment(state, captureStart, state.position, true);
                ch = state.input.charCodeAt(++state.position);
                if (isEOL(ch)) {
                    skipSeparationSpace(state, false, nodeIndent);
                } else if (ch < 256 && simpleEscapeCheck[ch]) {
                    state.result += simpleEscapeMap[ch];
                    state.position++;
                } else if ((tmp = escapedHexLen(ch)) > 0) {
                    let hexLength = tmp;
                    let hexResult = 0;
                    for(; hexLength > 0; hexLength--){
                        ch = state.input.charCodeAt(++state.position);
                        if ((tmp = fromHexCode(ch)) >= 0) {
                            hexResult = (hexResult << 4) + tmp;
                        } else {
                            return throwError(state, "expected hexadecimal character");
                        }
                    }
                    state.result += charFromCodepoint(hexResult);
                    state.position++;
                } else {
                    return throwError(state, "unknown escape sequence");
                }
                captureStart = captureEnd = state.position;
            } else if (isEOL(ch)) {
                captureSegment(state, captureStart, captureEnd, true);
                writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
                captureStart = captureEnd = state.position;
            } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
                return throwError(state, "unexpected end of the document within a double quoted scalar");
            } else {
                state.position++;
                captureEnd = state.position;
            }
        }
        return throwError(state, "unexpected end of the stream within a double quoted scalar");
    }
    function readFlowCollection(state, nodeIndent) {
        let ch = state.input.charCodeAt(state.position);
        let terminator;
        let isMapping = true;
        let result = {
        };
        if (ch === 91) {
            terminator = 93;
            isMapping = false;
            result = [];
        } else if (ch === 123) {
            terminator = 125;
        } else {
            return false;
        }
        if (state.anchor !== null && typeof state.anchor != "undefined" && typeof state.anchorMap != "undefined") {
            state.anchorMap[state.anchor] = result;
        }
        ch = state.input.charCodeAt(++state.position);
        const tag2 = state.tag, anchor = state.anchor;
        let readNext = true;
        let valueNode, keyNode, keyTag = keyNode = valueNode = null, isExplicitPair, isPair = isExplicitPair = false;
        let following = 0, line1 = 0;
        const overridableKeys = {
        };
        while(ch !== 0){
            skipSeparationSpace(state, true, nodeIndent);
            ch = state.input.charCodeAt(state.position);
            if (ch === terminator) {
                state.position++;
                state.tag = tag2;
                state.anchor = anchor;
                state.kind = isMapping ? "mapping" : "sequence";
                state.result = result;
                return true;
            }
            if (!readNext) {
                return throwError(state, "missed comma between flow collection entries");
            }
            keyTag = keyNode = valueNode = null;
            isPair = isExplicitPair = false;
            if (ch === 63) {
                following = state.input.charCodeAt(state.position + 1);
                if (isWsOrEol(following)) {
                    isPair = isExplicitPair = true;
                    state.position++;
                    skipSeparationSpace(state, true, nodeIndent);
                }
            }
            line1 = state.line;
            composeNode(state, nodeIndent, 1, false, true);
            keyTag = state.tag || null;
            keyNode = state.result;
            skipSeparationSpace(state, true, nodeIndent);
            ch = state.input.charCodeAt(state.position);
            if ((isExplicitPair || state.line === line1) && ch === 58) {
                isPair = true;
                ch = state.input.charCodeAt(++state.position);
                skipSeparationSpace(state, true, nodeIndent);
                composeNode(state, nodeIndent, 1, false, true);
                valueNode = state.result;
            }
            if (isMapping) {
                storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode);
            } else if (isPair) {
                result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
            } else {
                result.push(keyNode);
            }
            skipSeparationSpace(state, true, nodeIndent);
            ch = state.input.charCodeAt(state.position);
            if (ch === 44) {
                readNext = true;
                ch = state.input.charCodeAt(++state.position);
            } else {
                readNext = false;
            }
        }
        return throwError(state, "unexpected end of the stream within a flow collection");
    }
    function readBlockScalar(state, nodeIndent) {
        let chomping = 1, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false;
        let ch = state.input.charCodeAt(state.position);
        let folding = false;
        if (ch === 124) {
            folding = false;
        } else if (ch === 62) {
            folding = true;
        } else {
            return false;
        }
        state.kind = "scalar";
        state.result = "";
        let tmp = 0;
        while(ch !== 0){
            ch = state.input.charCodeAt(++state.position);
            if (ch === 43 || ch === 45) {
                if (1 === chomping) {
                    chomping = ch === 43 ? 3 : 2;
                } else {
                    return throwError(state, "repeat of a chomping mode identifier");
                }
            } else if ((tmp = fromDecimalCode(ch)) >= 0) {
                if (tmp === 0) {
                    return throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
                } else if (!detectedIndent) {
                    textIndent = nodeIndent + tmp - 1;
                    detectedIndent = true;
                } else {
                    return throwError(state, "repeat of an indentation width identifier");
                }
            } else {
                break;
            }
        }
        if (isWhiteSpace(ch)) {
            do {
                ch = state.input.charCodeAt(++state.position);
            }while (isWhiteSpace(ch))
            if (ch === 35) {
                do {
                    ch = state.input.charCodeAt(++state.position);
                }while (!isEOL(ch) && ch !== 0)
            }
        }
        while(ch !== 0){
            readLineBreak(state);
            state.lineIndent = 0;
            ch = state.input.charCodeAt(state.position);
            while((!detectedIndent || state.lineIndent < textIndent) && ch === 32){
                state.lineIndent++;
                ch = state.input.charCodeAt(++state.position);
            }
            if (!detectedIndent && state.lineIndent > textIndent) {
                textIndent = state.lineIndent;
            }
            if (isEOL(ch)) {
                emptyLines++;
                continue;
            }
            if (state.lineIndent < textIndent) {
                if (chomping === 3) {
                    state.result += repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
                } else if (chomping === 1) {
                    if (didReadContent) {
                        state.result += "\n";
                    }
                }
                break;
            }
            if (folding) {
                if (isWhiteSpace(ch)) {
                    atMoreIndented = true;
                    state.result += repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
                } else if (atMoreIndented) {
                    atMoreIndented = false;
                    state.result += repeat("\n", emptyLines + 1);
                } else if (emptyLines === 0) {
                    if (didReadContent) {
                        state.result += " ";
                    }
                } else {
                    state.result += repeat("\n", emptyLines);
                }
            } else {
                state.result += repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
            }
            didReadContent = true;
            detectedIndent = true;
            emptyLines = 0;
            const captureStart = state.position;
            while(!isEOL(ch) && ch !== 0){
                ch = state.input.charCodeAt(++state.position);
            }
            captureSegment(state, captureStart, state.position, false);
        }
        return true;
    }
    function readBlockSequence(state, nodeIndent) {
        let line1, following, detected = false, ch;
        const tag2 = state.tag, anchor = state.anchor, result = [];
        if (state.anchor !== null && typeof state.anchor !== "undefined" && typeof state.anchorMap !== "undefined") {
            state.anchorMap[state.anchor] = result;
        }
        ch = state.input.charCodeAt(state.position);
        while(ch !== 0){
            if (ch !== 45) {
                break;
            }
            following = state.input.charCodeAt(state.position + 1);
            if (!isWsOrEol(following)) {
                break;
            }
            detected = true;
            state.position++;
            if (skipSeparationSpace(state, true, -1)) {
                if (state.lineIndent <= nodeIndent) {
                    result.push(null);
                    ch = state.input.charCodeAt(state.position);
                    continue;
                }
            }
            line1 = state.line;
            composeNode(state, nodeIndent, 3, false, true);
            result.push(state.result);
            skipSeparationSpace(state, true, -1);
            ch = state.input.charCodeAt(state.position);
            if ((state.line === line1 || state.lineIndent > nodeIndent) && ch !== 0) {
                return throwError(state, "bad indentation of a sequence entry");
            } else if (state.lineIndent < nodeIndent) {
                break;
            }
        }
        if (detected) {
            state.tag = tag2;
            state.anchor = anchor;
            state.kind = "sequence";
            state.result = result;
            return true;
        }
        return false;
    }
    function readBlockMapping(state, nodeIndent, flowIndent) {
        const tag2 = state.tag, anchor = state.anchor, result = {
        }, overridableKeys = {
        };
        let following, allowCompact = false, line1, pos, keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
        if (state.anchor !== null && typeof state.anchor !== "undefined" && typeof state.anchorMap !== "undefined") {
            state.anchorMap[state.anchor] = result;
        }
        ch = state.input.charCodeAt(state.position);
        while(ch !== 0){
            following = state.input.charCodeAt(state.position + 1);
            line1 = state.line;
            pos = state.position;
            if ((ch === 63 || ch === 58) && isWsOrEol(following)) {
                if (ch === 63) {
                    if (atExplicitKey) {
                        storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
                        keyTag = keyNode = valueNode = null;
                    }
                    detected = true;
                    atExplicitKey = true;
                    allowCompact = true;
                } else if (atExplicitKey) {
                    atExplicitKey = false;
                    allowCompact = true;
                } else {
                    return throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
                }
                state.position += 1;
                ch = following;
            } else if (composeNode(state, flowIndent, 2, false, true)) {
                if (state.line === line1) {
                    ch = state.input.charCodeAt(state.position);
                    while(isWhiteSpace(ch)){
                        ch = state.input.charCodeAt(++state.position);
                    }
                    if (ch === 58) {
                        ch = state.input.charCodeAt(++state.position);
                        if (!isWsOrEol(ch)) {
                            return throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
                        }
                        if (atExplicitKey) {
                            storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
                            keyTag = keyNode = valueNode = null;
                        }
                        detected = true;
                        atExplicitKey = false;
                        allowCompact = false;
                        keyTag = state.tag;
                        keyNode = state.result;
                    } else if (detected) {
                        return throwError(state, "can not read an implicit mapping pair; a colon is missed");
                    } else {
                        state.tag = tag2;
                        state.anchor = anchor;
                        return true;
                    }
                } else if (detected) {
                    return throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
                } else {
                    state.tag = tag2;
                    state.anchor = anchor;
                    return true;
                }
            } else {
                break;
            }
            if (state.line === line1 || state.lineIndent > nodeIndent) {
                if (composeNode(state, nodeIndent, 4, true, allowCompact)) {
                    if (atExplicitKey) {
                        keyNode = state.result;
                    } else {
                        valueNode = state.result;
                    }
                }
                if (!atExplicitKey) {
                    storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode, line1, pos);
                    keyTag = keyNode = valueNode = null;
                }
                skipSeparationSpace(state, true, -1);
                ch = state.input.charCodeAt(state.position);
            }
            if (state.lineIndent > nodeIndent && ch !== 0) {
                return throwError(state, "bad indentation of a mapping entry");
            } else if (state.lineIndent < nodeIndent) {
                break;
            }
        }
        if (atExplicitKey) {
            storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
        }
        if (detected) {
            state.tag = tag2;
            state.anchor = anchor;
            state.kind = "mapping";
            state.result = result;
        }
        return detected;
    }
    function readTagProperty(state) {
        let position1, isVerbatim = false, isNamed = false, tagHandle = "", tagName, ch;
        ch = state.input.charCodeAt(state.position);
        if (ch !== 33) return false;
        if (state.tag !== null) {
            return throwError(state, "duplication of a tag property");
        }
        ch = state.input.charCodeAt(++state.position);
        if (ch === 60) {
            isVerbatim = true;
            ch = state.input.charCodeAt(++state.position);
        } else if (ch === 33) {
            isNamed = true;
            tagHandle = "!!";
            ch = state.input.charCodeAt(++state.position);
        } else {
            tagHandle = "!";
        }
        position1 = state.position;
        if (isVerbatim) {
            do {
                ch = state.input.charCodeAt(++state.position);
            }while (ch !== 0 && ch !== 62)
            if (state.position < state.length) {
                tagName = state.input.slice(position1, state.position);
                ch = state.input.charCodeAt(++state.position);
            } else {
                return throwError(state, "unexpected end of the stream within a verbatim tag");
            }
        } else {
            while(ch !== 0 && !isWsOrEol(ch)){
                if (ch === 33) {
                    if (!isNamed) {
                        tagHandle = state.input.slice(position1 - 1, state.position + 1);
                        if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
                            return throwError(state, "named tag handle cannot contain such characters");
                        }
                        isNamed = true;
                        position1 = state.position + 1;
                    } else {
                        return throwError(state, "tag suffix cannot contain exclamation marks");
                    }
                }
                ch = state.input.charCodeAt(++state.position);
            }
            tagName = state.input.slice(position1, state.position);
            if (PATTERN_FLOW_INDICATORS.test(tagName)) {
                return throwError(state, "tag suffix cannot contain flow indicator characters");
            }
        }
        if (tagName && !PATTERN_TAG_URI.test(tagName)) {
            return throwError(state, `tag name cannot contain such characters: ${tagName}`);
        }
        if (isVerbatim) {
            state.tag = tagName;
        } else if (typeof state.tagMap !== "undefined" && _hasOwnProperty4.call(state.tagMap, tagHandle)) {
            state.tag = state.tagMap[tagHandle] + tagName;
        } else if (tagHandle === "!") {
            state.tag = `!${tagName}`;
        } else if (tagHandle === "!!") {
            state.tag = `tag:yaml.org,2002:${tagName}`;
        } else {
            return throwError(state, `undeclared tag handle "${tagHandle}"`);
        }
        return true;
    }
    function readAnchorProperty(state) {
        let ch = state.input.charCodeAt(state.position);
        if (ch !== 38) return false;
        if (state.anchor !== null) {
            return throwError(state, "duplication of an anchor property");
        }
        ch = state.input.charCodeAt(++state.position);
        const position1 = state.position;
        while(ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)){
            ch = state.input.charCodeAt(++state.position);
        }
        if (state.position === position1) {
            return throwError(state, "name of an anchor node must contain at least one character");
        }
        state.anchor = state.input.slice(position1, state.position);
        return true;
    }
    function readAlias(state) {
        let ch = state.input.charCodeAt(state.position);
        if (ch !== 42) return false;
        ch = state.input.charCodeAt(++state.position);
        const _position = state.position;
        while(ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)){
            ch = state.input.charCodeAt(++state.position);
        }
        if (state.position === _position) {
            return throwError(state, "name of an alias node must contain at least one character");
        }
        const alias = state.input.slice(_position, state.position);
        if (typeof state.anchorMap !== "undefined" && !Object.prototype.hasOwnProperty.call(state.anchorMap, alias)) {
            return throwError(state, `unidentified alias "${alias}"`);
        }
        if (typeof state.anchorMap !== "undefined") {
            state.result = state.anchorMap[alias];
        }
        skipSeparationSpace(state, true, -1);
        return true;
    }
    function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
        let allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, type1, flowIndent, blockIndent;
        if (state.listener && state.listener !== null) {
            state.listener("open", state);
        }
        state.tag = null;
        state.anchor = null;
        state.kind = null;
        state.result = null;
        const allowBlockStyles = allowBlockScalars = allowBlockCollections = 4 === nodeContext || 3 === nodeContext;
        if (allowToSeek) {
            if (skipSeparationSpace(state, true, -1)) {
                atNewLine = true;
                if (state.lineIndent > parentIndent) {
                    indentStatus = 1;
                } else if (state.lineIndent === parentIndent) {
                    indentStatus = 0;
                } else if (state.lineIndent < parentIndent) {
                    indentStatus = -1;
                }
            }
        }
        if (indentStatus === 1) {
            while(readTagProperty(state) || readAnchorProperty(state)){
                if (skipSeparationSpace(state, true, -1)) {
                    atNewLine = true;
                    allowBlockCollections = allowBlockStyles;
                    if (state.lineIndent > parentIndent) {
                        indentStatus = 1;
                    } else if (state.lineIndent === parentIndent) {
                        indentStatus = 0;
                    } else if (state.lineIndent < parentIndent) {
                        indentStatus = -1;
                    }
                } else {
                    allowBlockCollections = false;
                }
            }
        }
        if (allowBlockCollections) {
            allowBlockCollections = atNewLine || allowCompact;
        }
        if (indentStatus === 1 || 4 === nodeContext) {
            const cond = 1 === nodeContext || 2 === nodeContext;
            flowIndent = cond ? parentIndent : parentIndent + 1;
            blockIndent = state.position - state.lineStart;
            if (indentStatus === 1) {
                if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
                    hasContent = true;
                } else {
                    if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
                        hasContent = true;
                    } else if (readAlias(state)) {
                        hasContent = true;
                        if (state.tag !== null || state.anchor !== null) {
                            return throwError(state, "alias node should not have Any properties");
                        }
                    } else if (readPlainScalar(state, flowIndent, 1 === nodeContext)) {
                        hasContent = true;
                        if (state.tag === null) {
                            state.tag = "?";
                        }
                    }
                    if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                        state.anchorMap[state.anchor] = state.result;
                    }
                }
            } else if (indentStatus === 0) {
                hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
            }
        }
        if (state.tag !== null && state.tag !== "!") {
            if (state.tag === "?") {
                for(let typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex++){
                    type1 = state.implicitTypes[typeIndex];
                    if (type1.resolve(state.result)) {
                        state.result = type1.construct(state.result);
                        state.tag = type1.tag;
                        if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                            state.anchorMap[state.anchor] = state.result;
                        }
                        break;
                    }
                }
            } else if (_hasOwnProperty4.call(state.typeMap[state.kind || "fallback"], state.tag)) {
                type1 = state.typeMap[state.kind || "fallback"][state.tag];
                if (state.result !== null && type1.kind !== state.kind) {
                    return throwError(state, `unacceptable node kind for !<${state.tag}> tag; it should be "${type1.kind}", not "${state.kind}"`);
                }
                if (!type1.resolve(state.result)) {
                    return throwError(state, `cannot resolve a node with !<${state.tag}> explicit tag`);
                } else {
                    state.result = type1.construct(state.result);
                    if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                        state.anchorMap[state.anchor] = state.result;
                    }
                }
            } else {
                return throwError(state, `unknown tag !<${state.tag}>`);
            }
        }
        if (state.listener && state.listener !== null) {
            state.listener("close", state);
        }
        return state.tag !== null || state.anchor !== null || hasContent;
    }
    function readDocument(state) {
        const documentStart = state.position;
        let position1, directiveName, directiveArgs, hasDirectives = false, ch;
        state.version = null;
        state.checkLineBreaks = state.legacy;
        state.tagMap = {
        };
        state.anchorMap = {
        };
        while((ch = state.input.charCodeAt(state.position)) !== 0){
            skipSeparationSpace(state, true, -1);
            ch = state.input.charCodeAt(state.position);
            if (state.lineIndent > 0 || ch !== 37) {
                break;
            }
            hasDirectives = true;
            ch = state.input.charCodeAt(++state.position);
            position1 = state.position;
            while(ch !== 0 && !isWsOrEol(ch)){
                ch = state.input.charCodeAt(++state.position);
            }
            directiveName = state.input.slice(position1, state.position);
            directiveArgs = [];
            if (directiveName.length < 1) {
                return throwError(state, "directive name must not be less than one character in length");
            }
            while(ch !== 0){
                while(isWhiteSpace(ch)){
                    ch = state.input.charCodeAt(++state.position);
                }
                if (ch === 35) {
                    do {
                        ch = state.input.charCodeAt(++state.position);
                    }while (ch !== 0 && !isEOL(ch))
                    break;
                }
                if (isEOL(ch)) break;
                position1 = state.position;
                while(ch !== 0 && !isWsOrEol(ch)){
                    ch = state.input.charCodeAt(++state.position);
                }
                directiveArgs.push(state.input.slice(position1, state.position));
            }
            if (ch !== 0) readLineBreak(state);
            if (_hasOwnProperty4.call(directiveHandlers, directiveName)) {
                directiveHandlers[directiveName](state, directiveName, ...directiveArgs);
            } else {
                throwWarning(state, `unknown document directive "${directiveName}"`);
            }
        }
        skipSeparationSpace(state, true, -1);
        if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
            state.position += 3;
            skipSeparationSpace(state, true, -1);
        } else if (hasDirectives) {
            return throwError(state, "directives end mark is expected");
        }
        composeNode(state, state.lineIndent - 1, 4, false, true);
        skipSeparationSpace(state, true, -1);
        if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
            throwWarning(state, "non-ASCII line breaks are interpreted as content");
        }
        state.documents.push(state.result);
        if (state.position === state.lineStart && testDocumentSeparator(state)) {
            if (state.input.charCodeAt(state.position) === 46) {
                state.position += 3;
                skipSeparationSpace(state, true, -1);
            }
            return;
        }
        if (state.position < state.length - 1) {
            return throwError(state, "end of the stream or a document separator is expected");
        } else {
            return;
        }
    }
    const State2 = State;
    class LoaderState extends State {
        documents = [];
        lineIndent = 0;
        lineStart = 0;
        position = 0;
        line = 0;
        result = "";
        constructor(input, { filename , schema: schema2 , onWarning , legacy =false , json: json3 = false , listener =null  }){
            super(schema2);
            this.input = input;
            this.filename = filename;
            this.onWarning = onWarning;
            this.legacy = legacy;
            this.json = json3;
            this.listener = listener;
            this.implicitTypes = this.schema.compiledImplicit;
            this.typeMap = this.schema.compiledTypeMap;
            this.length = input.length;
        }
    }
    const LoaderState1 = LoaderState;
    const LoaderState2 = LoaderState;
    function loadDocuments(input1, options1) {
        input1 = String(input1);
        options1 = options1 || {
        };
        if (input1.length !== 0) {
            if (input1.charCodeAt(input1.length - 1) !== 10 && input1.charCodeAt(input1.length - 1) !== 13) {
                input1 += "\n";
            }
            if (input1.charCodeAt(0) === 65279) {
                input1 = input1.slice(1);
            }
        }
        const state = new LoaderState(input1, options1);
        state.input += "\0";
        while(state.input.charCodeAt(state.position) === 32){
            state.lineIndent += 1;
            state.position += 1;
        }
        while(state.position < state.length - 1){
            readDocument(state);
        }
        return state.documents;
    }
    function isCbFunction(fn) {
        return typeof fn === "function";
    }
    function loadAll(input1, iteratorOrOption, options1) {
        if (!isCbFunction(iteratorOrOption)) {
            return loadDocuments(input1, iteratorOrOption);
        }
        const documents = loadDocuments(input1, options1);
        const iterator = iteratorOrOption;
        for(let index = 0, length = documents.length; index < length; index++){
            iteratorOrOption(documents[index]);
        }
        return void 0;
    }
    function load(input1, options1) {
        const documents = loadDocuments(input1, options1);
        if (documents.length === 0) {
            return;
        }
        if (documents.length === 1) {
            return documents[0];
        }
        throw new YAMLError("expected a single document in the stream, but found more");
    }
    const load1 = load;
    const load2 = load;
    function parse1(content, options1) {
        return load(content, options1);
    }
    const loadAll1 = loadAll;
    const loadAll2 = loadAll;
    function parseAll(content, iterator, options1) {
        return loadAll(content, iterator, options1);
    }
    const parse2 = parse1;
    const parse3 = parse1;
    const parseAll1 = parseAll;
    const parseAll2 = parseAll;
    const stringify1 = stringify;
    const stringify2 = stringify;
    const CORE_SCHEMA1 = core;
    const DEFAULT_SCHEMA1 = def;
    const FAILSAFE_SCHEMA1 = failsafe;
    const JSON_SCHEMA1 = json;
    const isNothing1 = isNothing;
    const isArray1 = isArray;
    const isBoolean1 = isBoolean;
    const isNull2 = isNull1;
    const isNumber1 = isNumber;
    const isString1 = isString;
    const isSymbol1 = isSymbol;
    const isUndefined1 = isUndefined;
    const isError1 = isError;
    const isFunction1 = isFunction;
    const isRegExp1 = isRegExp;
    const toArray1 = toArray;
    const isNegativeZero1 = isNegativeZero;
    return {
        parse: parse1,
        parseAll: parseAll,
        stringify: stringify,
        CORE_SCHEMA: core,
        DEFAULT_SCHEMA: def,
        FAILSAFE_SCHEMA: failsafe,
        JSON_SCHEMA: json
    };
}();
class StoreArgumentReader1 extends Utils {
    read(bundle) {
        try {
            const entries = Array.from(bundle.components.entries());
            entries.forEach(([pathToComponent, component])=>{
                if (!component.rootNode || component.type === "store") return;
                const cr = component.rootNode.childNodes;
                const stores = cr.filter((child)=>{
                    const { tagName  } = child;
                    if (!tagName) return;
                    const isImported = component.imports[tagName];
                    const subComponent = bundle.components.get(isImported);
                    return subComponent && subComponent.type === "store";
                });
                component.hasStore = stores.length > 0;
                stores.forEach((store)=>{
                    const forbiddenElement = store.childNodes.find((c)=>c.nodeType !== 3
                    );
                    if (forbiddenElement) {
                        this.error(`elements are note allowed inside store elements ${forbiddenElement.tagName} \n\t Error in component: ${component.file}`);
                    }
                    const textnode = store.childNodes[0];
                    if (textnode) {
                        const data = mod3.parse(textnode.rawText, {
                        });
                        console.warn(data);
                    }
                });
            });
        } catch (err) {
            this.error(`StoreArgumentReader: ${err.message}`);
        }
    }
}
class RouterAnalyzer1 extends Utils {
    allowedKeys = [
        "path",
        "redirect",
        "component",
        "name",
        "children",
        "title",
        "once",
    ];
    requiredKeys = [
        "path",
        "component",
    ];
    startRecursiveRouterInspection(bundle, component, route, opts) {
        try {
            if (!route) return;
            const keys = Object.keys(route);
            const unsupported = keys.find((k)=>!this.allowedKeys.includes(k)
            );
            const missingKey = this.requiredKeys.find((k)=>!(k in route)
            );
            if (missingKey) {
                this.error(`${missingKey} is undefined in one route of component ${component.file}`);
            }
            if (unsupported) {
                this.error(`${unsupported} is not supported in this version of Ogone\n            error found in: ${component.file}`);
            }
            if (route.component) {
                const c = component.imports[route.component];
                if (c) {
                    if (!bundle.components.get(c)) {
                        this.error(`incorrect path: ${c} is not a component. error found in: ${component.file}`);
                    }
                    const newcomp = bundle.components.get(c);
                    if (newcomp) {
                        route.component = `${newcomp.uuid}-nt`;
                        route.uuid = newcomp.uuid;
                    }
                } else {
                    this.error(`${route.component} is not imported in the component.\n              please use this syntaxe to import a component: use @/... as '${route.component}'\n              error found in: ${component.file}`);
                }
            }
            if (route.path && opts.parentPath) {
                route.path = `${opts.parentPath}/${route.path}`;
                route.path = route.path.replace(/\/\//gi, "/");
            }
            if (route.children) {
                if (!Array.isArray(route.children)) {
                    this.error(`route.children should be an Array.\n              error found in: ${component.file}`);
                }
                route.children.forEach((child)=>{
                    this.startRecursiveRouterInspection(bundle, component, child, {
                        routes: opts.routes,
                        parentPath: route.path
                    });
                });
            }
            opts.routes.push(route);
        } catch (err) {
            this.error(`RouterAnalyzer: ${err.message}`);
        }
    }
    inspectRoutes(bundle, component, routes) {
        try {
            if (!Array.isArray(routes)) {
                this.error(`inspectRoutes is waiting for an array as argument 2.\n              error found in: ${component.file}`);
            }
            const opts = {
                parentPath: null,
                routes: []
            };
            routes.forEach((route)=>{
                this.startRecursiveRouterInspection(bundle, component, route, opts);
            });
            return opts.routes;
        } catch (err) {
            this.error(`RouterAnalyzer: ${err.message}`);
        }
    }
}
const registry = {
};
class ComponentTypeGetter1 extends Utils {
    RouterAnalyzer = new RouterAnalyzer1();
    async setTypeOfComponents(bundle) {
        try {
            bundle.components.forEach((component)=>{
                const proto = component.elements.proto[0];
                if (proto) {
                    component.type = proto.attributes?.type || 'component';
                    bundle.types[component.type] = true;
                }
            });
        } catch (err) {
            this.error(`ComponentTypeGetter: ${err.message}`);
        }
    }
    setApplication(bundle) {
        try {
            const rootComponent = bundle.components.get(Configuration.entrypoint);
            const entries = Array.from(bundle.components.entries()).map(([, c])=>c
            );
            if (rootComponent) {
                const { head , template: template1  } = rootComponent.elements;
                if (rootComponent.type !== "app") {
                    this.error(`${rootComponent.file}\n\troot component type should be defined as app.`);
                }
                if (head && head.getInnerHTML) {
                    Configuration.head = head.getInnerHTML();
                    if (template1) {
                        template1.childNodes.splice(template1.childNodes.indexOf(head), 1);
                    }
                }
                rootComponent.type = "component";
            }
            entries.forEach((component)=>{
                if (component.type === 'app') {
                    component.type = 'component';
                }
            });
        } catch (err) {
            this.error(`ComponentTypeGetter: ${err.message}`);
        }
    }
    assignTypeConfguration(bundle) {
        try {
            registry[bundle.uuid] = registry[bundle.uuid] || {
            };
            bundle.components.forEach((component)=>{
                const proto = component.elements.proto[0];
                const position = MapPosition.mapNodes.get(proto);
                if (proto) {
                    const { type: type1  } = component;
                    if (!Ogone1.allowedTypes.includes(type1)) {
                        this.error(`${component.file}:${position.line}:${position.column}\n\t\n              ${type1} is not supported, in this version.\n                supported types of component: ${Ogone1.allowedTypes.join(" ")}`);
                    }
                    if (type1 === "controller") {
                        const namespace = proto.attributes.namespace;
                        if (namespace && /[^\w]/gi.test(namespace)) {
                            const __char = namespace.match(/[^\w]/);
                            this.error(`${component.file}:${position.line}:${position.column}\n\tforbidden character in namespace found. please remove it.\ncharacter: ${__char}`);
                        }
                        if (namespace && namespace.length) {
                            component.namespace = namespace;
                        } else {
                            this.error(`${component.file}:${position.line}:${position.column}\n\tproto's namespace is missing in ${type1} component.\nplease set the attribute namespace, this one can't be empty.`);
                        }
                        const comp = {
                            namespace: component.namespace,
                            protocol: `(${component.context.protocolClass})`,
                            runtime: `(${component.scripts.runtime})`,
                            file: component.file
                        };
                        if (registry[bundle.uuid] && registry[bundle.uuid][comp.namespace]) {
                            this.error(`${component.file}:${position.line}:${position.column}\n\tnamespace already used`);
                        }
                        Ogone1.controllers[comp.namespace] = comp;
                        registry[bundle.uuid][comp.namespace] = true;
                    }
                    if (type1 === "router") {
                        if (!component.data.routes) {
                            const position1 = MapPosition.mapNodes.get(proto);
                            this.error(`${component.file}:${position1.line}:${position1.column}\nall router components should provide routes through a def modifier`);
                        }
                        component.routes = this.RouterAnalyzer.inspectRoutes(bundle, component, Object.values(component.data.routes));
                        component.data = {
                        };
                    }
                    if (type1 === "store") {
                        if (proto.attributes.namespace) {
                            component.namespace = proto.attributes.namespace;
                        }
                    }
                    if ([
                        "store",
                        "controller"
                    ].includes(type1)) {
                        component.rootNode.childNodes.filter((child)=>{
                            return child.tagName && child.tagName !== "proto";
                        }).map((child)=>{
                            const position1 = MapPosition.mapNodes.get(child);
                            this.error(`${component.file}:${position1.line}:${position1.column}\n\ta forbidden element found in ${type1} component.\nelement: ${child.tagName}`);
                        });
                    }
                }
            });
        } catch (err) {
            this.error(`ComponentTypeGetter: ${err.message}`);
        }
    }
}
function existsSync1(filePath) {
    try {
        Deno.lstatSync(filePath);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
class DefinitionProvider1 extends Utils {
    mapData = new Map();
    saveDataOfComponent(component, ctx) {
        try {
            const { value  } = ctx;
            const data = mod3.parse(value);
            this.mapData.set(component.uuid, {
                data
            });
        } catch (err) {
            this.error(`DefinitionProvider: ${err.message}`);
        }
    }
    async setDataToComponentFromFile(component) {
        try {
            const proto = component.elements.proto[0];
            let defData;
            const item = this.mapData.get(component.uuid);
            if (proto && "def" in proto.attributes) {
                if (component.isTyped) {
                    const position = MapPosition.mapNodes.get(proto);
                    this.error(`${component.file}:${position.line}:${position.column} \n\tcan't use def attribute with a component using declare modifier.`);
                }
                const defPath = proto.attributes.def.trim();
                const relativePath = join(component.file, defPath);
                const remoteRelativePath = absolute1(component.file, defPath);
                const isAbsoluteRemote = [
                    "http",
                    "ws",
                    "https",
                    "ftp"
                ].includes(defPath.split("://")[0]);
                if (!defPath.endsWith(".yml") && !defPath.endsWith(".yaml")) {
                    this.error(`definition files require YAML extensions.\ncomponent: ${component.file}\ninput: ${defPath}`);
                }
                if (isAbsoluteRemote) {
                    this.warn(`Def: ${defPath}`);
                    const def = await fetchRemoteRessource(defPath);
                    if (!def) {
                        this.error(`definition file ${defPath} is not reachable. \ncomponent: ${component.file}\ninput: ${defPath}`);
                    } else {
                        defData = mod3.parse(def, {
                        });
                    }
                } else if (!!component.remote) {
                    this.warn(`Def: ${remoteRelativePath}`);
                    const def = await fetchRemoteRessource(remoteRelativePath);
                    if (!def) {
                        this.error(`definition file ${remoteRelativePath} is not reachable. \ncomponent: ${component.file}\ninput: ${defPath}`);
                    } else {
                        defData = mod3.parse(def, {
                        });
                    }
                } else if (existsSync1(defPath)) {
                    this.warn(`Def: ${defPath}`);
                    if (Deno.build.os !== "windows") {
                        Deno.chmodSync(defPath, 511);
                    }
                    const def = Deno.readTextFileSync(defPath);
                    defData = mod3.parse(def, {
                    });
                } else if (!component.remote && existsSync1(relativePath)) {
                    if (Deno.build.os !== "windows") {
                        Deno.chmodSync(relativePath, 511);
                    }
                    const def = Deno.readTextFileSync(relativePath);
                    defData = mod3.parse(def, {
                    });
                } else {
                    const position = MapPosition.mapNodes.get(proto);
                    this.error(`${component.file}:${position.line}:${position.column}\n\tcan't find the definition file: ${defPath}`);
                }
            }
            if (defData) {
                const position = MapPosition.mapNodes.get(proto);
                switch(true){
                    case item && Array.isArray(defData) && !Array.isArray(item.data):
                        this.error(`${component.file}:${position.line}:${position.column}\n\t${proto.attributes.def} doesn't match def type of ${component.file}`);
                        break;
                    case item && !Array.isArray(defData) && Array.isArray(item.data):
                        this.error(`${component.file}:${position.line}:${position.column}\n\t${proto.attributes.def} doesn't match def type of ${component.file}`);
                        break;
                    case item && Array.isArray(defData) && Array.isArray(item.data):
                        if (item) {
                            component.data = [
                                ...item.data,
                                ...defData,
                            ];
                        }
                        break;
                    case item && defData:
                        if (item && defData) {
                            component.data = {
                                ...item.data,
                                ...defData
                            };
                        }
                        break;
                    default:
                        component.data = defData;
                }
            } else if (item) {
                component.data = item.data;
            }
            this.saveContextToComponent(component);
        } catch (err) {
            this.error(`DefinitionProvider: ${err.message}`);
        }
    }
    saveContextToComponent(component) {
        try {
            component.context.data = component.data instanceof Object && !Array.isArray(component.data) ? Object.keys(component.data).map((key)=>{
                return `const ${key} = this.${key};`;
            }).join('\n') : '';
        } catch (err) {
            this.error(`DefinitionProvider: ${err.message}`);
        }
    }
    transformInheritedProperties(component) {
        try {
            this.trace('Inherit statements on def modifier.');
            const keys = Object.keys(component.data);
            const inheritRegExp = /^(inherit\s+)([^\s]+)+$/;
            keys.filter((key)=>{
                return inheritRegExp.test(key);
            }).forEach((key)=>{
                const property = key.replace(inheritRegExp, '$2');
                component.data[property] = component.data[key];
                component.requirements = component.requirements || [];
                component.requirements.push([
                    property,
                    'unknown'
                ]);
                this.trace(`${property} inherited. transformation of ${key}`);
                delete component.data[key];
            });
            this.trace('Inherit statements on def modifier done.');
        } catch (err) {
            this.error(`DefinitionProvider: ${err.message}`);
        }
    }
}
const __default12 = ()=>({
        blocks: {
        },
        parentheses: {
        },
        setters: {
        },
        imports: {
        },
        exports: {
        },
        require: [],
        use: {
        },
        properties: [],
        data: {
        },
        switch: {
            before: {
                each: null,
                cases: {
                }
            },
            cases: [],
            default: false
        },
        reflections: [],
        protocol: ""
    })
;
let i = 0;
const __default13 = function* gen() {
    while(true){
        yield i++;
    }
}();
const nullish = [
    {
        open: false,
        reg: /(?<!\\)\$\{(.*?)(?<!\\)\}/i,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `§§template${__default13.next().value}§§`;
            if (expressions) expressions[id] = value;
            return id;
        },
        close: false
    },
    {
        open: false,
        reg: /(?<!\\)(["'`])(.*?)(?<!\\)\1/i,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `${__default13.next().value}_string`;
            if (expressions) expressions[id] = value;
            return id;
        },
        close: false
    },
    {
        name: 'comment',
        split: [
            "/*",
            "*/"
        ],
        splittedId: (value, expressions)=>{
            const id = `§§comment0§§`;
            if (expressions) expressions[id] = value;
            return "";
        }
    },
    {
        name: 'comment',
        open: "//",
        reg: /(?<!\:)\/\/([^\n])+\n/,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `§§commentLine${__default13.next().value}§§`;
            if (expressions) expressions[id] = value;
            return "";
        },
        close: "/"
    },
    {
        open: false,
        reg: /(:?\s)(\/)(.+?)(?<!\\)(\/)(\w+){0,1}/i,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `§§regexp${__default13.next().value}§§`;
            if (expressions) expressions[id] = value;
            return id;
        },
        close: false
    },
];
const tokens = [
    {
        name: "block",
        open: "[",
        reg: /\[([^\[\]])+\]/,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `${__default13.next().value}_array`;
            if (expressions) expressions[id] = value;
            return id;
        },
        close: "]"
    },
    {
        name: "parentheses",
        open: "(",
        reg: /\(([^\(\)])*\)/,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `${__default13.next().value}_parenthese`;
            if (expressions) expressions[id] = value;
            if (typedExpressions && typedExpressions.parentheses) typedExpressions.parentheses[id] = value;
            return id;
        },
        close: ")"
    },
    {
        name: "block",
        open: "{",
        reg: /\{([^\{\}])*\}/,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `${__default13.next().value}_block`;
            if (expressions) expressions[id] = value;
            if (typedExpressions && typedExpressions.blocks) typedExpressions.blocks[id] = value;
            return id;
        },
        close: "}"
    },
];
function translateReflection({ body , identifier , isBlock  }) {
    const cases = [];
    const getPropertyRegExpGI = /(this\.)([\w\.]*)+/gi;
    const getPropertyRegExp = /(this\.)([\w\.]*)+/;
    const a = body.match(getPropertyRegExpGI);
    const b = identifier.match(getPropertyRegExpGI);
    const array = [
        ...a ? a : [],
        ...b ? b : []
    ];
    const n = identifier.replace(/^(\.)/, '').replace(/^(.*?)(\[)(.*?)(\])(.*?)$/, "$1");
    if (array.length) {
        array.forEach((thisExpression)=>{
            const m = thisExpression.match(getPropertyRegExp);
            if (m) {
                const [input, keywordThis, property] = m;
                const key = `'update:${property.replace(/^(\.)/, "")}'`;
                if (!cases.includes(key)) {
                    cases.push(key);
                }
            }
        });
        return (isBlock ? `\n        if ([${cases}].includes(_state as any) || _state === 0) {\n          this${identifier} = (() => ${body})();____("${n}", this);\n        }` : `if ([${cases}].includes(_state as any) || _state === 0) {\n          this${identifier} = ${body};____("${n}", this);\n        }`).trim();
    } else {
        return `\n      if (_state === 0) {\n        this${identifier} = (() => ${body})();____("${n}", this);\n      }`;
    }
}
const items = [
    {
        name: "reflection",
        open: false,
        reg: /(this)\s*(.+?)\s*(=>)\s*(\d+_block)/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches || !typedExpressions) {
                throw new Error("typedExpressions or expressions or matches are missing");
            }
            const id = `<${__default13.next().value}reflection>`;
            const [input, keywordThis, identifier, arrow, fnbody] = matches;
            let translate = fnbody;
            let translateIdentifier = identifier;
            function template1() {
                translate = getDeepTranslation1(translate, expressions);
                translateIdentifier = getDeepTranslation1(translateIdentifier, expressions);
            }
            template1();
            translate = translateReflection({
                body: translate,
                identifier: translateIdentifier,
                isBlock: true
            });
            template1();
            typedExpressions.reflections.push(translate);
            return "";
        },
        close: false
    },
    {
        name: "reflection",
        open: false,
        reg: /(this)\s*(.+?)\s*(=>)(.*?)(?:§{2}endExpression\d+§{2}|;|\n+)/i,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches || !typedExpressions) {
                throw new Error("typedExpressions or expressions or matches are missing");
            }
            const id = `<${__default13.next().value}reflection>`;
            const [input, keywordThis, identifier, arrow, fnbody] = matches;
            if (expressions) expressions[id] = value;
            if (fnbody) {
                let translate = fnbody.replace(/;/gi, "");
                let translateIdentifier = identifier;
                function template1() {
                    translate = getDeepTranslation1(translate, expressions);
                    translateIdentifier = getDeepTranslation1(translateIdentifier, expressions);
                }
                template1();
                translate = translateReflection({
                    body: translate,
                    identifier: translateIdentifier
                });
                template1();
                typedExpressions.reflections.push(translate);
            }
            return "";
        },
        close: false
    },
    {
        name: "reflection",
        open: false,
        reg: /(this)\s*(.+?)\s*(=>)\s*([^\s]+)+/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const UpsupportedReflectionSyntax = new Error(`[Ogone] Unsupported syntax of reflection.\n${value}\nnot supported in this version of Ogone\n      `);
            return "";
        },
        close: false
    },
];
class ProtocolBodyConstructor1 extends Utils {
    setBeforeEachContext(component, ctx) {
        try {
            if (ctx.token === 'before-each') {
                component.modifiers.beforeEach = ctx.value;
            }
        } catch (err) {
            this.error(`ProtocolBodyConstructor: ${err.message}`);
        }
    }
    setComputeContext(component, ctx) {
        try {
            if (ctx.token === 'compute') {
                const expressions = {
                };
                const typedExpressions = __default12();
                __default1({
                    array: nullish.concat(tokens).concat(items),
                    value: ctx.value,
                    typedExpressions,
                    expressions
                });
                component.modifiers.compute = typedExpressions.reflections.join('\n');
            }
        } catch (err) {
            this.error(`ProtocolBodyConstructor: ${err.message}`);
        }
    }
    setCaseContext(component, ctx) {
        try {
            if (ctx.token === 'case') {
                component.modifiers.cases.push(ctx);
            }
        } catch (err) {
            this.error(`ProtocolBodyConstructor: ${err.message}`);
        }
    }
}
const computed = [
    {
        open: false,
        reg: /\n+\s*(\&|\+|\<|\>|\||\=|\?|\:|\.)+/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!matches) return '';
            const [, sign] = matches;
            const id = `${__default13.next().value}_sign ${sign} `;
            if (expressions) expressions[id] = value;
            return `${sign}`;
        },
        close: false
    },
    {
        open: false,
        reg: /(\&|\+|(?!\d+_\w+)|(?<!\d+_\w+)|\||\=|\?|\:|\.)+\s*\n+/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!matches) return '';
            const [, sign] = matches;
            const id = `${__default13.next().value}_sign ${sign} `;
            if (expressions) expressions[id] = value;
            return id;
        },
        close: false
    },
];
class ProtocolReactivity1 extends Utils {
    expressions = {
    };
    getReactivity({ text , reactWith ='___'  }) {
        try {
            let result = '';
            this.reactWith = reactWith;
            this.typedExpressions = __default12();
            this.expressions = {
            };
            result = __default1({
                typedExpressions: this.typedExpressions,
                expressions: this.expressions,
                value: text,
                array: nullish.concat(tokens)
            });
            result = this.renderInvalidations(result);
            Object.entries(this.typedExpressions.blocks).forEach(([key, value])=>{
                if (this.typedExpressions) {
                    const result2 = this.renderInvalidations(value);
                    this.typedExpressions.blocks[key] = result2;
                    this.expressions[key] = result2;
                }
            });
            Object.entries(this.typedExpressions.parentheses).forEach(([key, value])=>{
                if (this.typedExpressions) {
                    const result2 = this.renderInvalidations(value);
                    this.typedExpressions.parentheses[key] = result2;
                    this.expressions[key] = result2;
                }
            });
            return getDeepTranslation1(result, this.expressions);
        } catch (err) {
            this.error(`ProtoolReactivity: ${err.message}`);
        }
    }
    renderInvalidations(text) {
        try {
            let result = __default1({
                value: text,
                array: computed,
                typedExpressions: this.typedExpressions,
                expressions: this.expressions
            });
            const invalidatationRegExp = /(this\.)(.+?\b)(.*?)(\s*=\s*)(?!\>|\<)(.+?)(\n|;|\)$|$)/gi;
            const invalidatationShortOperationRegExp = /(this\.)(.+?\b)(.*?)([\+\-\*]+)(\n|;|\)$|$)/gi;
            const arrayModifier = /(this\.)(.+?\b)((.*?)\.\s*(?:push|splice|pop|reverse|fill|copyWithin|shift|unshift|sort|set)(?:\d+_parenthese))+/gi;
            result = result.replace(invalidatationRegExp, `${this.reactWith || '___'}("$2", this,\n$1$2$3$4$5\n)$6`);
            result = result.replace(invalidatationShortOperationRegExp, `${this.reactWith || '___'}("$2", this,\n$1$2$3$4\n)$5`);
            result = result.replace(arrayModifier, `${this.reactWith || '___'}("$2", this, $&)`);
            return result;
        } catch (err) {
            this.error(`ProtoolReactivity: ${err.message}`);
        }
    }
}
var Protocol;
(function(Protocol1) {
    Protocol1["PROTOCOL_TEMPLATE"] = `\n    class Protocol {\n      {% data %}\n    }\n  `;
    Protocol1["BUILD"] = `\n    {% modules %}\n    {% namespaces %}\n    {% protocol %}\n\n    type OgoneCOMPONENTComponent<T> = { children?: any; } & T;\n    type OgoneASYNCComponent<T> = OgoneCOMPONENTComponent<T>;\n    type OgoneSTOREComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;\n    type OgoneROUTERComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;\n    type OgoneCONTROLLERComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;\n\n    declare function h(...args: unknown[]): unknown;\n    declare function hf(...args: unknown[]): unknown;\n    declare namespace h.JSX {\n      export interface IntrinsicElements {\n        [k: string]: any;\n      }\n    }\n    {% allUsedComponents %}\n    class Component extends Protocol {\n      render() {\n        return {% tsx.length ? \`(\${tsx})\` : '' %};\n      }\n      {% runtime %}\n    }\n  `;
    Protocol1["USED_COMPONENT_TEMPLATE"] = `\n    declare function {% tagName %} (props: {% genericType %}<{\n      {% propsTypes || '' %}\n    }>): h.JSX.IntrinsicElements;`;
})(Protocol || (Protocol = {
}));
const members = [
    {
        reg: /\bOgone\b/,
        start: "\ndeclare namespace Ogone {",
        children: [
            {
                reg: /\bOgone.error\b/,
                value: `    export function error(\n          title: string,\n          description: string,\n          error: Error | TypeError | SyntaxError | { message: string },\n        ): void;`
            },
            {
                reg: /\bOgone.stores\b/,
                value: "export const stores: { [k: string]: { [k: string]: any } };"
            },
            {
                reg: /\bOgone.clients\b/,
                value: `export const clients: [\n          string,\n          (namespace: string, dependency: string, overwrite?: boolean) => any,\n        ][];`
            },
            {
                reg: /\bOgone.render\b/,
                value: `export const render: { [k: string]: Function };`
            },
            {
                reg: /\bOgone.contexts\b/,
                value: `export const contexts: { [k: string]: Function };`
            },
            {
                reg: /\bOgone.components\b/,
                value: `export const components: { [k: string]: Function };`
            },
            {
                reg: /\bOgone.classes\b/,
                value: `export const classes: { [k: string]: any };`
            },
            {
                reg: /\bOgone.errorPanel\b/,
                value: `export const errorPanel: any;`
            },
            {
                reg: /\bOgone.warnPanel\b/,
                value: `export const warnPanel: any;`
            },
            {
                reg: /\bOgone.successPanel\b/,
                value: `export const successPanel: any;`
            },
            {
                reg: /\bOgone.infosPanel\b/,
                value: `export const infosPanel: any;`
            },
            {
                reg: /\bOgone.historyError\b/,
                value: `export const historyError: any;`
            },
            {
                reg: /\bOgone.errors\b/,
                value: `export const errors: number;`
            },
            {
                reg: /\bOgone.firstErrorPerf\b/,
                value: `export const firstErrorPerf: any;`
            },
            {
                reg: /\bOgone.router\b/,
                value: `export const router: RouterBrowser;`
            },
            {
                reg: /\bOgone.DevTool\b/,
                value: `export const DevTool: any | undefined;`
            },
            {
                reg: /\bOgone.ComponentCollectionManager\b/,
                value: `export const ComponentCollectionManager: any | undefined;`
            },
        ],
        end: "}"
    },
    {
        reg: /\bOComponent\b/,
        value: "\ndeclare function OComponent(): any;"
    },
    {
        reg: /\bRouterBrowser|Ogone.router\b/,
        start: "\ndeclare interface RouterBrowser {",
        children: [
            {
                reg: /\b(Ogone.router.react)\b/,
                value: "react: Function[];"
            },
            {
                reg: /\b(Ogone.router.actualRoute)\b/,
                value: "actualRoute: null | string;"
            },
            {
                reg: /\b(Ogone.router.go)\b/,
                value: "go: (url: string, state?: any) => void;"
            },
            {
                reg: /\b(Ogone.router.openDevTool)\b/,
                value: "openDevTool: (opts: any) => void;"
            },
        ],
        end: "}"
    },
    {
        reg: /\bAsync\b/,
        start: "\ndeclare namespace Async {",
        children: [
            {
                reg: /\bAsync.resolve\b/,
                value: "export function resolve(): void;"
            },
        ],
        end: "}"
    },
    {
        reg: /\bStore\b/,
        start: "\ndeclare abstract class Store {",
        children: [
            {
                reg: /\bdispatch\b/,
                value: "public static dispatch(ns: string, ctx?: any): any"
            },
            {
                reg: /\bcommit\b/,
                value: "public static commit(ns: string, ctx?: any): any;"
            },
            {
                reg: /\bget\b/,
                value: "public static get(ns: string): any;"
            },
        ],
        end: "}"
    },
    {
        reg: /\bControllers\b/,
        value: `\n    declare const Controllers: { [k: string]: Controller; };\n    declare interface Controller {\n      get(rte: string): Promise<any>;\n      post(rte: string, data: { [k: string]: any }, op: { [k: string]: any }): Promise<any>;\n      put(rte: string, data: { [k: string]: any }, op: { [k: string]: any }): Promise<any>;\n      patch(rte: string, data: { [k: string]: any }, op: { [k: string]: any }): Promise<any>;\n      delete(rte: string, data: { [k: string]: any }, op: { [k: string]: any }): Promise<any>;\n    };\n    `
    },
    {
        reg: /\bRefs\b/,
        value: `\n    declare const Refs: {\n      [k: string]: HTMLElement;\n    };`
    },
    {
        reg: /\b_state\b/,
        value: `\ndeclare type _state = string | number;`
    },
    {
        reg: /\bctx\b/,
        value: `\ndeclare type ctx = {[k: string]: any};`
    },
    {
        reg: /\bevent\b/,
        value: `\ndeclare type event = Event;`
    },
    {
        reg: /\b_once\b/,
        value: `\ndeclare type _once = number;`
    },
    {
        reg: /\b___\b/,
        value: "\ndeclare function ___(key: string, ctx: { [k: string]: any }, value?: any): void;"
    },
];
const __default14 = (text)=>{
    let result = "";
    function recursive(items1) {
        items1.forEach((rule)=>{
            if (!rule.reg.test(text)) return;
            if (rule.value) result += rule.value;
            if (rule.start) result += rule.start;
            if (rule.children) recursive(rule.children);
            if (rule.end) result += rule.end;
        });
    }
    recursive(members);
    return result;
};
var Context;
(function(Context1) {
    Context1["CASE_GATE"] = `\n    // @ts-ignore\n  if (typeof _state === "string" && ![{% declaredCases %}].includes(_state)) {\n    return;\n  }`;
    Context1["TEMPLATE_COMPONENT_RUNTIME"] = `({% async %} function ({% protocolAmbientType %} _state: _state, ctx: ctx, event: event, _once: number = 0) {\n    try {\n      {% body %}\n    } catch(err) {\n      // @ts-ignore\n      Ogone.displayError('Error in the component: \\n\\t {% file %}' ,err.message, err);\n      throw err;\n    }\n  });`;
    Context1["TEMPLATE_COMPONENT_RUNTIME_BODY"] = `\n    {% beforeEach %}\n    {% reflections %}\n    {% caseGate %}\n    switch(_state) { {% switchBody %} }`;
    Context1["TEMPLATE_COMPONENT_RUNTIME_PROTOCOL"] = `{% async %} runtime (_state: string | number, ctx: any, event: any, _once: number = 0) {\n    try {\n      {% body %}\n    } catch(err) {\n      // @ts-ignore\n      Ogone.displayError('Error in the component: \\n\\t {% file %}' ,err.message, err);\n      throw err;\n    }\n  }`;
    Context1["TEMPLATE_COMPONENT_RUNTIME_PROTOCOL_AS_FUNCTION"] = `{% async %} function runtime (_state: string | number, ctx: any, event: any, _once: number = 0) {\n    try {\n      {% body %}\n    } catch(err) {\n      // @ts-ignore\n      Ogone.displayError('Error in the component: \\n\\t {% file %}' ,err.message, err);\n      throw err;\n    }\n  }`;
})(Context || (Context = {
}));
var ComponentEngine;
(function(ComponentEngine1) {
    ComponentEngine1["TemplateSyncWithWebcomponent"] = 'sync-template';
    ComponentEngine1["ComponentProxyReaction"] = 'proxy-reaction';
    ComponentEngine1["ComponentInlineReaction"] = 'inline-reaction';
    ComponentEngine1["NoStrictTagName"] = 'no-strict-tagname';
})(ComponentEngine || (ComponentEngine = {
}));
class ProtocolClassConstructor1 extends ProtocolReactivity1 {
    mapProtocols = new Map();
    ProtocolReactivity = new ProtocolReactivity1();
    setItem(component) {
        try {
            this.mapProtocols.set(component.uuid, {
                value: '',
                props: '',
                types: [],
                importedComponentsTypes: []
            });
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}`);
        }
    }
    static getInterfaceProps(component) {
        try {
            return component.requirements ? component.requirements.map(([name, type1])=>`\n${name}: ${type1};`
            ).join('') : '';
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}`);
        }
    }
    static getPropsFromNode(node) {
        try {
            return Object.entries(node.attributes).filter(([key])=>key.startsWith(":")
            ).map(([key, value])=>`\n${key.slice(1)}: ${value === '=""' ? null : value}`
            ).join("\n,");
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}`);
        }
    }
    saveProtocol(component, ctx) {
        try {
            if (ctx.token === 'declare') {
                const item = this.mapProtocols.get(component.uuid);
                if (item) {
                    item.value = this.template(Protocol.PROTOCOL_TEMPLATE.trim(), {
                        data: ctx.value.trim()
                    });
                }
            }
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}`);
        }
    }
    recursiveInspectionOfNodes(bundle, component, opts) {
        try {
            const { importedComponent , tagName , n ,  } = opts;
            const item = this.mapProtocols.get(component.uuid);
            const { requirements  } = importedComponent;
            let propsTypes = "";
            if (n.tagName === tagName) {
                if (requirements && requirements.length) {
                    propsTypes = this.template(`{% props %}`, {
                        props: ProtocolClassConstructor1.getInterfaceProps(importedComponent)
                    });
                }
                const ctx = bundle.mapContexts.get(`${component.uuid}-${n.id}`);
                if (ctx) {
                    let result = this.template(Protocol.USED_COMPONENT_TEMPLATE, {
                        tagName,
                        tagNameFormatted: tagName.replace(/(\-)([a-z])/gi, "_$2"),
                        propsTypes,
                        genericType: `Ogone${importedComponent.type.toUpperCase()}Component`,
                        position: ctx.position,
                        data: ctx.data,
                        modules: ctx.modules,
                        value: ctx.value,
                        props: ProtocolClassConstructor1.getPropsFromNode(n)
                    });
                    if (item) {
                        item.importedComponentsTypes.push(result);
                    }
                }
            }
            if (n.childNodes) {
                for (let nc of n.childNodes){
                    this.recursiveInspectionOfNodes(bundle, component, {
                        importedComponent,
                        tagName,
                        n: nc
                    });
                }
            }
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}`);
        }
    }
    getAllUsedComponents(bundle, component) {
        try {
            for (let [tagName, imp] of Object.entries(component.imports)){
                const subc = bundle.components.get(imp);
                if (subc) {
                    this.recursiveInspectionOfNodes(bundle, component, {
                        tagName,
                        importedComponent: subc,
                        n: component.rootNode
                    });
                }
            }
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}`);
        }
    }
    buildProtocol(component) {
        try {
            const item = this.mapProtocols.get(component.uuid);
            if (item) {
                Object.defineProperty(component.context, 'protocol', {
                    get: ()=>{
                        const runtime = this.getComponentRuntime(component);
                        const namespaces = __default14(runtime);
                        return this.template(Protocol.BUILD, {
                            runtime,
                            namespaces,
                            modules: component.esmExpressions,
                            protocol: item.value.length ? item.value : `class Protocol {\n              ${component.data ? Object.entries(component.data).map(([key, value])=>`\n${key} = (${JSON.stringify(value)});\n`
                            ) : ''}\n            }`,
                            allUsedComponents: item.importedComponentsTypes.join('\n'),
                            tsx: this.getComponentTSX(component)
                        });
                    }
                });
                Object.defineProperty(component.context, 'protocolClass', {
                    get: ()=>item.value
                });
            }
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}`);
        }
    }
    getComponentTSX(component) {
        try {
            let result = '';
            const { template: template1  } = component.elements;
            if (template1 && template1.getOuterTSX) {
                result = template1.getOuterTSX(component);
            }
            return result;
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}`);
        }
    }
    getComponentRuntime(component) {
        try {
            let casesValue = component.modifiers.cases.map((modifier)=>`${modifier.token} ${modifier.argument}: ${modifier.value}`
            ).join('\n');
            let script = this.template(Context.TEMPLATE_COMPONENT_RUNTIME_PROTOCOL, {
                body: Context.TEMPLATE_COMPONENT_RUNTIME_BODY,
                switchBody: `\n${casesValue}\ndefault:\n${component.modifiers.default}`,
                file: component.file,
                caseGate: component.modifiers.cases.length || component.modifiers.default.length ? this.template(Context.CASE_GATE, {
                    declaredCases: component.modifiers.cases.map((modifier)=>modifier.argument
                    ).join(',')
                }) : '',
                reflections: component.modifiers.compute,
                beforeEach: component.modifiers.beforeEach,
                async: [
                    "async",
                    "store",
                    "controller"
                ].includes(component.type) ? "async" : ""
            });
            return script;
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}`);
        }
    }
    async setComponentRuntime(component) {
        try {
            let casesValue = component.modifiers.cases.map((modifier)=>`${modifier.token} ${modifier.argument}: ${modifier.value}`
            ).join('\n');
            let script = this.template(Context.TEMPLATE_COMPONENT_RUNTIME_PROTOCOL_AS_FUNCTION, {
                body: Context.TEMPLATE_COMPONENT_RUNTIME_BODY,
                switchBody: `\n${casesValue}\ndefault:\n${component.modifiers.default}`,
                file: component.file,
                caseGate: component.modifiers.cases.length || component.modifiers.default.length ? this.template(Context.CASE_GATE, {
                    declaredCases: component.modifiers.cases.map((modifier)=>modifier.argument
                    ).join(',')
                }) : '',
                reflections: component.modifiers.compute,
                beforeEach: component.modifiers.beforeEach,
                async: [
                    "async",
                    "store",
                    "controller"
                ].includes(component.type) ? "async" : ""
            });
            const runtime = (await Deno.emit("/transpiled.ts", {
                sources: {
                    "/transpiled.ts": script
                },
                compilerOptions: {
                    sourceMap: false
                }
            })).files["/transpiled.ts"];
            component.scripts.runtime = component.isTyped && !component.context.engine.includes(ComponentEngine.ComponentInlineReaction) || !component.isTyped && component.context.engine.includes(ComponentEngine.ComponentProxyReaction) ? runtime : this.getReactivity({
                text: runtime
            });
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}`);
        }
    }
}
class ProtocolModifierGetter1 extends Utils {
    ProtocolReactivity = new ProtocolReactivity1();
    expressions = {
    };
    registerModifierProviders(text, { modifiers , onError  }) {
        try {
            this.typedExpressions = __default12();
            this.expressions = {
            };
            this.modifiers = modifiers;
            this.onError = onError;
            const allTokens = this.getUncatchableModifiers();
            const globalRegExp = new RegExp(`(${allTokens.join('|')})`, 'gi');
            const transformedText = __default1({
                typedExpressions: this.typedExpressions,
                expressions: this.expressions,
                value: text,
                array: nullish.concat(tokens, [
                    {
                        open: false,
                        reg: /\n\s*\n/,
                        id: (value, matches)=>'\n'
                        ,
                        close: false
                    }
                ])
            });
            const contents = transformedText.split(globalRegExp).filter((s)=>s && s.length
            );
            const result = this.getModifierContents(contents);
            this.hasBadArgument(result);
            this.hasDuplicateModifierImplementation(transformedText, result);
            this.triggerParsedModifiers(result, modifiers);
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}`);
        }
    }
    triggerExclusion(modifier, savedModifiers) {
        try {
            const keys = Object.keys(savedModifiers);
            if (modifier.exclude) {
                modifier.exclude.forEach((token2)=>{
                    const reg = new RegExp(`${token2}\\b`, 'i');
                    const modifierRegExp = new RegExp(modifier.token, 'i');
                    const excludedModifier = keys.find((token3)=>reg.test(token3)
                    );
                    const hasModifier = keys.find((token3)=>modifierRegExp.test(token3)
                    );
                    if (excludedModifier && this.onError && hasModifier) {
                        const token3 = excludedModifier.trim().split(' ')[0].replace(/\:$/, '');
                        this.onError(new Error(`can't use ${modifier.token} and ${token3} inside the same component.`));
                    }
                });
            }
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}`);
        }
    }
    triggerParsedModifiers(savedModifiers, modifiers) {
        try {
            modifiers.forEach((modifier)=>{
                if (modifier.onParse && typeof modifier.onParse === 'function') {
                    const entries = Object.entries(savedModifiers);
                    entries.reverse().forEach(([key, values])=>{
                        const token = key.trim().split(' ')[0].replace(/\:$/, '');
                        const value = values.reverse().join('');
                        if (modifier.token === token) {
                            this.triggerExclusion(modifier, savedModifiers);
                            const newValue = getDeepTranslation1(value, this.expressions);
                            modifier.onParse({
                                argument: getDeepTranslation1(key.trim().split(' ')[1], this.expressions).replace(/\:$/, ''),
                                token,
                                value: newValue,
                                endsWithBreak: !!value.trim().match(/\bbreak[\n\s]*;{0,1}$/)
                            });
                        }
                    });
                }
            });
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}`);
        }
    }
    cleanContents(contents) {
        try {
            contents.forEach((content, i1, arr)=>{
                if (content.startsWith('\n')) return true;
                else if (arr[i1 - 1]) {
                    arr[i1 - 1] = `${arr[i1 - 1]}${content}`;
                    delete arr[i1];
                }
            });
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}`);
        }
    }
    hasBadArgument(savedModifiers) {
        try {
            if (this.modifiers) {
                this.modifiers.map((modifierProvider)=>{
                    if (modifierProvider.argumentType && modifierProvider.argumentType === 'string') {
                        const regExp = new RegExp(`(?:(?:\\s*)${modifierProvider.token}\\s+(\\<string\\d+\\>)\\s*\\:)`, 'i');
                        const entries = Object.entries(savedModifiers);
                        entries.forEach(([key, value])=>{
                            const match = regExp.test(key.trim());
                            if (key.startsWith(`${modifierProvider.token} `) && !match && this.onError) {
                                this.onError(new Error(`modifier ${modifierProvider.token} is only waiting for a ${modifierProvider.argumentType} as argument. concatenations are not supported, please use template litteral`));
                            }
                        });
                    }
                });
            }
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}`);
        }
    }
    hasDuplicateModifierImplementation(text, savedModifiers) {
        try {
            if (!this.onError) return;
            const allTokens = this.getCatchableModifiers();
            const globalRegExp = new RegExp(`(${allTokens.join('|')})`, 'gi');
            const match = text.match(globalRegExp);
            const store = [];
            match?.forEach((m)=>{
                if (this.modifiers) {
                    const token = m.trim();
                    const name = token.split(/(?:\s|\:$)/)[0];
                    const modifierProvider = this.modifiers.find((modifier)=>modifier.token === name && modifier.unique
                    );
                    if (store.includes(m) && savedModifiers[m] && this.onError && modifierProvider) {
                        this.onError(new Error(`[Protocol] - Duplicate modifier implementation: ${modifierProvider.token}`));
                    } else {
                        store.push(m);
                    }
                }
            });
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}`);
        }
    }
    getUncatchableModifiers() {
        try {
            if (!this.modifiers) return [];
            return this.modifiers.map((modifierProvider)=>{
                if (modifierProvider.argumentType && modifierProvider.argumentType === 'string') return `(?:(?:\\s*)${modifierProvider.token}\\s*(?:.+?)\\s*\\:)`;
                return `(?:\\s*)${modifierProvider.token}\\s*\\:`;
            });
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}`);
        }
    }
    getCatchableModifiers() {
        try {
            if (!this.modifiers) return [];
            return this.modifiers.map((modifierProvider)=>{
                if (modifierProvider.argumentType && modifierProvider.argumentType === 'string') return `\\n((?:\\s*)${modifierProvider.token}\\s*(.+?)\\s*\\:)`;
                return `\\n(\\s*)${modifierProvider.token}\\s*\\:`;
            });
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}`);
        }
    }
    getModifierContents(contents) {
        try {
            if (!this.modifiers) return {
            };
            this.cleanContents(contents);
            const tokens1 = this.getCatchableModifiers();
            const indentRegExp = /\n\s*/;
            const result = {
            };
            const reversedContents = contents.slice().reverse();
            reversedContents.forEach((content, i1, arr)=>{
                const match = content.match(indentRegExp);
                const matchingToken = tokens1.find((token)=>new RegExp(token, 'g').exec(content)
                );
                if (match) {
                    const [indent] = match;
                    if (!indent || !content.length) return;
                    const parent = reversedContents.find((content2, id)=>{
                        const m = content2?.match(indentRegExp);
                        if (m) {
                            const matchingTokenForCandidate = tokens1.find((token)=>new RegExp(token, 'g').exec(content2)
                            );
                            const [indent2] = m;
                            return indent2 && indent2.length < indent.length && id > i1 && matchingTokenForCandidate || matchingTokenForCandidate && !matchingToken && id > i1;
                        }
                    });
                    if (parent) {
                        const name = parent;
                        result[parent] = result[parent] || [];
                        result[parent].push(content);
                    }
                    if (!parent && matchingToken) {
                        const match1 = new RegExp(matchingToken).exec(content);
                        if (match1) {
                            const [input] = match1;
                            const value = content.replace(input, '');
                            if (value.length) {
                                const name = input;
                                result[input] = result[input] || [];
                                result[input].push(value);
                            }
                        }
                    }
                }
            });
            return result;
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}`);
        }
    }
}
class ProtocolDataProvider1 extends Utils {
    DefinitionProvider = new DefinitionProvider1();
    ProtocolBodyConstructor = new ProtocolBodyConstructor1();
    ProtocolClassConstructor = new ProtocolClassConstructor1();
    ProtocolModifierGetter = new ProtocolModifierGetter1();
    ProtocolReactivity = new ProtocolReactivity1();
    async read(bundle) {
        try {
            const entries = Array.from(bundle.components.entries());
            entries.forEach(([, component])=>{
                const proto = component.elements.proto[0];
                if (!proto || !proto.getInnerHTML) return;
                const position = MapPosition.mapNodes.get(proto);
                const protocol = proto.getInnerHTML();
                this.ProtocolClassConstructor.setItem(component);
                this.ProtocolModifierGetter.registerModifierProviders(protocol, {
                    modifiers: [
                        {
                            token: 'def',
                            unique: true,
                            indentStyle: true,
                            exclude: [
                                'declare'
                            ],
                            onParse: (ctx)=>{
                                this.DefinitionProvider.saveDataOfComponent(component, ctx);
                            }
                        },
                        {
                            token: 'declare',
                            unique: true,
                            indentStyle: true,
                            exclude: [
                                'def'
                            ],
                            isReactive: component.type !== "controller",
                            onParse: (ctx)=>{
                                this.transformInheritedPropertiesInContext(component, ctx);
                                component.isTyped = true;
                                this.ProtocolClassConstructor.saveProtocol(component, ctx);
                            }
                        },
                        {
                            token: 'default',
                            unique: true,
                            isReactive: component.type !== "controller",
                            onParse: (ctx)=>{
                                component.modifiers.default = ctx.value;
                            }
                        },
                        {
                            token: 'before-each',
                            unique: true,
                            isReactive: component.type !== "controller",
                            onParse: (ctx)=>{
                                this.ProtocolBodyConstructor.setBeforeEachContext(component, ctx);
                            }
                        },
                        {
                            token: 'compute',
                            unique: true,
                            isReactive: component.type !== "controller",
                            onParse: (ctx)=>{
                                this.ProtocolBodyConstructor.setComputeContext(component, ctx);
                            }
                        },
                        {
                            token: 'case',
                            argumentType: 'string',
                            unique: false,
                            isReactive: component.type !== "controller",
                            onParse: (ctx)=>{
                                this.ProtocolBodyConstructor.setCaseContext(component, ctx);
                            }
                        },
                    ],
                    onError: (err)=>{
                        this.error(`Error in component: ${component.file}:${position.line}:${position.column} \n\t${err.message}`);
                    }
                });
            });
            for await (const [, component] of entries){
                await this.DefinitionProvider.setDataToComponentFromFile(component);
                this.DefinitionProvider.transformInheritedProperties(component);
            }
            for await (const [, component1] of entries){
                this.ProtocolClassConstructor.getAllUsedComponents(bundle, component1);
                this.ProtocolClassConstructor.buildProtocol(component1);
                await this.ProtocolClassConstructor.setComponentRuntime(component1);
            }
        } catch (err) {
            this.error(`ProtocolDataProvider: ${err.message}`);
        }
    }
    setReactivity(text) {
        try {
            return this.ProtocolReactivity.getReactivity({
                text
            });
        } catch (err) {
            this.error(`ProtocolDataProvider: ${err.message}`);
        }
    }
    transformInheritedPropertiesInContext(component, ctx) {
        try {
            const expressions = {
            };
            const typedExpressions = __default12();
            let result = __default1({
                value: ctx.value,
                array: nullish.concat(tokens).concat([
                    {
                        name: 'inherit',
                        reg: /(inherit)(?:\s+)([^\s\:\n\=\;\?]+)+((?<undefinedAllowed>\s*\?\s*){0,1}\:(?<types>.+?)){0,1}(?<last>\=|\;|\n)/,
                        open: false,
                        id: (value, matches)=>{
                            const id = `${__default13.next().value}_tokenIn`;
                            if (matches) {
                                const [input, statement, property] = matches;
                                const types = matches && matches.groups && matches.groups.types ? matches.groups.types : '';
                                component.requirements = component.requirements || [];
                                component.requirements.push([
                                    property.trim(),
                                    getDeepTranslation1(types, expressions)
                                ]);
                                expressions[id] = value.replace(/^\s*inherit\b/, '');
                                return id;
                            }
                            expressions[id] = value;
                            return id;
                        },
                        close: false
                    }
                ]),
                expressions,
                typedExpressions
            });
            ctx.value = getDeepTranslation1(result, expressions);
        } catch (err) {
            this.error(`ProtocolDataProvider: ${err.message}`);
        }
    }
}
class ComponentTopLevelAnalyzer1 extends Utils {
    read(bundle) {
        try {
            bundle.components.forEach((c)=>{
                c.rootNode.childNodes.filter((node, id)=>id !== 0
                ).forEach((node)=>{
                    if (node.nodeType === 3 && node.rawText && node.rawText.trim().length) {
                        const position = MapPosition.mapNodes.get(node);
                        this.error(`${c.file}:${position && position.line || 0}:${position && position.column || 0}\n\tTop level text are not allowed, excepted for the first lines, these will serve for the imports, services.\nplease wrap this text into the template:\n\t${node.rawText.trim()}\n\t`);
                    }
                });
            });
        } catch (err) {
            this.error(`ComponentTopLevelAnalyzer: ${err.message}`);
        }
    }
    cleanRoot(bundle) {
        try {
            bundle.components.forEach((c)=>{
                c.rootNode.childNodes = c.rootNode.childNodes.filter((node, id)=>{
                    return node.tagName !== "style" && node.tagName !== "script" && node.tagName !== "proto" && node.nodeType !== 8 || node.nodeType === 3 && node.rawText && !node.rawText.trim().length || id === 0 && node.nodeType !== 3;
                });
            });
        } catch (err) {
            this.error(`ComponentTopLevelAnalyzer: ${err.message}`);
        }
    }
    switchRootNodeToTemplateNode(bundle) {
        try {
            this.read(bundle);
            bundle.components.forEach((component)=>{
                const forbiddenNode = component.rootNode.childNodes.find((n)=>n && n.nodeType === 1 && ![
                        "template",
                        "proto",
                        "style"
                    ].includes(n.tagName)
                );
                if (forbiddenNode) {
                    const position = MapPosition.mapNodes.get(forbiddenNode);
                    this.error(`Component Structure Error: ${component.file}:${position.line}:${position.column}\n          [v0.20.0] Only proto, template and style elements are allowed at the top-level of the component:\n          please follow this pattern:\n            <proto>\n              ...\n            </proto>\n            <template>\n              <${forbiddenNode.tagName} />\n            </template>\n            <style>\n              ...\n            </style>\n          you're getting this error cause the ${forbiddenNode.tagName} element is not wrapped into the template element.\n          This is to keep a scalable structure for your components.\n        `);
                }
                if (component.elements.template) {
                    component.rootNode.childNodes = component.elements.template.childNodes.slice();
                    component.rootNode.childNodes.forEach((n)=>{
                        n.parentNode = component.rootNode;
                    });
                }
            });
        } catch (err) {
            this.error(`ComponentTopLevelAnalyzer: ${err.message}`);
        }
    }
}
class MapOutput {
    static outputs = new Map();
    static async startSavingComponentsOutput(bundle) {
        const entries = Array.from(bundle.components.entries());
        for await (let [file] of entries){
            this.outputs.set(file, {
                render: '',
                data: '',
                context: '',
                customElement: ''
            });
        }
    }
    static async getOutputs(bundle) {
        const entries = Array.from(this.outputs.entries());
        for await (let [file, output] of entries.slice().reverse()){
            bundle.output += `\n      /**\n       * OUTPUT context for ${file}\n       */\n      ${output.context}\n      `;
        }
        for await (let [file1, output1] of entries){
            bundle.output += `\n      /**\n       * OUTPUT for ${file1}\n       */\n      ${output1.data}\n      ${output1.render}\n      ${output1.customElement}\n      `;
        }
        console.log(bundle.output);
    }
}
class ComponentCompiler1 extends Utils {
    async startAnalyze(bundle) {
        try {
            const entries = Array.from(bundle.components);
            for await (let [, component] of entries){
                await this.read(bundle, component);
            }
        } catch (err) {
            this.error(`ComponentCompiler: ${err.message}`);
        }
    }
    getControllers(bundle, component) {
        try {
            const controllers = Object.entries(component.imports).filter(([, path1])=>{
                const comp = bundle.components.get(path1);
                return comp && comp.type === "controller";
            });
            if (controllers.length && component.type !== "store") {
                this.error(this.template(`forbidden use of a controller inside a non-store component. \ncomponent: {% component.file %}`, {
                    component
                }));
            }
            return controllers;
        } catch (err) {
            this.error(`ComponentCompiler: ${err.message}`);
        }
    }
    async read(bundle, component) {
        try {
            const { mapRender  } = bundle;
            if (component.data instanceof Object) {
                const { runtime  } = component.scripts;
                const { modules  } = component;
                const controllers = this.getControllers(bundle, component);
                const controllerDef = controllers.length > 0 ? `\n            const Controllers = {};\n            ${controllers.map(([tagName, path1])=>{
                    const subcomp = bundle.components.get(path1);
                    let result = subcomp ? `\n            Controllers["${tagName}"] = {\n                async get(rte) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`)).blob()).text(); },\n                async post(rte, data = {}, op = {}) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`, { ...op, body: JSON.stringify(data || {}), method: 'POST'})).blob()).text(); },\n                async put(rte, data = {}, op = {}) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`, { ...op,  body: JSON.stringify(data || {}), method: 'PUT'})).blob()).text(); },\n                async delete(rte, data = {}, op = {}) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`, { ...op,  body: JSON.stringify(data || {}), method: 'DELETE'})).blob()).text(); },\n                async patch(rte, data = {}, op = {}) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`, { ...op,  body: JSON.stringify(data || {}), method: 'PATCH'})).blob()).text(); },\n              }` : "";
                    return result;
                })}\n            Object.seal(Controllers);\n          ` : "";
                const store = `\n        const Store = {\n          dispatch: (id, ctx) => {\n            const path = id.split('/');\n            if (path.length > 1) {\n              const [namespace, action] = path;\n              const mod = this.store[namespace];\n              if (mod && mod.runtime) {\n                return mod.runtime(\`action:$\{action}\`, ctx)\n                  .catch((err) => Ogone.displayError(err.message, \`Error in dispatch. action: \${action} component: {% component.file %}\`, err));\n              }\n            } else {\n              const mod = this.store[null];\n              if (mod && mod.runtime) {\n                return mod.runtime(\`action:$\{id}\`, ctx)\n                  .catch((err) => Ogone.displayError(err.message, \`Error in dispatch. action: \${action} component: {% component.file %}\`, err));\n              }\n            }\n          },\n          commit: (id, ctx) => {\n            const path = id.split('/');\n            if (path.length > 1) {\n              const [namespace, mutation] = path;\n              const mod = this.store[namespace];\n              if (mod && mod.runtime) {\n                return mod.runtime(\`mutation:$\{mutation}\`, ctx).catch((err) => Ogone.displayError(err.message, \`Error in commit. mutation: \${mutation} component: {% component.file %}\`, err));\n              }\n            } else {\n              const mod = this.store[null];\n              if (mod && mod.runtime) {\n                return mod.runtime(\`mutation:$\{id}\`, ctx).catch((err) => Ogone.displayError(err.message, \`Error in commit. mutation: \${id} component: {% component.file %}\`, err));\n              }\n            }\n          },\n          get: (id) => {\n            const path = id.split('/');\n            if (path.length > 1) {\n              const [namespace, get] = path;\n              const mod = this.store[namespace];\n              if (mod && mod.data) {\n                return mod.data[get];\n              }\n            } else {\n              const mod = this.store[null];\n              if (mod && mod.data) {\n                return mod.data[id];\n              }\n            }\n          },\n        };`;
                const asyncResolve = `\n          const Async = {\n            resolve: (...args) => {\n              if (this.resolve) {\n                const promise = this.resolve(...args);\n                if (this.dispatchAwait) {\n                  this.dispatchAwait();\n                  this.dispatchAwait = false;\n                  this.promiseResolved = true;\n                }\n                this.resolve = null;\n                return promise;\n              } else if (this.resolve === null) {\n                const DoubleUseOfResolveException = new Error('Double use of resolution in async component');\n                Ogone.displayError(DoubleUseOfResolveException.message, 'Double Resolution of Promise', {\n                 message: \`component: {% component.file %}\`\n                });\n                throw DoubleUseOfResolveException;\n              }\n            },\n          };\n          // freeze Async Object;\n          Object.freeze(Async);\n          `;
                let result = `function OgoneComponentRuntime () {\n            OComponent.call(this);\n            {% controllerDef %}\n            {% hasStore %}\n            const ___ = (prop, inst, value) => {\n              this.update(prop);\n              return value;\n            };\n            const ____r = (name, use, once) => {\n              this.runtime(name, use[0], use[1], once);\n            };\n            this.data = {% data %};\n            this.refs = {\n              {% refs %}\n            };\n            const Refs = this.refs;\n            {% asyncResolve %}\n            {% modules %}\n            {% protocol %}\n            const __run = {% runtime %}\n            this.runtime = __run.bind(this.data);\n          };\n          `;
                const d = {
                    component,
                    modules: modules && Env2._env !== "production" ? modules.flat().join("\n") : "",
                    asyncResolve: component.type === "async" ? asyncResolve : "",
                    protocol: component.protocol ? component.protocol : "",
                    dataSource: component.isTyped ? `new (${component.context.protocolClass})` : JSON.stringify(component.data),
                    data: component.isTyped || component.context.engine.includes(ComponentEngine.ComponentProxyReaction) && !component.context.engine.includes(ComponentEngine.ComponentInlineReaction) ? `Ogone.setReactivity({% dataSource %}, (prop) => this.update(prop))` : '{% dataSource %}',
                    runtime,
                    controllerDef: component.type === "store" ? controllerDef : "",
                    refs: Object.entries(component.refs).length ? Object.entries(component.refs).map(([key, value])=>`'${key}': '${value}',`
                    ) : "",
                    hasStore: !!component.hasStore ? store : ""
                };
                result = (await Deno.emit('/transpiled.ts', {
                    sources: {
                        "/transpiled.ts": `  ${this.template(result, d)}`
                    },
                    compilerOptions: {
                        sourceMap: false
                    }
                })).files["/transpiled.ts"];
                const componentOutput = MapOutput.outputs.get(component.file);
                if (!componentOutput) {
                    this.error('component output not found in MapOutput');
                }
                if (mapRender.has(result)) {
                    const item = mapRender.get(result);
                    result = this.template(`Ogone.components['{% component.uuid %}'] = Ogone.components['{% item.id %}'];`, {
                        component,
                        item
                    });
                    if (componentOutput) {
                        componentOutput.data = this.template(result, d);
                    }
                } else {
                    mapRender.set(result, {
                        id: component.uuid
                    });
                    if (componentOutput) {
                        componentOutput.data = this.template(`Ogone.components['{% component.uuid %}'] = ${result.trim()}`, d);
                    }
                }
            }
        } catch (err) {
            this.error(`ComponentCompiler: ${err.message}`);
        }
    }
}
class SwitchContextBuilder1 extends Utils {
    async startAnalyze(bundle) {
        try {
            const entries = Array.from(bundle.components);
            for await (let [path1] of entries){
                await this.read(bundle, path1);
            }
        } catch (err) {
            this.error(`SwitchContextBuilder: ${err.message}`);
        }
    }
    read(bundle, keyComponent) {
        try {
            const component = bundle.components.get(keyComponent);
            if (component) {
                Object.entries(component.for).forEach(([nId, flag])=>{
                    const { script  } = flag;
                    const { modules  } = component;
                    const { node , ctx , getLength , array , item: itemName , aliasItem , destructured  } = script;
                    let contextIf = null;
                    if (node.attributes && node.attributes["--if"]) {
                        let nxt = node.nextElementSibling;
                        node.hasFlag = true;
                        node.ifelseBlock = {
                            main: node.attributes["--if"],
                            ifFlag: {
                                [node.id]: node.attributes["--if"]
                            },
                            elseIf: {
                            },
                            elseFlag: {
                            }
                        };
                        while(nxt && nxt.attributes && (nxt.attributes["--else-if"] || nxt.attributes["--else"])){
                            nxt.ifelseBlock = node.ifelseBlock;
                            if (nxt.attributes["--else-if"]) {
                                node.ifelseBlock.elseIf[nxt.id] = nxt.attributes["--else-if"];
                            } else {
                                node.ifelseBlock.elseFlag[nxt.id] = nxt.attributes["--else"];
                            }
                            const elseDir = !!nxt.attributes["--else"];
                            nxt = nxt.nextElementSibling;
                            if (elseDir && nxt && nxt.attributes && (!!nxt.attributes["--else"] || !!nxt.attributes["--else-if"])) {
                                this.error("else flag has to be the last in if-else-if blocks, no duplicate of --else are allowed.");
                            }
                        }
                    }
                    if (node.ifelseBlock && node.attributes && !node.attributes["--for"]) {
                        node.hasFlag = true;
                        const { ifFlag , elseFlag , elseIf , main  } = node.ifelseBlock;
                        const isElse = elseFlag[node.id];
                        const isElseIf = elseIf[node.id];
                        const isMain = ifFlag[node.id];
                        const allElseIf = Object.values(elseIf);
                        if (!!isMain) {
                            contextIf = `\n              if (GET_LENGTH && !(${main})) {\n                return 0;\n              }\n            `;
                        } else if (!!isElseIf) {
                            contextIf = `\n              if (GET_LENGTH && (${main})) {\n                return 0;\n              } else if (GET_LENGTH && !(${isElseIf})) {\n                return 0;\n              }\n            `;
                        } else if (!!isElse) {
                            contextIf = `\n              if (GET_LENGTH && (${main})) {\n                return 0;\n              ${allElseIf.map((key)=>{
                                return `\n              } else if (GET_LENGTH && ${key}) {\n                return 0;`;
                            }).join("\n")}\n              }\n            `;
                        }
                    }
                    function renderConditions(item) {
                        if (!!item.ifelseBlock && item.id) {
                            item.hasFlag = true;
                            const { ifFlag , elseFlag , elseIf , main  } = item.ifelseBlock;
                            const isElse = elseFlag[item.id];
                            const isElseIf = elseIf[item.id];
                            const isMain = ifFlag[item.id];
                            const allElseIf = Object.values(elseIf);
                            if (!!isMain) {
                                return `(${main})`;
                            } else if (!!isElseIf) {
                                return `!(${main}) && (${isElseIf})`;
                            } else if (!!isElse) {
                                return `!(${main}) && !(${allElseIf.join(" && ")})`;
                            }
                        }
                        return "";
                    }
                    const nodeHasProps = !!Object.keys(node.attributes).find((n)=>n.startsWith(":")
                    );
                    const isImported = bundle.components.get(keyComponent)?.imports[node.tagName];
                    const isNodeDynamic = nodeHasProps && !node.attributes['--for'] && !isImported;
                    const contextScript = node.hasFlag || !node.tagName && node.nodeType === 1 || isNodeDynamic ? `\n        Ogone.contexts['{% context.id %}'] = function(opts) {\n            const GET_TEXT = opts.getText;\n            const GET_LENGTH = opts.getLength;\n            const POSITION = opts.position;\n            {% data %}\n            {% modules %}\n            {% value %}\n            {% context.if %}\n            {% context.getNodeDynamicLength || context.getLength %}\n            if (GET_TEXT) {\n              try {\n                return eval('('+GET_TEXT+')');\n              } catch(err) {\n                if (!({% itemName %})) { return undefined }\n                Ogone.displayError('Error in component:\\n\\t {%component.file%} '+\`$\{GET_TEXT}\`, err.message ,err);\n                throw err;\n              }\n            }\n            return { {% context.result %} };\n          };\n        ` : `Ogone.contexts['{% context.id %}'] = Ogone.contexts['{% context.parentId %}'];`;
                    const result = this.template(contextScript, {
                        component,
                        data: component.context.data,
                        value: script.value || "",
                        itemName: aliasItem || itemName,
                        context: {
                            id: `${component.uuid}-${nId}`,
                            if: contextIf ? contextIf : "",
                            parentId: node.parentNode ? `${component.uuid}-${node.parentNode.id}` : "",
                            result: component.data ? [
                                ...Object.keys(ctx).filter((key)=>!key.match(/^(\{|\[)/)
                                ),
                                ...destructured ? destructured : [],
                                ...Object.keys(component.data)
                            ].join(',') : '',
                            getNodeDynamicLength: isNodeDynamic ? `\n            if (GET_LENGTH) {\n              return 1;\n            }` : null,
                            getLength: getLength ? getLength({
                                filter: renderConditions(node)
                            }) : ""
                        },
                        modules: modules ? modules.map((md)=>md[0]
                        ).join(";\n") : ""
                    });
                    bundle.mapContexts.set(`${component.uuid}-${node.id}`, {
                        position: `const POSITION: number[] = Array.from(new Array(${script.level})).map((a,i) => 0);`,
                        data: component.data instanceof Object ? Object.keys(component.data).map((prop)=>`const ${prop} = this.${prop};`
                        ).join("\n") : "",
                        value: script.value || "",
                        modules: modules ? modules.map((md)=>md[0]
                        ).join(";\n") : ""
                    });
                    const componentOutput = MapOutput.outputs.get(component.file);
                    if (!componentOutput) {
                        this.error('component output not found in MapOutput');
                    }
                    componentOutput.context = result;
                });
            }
        } catch (err) {
            this.error(`SwitchContextBuilder: ${err.message}`);
        }
    }
}
class WebComponentDefinition extends Utils {
    render(bundle, component, node) {
        try {
            if (!component) return "";
            const isTemplate = node.tagName === null;
            const isImported = node.tagName ? component.imports[node.tagName] : false;
            const isProduction = Env1._env === "production";
            const componentPragma = node.pragma ? node.pragma(bundle, component, true) : "";
            if (isImported) {
                return "";
            }
            const templateSlots = {
                component,
                elementId: isTemplate ? `${component.uuid}-nt` : `${component.uuid}-${node.id}`,
                extension: isTemplate ? "HTMLTemplateElement" : `HTMLElement`
            };
            let componentExtension = ``;
            let definition1 = `customElements.define('{% elementId %}', Ogone.classes.component({% extension %}, '{% component.type %}'), { extends: 'template' });`;
            if (!isTemplate) {
                definition1 = `customElements.define('{% elementId %}', Ogone.classes.component({% extension %}, '{% component.type %}'));`;
            }
            if (!isProduction) {
                definition1 = `\n        if (!customElements.get("{% elementId %}")) {\n          ${definition1}\n        }\n      `;
            }
            const render = `Ogone.render['{% elementId %}'] = ${componentPragma.replace(/\n/gi, "").replace(/\s+/gi, " ")}`;
            const componentOutput = MapOutput.outputs.get(component.file);
            if (componentOutput) {
                componentOutput.customElement = this.template(definition1, templateSlots);
                componentOutput.render = this.template(render, templateSlots);
            }
            if ([
                "controller"
            ].includes(component.type)) {
                return `class extends HTMLTemplateElement {\n        constructor(){super();}\n        connectedCallBack(){this.remove()} };`;
            }
            return this.template(componentExtension, templateSlots);
        } catch (err) {
            this.error(`WebComponentDefinition: ${err.message}`);
        }
    }
}
class NodeAnalyzerCompiler1 extends WebComponentDefinition {
    async startAnalyze(bundle) {
        try {
            const entries = Array.from(bundle.components);
            for await (let [path1, component] of entries){
                await this.read(bundle, path1, component.rootNode);
            }
        } catch (err) {
            this.error(`Constructor: ${err.message}`);
        }
    }
    async read(bundle, keyComponent, node) {
        try {
            const component = bundle.components.get(keyComponent);
            if (component) {
                const protoNoStrictTagname = component.elements.proto[0] && component.elements.proto[0].attributes.engine === ComponentEngine.NoStrictTagName;
                const isImported = component.imports[node.tagName];
                const subcomp = bundle.components.get(isImported);
                if (node.attributes && node.attributes["--await"] && component.type !== "async") {
                    const BadUseOfAwaitInSyncComponentException = `--await must be used in an async component. define type="async" to the proto.\n Error in component: ${component.file}\n node: ${node.tagName}`;
                    this.error(BadUseOfAwaitInSyncComponentException);
                }
                this.trace('BadUseOfAwaitInSyncComponentException passed.');
                if (node.attributes && node.attributes["--await"] && isImported && subcomp && subcomp.type !== "async") {
                    const BadUseOfAwaitInSyncComponentException = `--await must be called only on async components. change type of <${node.tagName} --await /> or erase --await.\n Error in component: ${component.file}\n node: ${node.tagName}`;
                    this.error(BadUseOfAwaitInSyncComponentException);
                }
                this.trace('BadUseOfAwaitInSyncComponentException passed.');
                if (node.attributes && node.attributes["--defer"] && !isImported) {
                    const BadUseDeferFlagException = `--defer must be called only on async components. discard <${node.tagName} --defer="${node.attributes["--defer"]}" />.\n Error in component: ${component.file}\n node: ${node.tagName}`;
                    this.error(BadUseDeferFlagException);
                }
                this.trace('BadUseDeferFlagException passed.');
                if (node.attributes && node.attributes["--defer"] && isImported && subcomp && subcomp.type !== "async") {
                    const BadUseDeferFlagException = `--defer must be called only on async components. change type of <${node.tagName} --defer="${node.attributes["--defer"]}" /> or delete it.\n Error in component: ${component.file}\n node: ${node.tagName}`;
                    this.error(BadUseDeferFlagException);
                }
                this.trace('BadUseDeferFlagException passed.');
                switch(true){
                    case !protoNoStrictTagname && subcomp && [
                        "async",
                        "store",
                        "router"
                    ].includes(subcomp.type) && node.tagName && !node.tagName.startsWith(`${subcomp.type[0].toUpperCase()}${subcomp.type.slice(1)}`):
                        if (subcomp) {
                            this.error(`'${node.tagName}' is not a valid selector of ${subcomp.type} component. please use the following syntax:\n                import ${subcomp.type[0].toUpperCase()}${subcomp.type.slice(1)}${node.tagName} from '${isImported}';\nimport { ComponentEngine } from '../enums/componentEngine';\n                component: ${component.file}\n              `);
                        }
                }
                this.trace('Valid tag name passed.');
                const nodeIsDynamic = node.nodeType === 1 && Object.keys(node.attributes).find((key)=>key.startsWith(':')
                );
                if (node.nodeType === 1 && node.childNodes && node.childNodes.length) {
                    for await (const child of node.childNodes){
                        await this.read(bundle, keyComponent, child);
                    }
                }
                if (node.tagName === null || node.hasFlag && node.tagName || nodeIsDynamic) {
                    this.render(bundle, component, node);
                }
            }
        } catch (err) {
            this.error(`NodeAnalyzerCompiler: ${err.message}`);
        }
    }
}
let i1 = 0;
function getId(type1) {
    i1++;
    return `${type1}${i1}`;
}
class CSSScoper1 {
    preserveRegexp(str, expressions, regexp) {
        const reg = /\{([^\{\}])*\}/;
        const kReg = regexp;
        let result = str;
        while(result.match(reg)){
            const [input] = result.match(reg);
            const key = getId("block");
            const content = input;
            expressions[key] = input;
            result = result.replace(input, key);
        }
        const regExp = /(block\d+)/gi;
        const matches = result.match(regExp);
        if (matches) {
            matches.forEach((block, i2, arr)=>{
                const endIndex = result.indexOf(block) + block.length;
                const previousBlock = arr[i2 - 1];
                let startIndex = previousBlock ? result.indexOf(previousBlock) + previousBlock.length : 0;
                if (startIndex === endIndex || startIndex === -1) {
                    startIndex = 0;
                }
                let rule = result.slice(startIndex, endIndex);
                while(rule.match(regexp)){
                    const [input] = rule.match(regexp);
                    const key = getId("reserved");
                    expressions[key] = input;
                    result = result.replace(input, key);
                    rule = rule.replace(input, key);
                }
            });
        }
        while(Object.keys(expressions).filter((k)=>k.startsWith("block")
        ).find((k)=>result.indexOf(k) > -1
        )){
            const key = Object.keys(expressions).filter((k)=>k.startsWith("block")
            ).find((k)=>result.indexOf(k) > -1
            );
            if (key) {
                const expression = expressions[key];
                result = result.replace(key, expression);
            }
        }
        return result;
    }
    preserve(str, expressions, template) {
        let result = str;
        const splitted = result.split(template[0]).filter((s)=>s.indexOf(template[1]) > -1
        );
        splitted.forEach((s)=>{
            let c = s.split(template[1])[0];
            const key = getId("__");
            const content = `${template[0]}${c}${template[1]}`;
            expressions[key] = content;
            result = result.replace(content, key);
        });
        return result;
    }
    transform(cssStr, scopeId) {
        let result = cssStr;
        let expressions = {
        };
        result = this.preserve(result, expressions, [
            "(",
            ")"
        ]);
        result = this.preserve(result, expressions, [
            "[",
            "]"
        ]);
        result = this.preserveRegexp(result, expressions, /(\@keyframes)([\s\w\d\-]*)+(block\d+)/);
        result = this.preserveRegexp(result, expressions, /(\@font-feature-values)([\s\w\d\-]*)+(block\d+)/);
        result = this.preserveRegexp(result, expressions, /(\@font-face)([\s\w\d\-]*)+(block\d+)/);
        result = this.preserveRegexp(result, expressions, /(\@counter-style)([\s\w\d\-]*)+(block\d+)/);
        result = this.preserveRegexp(result, expressions, /(\@page)([\s\w\d\-]*)+(block\d+)/);
        result = this.preserveRegexp(result, expressions, /(?=(:{2}))([^\s]*)+/);
        const match = result.match(/([^\{\}])+(?=\{)/gi);
        const matches = match ? match.filter((s)=>!s.trim().startsWith("@")
        ) : null;
        if (matches) {
            matches.forEach((select)=>{
                let selector = select.replace(/((reserved|block)\d+)/gi, '');
                let s = selector;
                const inputs = selector.split(/([\s,\>\<\(\)\+\:])+/gi).filter((s1)=>s1.trim().length && !s1.match(/^([^a-zA-Z])$/gi)
                ).map((inp)=>{
                    const key = getId("k");
                    s = s.replace(inp, key);
                    return {
                        key,
                        value: inp
                    };
                });
                inputs.forEach((inp, i2, arr)=>{
                    let { value  } = inp;
                    if (value.indexOf(":") > -1) {
                        value = value.split(":")[0];
                    }
                    const savedPseudoElement = value.match(/(reserved\d+)+$/);
                    value = value.replace(/(reserved\d+)+$/, "");
                    value = value.replace(value, `${value}[${scopeId}]${savedPseudoElement ? savedPseudoElement[0] : ""}`);
                    arr[i2].value = value;
                });
                while(inputs.find((inp)=>s.indexOf(inp.key) > -1 && (s = s.replace(inp.key, inp.value))
                )){
                }
                result = result.replace(selector, s);
            });
        }
        result = getDeepTranslation1(result, expressions);
        return result;
    }
}
class StyleSupports extends Utils {
    static renderElement(styleBundle, bundle, component, opts) {
        let result = '';
        const render = ([selector, parent])=>{
            result += `${selector} { `;
            const { childs  } = parent;
            childs.forEach((item)=>{
                if (item.selector.trim() === selector.trim()) return;
                let type1 = "normal";
                switch(true){
                    case item.selector.trim().startsWith('@keyframes'):
                        type1 = "keyframes";
                        break;
                    case item.selector.trim().startsWith('@media'):
                        type1 = "media";
                        break;
                    case item.selector.trim().startsWith('@supports'):
                        type1 = "supports";
                        break;
                }
                if (item.selector !== selector) {
                    result += StyleRenderer1.render(styleBundle, bundle, component, {
                        type: type1,
                        id: item.id,
                        selector: item.selector
                    });
                }
            });
            result += `} `;
        };
        if (opts && opts.id) {
            const candidate = styleBundle.mapSupports.get(opts.id);
            if (candidate) {
                [
                    [
                        opts.id,
                        candidate
                    ]
                ].forEach(render);
            } else {
                this.error(`@supports not found`);
            }
        } else {
            const entries = Array.from(styleBundle.mapSupports.entries());
            entries.forEach(render);
        }
        return result;
    }
    static saveElement(styleBundle, bundle, component, opts) {
        const { item  } = opts;
        if (!styleBundle.mapSupports.has(item.isSupports)) styleBundle.mapSupports.set(item.isSupports, {
            childs: [
                item
            ]
        });
        else {
            const doc = styleBundle.mapSupports.get(item.isSupports);
            doc.childs.push(item);
        }
    }
}
class StyleDocument extends Utils {
    static renderElement(styleBundle, bundle, component) {
        let result = '';
        const entries = Array.from(styleBundle.mapDocument.entries());
        entries.forEach(([selector, parent])=>{
            result += `${selector} { `;
            const { childs  } = parent;
            childs.forEach((item)=>{
                const propsEntries = Object.entries(item.properties.props);
                const props = propsEntries.length ? propsEntries.map(([name, value])=>`${name}: ${value};`
                ).join('') : null;
                if (props) {
                    result += `${item.selector} { ${props} } `;
                }
            });
            result += `} `;
        });
        return result;
    }
    static saveElement(styleBundle, bundle, component, opts) {
        const { item  } = opts;
        if (!styleBundle.mapDocument.has(item.isDocument)) styleBundle.mapDocument.set(item.isDocument, {
            childs: [
                item
            ]
        });
        else {
            const doc = styleBundle.mapDocument.get(item.isDocument);
            doc.childs.push(item);
        }
    }
}
class StyleKeyframes extends Utils {
    static renderElement(styleBundle, bundle, component, opts) {
        let result = '';
        const render = ([selector, item])=>{
            if (item.isNestedKeyframes) {
                const { props  } = item.properties;
                const { parent  } = item;
                const keys = Object.keys(props);
                const animationKeys = keys.filter((k)=>k.indexOf('animation') > -1
                );
                const keyframes = [];
                Object.entries(props).filter(([k])=>k.indexOf('animation') < 0
                ).map(([k, value])=>{
                    const newValue = value.split('|');
                    newValue.forEach((v, i2)=>{
                        keyframes[i2] = keyframes[i2] || {
                        };
                        keyframes[i2][k] = v.trim().length ? v.trim() : keyframes[i2 - 1] ? keyframes[i2 - 1][k] : '';
                    });
                    return [
                        k,
                        newValue
                    ];
                });
                const m = item.selector.match(/@keyframes\s+(.*)/i);
                if (m) {
                    let [, name] = m;
                    props["animation-name"] = props["animation-name"] || name;
                } else {
                    this.error(`${component.file}\n\t@keyframes requires a name\n\tplease follow this pattern: @keyframes <name> { ... }\n\tinput: ${item.selector} { ... }`);
                }
                result += this.template(`{% parentRule %} {% keyframesSelector %} { {% frames %} } `, {
                    parentRule: item.parent && !item.parent.isSpecial ? `{% parent.selector %} { {% animation %} }` : '',
                    frames: keyframes.map((keyframe, i2, arr)=>{
                        const total = arr.length - 1;
                        let percent = Math.round(i2 / total * 100);
                        const entries = Object.entries(keyframe);
                        return `${Number.isNaN(percent) ? 0 : percent}% {${entries.map(([k, v])=>`${k}: ${v};`
                        ).join('')}}`;
                    }).join(''),
                    parent,
                    keyframesSelector: `@keyframes ${props["animation-name"]}`,
                    animation: `${animationKeys.map((key)=>`${key}:${props[key]};`
                    ).join('')} {% animationProp %}`,
                    animationProp: !props["animation"] ? `animation-name: ${props["animation-name"]};` : ''
                });
            } else if (item.isKeyframes) {
                const propsEntries = Object.entries(item.properties.props);
                const props = propsEntries.length ? propsEntries.map(([name, value])=>`${name}: ${value};`
                ).join('') : null;
                if (props) {
                    result += `${item.selector} { ${props} } `;
                }
            }
        };
        if (opts && opts.id) {
            const candidate = styleBundle.mapKeyframes.get(opts.id);
            if (opts.id && candidate) [
                [
                    opts.id,
                    candidate
                ]
            ].forEach(render);
        } else {
            const entries = Array.from(styleBundle.mapKeyframes.entries());
            entries.forEach(render);
        }
        return result;
    }
    static saveElement(styleBundle, bundle, component, opts) {
        const { item  } = opts;
        if (!styleBundle.mapKeyframes.has(item.id)) styleBundle.mapKeyframes.set(item.id, item);
        else {
            this.error(`${component.file}\n\tduplicated keyframes.\n\tinput: ${item.selector} {...}`);
        }
    }
}
class StyleMediaQueries extends Utils {
    static renderElement(styleBundle, bundle, component, opts) {
        let result = '';
        const render = ([selector, item])=>{
            const { queries  } = item;
            queries.forEach((query)=>{
                let type1 = "normal";
                let target = query;
                if (query.id.trim() !== selector.trim()) {
                    switch(true){
                        case query.selector.trim().startsWith('@keyframes'):
                            type1 = "keyframes";
                            break;
                        case query.selector.trim().startsWith('@supports'):
                            type1 = "supports";
                            break;
                        case query.selector.trim().startsWith('@media'):
                            type1 = "media";
                            break;
                    }
                    result += StyleRenderer2.render(styleBundle, bundle, component, {
                        type: type1,
                        id: target.id,
                        selector: target.selector
                    });
                } else {
                    result += `${query.selector} { `;
                    const propsEntries = Object.entries(query.properties.props);
                    const props = propsEntries.length ? propsEntries.map(([name, value])=>`${name}: ${value};`
                    ).join('') : null;
                    if (props) {
                        result += `${(query.isNestedMedia ? query.parent : query).selector} { ${props} } `;
                    }
                }
            });
            result += `} `;
        };
        if (opts && opts.id) {
            const candidate = styleBundle.mapMedia.get(opts.id);
            if (candidate) {
                [
                    [
                        opts.id,
                        candidate
                    ]
                ].forEach(render);
            } else {
                const candidate2 = styleBundle.mapSelectors.get(opts.id);
                [
                    [
                        opts.id,
                        candidate2
                    ]
                ].forEach(render);
            }
        } else {
            const entries = Array.from(styleBundle.mapMedia.entries());
            entries.forEach(render);
        }
        return result;
    }
    static saveElement(styleBundle, bundle, component, opts) {
        const { item  } = opts;
        if (!styleBundle.mapMedia.has(item.id)) styleBundle.mapMedia.set(item.id, {
            queries: [
                item
            ]
        });
        else {
            const itemMedia = styleBundle.mapMedia.get(item.id);
            itemMedia.queries.push(item);
        }
    }
}
class StyleParser extends Utils {
    regularAtRules = /^(\@(import|namespace|charset))/i;
    nestedAtRules = /^(\@(media|keyframes|supports|document))\b/i;
    mapStyleBundle = new Map();
    getContextRecursive(styleBundle, bundle, component, opts) {
        let result = opts && opts.imported ? `(() => {` : '';
        const { expressions  } = styleBundle.tokens;
        const varEntries = Array.from(styleBundle.mapVars.entries());
        styleBundle.mapImports.forEach((item)=>{
            const { name  } = item;
            result += `\nconst $${name} = ${this.getContextRecursive(item.bundle, bundle, component, {
                imported: true
            })};`;
        });
        varEntries.forEach(([key, item])=>{
            switch(true){
                case item.eval:
                    result += `\nconst $${key} = typeof ${item.value} === "string" ? ${item.value} :\n            typeof ${item.value} === "function" ? ${item.value}() : eval(${item.value});`;
                    break;
                case !item.eval && typeof item.value === "string":
                    result += `\nconst $${key} = "${item.value}";\n`;
                    break;
                case item.isSelector:
                    result += `\nconst $${key} = $$target;\n`;
                    break;
            }
        });
        if (opts && opts.imported) {
            let exported = '{';
            varEntries.filter(([, item])=>item.exportable
            ).map(([key])=>{
                exported += `${key}: $${key},`;
            });
            exported += '}';
            result += `\nreturn (${exported}); })()`;
        } else {
            result += `\n        if ('{% context %}' === 'spread' && ($$target ? $$target : {% subject %})) {\n          const _target = ($$target ? $$target : {% subject %});\n          if (!_target.value || !_target.value[0] || !_target.value[0].children) {\n            this.error(\`{% component.file %}\n\tError in style of Component: {% subject.trim() %} is not a rule.\n\tyou're getting this error cause you're trying to spread a non-rule value\n\tcant spread it inside another one\n\tinput: ...{% subject.trim() %}\`);\n          }\n          $$item.children = [\n              ...$$item.children,\n              ..._target.value[0].children,\n            ];\n          $$item.props = {\n            ...$$item.props,\n            ..._target.value[0].properties.props,\n          };\n        }\n        if ('{% context %}' === 'value') {\n          return {% subject %};\n        }\n      `;
        }
        return this.getDeepTranslation(result, expressions);
    }
    getValueOf(variable, styleBundle, bundle, component, opts) {
        const { value  } = variable;
        const { expressions  } = styleBundle.tokens;
        let result = this.getDeepTranslation(value, expressions);
        const imports = Object.fromEntries(styleBundle.mapImports.entries());
        const names = Object.keys(imports);
        names.forEach((name)=>{
            const componentsRegExp = new RegExp(`(\\$${name})(\.([\\w\\d\\_\\-]*)+)*`);
            const m = result.match(componentsRegExp);
            if (m) {
                const [match, nameOfComponent] = m;
                const functionBody = this.template(this.getContextRecursive(styleBundle, bundle, component), {
                    context: 'value',
                    subject: match,
                    component
                });
                const renderContext = new Function('$$item', '$$target', functionBody).bind(this);
                const newValue = renderContext(result, styleBundle.mapImports.get(nameOfComponent.replace(/^\$/, '')));
                result = result.replace(match, newValue);
            }
        });
        return result;
    }
    getProperties(css, styleBundle, bundle, component, opts) {
        const result = {
            children: [],
            props: {
            }
        };
        const { expressions  } = styleBundle.tokens;
        const endExp = /(?:;\n*(?=(?:\s+(?:.+?)\s*\:)|(?=(?:.+?)\d+_block)))/;
        const parts = css.split(endExp);
        parts.filter((rule)=>rule && rule.trim().length
        ).forEach((rule)=>{
            const isChild = rule.match(/(\d+_block)/);
            const isSpread = rule.match(/(\.{3})(.*)/);
            if (isChild) {
                const [block] = isChild;
                result.children.push(rule);
            } else if (isSpread) {
                let [, , variable] = isSpread;
                variable = this.getDeepTranslation(variable, expressions).replace(/(\;)$/, '');
                const functionBody = this.template(this.getContextRecursive(styleBundle, bundle, component), {
                    context: 'spread',
                    subject: variable,
                    component
                });
                const renderContext = new Function('$$item', '$$target', functionBody).bind(this);
                const target = this.getComponentContext(styleBundle, bundle, component, {
                    variable
                }) || styleBundle.mapVars.get(variable.replace(/^\$/, ''));
                renderContext(result, target);
            } else {
                const item = rule.split(/\:/);
                if (item) {
                    let [prop, value] = item;
                    if (value) {
                        let realValue = this.getDeepTranslation(value.trim(), expressions);
                        prop = this.getDeepTranslation(prop.trim(), expressions);
                        result.props[prop] = realValue;
                        const regReference = /@([\w\_\-]*)+/;
                        const regVars = /(?<!\-{2})\$(\w*)+/;
                        const vars = Object.fromEntries(styleBundle.mapVars.entries());
                        while(result.props[prop].match(regReference)){
                            const m = result.props[prop].match(regReference);
                            if (m) {
                                const [, ref] = m;
                                if (!result.props[ref]) {
                                    this.error(`${component.file}\n\tStyle error:\n\tcan't find value of property ${ref}.\n\tif it's defined, please place it before the property ${prop}.\n\tinput: ${prop}: ${realValue}`);
                                }
                                result.props[prop] = result.props[prop].replace(`@${ref}`, result.props[ref]);
                            }
                        }
                        while(result.props[prop].match(regVars)){
                            const m = result.props[prop].match(regVars);
                            if (m) {
                                const [, ref] = m;
                                const variableValue = this.getValueOf(vars[ref], styleBundle, bundle, component, {
                                    context: 'value'
                                });
                                if (!variableValue) {
                                    this.error(`${component.file}\n\tStyle error:\n\t${ref} is undefined.\n\tinput: ${prop}: ${realValue}`);
                                }
                                result.props[prop] = result.props[prop].replace(`$${ref}`, variableValue);
                            }
                        }
                    }
                }
            }
        });
        styleBundle.mapSelectors.get(opts.selector).properties = result;
        return result;
    }
    getComponentContext(styleBundle, bundle, component, opts = {
        variable: ''
    }) {
        if (opts) {
            const text = opts.variable;
            const entries = Array.from(styleBundle.mapImports.entries());
            const usedComponent = entries.find(([name])=>text.startsWith(`$${name}.`)
            );
            if (usedComponent && usedComponent[1].bundle) {
                const { mapVars  } = usedComponent[1].bundle;
                const entriesMapVars = Array.from(mapVars.entries());
                const usedVar = entriesMapVars.find(([name])=>text.endsWith(`$${usedComponent[0]}.${name}`)
                );
                return usedVar && usedVar[1];
            }
        }
    }
    static isNotSpecial(selector) {
        const special = [
            "@media",
            "@keyframes",
            "@font-face",
            "@supports",
            "@font-feature-values",
            "@counter-style",
            "@page",
            "@document"
        ];
        let result = !special.find((r)=>selector.trim().startsWith(r)
        );
        return result;
    }
    getRules(css, styleBundle, bundle, component, opts = {
    }) {
        let result = css;
        if (typeof result !== "string") {
            return;
        }
        const rules = [];
        const regExp = /(\d+_block)/gi;
        const matches = result.match(regExp);
        if (matches) {
            matches.forEach((block, i2, arr)=>{
                const endIndex = css.indexOf(block) + block.length;
                const previousBlock = arr[i2 - 1];
                let startIndex = previousBlock ? css.indexOf(previousBlock) + previousBlock.length : 0;
                if (startIndex === endIndex || startIndex === -1) {
                    startIndex = 0;
                }
                const rule = css.slice(startIndex, endIndex);
                const isKeyframes = rule.trim().startsWith("@keyframes");
                const isMedia = rule.trim().startsWith("@media");
                const isDocument = rule.trim().startsWith("@document");
                const isSupports = rule.trim().startsWith("@supports");
                const expressions = styleBundle.tokens.expressions;
                const typedExpressions = styleBundle.tokens.typedExpressions;
                let selector = this.getDeepTranslation(rule.replace(block, '').trim(), expressions);
                const keySelector = "k" + Math.random();
                if (isDocument && opts.parent) {
                    this.error(`${component.file}\n\tcan't nest @document`);
                }
                const style = __default1({
                    expressions,
                    typedExpressions,
                    value: expressions[block].trim().slice(1).slice(0, -1),
                    array: tokens
                });
                styleBundle.mapSelectors.set(keySelector, {
                    id: keySelector,
                    selector,
                    rule,
                    properties: null,
                    parent: opts.parent ? opts.parent : null,
                    children: [],
                    isSpecial: !StyleParser.isNotSpecial(rule.trim()),
                    omitOutputSelector: opts.omitOutputSelector,
                    isMedia: opts.isMedia ? opts.isMedia : false,
                    isDocument: isDocument ? selector : opts.isDocument ? opts.isDocument : false,
                    isSupports: isSupports ? selector : opts.isSupports ? opts.isSupports : false,
                    isNestedMedia: false,
                    isKeyframes
                });
                const { props: properties , children  } = this.getProperties(style, styleBundle, bundle, component, {
                    selector: keySelector
                });
                if (opts.parent && isMedia) {
                    if (children.length) {
                        this.error(`${component.file}\nError in Style, can't assign nested rule inside a nested @media.\ninput: ${selector} {${this.getDeepTranslation(children[0], expressions)}}`);
                    }
                    const item = styleBundle.mapSelectors.get(keySelector);
                    item.isNestedMedia = selector;
                    item.isMedia = selector;
                }
                if (opts.parent && isKeyframes) {
                    if (children.length) {
                        this.error(`${component.file}\nError in Style, can't assign nested rule inside a nested @keyframes.\n\tif you're trying to use classic @keyframes please use it at the style's top level\ninput: ${selector} {${this.getDeepTranslation(children[0], expressions)}}`);
                    }
                    const item = styleBundle.mapSelectors.get(keySelector);
                    item.isNestedKeyframes = selector;
                    item.isKeyframes = selector;
                }
                if (!isKeyframes) {
                    children.forEach((child)=>{
                        this.getRules(child, styleBundle, bundle, component, {
                            parent: styleBundle.mapSelectors.get(keySelector),
                            isMedia: rule.trim().startsWith('@media') ? selector : !!opts.isMedia ? opts.isMedia : false,
                            isDocument: rule.trim().startsWith('@document') ? selector : !!opts.isDocument ? opts.isDocument : false,
                            isSupports: rule.trim().startsWith('@supports') ? selector : !!opts.isSupports ? opts.isSupports : false
                        });
                    });
                }
                if (opts.parent) {
                    opts.parent.children.push(styleBundle.mapSelectors.get(keySelector));
                }
                result = result.replace(rule, '');
                rules.push(styleBundle.mapSelectors.get(keySelector));
            });
        }
        return {
            rules,
            value: result
        };
    }
    getTokens(styleBundle, bundle, component) {
        let result = styleBundle.value;
        const expressions = styleBundle.tokens.expressions;
        const typedExpressions = styleBundle.tokens.typedExpressions;
        result = __default1({
            expressions,
            typedExpressions,
            value: result,
            array: nullish.concat(tokens).concat(tokens)
        });
        styleBundle.value = result;
        return result;
    }
}
class StyleRenderer extends StyleParser {
    static render(styleBundle, bundle, component, opts) {
        let result = '';
        if (opts && opts.type) {
            switch(opts.type){
                case "supports":
                    result += StyleSupports.renderElement(styleBundle, bundle, component, {
                        id: opts.selector
                    });
                    styleBundle.mapSupports.delete(opts.selector);
                    break;
                case "keyframes":
                    result += StyleKeyframes.renderElement(styleBundle, bundle, component, {
                        id: opts.id
                    });
                    styleBundle.mapKeyframes.delete(opts.id);
                    break;
                case "media":
                    result += StyleMediaQueries.renderElement(styleBundle, bundle, component, {
                        id: opts.id
                    });
                    styleBundle.mapMedia.delete(opts.id);
                    break;
                case "normal":
                    result += this.renderRules(styleBundle, bundle, component, {
                        id: opts.id
                    });
                    styleBundle.mapSelectors.delete(opts.id);
                    break;
            }
        } else {
            result += StyleDocument.renderElement(styleBundle, bundle, component);
            result += StyleSupports.renderElement(styleBundle, bundle, component);
            result += this.renderPreservedRules(styleBundle, bundle, component);
            result += this.renderRules(styleBundle, bundle, component);
            result += StyleMediaQueries.renderElement(styleBundle, bundle, component);
            result += StyleKeyframes.renderElement(styleBundle, bundle, component);
        }
        return result;
    }
    static renderRules(styleBundle, bundle, component, opts) {
        let result = '';
        const render = (item)=>{
            if (!item.isSpecial && !item.omitOutputSelector) {
                if (item.parent && this.isNotSpecial(item.parent.selector.trim()) && this.isNotSpecial(item.selector.trim())) {
                    let { selector  } = item;
                    const match = selector.match(/&/gi);
                    if (!match) {
                        selector = `${item.parent.selector} ${selector}`;
                    } else {
                        selector = selector.replace(/&/gi, item.parent.selector);
                    }
                    item.selector = selector;
                }
                const entries = Object.entries(item.properties.props);
                const props = entries.length ? entries.map(([name, value])=>`${name}: ${value};`
                ).join('') : null;
                if (props) {
                    result += this.template(`${item.selector} { {%props%} } `, {
                        props
                    });
                }
            }
        };
        if (opts && opts.id) {
            const rule = styleBundle.mapSelectors.get(opts.id);
            if (rule) {
                render(rule);
            } else {
                this.error(`rule not found`);
            }
        } else {
            styleBundle.mapSelectors.forEach(render);
        }
        return result;
    }
    static renderPreservedRules(styleBundle, bundle, component) {
        let result = '';
        styleBundle.mapPreservedRules.forEach((rule)=>{
            result += `${rule};`;
        });
        return this.getDeepTranslation(result, styleBundle.tokens.expressions);
    }
}
const StyleRenderer1 = StyleRenderer;
const StyleRenderer2 = StyleRenderer;
class StyleOutput extends StyleRenderer {
    getOutput(styleBundle, bundle, component) {
        let result = '';
        styleBundle.mapSelectors.forEach((item)=>{
            let rule = '';
            item.properties.children.forEach((child)=>{
                if (child.parent) {
                    child.parent = item;
                }
            });
            if (!!item.isSupports) {
                StyleSupports.saveElement(styleBundle, bundle, component, {
                    item
                });
            }
            if (!!item.isDocument) {
                StyleDocument.saveElement(styleBundle, bundle, component, {
                    item
                });
            }
            if (!!item.isKeyframes) {
                StyleKeyframes.saveElement(styleBundle, bundle, component, {
                    item
                });
            }
            if (!!item.isMedia) {
                StyleMediaQueries.saveElement(styleBundle, bundle, component, {
                    item
                });
            }
            result += rule;
        });
        result += StyleRenderer.render(styleBundle, bundle, component);
        styleBundle.value += result;
        return result;
    }
}
class StyleMemory extends StyleOutput {
    getVars(styleBundle, bundle, component) {
        let result = styleBundle.value;
        const parts = result.split(/(?:(;|\n+))/);
        const regExpVarsExported = /(@export)\s+(const\*{0,1})\s+(\w+)+\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+)(.*)/;
        const regExpVars = /(@const\*{0,1})\s+(\w+)+\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+)(.*)/;
        result = parts.map((statement)=>{
            if (statement.trim().match(this.regularAtRules)) {
                styleBundle.mapPreservedRules.set(statement, statement);
                return;
            }
            if (statement.trim().length && statement.trim().match(/(\@(const|export))/)) {
                const isConstant = statement.match(regExpVars);
                const isExportable = statement.match(regExpVarsExported);
                if (isExportable) {
                    let [match, exportable, kConst, name, equal, value] = isExportable;
                    const evaluated = kConst.trim().endsWith('*');
                    if (styleBundle.mapVars.get(name)) {
                        this.error(`${name} already defined.`);
                    }
                    const isSelector = !evaluated && !!value.match(/(\d+_block)$/);
                    styleBundle.mapVars.set(name, {
                        value: isSelector ? this.getRules(value, styleBundle, bundle, component, {
                            omitOutputSelector: true
                        }).rules : value,
                        eval: evaluated,
                        isSelector,
                        exportable: true
                    });
                } else if (isConstant) {
                    let [match, kConst, name, equal, value] = isConstant;
                    const evaluated = kConst.trim().endsWith('*');
                    if (styleBundle.mapVars.get(name)) {
                        this.error(`${name} already defined.`);
                    }
                    const isSelector = !evaluated && !!value.match(/(\d+_block)$/);
                    styleBundle.mapVars.set(name, {
                        value: isSelector ? this.getRules(value, styleBundle, bundle, component, {
                            omitOutputSelector: true
                        }).rules : value,
                        eval: evaluated,
                        isSelector,
                        exportable: false
                    });
                }
                return '';
            }
            if (statement.match(/(;|\n+)/)) {
                return '';
            }
            return statement;
        }).join('');
        styleBundle.value = result;
        return result;
    }
    async getNewStyleBundle(css, bundle, component) {
        const styleBundle = {
            input: css,
            value: css,
            mapImports: new Map(),
            mapVars: new Map(),
            mapMedia: new Map(),
            mapDocument: new Map(),
            mapSupports: new Map(),
            mapKeyframes: new Map(),
            mapSelectors: new Map(),
            mapPreservedRules: new Map(),
            component,
            tokens: {
                expressions: {
                },
                typedExpressions: {
                    blocks: {
                    },
                    parentheses: {
                    }
                }
            }
        };
        this.trace(`Style bundle created for component: ${component.file}`);
        this.getTokens(styleBundle, bundle, component);
        this.trace('All tokens analyze done');
        await this.getImports(styleBundle, bundle, component);
        this.trace(`All imports saved for component: ${component.file}`);
        this.getVars(styleBundle, bundle, component);
        this.trace(`Style variables saved`);
        styleBundle.value = this.getRules(styleBundle.value, styleBundle, bundle, component).value;
        this.getOutput(styleBundle, bundle, component);
        return styleBundle;
    }
    async getImports(styleBundle, bundle, component) {
        const entries = Object.entries(component.imports);
        for await (const [tag2, filePath] of entries){
            if (filePath !== component.file) {
                const subcomp = bundle.components.get(filePath);
                if (!subcomp) {
                    this.error(`${component.file}\n\tStyle Use Error while fetching component: component not found.\n\tinput: ${tag2}`);
                } else {
                    styleBundle.mapImports.set(tag2, {
                        name: tag2,
                        tag: tag2
                    });
                    const item = styleBundle.mapImports.get(tag2);
                    if (item) {
                        item.bundle = await this.getNewStyleBundle(subcomp.elements.styles.map((style)=>{
                            if (style.getInnerHTML) {
                                return style.getInnerHTML();
                            }
                        }).join('\n'), bundle, subcomp);
                    }
                }
            }
        }
    }
}
class Style1 extends StyleMemory {
    async read(css, bundle, component) {
        this.trace('getting new style bundle');
        const styleBundle = await this.getNewStyleBundle(css, bundle, component);
        this.mapStyleBundle.set("k" + Math.random(), styleBundle);
        return styleBundle.value;
    }
}
const keyframes = {
    "fade-in-bottom-left": `\n      @-webkit-keyframes fade-in-bottom-left{\n        from{\n            -webkit-opacity: 0;\n            -webkit-transform: translate3d(-100%, 100%, 0);\n        }\n        to{\n            -webkit-opacity: 1;\n            -webkit-transform: translate3d(0, 0, 0);\n        }\n    }\n\n    @keyframes fade-in-bottom-left{\n        from{\n            opacity: 0;\n            transform: translate3d(-100%, 100%, 0);\n        }\n        to{\n            opacity: 1;\n            transform: translate3d(0, 0, 0);\n        }\n    }\n      `,
    "fade-in-bottom-right": `\n      @-webkit-keyframes fade-in-bottom-right{\n        from{\n            -webkit-opacity: 0;\n            -webkit-transform: translate3d(100%, 100%, 0);\n        }\n        to{\n            -webkit-opacity: 1;\n            -webkit-transform: translate3d(0, 0, 0);\n        }\n      }\n\n      @keyframes fade-in-bottom-right{\n          from{\n              opacity: 0;\n              transform: translate3d(100%, 100%, 0);\n          }\n          to{\n              opacity: 1;\n              transform: translate3d(0, 0, 0);\n          }\n      }`,
    "fade-in-down": `\n        @-webkit-keyframes fade-in-down{\n          from{\n              -webkit-opacity: 0;\n              -webkit-transform: translate3d(0, -100%, 0);\n          }\n          to{\n              -webkit-opacity: 1;\n              -webkit-transform: translate3d(0, 0, 0);\n          }\n        }\n\n        @keyframes fade-in-down{\n            from{\n                opacity: 0;\n                transform: translate3d(0, -100%, 0);\n            }\n            to{\n                opacity: 1;\n                transform: translate3d(0, 0, 0);\n            }\n        }`,
    "fade-in-left": `\n          @-webkit-keyframes fade-in-left{\n            from{\n                -webkit-opacity: 0;\n                -webkit-transform: translate3d(-100%, 0, 0);\n            }\n            to{\n                -webkit-opacity: 1;\n                -webkit-transform: translate3d(0, 0, 0);\n            }\n          }\n\n          @keyframes fade-in-left{\n              from{\n                  opacity: 0;\n                  transform: translate3d(-100%, 0, 0);\n              }\n              to{\n                  opacity: 1;\n                  transform: translate3d(0, 0, 0);\n              }\n          }`,
    "fade-in-right": `\n            @-webkit-keyframes fade-in-right{\n              from{\n                  -webkit-opacity: 0;\n                  -webkit-transform: translate3d(100%, 0, 0);\n              }\n              to{\n                  -webkit-opacity: 1;\n                  -webkit-transform: translate3d(0, 0, 0);\n              }\n            }\n\n            @keyframes fade-in-right{\n                from{\n                    opacity: 0;\n                    transform: translate3d(100%, 0, 0);\n                }\n                to{\n                    opacity: 1;\n                    transform: translate3d(0, 0, 0);\n                }\n            }`,
    "fade-in-top-left": `\n            @-webkit-keyframes fade-in-top-left{\n              from{\n                  -webkit-opacity: 0;\n                  -webkit-transform: translate3d(-100%, -100%, 0);\n              }\n              to{\n                  -webkit-opacity: 1;\n                  -webkit-transform: translate3d(0, 0, 0);\n              }\n          }\n\n          @keyframes fade-in-top-left{\n              from{\n                  opacity: 0;\n                  transform: translate3d(-100%, -100%, 0);\n              }\n              to{\n                  opacity: 1;\n                  transform: translate3d(0, 0, 0);\n              }\n          }`,
    "fade-in-top-right": `\n            @-webkit-keyframes fade-in-top-right{\n              from{\n                  -webkit-opacity: 0;\n                  -webkit-transform: translate3d(100%, -100%, 0);\n              }\n              to{\n                  -webkit-opacity: 1;\n                  -webkit-transform: translate3d(0, 0, 0);\n              }\n            }\n\n            @keyframes fade-in-top-right{\n              from{\n                  opacity: 0;\n                  transform: translate3d(100%, -100%, 0);\n              }\n              to{\n                  opacity: 1;\n                  transform: translate3d(0, 0, 0);\n              }\n            }`,
    "fade-in-up": `\n              @-webkit-keyframes fade-in-up{\n                from{\n                    -webkit-opacity: 0;\n                    -webkit-transform: translate3d(0, 100%, 0);\n                }\n                to{\n                    -webkit-opacity: 1;\n                    -webkit-transform: translate3d(0, 0, 0);\n                }\n            }\n\n            @keyframes fade-in-up{\n                from{\n                    opacity: 0;\n                    transform: translate3d(0, 100%, 0);\n                }\n                to{\n                    opacity: 1;\n                    transform: translate3d(0, 0, 0);\n                }\n            }`,
    "fade-in": `\n              @-webkit-keyframes fade-in{\n                from{\n                    -webkit-opacity: 0;\n                }\n                to{\n                    -webkit-opacity: 1;\n                }\n            }\n\n            @keyframes fade-in{\n                from{\n                    opacity: 0;\n                }\n                to{\n                    opacity: 1;\n                }\n            }`,
    "fade-out-bottom-left": `\n              @-webkit-keyframes fade-out-bottom-left{\n                from{\n                    -webkit-opacity: 1;\n                    -webkit-transform: translate3d(0, 0, 0);\n                }\n                to{\n                    -webkit-opacity: 0;\n                    -webkit-transform: translate3d(-100%, 100%, 0);\n                }\n              }\n\n              @keyframes fade-out-bottom-left{\n                  from{\n                      opacity: 1;\n                      transform: translate3d(0, 0, 0);\n                  }\n                  to{\n                      opacity: 0;\n                      transform: translate3d(-100%, 100%, 0);\n                  }\n              }`,
    "fade-out-bottom-right": `\n                @-webkit-keyframes fade-out-bottom-right{\n                  from{\n                      -webkit-opacity: 1;\n                      -webkit-transform: translate3d(0, 0, 0);\n                  }\n                  to{\n                      -webkit-opacity: 0;\n                      -webkit-transform: translate3d(100%, 100%, 0);\n                  }\n                }\n\n                @keyframes fade-out-bottom-right{\n                    from{\n                        opacity: 1;\n                        transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        opacity: 0;\n                        transform: translate3d(100%, 100%, 0);\n                    }\n                }`,
    "fade-bottom-right": `\n                  @-webkit-keyframes fade-out-down{\n                    from{\n                        -webkit-opacity: 1;\n                        -webkit-transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        -webkit-opacity: 0;\n                        -webkit-transform: translate3d(0, 100%, 0);\n                    }\n                }\n\n                @keyframes fade-out-down{\n                    from{\n                        opacity: 1;\n                        transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        opacity: 0;\n                        transform: translate3d(0, 100%, 0);\n                    }\n                }`,
    "fade-out-left": `\n                  @-webkit-keyframes fade-out-left{\n                    from{\n                        -webkit-opacity: 1;\n                        -webkit-transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        -webkit-opacity: 0;\n                        -webkit-transform: translate3d(-100%, 0, 0);\n                    }\n                  }\n\n                  @keyframes fade-out-left{\n                      from{\n                          opacity: 1;\n                          transform: translate3d(0, 0, 0);\n                      }\n                      to{\n                          opacity: 0;\n                          transform: translate3d(-100%, 0, 0);\n                      }\n                  }`,
    "fade-out-right": `\n                  @-webkit-keyframes fade-out-right{\n                    from{\n                        -webkit-opacity: 1;\n                        -webkit-transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        -webkit-opacity: 0;\n                        -webkit-transform: translate3d(100%, 0, 0);\n                    }\n                }\n\n                @keyframes fade-out-right{\n                    from{\n                        opacity: 1;\n                        transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        opacity: 0;\n                        transform: translate3d(100%, 0, 0);\n                    }\n                }`,
    "fade-out-top-left": `\n                  @-webkit-keyframes fade-out-top-left{\n                    from{\n                        -webkit-opacity: 1;\n                        -webkit-transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        -webkit-opacity: 0;\n                        -webkit-transform: translate3d(-100%, -100%, 0);\n                    }\n                }\n\n                @keyframes fade-out-top-left{\n                    from{\n                        opacity: 1;\n                        transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        opacity: 0;\n                        transform: translate3d(-100%, -100%, 0);\n                    }\n                }`
};
class StylesheetBuilder1 extends Utils {
    CSSScoper = new CSSScoper1();
    Style = new Style1();
    async read(bundle) {
        try {
            const entries = Array.from(bundle.components.entries());
            this.trace('start component style analyze');
            for await (const [, component] of entries){
                const { styles  } = component.elements;
                this.trace('start style node analyze');
                for await (const element of styles){
                    let styleContent = element.getInnerHTML ? element.getInnerHTML() : null;
                    const isGlobal = element.attributes.global;
                    if (styleContent) {
                        let compiledCss = "";
                        const src = element.attributes.src ? element.attributes.src.trim() : "";
                        const relativePath = join(component.file, src);
                        const remoteRelativePath = absolute1(component.file, src);
                        const isAbsoluteRemote = [
                            "http",
                            "ws",
                            "https",
                            "ftp"
                        ].includes(src.split("://")[0]);
                        if (src.length && !component.remote) {
                            const p = existsSync(src) ? src : existsSync(relativePath) ? isAbsoluteRemote ? await fetchRemoteRessource(src) : relativePath : null;
                            switch(true && !!p){
                                case !p:
                                    this.error(`style's src attribute is not found. \ncomponent${component.file}\ninput: ${src}`);
                                default:
                                    this.error(`style's src attribute and lang attribute has to be on the same language. \ncomponent${component.file}\ninput: ${src}`);
                            }
                        } else if (src.length && component.remote) {
                            this.warn(`Downloading style: ${isAbsoluteRemote ? src : remoteRelativePath}`);
                            const p = isAbsoluteRemote ? await fetchRemoteRessource(src) : await fetchRemoteRessource(remoteRelativePath);
                            switch(true){
                                case !p:
                                    this.error(`style's src attribute is not reachable. \ncomponent${component.file}\ninput: ${src}`);
                                default:
                                    this.error(`style's src attribute and lang attribute has to be on the same language. \ncomponent${component.file}\ninput: ${src}`);
                            }
                        }
                        this.trace('end style element analyze, start assignment');
                        switch(element.attributes.lang){
                            default:
                                compiledCss = styleContent;
                                break;
                        }
                        if (element.attributes['--keyframes']) {
                            compiledCss = `${compiledCss} \n ${this.readKeyframes(element.attributes['--keyframes'])}`;
                        }
                        this.trace('start component style transformations');
                        compiledCss = await this.Style.read(compiledCss, bundle, component);
                        this.trace('end component style transformations, start mapStyleBundle assignment');
                        component.mapStyleBundle = this.Style.mapStyleBundle;
                        const css = isGlobal ? compiledCss : this.CSSScoper.transform(compiledCss, component.uuid);
                        component.style.push(css);
                    }
                }
            }
        } catch (err) {
            this.error(`StylesheetBuilder: ${err.message}`);
        }
    }
    async transformAllStyleElements(bundle) {
        try {
            const entries = Array.from(bundle.components.entries());
            this.trace('start component style analyze');
            for await (const [, component] of entries){
                const { rootNode  } = component;
                const { nodeList  } = rootNode;
                const { styles  } = component.elements;
                const allStyles = nodeList.filter((el)=>!styles.includes(el) && el.tagName === 'style'
                );
                for await (let element of allStyles){
                    let styleContent = element.getInnerHTML ? element.getInnerHTML() : null;
                    if (styleContent) {
                        let compiledCss = "";
                        const src = element.attributes.src ? element.attributes.src.trim() : "";
                        const relativePath = join(component.file, src);
                        const remoteRelativePath = absolute1(component.file, src);
                        const isAbsoluteRemote = [
                            "http",
                            "ws",
                            "https",
                            "ftp"
                        ].includes(src.split("://")[0]);
                        if (src.length && !component.remote) {
                            const p = existsSync(src) ? src : existsSync(relativePath) ? isAbsoluteRemote ? await fetchRemoteRessource(src) : relativePath : null;
                            switch(true && !!p){
                                case !p:
                                    this.error(`style's src attribute is not found. \ncomponent${component.file}\ninput: ${src}`);
                                default:
                                    this.error(`style's src attribute and lang attribute has to be on the same language. \ncomponent${component.file}\ninput: ${src}`);
                            }
                        } else if (src.length && component.remote) {
                            this.warn(`Downloading style: ${isAbsoluteRemote ? src : remoteRelativePath}`);
                            const p = isAbsoluteRemote ? await fetchRemoteRessource(src) : await fetchRemoteRessource(remoteRelativePath);
                            switch(true){
                                case !p:
                                    this.error(`style's src attribute is not reachable. \ncomponent${component.file}\ninput: ${src}`);
                                default:
                                    this.error(`style's src attribute and lang attribute has to be on the same language. \ncomponent${component.file}\ninput: ${src}`);
                            }
                        }
                        this.trace('end style element analyze, start assignment');
                        switch(element.attributes.lang){
                            default:
                                compiledCss = styleContent;
                                break;
                        }
                        if (element.attributes['--keyframes']) {
                            compiledCss = `${compiledCss} \n ${this.readKeyframes(element.attributes['--keyframes'])}`;
                        }
                        this.trace('start component style transformations');
                        compiledCss = await this.Style.read(compiledCss, bundle, component);
                        element.childNodes[0].rawText = compiledCss;
                    }
                }
            }
        } catch (err) {
            this.error(`StylesheetBuilder: ${err.message}`);
        }
    }
    readKeyframes(keyframesEvaluated) {
        try {
            const fn = new Function('get', `return (${keyframesEvaluated});`);
            const get = (name, opts)=>{
                switch(true){
                    case typeof name !== 'string':
                        this.error('using keyframes fade: argument one has to be a string.');
                        break;
                }
                return `\n        .${name} {\n          animation-name: ${name};\n          animation-duration: ${opts.time || 1}s;\n          animation-iteration-count: ${opts.iteration || 1};\n          animation-fill-mode: ${opts.iteration || 'forwards'};\n          animation-timing-function: ${opts.style || 'linear'};\n        }\n        ${keyframes[name]}\n      `;
            };
            const k = fn(get);
            return Array.isArray(k) ? k.join('\n') : k;
        } catch (err) {
            this.error(`StylesheetBuilder: ${err.message}`);
        }
    }
}
function readDestructuration(destructured, opts) {
    try {
        const { typedExpressions , registry: registry1 ,  } = opts;
        if (!typedExpressions.blocks[destructured]) return null;
        const content = typedExpressions.blocks[destructured];
        const blocks = content.match(/(?<=([\:\=]\s*))\d+_block/gi);
        const propertiesRegExp = /(([\w\d]+)+(?=\s*\}$)|(([\w\d]+)+(?=\s*,))|((?<=([\w\d]+)+\s*\:)([\w\d]+)+)|(([\w\d]+)+(?=\s*\=)))/gi;
        const properties = content.match(propertiesRegExp);
        if (properties) {
            registry1.push(...properties);
        }
        if (blocks) {
            blocks.forEach((block)=>{
                readDestructuration(block, opts);
            });
        }
        return true;
    } catch (err) {
        throw err;
    }
}
function* gen1(i2) {
    yield i2;
    while(true){
        yield i2++;
    }
}
const iterator1 = gen1(0);
const arrayAliasIterator = gen1(0);
iterator1.next().value;
arrayAliasIterator.next().value;
class ForFlagBuilder1 extends Utils {
    startAnalyze(bundle) {
        try {
            const entries = bundle.components.entries();
            for (let [path1, component] of entries){
                this.read(bundle, path1, component.rootNode);
            }
        } catch (err) {
            this.error(`ForFlagBuiler: ${err.message}`);
        }
    }
    read(bundle, keyComponent, node, legacy = {
        limit: 0,
        ctx: {
        },
        script: [],
        getLengthDeclarationAfterArrayEvaluation: "",
        declarationScript: [],
        callbackDeclaration: ""
    }) {
        try {
            const component = bundle.components.get(keyComponent);
            let contextLegacy = {
            };
            if (component && node.attributes) {
                const attrs = Object.keys(node.attributes);
                const keyData = Object.keys(component.data);
                attrs.forEach((key)=>{
                    if (!key.startsWith("--")) return;
                    node.hasFlag = true;
                    keyData.forEach((key2)=>{
                        if (node.attributes[key].indexOf && node.attributes[key].indexOf(key2) > -1 && !node.dependencies.includes(key2)) {
                            node.dependencies.push(key2);
                        }
                    });
                });
            }
            if (node.tagName) {
                if (!node.attributes) {
                    node.attributes = {
                    };
                }
                if (component && node.attributes) {
                    node.attributes[component.uuid] = true;
                }
            }
            if (legacy) {
                contextLegacy = Object.assign(legacy, {
                });
            }
            if (node.attributes["--for"]) {
                const v = node.attributes["--for"];
                const oForFlag = this.getForFlagDescription(v);
                const { item , index , array , destructured  } = oForFlag;
                const arrayAlias = `_____a_${arrayAliasIterator.next().value}`;
                if (legacy.ctx) {
                    if (legacy.ctx[item]) {
                        this.error(`'${item}' is already defined in the template, as item`);
                    }
                    if (legacy.ctx[index]) {
                        this.error(`'${index}' is already defined in the template, as index`);
                    }
                    legacy.ctx[index] = true;
                    legacy.ctx[item] = oForFlag;
                    node.hasFlag = true;
                    const getLengthScript = (opts)=>{
                        if (!opts.filter) {
                            return `\n                  if (GET_LENGTH) {\n                    if (!${arrayAlias}) {\n                      return 0;\n                    }\n                    return ${arrayAlias}.length;\n                  }`;
                        }
                        return this.template(`\n                let {% arrayAlias %}2 = ({% arrayAlias %} || []).filter(({%item%}, {%index%}) => {%filter%});\n                {%item%} = ({% arrayAlias %}2)[{%index%}];\n                if (GET_LENGTH) {\n                  return ({% arrayAlias %}2).length;\n                }`, {
                            item,
                            index,
                            arrayAlias,
                            filter: opts.filter
                        });
                    };
                    legacy.arrayName = array;
                    legacy.getLength = getLengthScript;
                    legacy.item = item;
                    let aliasItem;
                    if (!item.match(/^\w/)) {
                        aliasItem = `alias_${node.id}`;
                        legacy.aliasItem = aliasItem;
                    }
                    legacy.destructured = destructured;
                    if (contextLegacy) {
                        const declarationScript = [
                            `const ${arrayAlias} =\n              !!${array.split(/(?<!\bthis)(\.)/)[0]}\n              && ${array} || [];`,
                            `\n                          let ${index} = POSITION[${contextLegacy.limit}],\n                          ${item} = (${arrayAlias})[${index}];`,
                            aliasItem ? `const ${aliasItem} = (${arrayAlias})[${index}];` : '',
                        ];
                        if (contextLegacy && contextLegacy.declarationScript) {
                            contextLegacy.declarationScript = contextLegacy.declarationScript.concat(declarationScript);
                        }
                    }
                }
            }
            if (node.childNodes?.length) {
                node.childNodes.forEach((el, i2)=>{
                    if (component && component.data && el.nodeType === 3) {
                        const data = el.rawText;
                        Object.keys(component.data).forEach((key)=>{
                            const result = data;
                            if (data && data.indexOf("\${") > -1 && data.indexOf(`${key}`) > -1) {
                                if (!node.dependencies.includes(key)) {
                                    node.dependencies.push(key);
                                }
                            }
                        });
                    }
                    if (contextLegacy) {
                        this.read(bundle, keyComponent, el, {
                            ...contextLegacy,
                            ctx: {
                                ...contextLegacy.ctx
                            },
                            declarationScript: [
                                ...contextLegacy && contextLegacy.declarationScript ? contextLegacy.declarationScript : [],
                            ],
                            callbackDeclaration: "",
                            limit: contextLegacy.limit + 1
                        });
                    }
                });
            }
            if (contextLegacy) {
                const value = `${contextLegacy.declarationScript ? contextLegacy.declarationScript.join("") : ""} `;
                contextLegacy.script = {
                    value,
                    node,
                    item: legacy.item,
                    aliasItem: legacy.aliasItem,
                    destructured: legacy.destructured,
                    ctx: legacy.ctx,
                    level: contextLegacy.limit,
                    getLength: legacy.getLength,
                    array: legacy.arrayName
                };
                if (component && node.id) {
                    component.for[node.id] = contextLegacy;
                }
            }
        } catch (oRenderDOMException) {
            this.error(oRenderDOMException);
        }
    }
    getForFlagDescription(value) {
        try {
            const expressions = {
            };
            const typedExpressions = __default12();
            const flagValue = __default1({
                expressions,
                value,
                typedExpressions,
                array: [
                    ...nullish,
                    ...tokens.filter((el)=>el.name === 'block'
                    ),
                ]
            });
            const itemAndIndexRegExp = /^\((.+?),\s*(\w+?)\)\s+of\s+(.+?)$/gi;
            const itemRegExp = /^(.+?)\s+of\s+(.+?)$/gi;
            let oForRegExp = itemAndIndexRegExp.exec(flagValue.trim());
            const registry1 = [];
            if (oForRegExp) {
                itemAndIndexRegExp.exec(flagValue.trim());
                let [input, item, index, arrayName] = oForRegExp;
                readDestructuration(item, {
                    typedExpressions,
                    registry: registry1
                });
                arrayName = flagValue.split("of")[1].trim();
                return {
                    index: index ? index : `i${iterator1.next().value}`,
                    item: getDeepTranslation1(item, expressions),
                    array: getDeepTranslation1(arrayName, expressions),
                    content: getDeepTranslation1(flagValue, expressions),
                    destructured: registry1
                };
            }
            oForRegExp = itemRegExp.exec(flagValue.trim());
            if (!oForRegExp) {
                throw this.error(`Syntax Error: ${flagValue} \n\tPlease follow this --for syntax. (item [, i]) of array `);
            }
            itemAndIndexRegExp.exec(flagValue.trim());
            let [input, item, arrayName] = oForRegExp;
            readDestructuration(item, {
                typedExpressions,
                registry: registry1
            });
            arrayName = flagValue.split("of")[1].trim();
            return {
                index: `i${iterator1.next().value}`,
                item: getDeepTranslation1(item, expressions),
                array: getDeepTranslation1(arrayName, expressions),
                content: getDeepTranslation1(flagValue, expressions),
                destructured: registry1
            };
        } catch (err) {
            this.error(`ForFlagBuiler: ${err.message}`);
        }
    }
}
const items1 = [
    {
        name: "declarations",
        open: false,
        reg: /(use)\s+(.*?)(\s+as\s+)/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            throw new Error(`use syntax is no more supported, please use a default import instead: import MyComponent from 'path/to/component.o3'\ninput: ${value}`);
        },
        close: false
    },
];
let rid = 0;
const items2 = [
    {
        name: "linkCases",
        open: false,
        reg: /\s*(\*){0,1}execute\s+(\b(default)\b)\s*(;|\n+)/,
        id: (value, match, typedExpressions, expressions)=>{
            if (!expressions || !match) {
                throw new Error("expressions or matches are missing");
            }
            const [inpute, runOnce] = match;
            if (!runOnce) {
                rid++;
                return `_once !== ${rid} ? ____r(0, [], ${rid}) : null; return;`;
            }
            return `____r(0, [], _once || null); return;`;
        },
        close: false
    },
    {
        name: "linkCases",
        open: false,
        reg: /\s*(\*){0,1}execute\s+(case|default)\s*/,
        id: (value, match, typedExpressions, expressions)=>{
            if (!expressions || !match) {
                throw new Error("expressions or matches are missing");
            }
            throw new Error(`\n      the following syntax is not supported\n\n        please one of those syntaxes:\n          execute case 'casename' use [ctx, event];\n          execute case 'casename';\n          execute default;\n        It assumes that cases are strings in proto.\n        It can change in the future, do not hesitate to make a pull request on it.\n      `);
        },
        close: false
    },
];
function getMembers(tokens1) {
    let result = {
        members: [],
        hasDefault: false,
        hasMembers: false,
        hasAllAs: false,
        default: {
            alias: void 0,
            name: ''
        },
        allAs: void 0
    };
    const membersRegExpGI = /\b(.*?)(?:\s+(?:as)\s+(.*?)){0,1}(?:[\}\,])/gi;
    const membersRegExp = /\b(.*?)(?:\s+(?:as)\s+(.*?)){0,1}(?:[\}\,])/i;
    const allAsRegExp = /(\*)\s+(?:as)\s+(.+?)(?:(\,|\s))/i;
    const defaultRegExp = /(.+?)(?=\b)/i;
    let text = tokens1.replace(/\n,/gi, ",").trim();
    text.split(/(?=\{)/gi).filter((p)=>p.indexOf('}') > -1 && p.indexOf('{') > -1
    ).forEach((substring)=>{
        substring.split(/(?:\{)/gi).forEach((part1)=>{
            const content = part1.split('}')[0];
            const m = `${content.trim()},`.match(membersRegExpGI);
            if (m) {
                m.forEach((match)=>{
                    const p = match.match(membersRegExp);
                    if (p) {
                        const [, variable, alias] = p;
                        if (variable) {
                            result.hasMembers = true;
                            result.members.push({
                                name: variable.trim(),
                                alias: alias?.trim()
                            });
                        }
                    }
                });
                text = text.replace(`{${content}}`, '');
            }
        });
    });
    let allAsTokenMatch = `${text} `.match(allAsRegExp);
    while(allAsTokenMatch){
        const [input, asterix, name] = allAsTokenMatch;
        result.allAs = name;
        text = text.replace(input.trim(), '');
        allAsTokenMatch = `${text} `.match(allAsRegExp);
        result.hasAllAs = true;
    }
    const defaultTokenMatch = text.match(defaultRegExp);
    if (defaultTokenMatch) {
        const [input, name] = defaultTokenMatch;
        result.default.name = name;
        text = text.replace(input, '');
        result.hasDefault = true;
    }
    return result;
}
const AllExports = [
    {
        name: "export default",
        open: false,
        reg: /(\bexport\b)\s*(\b(default)\b)(.*?)(§{2}endExpression\d+§{2}|;|\n+)/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const [exp, def1, def2, token] = matches;
            const id = `§§export${__default13.next().value}§§`;
            expressions[id] = value;
            if (typedExpressions) {
                typedExpressions.exports['default'] = {
                    key: id,
                    default: true,
                    defaultName: null,
                    members: [],
                    path: "",
                    member: false,
                    value: getDeepTranslation1(token, expressions),
                    type: "default"
                };
            }
            return '';
        },
        close: false
    },
    {
        name: "export vars",
        open: false,
        reg: /(\bexport\b)\s*(const|let|var)(.*?)((?:\:)(.*?)){0,1}(?:\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+))(.*?)(§{2}endExpression\d+§{2}|;|\n+)/i,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const id = `§§export${__default13.next().value}§§`;
            const [input, exp, constorLet, key, optional, types, val] = matches;
            expressions[id] = value;
            if (typedExpressions) {
                typedExpressions.exports[key] = {
                    key: id,
                    default: false,
                    defaultName: null,
                    name: key.trim(),
                    members: [],
                    path: "",
                    member: true,
                    type: "member",
                    value: val
                };
            }
            return '';
        },
        close: false
    },
    {
        name: "export function",
        open: false,
        reg: /(\bexport\b)\s*(\bfunction\b)(.*?)(\<(?:.*?)\>){0,1}(\d+_parenthese)((?:\:)(.*?)){0,1}(.*?)(§{2}endExpression\d+§{2}|;|\n+)/i,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const id = `§§export${__default13.next().value}§§`;
            const [input, exp, func, key] = matches;
            const [input2, exp2, ...f2] = matches;
            expressions[id] = value;
            if (typedExpressions) {
                typedExpressions.exports[key] = {
                    key: id,
                    default: false,
                    defaultName: null,
                    members: [],
                    name: key.trim(),
                    path: "",
                    member: true,
                    type: "function",
                    value: getDeepTranslation1(f2.join(''), expressions)
                };
            }
            return '';
        },
        close: false
    },
    {
        name: "export class",
        open: false,
        reg: /(\bexport\b)\s+(\bclass\b)(.*?)(\bextends\b(.*?)){0,1}(§{2}block\w*\d+§{2})\s*(?:§{2}endExpression\d+§{2}|;|\n+)/i,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const id = `§§export${__default13.next().value}§§`;
            const [input, exp, cl, key] = matches;
            const [input2, exp2, ...klass] = matches;
            expressions[id] = value;
            if (typedExpressions) {
                typedExpressions.exports[key] = {
                    key: id,
                    default: false,
                    defaultName: null,
                    members: [],
                    name: key.trim(),
                    path: "",
                    member: true,
                    type: "class",
                    value: getDeepTranslation1(klass.join(''), expressions)
                };
            }
            return '';
        },
        close: false
    },
    {
        name: "export * from",
        open: false,
        reg: /\s*(\bexport\b)(.*?)(\bfrom\b)\s*(\d+_string)\s*(?:§{2}endExpression\d+§{2}|;|\n+)/i,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const id = `§§export${__default13.next().value}§§`;
            const [input, imp, key, f, id2] = matches;
            expressions[id] = value;
            if (typedExpressions) {
                const tokens1 = getDeepTranslation1(key, expressions);
                const exportDescription = getMembers(getDeepTranslation1(tokens1, expressions));
                typedExpressions.exports[key] = {
                    key: id,
                    default: false,
                    member: true,
                    members: exportDescription.members,
                    defaultName: exportDescription.default.alias || exportDescription.default.name || null,
                    path: getDeepTranslation1(id2, expressions).replace(/["'`]/gi, ''),
                    type: "all",
                    value: getDeepTranslation1(key, expressions).trim()
                };
            }
            return '';
        },
        close: false
    },
];
const importMeta4 = {
    url: "file:///home/rudy/Documents/Perso/Ogone/utils/esm-imports.ts",
    main: false
};
function getHmrModuleSystem({ variable , registry: registry1 , isDefault , isAllAs , isMember , path: path1  }) {
    let result = getDeepTranslation1(`\n    let $_1 = $_2["$_3"]$_4;\n    $_2['*'].push(["$_3", (m) => {\n      if (!this.activated) return false;\n      $_1 = m$_4;\n      this.runtime('destroy');\n      this.runtime(0);\n      return this.activated;\n    }]);`, {
        $_1: variable,
        $_2: registry1,
        $_3: path1,
        $_4: isDefault ? '.default' : isMember ? `.${variable}` : ''
    });
    return result;
}
const esm = [
    {
        name: "ambient import",
        open: false,
        reg: /\s*(\bimport\b)\s+(\d+_string)\s*(§{2}endExpression\d+§{2}|;|\n+)?/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const id = `§§import${__default13.next().value}§§`;
            const [input, imp, id2] = matches;
            expressions[id] = value;
            if (typedExpressions) {
                const path1 = getDeepTranslation1(id2, expressions).replace(/['"`]/gi, "");
                const type1 = path1.startsWith('.') ? 'relative' : path1.startsWith('@') ? 'absolute' : 'remote';
                typedExpressions.imports[id] = {
                    key: id,
                    uuid: `a${crypto.getRandomValues(new Uint32Array(1)).join('')}`,
                    value,
                    path: path1,
                    type: type1,
                    ambient: true,
                    allAs: false,
                    object: false,
                    default: false,
                    defaultName: null,
                    allAsName: null,
                    getHmrModuleSystem,
                    members: [],
                    static: (namespace)=>{
                        if (type1 === 'remote') return getDeepTranslation1(value, expressions);
                        const result = getDeepTranslation1(value, expressions);
                        return result;
                    },
                    dynamic: (importFn = 'Ogone.imp', namespace = '')=>{
                        if (type1 === 'remote') return `${importFn}('${path1}'),`;
                        const baseUrl = new URL(importMeta4.url);
                        baseUrl.pathname = join(Deno.cwd(), namespace);
                        const newUrl = new URL(path1, baseUrl);
                        return `${importFn}('${path1}', '${newUrl.pathname}'),`;
                    }
                };
            }
            return id;
        },
        close: false
    },
    {
        name: "all imports",
        open: false,
        reg: /(\bimport\b)(\s+component\s+){0,1}(.+?)(\bfrom\b)(.*?)(?=(§{2}endExpression\d+§{2}|;|\n+))/i,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const id = `§§import${__default13.next().value}§§`;
            const [input, imp, isComponent, tokens1, f, str2] = matches;
            expressions[id] = value;
            if (typedExpressions) {
                const importDescription = getMembers(getDeepTranslation1(tokens1, expressions));
                const path1 = getDeepTranslation1(str2, expressions).replace(/['"\s`]/gi, "");
                const type1 = path1.startsWith('.') ? 'relative' : path1.startsWith('@') ? 'absolute' : 'remote';
                typedExpressions.imports[id] = {
                    key: id,
                    type: type1,
                    uuid: `a${crypto.getRandomValues(new Uint32Array(1)).join('')}`,
                    isComponent: !!isComponent,
                    ambient: false,
                    allAs: importDescription.hasAllAs,
                    object: importDescription.hasMembers,
                    default: importDescription.hasDefault,
                    defaultName: importDescription.default.alias || importDescription.default.name || null,
                    allAsName: importDescription.allAs || null,
                    path: path1,
                    static: (namespace)=>{
                        if (type1 === 'remote') return getDeepTranslation1(value, expressions);
                        const result = getDeepTranslation1(value, expressions);
                        return result;
                    },
                    dynamic: (importFn = 'Ogone.imp', namespace = '')=>{
                        if (type1 === 'remote') return `${importFn}('${path1}'),`;
                        const baseUrl = new URL(importMeta4.url);
                        baseUrl.pathname = join(Deno.cwd(), namespace);
                        const newUrl = new URL(path1, baseUrl);
                        return `${importFn}('${path1}', '${newUrl.pathname}'),`;
                    },
                    value: getDeepTranslation1(value, expressions),
                    members: importDescription.members,
                    getHmrModuleSystem
                };
            }
            return !!isComponent ? '' : id;
        },
        close: false
    },
    {
        name: "fallback import",
        open: false,
        reg: /(\bimport\b)(.*?)(\bfrom\b)(.*?)(?=(§{2}endExpression\d+§{2}|;|\n+))/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            throw new Error(`this syntax of import is not supported\ninput:${getDeepTranslation1(value, expressions)}`);
        },
        close: false
    },
    ...AllExports
];
const items3 = [
    {
        name: "declarations",
        open: false,
        reg: /(require)\s+(.+?)(as)/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches || !typedExpressions) {
                throw new Error("expressions or matches are missing");
            }
            throw new SyntaxError(`[Ogone] 0.28.0\n      the require syntax is no more supported,\n      please use the declare or def modifier and add the statement inherit before the name of the property\n        example:\n          <proto>\n            declare:\n              inherit name;\n              inherit myProp: string = 'value';\n              public inherit state: 'normal' | 'activated' = 'normal';\n          </proto>\n      `);
        },
        close: false
    },
];
class AssetsParser1 extends Utils {
    parseUseStatement(value) {
        try {
            const result = {
                value: null,
                body: __default12()
            };
            const expressions = {
            };
            __default1({
                expressions,
                value,
                typedExpressions: result.body,
                array: [
                    ...nullish,
                    ...tokens,
                    ...items1
                ]
            });
            return result;
        } catch (err) {
            this.error(`AssetsParser: ${err.message}`);
        }
    }
    transformLinkStatement(value) {
        try {
            const result = {
                value: null,
                body: __default12()
            };
            const expressions = {
            };
            const newValue = __default1({
                expressions,
                value,
                typedExpressions: result.body,
                array: [
                    ...nullish,
                    ...tokens,
                    ...items2
                ]
            });
            return getDeepTranslation1(newValue, expressions);
        } catch (err) {
            this.error(`AssetsParser: ${err.message}`);
        }
    }
    parseImportStatement(value) {
        try {
            const result = {
                value: null,
                body: __default12()
            };
            const expressions = {
            };
            __default1({
                expressions,
                value,
                typedExpressions: result.body,
                array: [
                    ...nullish,
                    ...tokens,
                    ...esm
                ]
            });
            return result;
        } catch (err) {
            this.error(`AssetsParser: ${err.message}`);
        }
    }
    parseRequireStatement(value) {
        try {
            const result = {
                value: null,
                body: __default12()
            };
            const expressions = {
            };
            __default1({
                expressions,
                value,
                typedExpressions: result.body,
                array: [
                    ...nullish,
                    ...tokens,
                    ...items3
                ]
            });
            return result;
        } catch (err) {
            this.error(`AssetsParser: ${err.message}`);
        }
    }
}
class ImportsAnalyzer1 extends Utils {
    AssetsParser = new AssetsParser1();
    inspect(bundle) {
        try {
            const entries = Array.from(bundle.components.entries());
            for (const [, component] of entries){
                const firstNode = component.rootNode.childNodes.find((node)=>node.nodeType !== 3
                );
                if (firstNode) {
                    const index = component.rootNode.childNodes.indexOf(firstNode);
                    const textNodes = component.rootNode.childNodes.filter((node, id)=>node.nodeType === 3 && id < index
                    );
                    let declarations = ``;
                    textNodes.forEach((node)=>{
                        declarations += node.rawText;
                    });
                    if (declarations.length) {
                        const importBody = this.AssetsParser.parseImportStatement(declarations);
                        if (importBody.body && importBody.body.imports) {
                            const { imports  } = importBody.body;
                            component.deps = Object.values(imports).filter((imp)=>!imp.isComponent
                            );
                            component.dynamicImportsExpressions = Object.entries(imports).filter(([key, imp])=>!imp.path.endsWith('.o3')
                            ).map(([key, imp])=>{
                                const hmrModule = {
                                    registry: 'Ogone.mod',
                                    variable: '',
                                    path: imp.path,
                                    isDefault: false,
                                    isAllAs: false,
                                    isMember: false
                                };
                                if (imp.default) {
                                    hmrModule.variable = imp.defaultName;
                                    hmrModule.isDefault = true;
                                    component.modules.push(imp.getHmrModuleSystem(hmrModule));
                                }
                                if (imp.allAs) {
                                    hmrModule.variable = imp.allAsName;
                                    hmrModule.isAllAs = true;
                                    component.modules.push(imp.getHmrModuleSystem(hmrModule));
                                }
                                if (imp.object) {
                                    hmrModule.isMember = true;
                                    imp.members.forEach((element)=>{
                                        hmrModule.variable = element.alias || element.name;
                                        component.modules.push(imp.getHmrModuleSystem(hmrModule));
                                    });
                                }
                                return imp.dynamic('Ogone.imp', component.file);
                            }).join("\n");
                            component.esmExpressions = Object.entries(imports).map(([key, imp])=>{
                                if (imp.isComponent) return '';
                                return imp.static(component.file);
                            }).join("\n");
                        }
                        if (importBody.body && importBody.body.imports) {
                            Object.values(importBody.body.imports).forEach((item)=>{
                                if (!item.isComponent || !item.path.endsWith('.o3')) return;
                                const pathComponent = bundle.repository[component.uuid][item.path];
                                const tagName = item.defaultName;
                                switch(true){
                                    case !tagName:
                                        this.error(`this Ogone version only supports default exports.\n                      input: import component ... from ${item.path}\n                      component: ${component.file}\n                    `);
                                    case tagName === "proto":
                                        this.error(`proto is a reserved tagname, don\'t use it as selector of your component.\n                      input: import component ${item.defaultName} from ${item.path}\n                      component: ${component.file}\n                    `);
                                    case !tagName.match(/^([A-Z])((\w+))+$/):
                                        this.error(`'${tagName}' is not a valid component name. Must be PascalCase. please use the following syntax:\n\n                      import component YourComponentName from '${item.path}'\n\n                      input: import component ${item.defaultName} from ${item.path}\n                      component: ${component.file}\n\n                      note: if the component is typed you must provide the name into the tagName\n                    `);
                                    case !!component.imports[tagName]:
                                        this.error(`component name already in use. please use the following syntax:\n\n                      import component ${tagName}2 from '${item.path}'\nimport { ImportDescription } from '../';\n\n                      input: import component ${item.defaultName} from ${item.path}\n                      component: ${component.file}\n                    `);
                                    default:
                                        component.imports[tagName] = pathComponent;
                                        break;
                                }
                            });
                        }
                        textNodes.forEach((node)=>{
                            node.rawText = "";
                        });
                        component.requirements = this.AssetsParser.parseRequireStatement(declarations).body.properties;
                    }
                }
            }
        } catch (err) {
            this.error(`ImportsAnalyzer: ${err.message}`);
        }
    }
}
class ComponentsSubscriber1 extends Utils {
    AssetsParser = new AssetsParser1();
    async startRecursiveInspectionOfComponent(textFile, p, bundle, opts = {
        remote: false,
        baseUrl: "",
        current: "",
        item: null
    }) {
        try {
            const splitTextUseFirstPart = textFile.split(/\<([a-zA-Z0-9]*)+/i)[0];
            const tokens1 = this.AssetsParser.parseImportStatement(splitTextUseFirstPart);
            if (opts && opts.remote) {
                bundle.remotes.push({
                    file: textFile,
                    base: opts.base,
                    path: opts.current,
                    item: opts.item,
                    parent: opts.parent
                });
            } else {
                bundle.files.push({
                    path: p,
                    file: textFile,
                    item: opts.item,
                    parent: opts.parent
                });
            }
            if (tokens1.body && tokens1.body.imports) {
                for await (let item of Object.values(tokens1.body.imports)){
                    const { path: inputPath , type: type1 , isComponent  } = item;
                    if (!isComponent) return;
                    const path1 = inputPath.replace(/^@\//, '');
                    if (path1 === p) {
                        if (opts.recursive) {
                            continue;
                        }
                        await this.startRecursiveInspectionOfComponent(textFile, path1, bundle, {
                            item,
                            parent: path1,
                            recursive: true
                        });
                        continue;
                    }
                    if (type1 === "remote") {
                        this.warn("Downloading", path1);
                        const file = await fetchRemoteRessource(path1);
                        if (file) {
                            await this.startRecursiveInspectionOfComponent(file, path1, bundle, {
                                remote: true,
                                base: path1.match(/(http|https|ws|wss|ftp|tcp|fttp)(\:\/{2}[^\/]+)/gi)[0],
                                current: path1,
                                item,
                                parent: p
                            });
                        } else {
                            this.error(`unreachable remote component.\t\t\ninput: ${path1}`);
                        }
                    } else if (type1 === "absolute" && existsSync(path1)) {
                        if (Deno.build.os !== "windows") {
                            Deno.chmodSync(path1, 511);
                        }
                        const file = Deno.readTextFileSync(path1);
                        await this.startRecursiveInspectionOfComponent(file, path1, bundle, {
                            item,
                            parent: p
                        });
                    } else if (opts.remote && type1 === "relative" && opts.base) {
                        const newPath = `${opts.current.split("://")[0]}://${absolute1(opts.current.split("://")[1], path1)}`;
                        this.warn(`Downloading ${newPath}`);
                        const file = await fetchRemoteRessource(newPath);
                        if (file) {
                            await this.startRecursiveInspectionOfComponent(file, newPath, bundle, {
                                ...opts,
                                item,
                                current: newPath,
                                parent: p
                            });
                        } else {
                            this.error(`unreachable remote component.\t\t\ninput: ${newPath}`);
                        }
                    } else if (!opts.remote && type1 === "relative") {
                        const newPath = absolute1(p, path1);
                        if (existsSync(newPath)) {
                            if (Deno.build.os !== "windows") {
                                Deno.chmodSync(newPath, 511);
                            }
                            const file = Deno.readTextFileSync(newPath);
                            await this.startRecursiveInspectionOfComponent(file, newPath, bundle, {
                                item,
                                parent: p
                            });
                        } else {
                            this.error(`component not found. input: ${path1}`);
                        }
                    } else {
                        this.error(`component not found. input: ${path1}`);
                    }
                }
            }
        } catch (err) {
            this.error(`ComponentSubscriber: ${err.message}`);
        }
    }
    async inspect(entrypoint, bundle) {
        try {
            if (existsSync(entrypoint)) {
                if (Deno.build.os !== "windows") {
                    Deno.chmodSync(entrypoint, 511);
                }
                const rootComponentFile = Deno.readTextFileSync(entrypoint);
                await this.startRecursiveInspectionOfComponent(rootComponentFile, entrypoint, bundle, {
                    item: {
                        path: entrypoint
                    },
                    parent: entrypoint
                });
            } else {
                this.error(`entrypoint file doesn't exist \n\t${entrypoint}`);
            }
        } catch (err) {
            this.error(`ComponentSubscriber: ${err.message}`);
        }
    }
}
class XMLJSXOutputBuilder extends Utils {
    flags = [
        "--click",
        "--mouseenter",
        "--mouseover",
        "--mousemove",
        "--mousedown",
        "--mouseup",
        "--mouseleave",
        "--mouseout",
        "--dblclick",
        "--resize",
        "--drag",
        "--dragend",
        "--dragstart",
        "--input",
        "--change",
        "--blur",
        "--focus",
        "--focusin",
        "--focusout",
        "--select",
        "--keydown",
        "--keyup",
        "--keypress",
        "--submit",
        "--reset",
        "--touchcancel",
        "--touchmove",
        "--touchend",
        "--touchenter",
        "--touchstart",
        "--wheel",
    ];
    renderPragma({ bundle , component , isOgone , node , props , nId , getNodeCreations , isImported , idComponent , nodeIsDynamic , isRoot , setAttributes , nodesPragma , params , flags , query , appending , isTemplate , isAsyncNode , isRemote  }) {
        try {
            const subcomp = isImported ? bundle.components.get(component.imports[node.tagName]) : null;
            const start = isRoot ? this.template(`\n      (function({%params%}) {\n          let p = pos.slice();\n          let o = null;\n`, {
                params
            }) : "";
            const end = isRoot ? this.template(`\n          return {%nId%};\n          });\n          `, {
                nId
            }) : "";
            let nodeSuperCreation = "";
            if (isRoot) {
                const idList = [];
                getNodeCreations(idList);
                const constants = idList.map(([k, v])=>`${k} = ${v}`
                );
                nodeSuperCreation = `const ${constants};`;
            }
            const reuseStatement = component.context.reuse;
            return this.template(`\n              {% start %}\n              {% nodeSuperCreation %}\n              {% setAwait %}\n              {% setOgone.isOgone %}\n              {% setNodeAwait %}\n              at({% nId %},'${idComponent}', '');\n              {% setAttributes %}\n              {% nodesPragma %}\n              {% storeRender %}\n              {% recycleWebcomponent %}\n              {%end%}`, {
                nId,
                end,
                start,
                idComponent,
                nodeSuperCreation,
                isAsyncNode,
                isImported,
                isRemote,
                component,
                subcomp,
                isTemplate: isTemplate || !!isImported && !!subcomp,
                isAsync: !!isImported && !!subcomp && subcomp.type === "async",
                isRouter: !!isImported && !!subcomp && subcomp.type === "router",
                isStore: !!isImported && !!subcomp && subcomp.type === "store",
                recycleWebcomponent: isRoot && reuseStatement ? `\n          Ogone.recycleWebComponent({% nId %}, {\n            id: '${idComponent}',\n            name: '${reuseStatement.split(':')[0]}',\n            extends: '${reuseStatement.split(':')[1]}',\n            component: ctx,\n            isSync: ${component.context.engine.includes(ComponentEngine.TemplateSyncWithWebcomponent)},\n          });\n          ` : '',
                setAwait: node.attributes && node.attributes.await ? `at({%nId%},'await', '');` : "",
                setNodeAwait: isOgone && node.attributes && node.attributes.nodeAwait && !isRoot ? `ctx.promises.push(new Promise((rs) => {\n            ${''}\n            {%nId%}.connectedCallback();\n            for(let n of {%nId%}.ogone.nodes) {\n              n.addEventListener('load', () => {\n                rs();\n              });\n            }\n          }));` : "",
                setAttributes: !(nodeIsDynamic && !isRoot && !isImported) ? setAttributes : "",
                storeRender: !!isImported && !!subcomp && subcomp.type === "store" ? '{%nId%}.connectedCallback();' : '',
                nodesPragma: nodesPragma.length ? `l++; ${nodesPragma}  l--; ${appending}` : "",
                setOgone: {
                    isOgone: isOgone ? `\n            o = {\n              isRoot: false,\n              originalNode: true,\n              {%setOgone.tagname%}\n              {%setOgone.tree%}\n              {%setOgone.positionLevelIndex%}\n              {%setOgone.inheritedCTX%}\n              {%setOgone.flags%},\n              isTemplate: {% isTemplate %},\n              isAsync: {% isAsync %},\n              isRouter: {% isRouter %},\n              isStore: {% isStore %},\n              isAsyncNode: {% isAsyncNode %},\n              isImported: {% isImported %},\n              isRemote: {% isRemote %},\n              extends: '{% setOgone.extends %}',\n              uuid: '{% component.uuid %}',\n              {%setOgone.positionInParentComponent%}\n              {% setOgone.nodeProps %}\n            };\n              Ogone.setOgone({%nId%}, o); o = null;` : "",
                    inheritedCTX: isImported && subcomp ? "" : "component: ctx,",
                    flags: `flags: ${flags}`,
                    tagname: isImported ? `name: "${node.tagName}",` : "",
                    tree: isImported || nodeIsDynamic ? `tree: "${query}",` : "",
                    extends: isTemplate || isImported ? `-nt` : `-${node.id}`,
                    positionLevelIndex: !isImported ? "position: p, level: l, index: i," : "",
                    positionInParentComponent: isImported && subcomp ? `positionInParentComponent: p, levelInParentComponent: l, parentComponent: ctx, parentCTXId: '${idComponent}-${node.id}', props: (${JSON.stringify(props)}),\n            uuid: '${subcomp.uuid}',\n            routes: ${JSON.stringify(subcomp.routes)},\n            namespace: '${subcomp.namespace ? subcomp.namespace : ""}',\n            requirements: (${subcomp && subcomp.requirements ? JSON.stringify(subcomp.requirements) : null}),\n            dependencies: ${JSON.stringify(node.dependencies)},` : "",
                    nodeProps: props.length && !isTemplate && !isImported && !isRoot ? `nodeProps: (${JSON.stringify(props)}),` : ''
                }
            });
        } catch (err) {
            this.error(`XMLJSXOutputBuilder: ${err.message}`);
        }
    }
    setNodesPragma(expressions) {
        try {
            const nodes = Object.values(expressions).reverse();
            let pragma = null;
            for (let node of nodes){
                if (node.tagName === 'head') {
                    continue;
                }
                const params = "ctx, pos = [], i = 0, l = 0, ap = (p,n) => {p.append(n);}, h = (...a) => document.createElement(...a), at = (n,a,b) => n.setAttribute(a,b)";
                if (node.nodeType === 1 && node.tagName !== "style") {
                    const nodeIsDynamic = !!Object.keys(node.attributes).find((attr)=>attr.startsWith(":") || attr.startsWith("--") || attr.startsWith("@") || attr.startsWith("&") || attr.startsWith("_")
                    );
                    const nId = `n${nodeIsDynamic ? "d" : ""}${node.id}`;
                    node.id = nId;
                    let setAttributes = Object.entries(node.attributes).filter(([key, value])=>!(key.startsWith(":") || key.startsWith("--") || key.startsWith("@") || key.startsWith("&") || key.startsWith("o-") || key.startsWith("_"))
                    ).map(([key, value])=>key !== "ref" ? `at(${nId},'${key}', '${value}');` : `ctx.refs['${value}'] = ${nId};`
                    ).join("");
                    pragma = (bundle, component, isRoot)=>{
                        let identifier = [];
                        const idComponent = component.uuid;
                        const imports = Object.keys(component.imports);
                        const isImported = imports.includes(node.tagName || "");
                        const isTemplate = node.tagName === null;
                        const isRouter = isTemplate && component.type === "router";
                        const isStore = isTemplate && component.type === "store";
                        const isAsync = isTemplate && component.type === "async";
                        const isRemote = !!component.remote;
                        let nodesPragma = node.childNodes.filter((child)=>child.pragma
                        ).map((child, i2, arr)=>{
                            return child.pragma ? child.pragma(bundle, component, false).value : "";
                        }).join("");
                        let appending = node.childNodes.filter((child)=>child.pragma && child.pragma(bundle, component, false).id
                        ).map((child)=>child.pragma ? `ap(${nId},${child.pragma(bundle, component, false).id});` : ""
                        ).join("\n");
                        let extensionId = "";
                        if (isImported && component.imports[node.tagName]) {
                            const newcomponent = bundle.components.get(component.imports[node.tagName]);
                            if (newcomponent) extensionId = newcomponent.uuid;
                        }
                        const props = Object.entries(node.attributes).filter(([key])=>key.startsWith(":")
                        ).map(([key, value])=>{
                            return [
                                key.replace(/^\:/, ""),
                                value
                            ];
                        });
                        let nodeCreation = `const ${nId} = h('${node.tagName}');`;
                        identifier[0] = `${nId}`;
                        identifier[1] = `h('${node.tagName}')`;
                        if (nodeIsDynamic && !isImported && !isRoot) {
                            identifier[1] = `h("${idComponent}-${node.id}")`;
                        } else if (isImported) {
                            identifier[1] = `h('template', { is: '${extensionId}-nt'})`;
                        }
                        nodeCreation = `const ${nId} = ${identifier[1]};`;
                        const flags = this.parseFlags(node, {
                            nodeIsDynamic,
                            isImported
                        });
                        let query = node.tagName;
                        if (nodeIsDynamic || isImported) {
                            let parentN = node.parentNode;
                            while(parentN){
                                query += `<${parentN.tagName}`;
                                parentN = parentN.parentNode;
                            }
                            query = query?.split("<").reverse().join(">");
                        }
                        const isOgone = isImported || nodeIsDynamic && !isImported && !isRoot;
                        const opts = {
                            bundle,
                            component,
                            query,
                            props,
                            flags,
                            params,
                            nodeCreation,
                            isOgone,
                            node,
                            nId,
                            getNodeCreations (idList) {
                                idList.push(identifier);
                                node.childNodes.filter((child)=>child.pragma
                                ).map((child)=>{
                                    if (child.pragma) {
                                        const id = child.pragma(bundle, component, false);
                                        if (id.getNodeCreations) {
                                            id.getNodeCreations(idList);
                                        }
                                    }
                                });
                            },
                            isImported,
                            idComponent,
                            nodeIsDynamic,
                            isRoot,
                            setAttributes,
                            nodesPragma,
                            appending,
                            isTemplate,
                            isAsync,
                            isRouter,
                            isStore,
                            isAsyncNode: !isTemplate && !isImported && !!node.flags && !!node.flags.await,
                            isRemote
                        };
                        if (isRoot) {
                            return this.renderPragma(opts);
                        }
                        return {
                            id: nId,
                            identifier,
                            getNodeCreations (idList) {
                                idList.push(identifier);
                                node.childNodes.filter((child)=>child.pragma
                                ).map((child)=>{
                                    if (child.pragma) {
                                        const id = child.pragma(bundle, component, false);
                                        if (id.getNodeCreations) {
                                            id.getNodeCreations(idList);
                                        }
                                    }
                                });
                            },
                            value: this.renderPragma(opts)
                        };
                    };
                }
                if (node.nodeType === 3) {
                    const nId = `t${node.id}`;
                    node.id = nId;
                    pragma = (bundle, component, isRoot)=>{
                        const idComponent = component.uuid;
                        const isEvaluated = node.rawText.indexOf("${") > -1;
                        const saveText = isEvaluated ? `\n                  const {%getContextConstant%} = Ogone.contexts['{%contextId%}'] ? Ogone.contexts['{%contextId%}'].bind(ctx.data) : null; /* getContext function */\n                  const {%textConstant%} = '{%evaluatedString%}';\n                  const p{%textConstant%} = p.slice();\n                  /*removes txt position and root position*/\n                  p{%textConstant%}[l-2]=i;\n                  ctx.texts.push((k) => {\n                    if ({% dependencies %} typeof k === 'string' && {%textConstant%}.indexOf(k) < 0) return true;\n                    if (!{%getContextConstant%}) return false;\n                    const v = {%getContextConstant%}({\n                      getText: {%textConstant%},\n                      position: p{%textConstant%},\n                    });\n                    if ({%nId%}.data !== v && v) {%nId%}.data = v.length ? v : ' ';\n                    return true\n                  });\n                ` : "";
                        if (!isEvaluated) {
                            return {
                                id: nId,
                                getNodeCreations: (idList)=>idList.push([
                                        nId,
                                        `\`${node.rawText.replace(/\n/gi, " ").trim()}\``
                                    ])
                                ,
                                value: " /**/"
                            };
                        }
                        return {
                            id: nId,
                            getNodeCreations: (idList)=>idList.push([
                                    nId,
                                    `new Text('${isEvaluated ? " " : node.rawText}')`
                                ])
                            ,
                            value: this.template(`\n                  {%saveText%}`, {
                                nId,
                                saveText,
                                contextId: `${idComponent}-${node.id}`,
                                getContextConstant: `g${nId}`,
                                textConstant: `t${nId}`,
                                dependencies: node.parentNode && node.parentNode.dependencies.length ? `!${JSON.stringify(node.parentNode?.dependencies)}.includes(k) && ` : "",
                                evaluatedString: `\`${node.rawText.replace(/\n/gi, " ").replace(/\\/gi, "\\\\").replace(/\'/gi, "\\'").trim()}\``
                            })
                        };
                    };
                }
                node.pragma = pragma;
            }
        } catch (err) {
            this.error(`XMLJSXOutputBuilder: ${err.message}`);
        }
    }
    parseFlags(node, opts) {
        try {
            let result = {
                if: "",
                then: "",
                defer: "",
                await: "",
                style: "",
                class: "",
                html: "",
                catch: "",
                events: [],
                elseIf: "",
                finally: "",
                spread: "",
                else: false
            };
            const { nodeIsDynamic , isImported  } = opts;
            if (nodeIsDynamic || isImported) {
                const { attributes  } = node;
                const keys = Object.keys(attributes);
                for (let key of keys){
                    for (let flag of this.flags){
                        switch(true){
                            case key.startsWith(flag) && !key.match(/(\-){2}(\w+\:)([^\s]*)+/):
                                throw this.getSyntaxEventException(flag);
                            case key.startsWith(flag):
                                const m = key.match(/(\-){2}(\w+\:)([^\s]*)+/);
                                if (m) {
                                    const [input, t, ev, caseName] = m;
                                    const infos = {
                                        type: flag.slice(2),
                                        case: `${ev}${caseName}`,
                                        filter: null,
                                        target: null
                                    };
                                    if (flag.startsWith("--key")) {
                                        infos.target = "document";
                                    }
                                    if (node.attributes[key] !== true) {
                                        infos.filter = node.attributes[key];
                                    }
                                    result.events.push(infos);
                                }
                                break;
                        }
                    }
                }
                for (let key1 of keys){
                    switch(true){
                        case key1 === "--router-go":
                            result.events.push({
                                type: "click",
                                name: "router-go",
                                eval: attributes[key1]
                            });
                            break;
                        case key1 === "--router-dev-tool":
                            result.events.push({
                                type: "click",
                                name: "router-dev-tool",
                                eval: attributes[key1]
                            });
                            break;
                        case key1.startsWith("--event:") && key1.split(':').length === 3:
                            const name = key1.slice(2);
                            const tokens1 = key1.split(':');
                            result.events.push({
                                name: "event",
                                type: tokens1[1],
                                case: name,
                                eval: tokens1[2]
                            });
                            node.hasFlag = true;
                            break;
                        case key1 === "--class":
                            result.class = `${attributes[key1]}`;
                            node.hasFlag = true;
                            break;
                        case key1 === "--style":
                            result.style = `${attributes[key1]}`;
                            node.hasFlag = true;
                            break;
                        case key1 === "--if":
                            result.if = `${attributes[key1]}`;
                            node.hasFlag = true;
                            break;
                        case key1 === "--else":
                            result.else = true;
                            node.hasFlag = true;
                            break;
                        case key1 === "--else-if":
                            result.elseIf = `${attributes[key1]}`;
                            node.hasFlag = true;
                            break;
                        case key1 === "--html":
                            result.html = `${attributes[key1]}`;
                            node.hasFlag = true;
                            break;
                        case key1 === "--await":
                            result.await = attributes[key1] === true ? true : `${attributes[key1]}`;
                            if (isImported) {
                                node.attributes.await = true;
                            } else if (!node.attributes.nodeAwait) {
                                node.attributes.nodeAwait = true;
                            }
                            node.hasFlag = true;
                            break;
                        case key1 === "--defer":
                            result.defer = `${attributes[key1]}`;
                            node.hasFlag = true;
                            break;
                        case key1 === "--spread":
                            result.spread = `${attributes[key1]}`;
                            node.hasFlag = true;
                            break;
                        case key1.startsWith("--then:"):
                            result.then = key1.slice(2);
                            node.hasFlag = true;
                            break;
                        case key1.startsWith("--catch:"):
                            result.catch = key1.slice(2);
                            node.hasFlag = true;
                            break;
                        case key1.startsWith("--finally:"):
                            result.finally = key1.slice(2);
                            node.hasFlag = true;
                            break;
                        case key1 === "--bind":
                            result.bind = attributes[key1];
                            node.hasFlag = true;
                    }
                }
                node.hasFlag = true;
                node.flags = result;
                return JSON.stringify(result);
            }
            return null;
        } catch (err) {
            this.error(`XMLJSXOutputBuilder: ${err.message}`);
        }
    }
    getSyntaxEventException(event) {
        try {
            return this.error(`wrong syntax of ${event} event. it should be: ${event}:case`, {
                returns: true
            });
        } catch (err) {
            this.error(`XMLJSXOutputBuilder: ${err.message}`);
        }
    }
}
const openComment = "<!--";
const closeComment = "-->";
function savePosition1(node, opts) {
    return MapPosition.mapNodes.set(node, opts);
}
function translateAll(str2, expressions) {
    return getDeepTranslation1(str2, expressions, (key)=>expressions[key].expression
    );
}
class XMLParser1 extends XMLJSXOutputBuilder {
    textMarginStart = 0;
    textMarginEnd = 0;
    originalHTML = '';
    ForFlagBuilder = new ForFlagBuilder1();
    getUniquekey(id = "", iterator) {
        iterator.value++;
        return `§§${iterator.value}${id}§§`;
    }
    getNodeUniquekey(id = "", iterator) {
        iterator.node++;
        return `§§${iterator.node}${id}§§`;
    }
    getTextUniquekey(id = "", iterator) {
        iterator.text++;
        return `§§${iterator.text}${id}§§`;
    }
    saveNode(text, opts) {
        const { expressions , node , value , margin  } = opts;
        const { key  } = node;
        const exp = expressions;
        if (!translateAll(value, expressions).trim().length || text.indexOf(key) < 0) return;
        const file = translateAll(text, expressions);
        const part1 = translateAll(text.slice(0, text.indexOf(key, margin)), expressions);
        const start = translateAll(part1, expressions).length;
        const end = translateAll(value, expressions).length + start;
        return savePosition1(node, {
            start,
            end,
            column: MapPosition.getColumn(file, {
                start,
                end
            }, margin),
            line: MapPosition.getLine(file, {
                start,
                end
            }, margin)
        });
    }
    setInnerOuterHTML(rootnode, expressions) {
        const { nodeList  } = rootnode;
        nodeList.forEach((node)=>{
            node.getOuterTSX = (component)=>{
                if (node.nodeType === 1) {
                    let templateOuterTSX = `\n<{%tagname%} {%attrs%}>\n{%outers%}\n</{%tagname%}>`;
                    if (node.attributes['--for']) {
                        const value = node.attributes['--for'];
                        const flagDescript = this.ForFlagBuilder.getForFlagDescription(value);
                        const { array , item , index  } = flagDescript;
                        templateOuterTSX = `{\n              ${array}\n            .map((\n              ${item},\n              ${index}: number\n            ) =>\n              ${templateOuterTSX}\n            )}`;
                    }
                    let result = this.template(templateOuterTSX, {
                        outers: node.childNodes.map((c)=>{
                            if (c.getOuterTSX) {
                                return c.getOuterTSX(component);
                            } else {
                                return "";
                            }
                        }).join(""),
                        tagname: node.tagName,
                        attrs: Object.entries(node.attributes).map(([key, value])=>{
                            if (key === component.uuid) return '';
                            if (key === '--spread') {
                                return `\n{${value}}`;
                            }
                            if (key.match(/^(\-){2}/)) {
                                return '';
                            }
                            if (value === true) {
                                return `\n${key} `;
                            }
                            if (key.startsWith(`:`)) {
                                return `\n${key.slice(1)}={${value}} `;
                            }
                            return `\n${key}="${value}"`;
                        }).join(' ')
                    });
                    return getDeepTranslation1(result, expressions);
                }
                const value = node.rawText?.replace(/\</gi, "&lt;").replace(/\>/gi, "&rt;");
                return getDeepTranslation1(`\n${value}\n` || "", expressions);
            };
            node.getOuterHTML = ()=>{
                if (node.nodeType === 1) {
                    let result = this.template(`<{%tagname%} {%attrs%}>{%outers%}</{%tagname%}>`, {
                        outers: node.childNodes.map((c)=>{
                            if (c.getOuterHTML) {
                                return c.getOuterHTML();
                            } else {
                                return "";
                            }
                        }).join(""),
                        tagname: node.tagName,
                        attrs: node.rawAttrs
                    });
                    return getDeepTranslation1(result, expressions, (key)=>expressions[key].expression
                    );
                }
                return getDeepTranslation1(node.rawText || "", expressions, (key)=>expressions[key].expression
                );
            };
            node.getInnerHTML = ()=>{
                if (node.nodeType === 1) {
                    let result = this.template("{%outers%}", {
                        outers: node.childNodes.map((c)=>{
                            if (c.getOuterHTML) {
                                return c.getOuterHTML();
                            } else {
                                return "";
                            }
                        }).join("")
                    });
                    return getDeepTranslation1(result, expressions, (key)=>expressions[key].expression
                    );
                }
                return getDeepTranslation1(node.rawText || "", expressions);
            };
        });
    }
    setDNA(rootnode, node, expressions) {
        if (rootnode !== node) {
            rootnode.nodeList.push(node);
        }
        if (!node.dna) {
            node.dna = "";
        }
        if (node.tagName) {
            node.dna += node.tagName;
            rootnode.dna += node.tagName;
            if (node.parentNode) node.parentNode.dna += node.tagName;
        }
        if (node.rawAttrs) {
            node.dna += node.rawAttrs;
            rootnode.dna += node.rawAttrs;
            if (node.parentNode) node.parentNode.dna += node.rawAttrs;
        }
        if (node.rawText) {
            node.dna += node.rawText;
            rootnode.dna += node.rawText;
            if (node.parentNode) node.parentNode.dna += node.rawText;
        }
        node.dna = getDeepTranslation1(node.dna, expressions, (key)=>expressions[key].expression
        );
        if (node.childNodes && node.childNodes.length) {
            node.childNodes.forEach((child, i2, arr)=>{
                this.setDNA(rootnode, child, expressions);
            });
        }
    }
    setElementSiblings(node) {
        if (node.childNodes && node.childNodes.length) {
            node.childNodes.forEach((child, i2, arr)=>{
                if (arr[i2 - 1]) {
                    child.previousElementSibling = arr[i2 - 1];
                } else {
                    child.previousElementSibling = null;
                }
                if (arr[i2 + 1]) {
                    child.nextElementSibling = arr[i2 + 1];
                } else {
                    child.nextElementSibling = null;
                }
                this.setElementSiblings(child);
            });
        }
    }
    getRootnode(html, expressions) {
        const keysOfExp = Object.keys(expressions);
        const key = keysOfExp.find((key1)=>html.indexOf(key1) > -1
        );
        if (key) {
            let result = expressions[key];
            result.type = "root";
            delete result.id;
            return result;
        } else {
            return null;
        }
    }
    parseNodes(html, expressions, componentPath) {
        let result = html;
        Object.entries(expressions).filter(([key, value])=>value.type === "node"
        ).forEach(([key, value])=>{
            const { expression , rawAttrs  } = value;
            let attrs = `${rawAttrs}`.split(/[\s\n\r]/).filter((s)=>s.trim().length
            );
            attrs.forEach((attr)=>{
                const attrIDRE = /([^\s]*)+(§{2}\d*attr§§)/;
                if (attr.endsWith('attr§§')) {
                    const m = attr.match(attrIDRE);
                    if (m && expressions[m[2]]) {
                        let [input, attributeName, id] = m;
                        const { value: value1 , expression: expression1 , isTSX , isAttrSpreadTSX  } = expressions[id];
                        let attributeFormatted = isTSX && !attributeName.startsWith('--') ? `:${attributeName}` : attributeName;
                        if (isAttrSpreadTSX && expressions[key].attributes[attributeFormatted]) {
                            let textError = null;
                            const position = MapPosition.mapNodes.get(expressions[key]);
                            let column = 0, line = 0;
                            if (position) {
                                const file = translateAll(html, expressions);
                                column = MapPosition.getColumn(file, position, this.textMarginStart);
                                line = MapPosition.getLine(file, position, this.textMarginStart);
                                textError = file.slice(position.start, position.end);
                            }
                            this.error(`${componentPath}:${line}:${column}\n                Cannot spread multiple time on the same element:\n                  input: ${textError || expression1?.slice(1)}`);
                        }
                        expressions[key].attributes[attributeFormatted] = value1;
                    }
                } else if (expressions[key] && !expressions[key].attributes[attr.trim()]) {
                    expressions[key].attributes[attr.trim()] = true;
                }
            });
        });
        const keysOfExp = Object.keys(expressions);
        Object.entries(expressions).reverse().filter(([key, value])=>value.type === "node"
        ).forEach(([key, node])=>{
            const opening = node.key;
            const { closingTag  } = node;
            const open = result.split(opening);
            open.filter((content)=>closingTag && content.indexOf(closingTag) > -1
            ).forEach((content)=>{
                let innerHTML = content.split(closingTag)[0];
                const outerContent = `${opening}${innerHTML}${closingTag}`;
                keysOfExp.filter((k)=>innerHTML.indexOf(k) > -1 && expressions[k]
                ).sort((a, b)=>innerHTML.indexOf(a) - innerHTML.indexOf(b)
                ).forEach((k)=>{
                    expressions[key].childNodes.push(expressions[k]);
                    expressions[k].parentNode = expressions[key];
                });
                keysOfExp.filter((k)=>node.rawAttrs.indexOf(k) > -1 && expressions[k].type === "attr"
                ).forEach((k)=>{
                    node.rawAttrs = node.rawAttrs.replace(k, expressions[k].expression);
                });
                result = result.replace(outerContent, opening);
                delete expressions[key].closingTag;
                delete expressions[key].key;
                delete expressions[key].autoclosing;
                delete expressions[key].closing;
                delete expressions[key].expression;
            });
        });
        return result;
    }
    parseTextNodes(html, expression, iterator) {
        let result = html;
        const regexp = /(\<)§§\d+node§§(\>)/;
        const textnodes = result.split(regexp);
        textnodes.filter((content)=>content.trim().length
        ).forEach((content)=>{
            const key = this.getTextUniquekey("text", iterator);
            expression[key] = {
                type: "text",
                key,
                value: content,
                expression: content,
                id: iterator.text,
                nodeType: 3,
                rawAttrs: "",
                rawText: "",
                childNodes: [],
                parentNode: null,
                pragma: null,
                tagName: undefined,
                attributes: {
                },
                flags: null,
                dependencies: []
            };
            result = result.replace(`>${content}<`, `>${key}<`);
            this.saveNode(result, {
                margin: this.textMarginStart,
                value: content,
                expressions: expression,
                node: expression[key]
            });
        });
        return result;
    }
    preserveNodes(html, expression, iterator) {
        let result = html;
        const regexp = /<(\/){0,1}([a-zA-Z][^>\s]*)([^\>]*)+(\/){0,1}>/gi;
        const matches = result.match(regexp);
        matches?.forEach((node)=>{
            const regexpID = /<(\/){0,1}([a-zA-Z][^>\s\/]*)([^\>\/]*)+(\/){0,1}>/;
            const id = node.match(regexpID);
            if (id) {
                let [input, slash, tagName, attrs, closingSlash] = id;
                attrs = this.parseTSXSpreadAndAddSpreadFlag(attrs, expression, iterator);
                const key = `<${this.getNodeUniquekey("node", iterator)}>`;
                if (!!slash) {
                    const tag2 = Object.values(expression).reverse().find((n)=>n.type === "node" && (n.tagName && n.tagName.trim() === tagName.trim()) && (n.id && n.id < iterator.node) && n.closingTag === null && !n.closing && !n.autoclosing
                    );
                    if (tag2 && expression[tag2.key || ""]) {
                        expression[tag2.key].closingTag = key;
                        expression[key] = {
                            key,
                            tagName,
                            id: iterator.node,
                            rawAttrs: attrs,
                            attributes: {
                            },
                            closing: !!slash,
                            autoclosing: !!closingSlash,
                            type: "node",
                            nodeType: 30,
                            closingTag: null,
                            expression: input,
                            childNodes: [],
                            rawText: "",
                            parentNode: null,
                            pragma: null,
                            flags: null,
                            dependencies: []
                        };
                    }
                } else {
                    expression[key] = {
                        key,
                        tagName,
                        id: iterator.node,
                        rawAttrs: attrs,
                        attributes: {
                        },
                        closing: !!slash,
                        autoclosing: !!closingSlash,
                        type: "node",
                        nodeType: 1,
                        closingTag: null,
                        expression: input,
                        childNodes: [],
                        rawText: "",
                        parentNode: null,
                        pragma: null,
                        flags: null,
                        dependencies: []
                    };
                }
                result = result.replace(input, key);
                this.saveNode(result, {
                    margin: this.textMarginStart,
                    value: input,
                    expressions: expression,
                    node: expression[key]
                });
            }
        });
        return result;
    }
    preserveTemplates(html, expression, iterator) {
        let result = html;
        const templates = [
            "${",
            "}"
        ];
        const [beginTemplate, traillingTemplate] = templates;
        result.split(/[^\\](\$\{)/).filter((content, id, arr)=>content.indexOf("}") > -1 && arr[id - 1] === beginTemplate
        ).forEach((content)=>{
            let str2 = content.split(/(?<!\\)(\})/gi)[0];
            const allTemplate = `${beginTemplate}${str2}${traillingTemplate}`;
            const key = this.getUniquekey("templ", iterator);
            expression[key] = {
                key,
                expression: allTemplate,
                value: str2,
                type: "template",
                rawText: "",
                rawAttrs: "",
                tagName: null,
                childNodes: [],
                pragma: null,
                parentNode: null,
                id: null,
                nodeType: 1,
                attributes: {
                },
                flags: null,
                dependencies: []
            };
            result = result.replace(allTemplate, key);
            this.saveNode(result, {
                margin: this.textMarginStart,
                value: str2,
                expressions: expression,
                node: expression[key]
            });
        });
        return result;
    }
    preserveStrings(html, expression, iterator) {
        let result = html;
        result.split(/((?<!\\)`)/).filter((content)=>content !== "`"
        ).forEach((content)=>{
            let str2 = content.split(/((?<!\\)`)/);
            str2.forEach((contentOfStr)=>{
                const allLit = `\`${contentOfStr}\``;
                if (result.indexOf(allLit) < 0) return;
                const key = this.getUniquekey("str", iterator);
                expression[key] = {
                    key,
                    expression: allLit,
                    value: contentOfStr,
                    type: "string",
                    rawAttrs: "",
                    rawText: "",
                    childNodes: [],
                    parentNode: null,
                    pragma: null,
                    id: null,
                    tagName: undefined,
                    nodeType: 0,
                    attributes: {
                    },
                    dependencies: [],
                    flags: null
                };
                result = result.replace(allLit, key);
                this.saveNode(result, {
                    margin: this.textMarginStart,
                    value: allLit,
                    expressions: expression,
                    node: expression[key]
                });
            });
        });
        return result;
    }
    preserveStringsAttrs(html, expression, iterator) {
        let result = html;
        const regEmptyStr = /\=\"\"/gi;
        const quotes = [
            '="',
            '"'
        ];
        const [beginQuote, closinQuote] = quotes;
        const matchesEmpty = result.match(regEmptyStr);
        matchesEmpty?.forEach((match)=>{
            const key = this.getUniquekey("attr", iterator);
            result = result.replace(match, key);
            expression[key] = {
                key,
                expression: match,
                value: match,
                type: "attr",
                rawAttrs: "",
                rawText: "",
                childNodes: [],
                parentNode: null,
                pragma: null,
                id: null,
                nodeType: 0,
                tagName: undefined,
                attributes: {
                },
                dependencies: [],
                flags: null
            };
            this.saveNode(result, {
                margin: this.textMarginStart,
                value: match,
                expressions: expression,
                node: expression[key]
            });
        });
        result.split(beginQuote).filter((content)=>/[^\\](")/.test(content)
        ).forEach((content)=>{
            let str2 = content.split(/(?<!\\)(")/gi)[0];
            const allstring = `${beginQuote}${str2}${closinQuote}`;
            const key = this.getUniquekey("attr", iterator);
            expression[key] = {
                key,
                expression: allstring,
                value: str2,
                type: "attr",
                rawAttrs: "",
                rawText: "",
                childNodes: [],
                parentNode: null,
                pragma: null,
                id: null,
                tagName: undefined,
                nodeType: 0,
                attributes: {
                },
                dependencies: [],
                flags: null
            };
            result = result.replace(allstring, key);
            this.saveNode(result, {
                margin: this.textMarginStart,
                value: allstring,
                expressions: expression,
                node: expression[key]
            });
        });
        return result;
    }
    preserveComments(html, expression, iterator) {
        let result = html;
        result.split(openComment).filter((open)=>open.indexOf(closeComment) > -1
        ).forEach((open)=>{
            let comment = open.split(closeComment)[0];
            let key = this.getUniquekey("com", iterator);
            const allComment = `${openComment}${comment}${closeComment}`;
            result = result.replace(allComment, "");
            expression[key] = {
                expression: allComment,
                value: comment,
                nodeType: 8,
                type: "comment",
                rawAttrs: "",
                rawText: "",
                childNodes: [],
                parentNode: null,
                pragma: null,
                id: null,
                tagName: undefined,
                attributes: {
                },
                dependencies: [],
                flags: null
            };
        });
        return result;
    }
    cleanNodes(expressions) {
        for (let key of Object.keys(expressions)){
            delete expressions[key].type;
        }
        const nodes = Object.values(expressions);
        for (let node of nodes){
            if (node.nodeType === 3) {
                const { value  } = node;
                let rawText = value;
                rawText = getDeepTranslation1(rawText, expressions, (key1)=>expressions[key1].expression
                );
                node.rawText = rawText;
            }
        }
    }
    preserveBlocks(str, globalExpressions, typedExpressions) {
        let result = __default1({
            value: str,
            array: nullish.filter((item)=>item.name !== 'comment'
            ).concat(tokens),
            expressions: globalExpressions,
            typedExpressions
        });
        return result;
    }
    parseTSXSpreadAndAddSpreadFlag(text, expression, iterator) {
        let result = text;
        const attrSpreadTSXBlockRegExp = /(?<=\s)(\d+_block)\b/gi;
        const attrTSXBlockRegExp = /(?<=\=)\d+_block\b/gi;
        const expressions = {
        };
        const typedExpressions = __default12();
        result = __default1({
            name: 'block',
            value: result,
            array: tokens,
            expressions,
            typedExpressions
        });
        result = result.replace(attrSpreadTSXBlockRegExp, '--spread=$1');
        let match = result.match(attrTSXBlockRegExp);
        if (match) {
            match.forEach((value)=>{
                const allblock = getDeepTranslation1(value, expressions);
                if (!allblock.match(/^\{\s*\.{3}/)) {
                    return;
                }
                const key = this.getUniquekey("attr", iterator);
                expression[key] = {
                    key,
                    expression: `=${allblock}`,
                    value: allblock.slice(1, -1),
                    type: "attr",
                    rawAttrs: "",
                    rawText: "",
                    childNodes: [],
                    parentNode: null,
                    pragma: null,
                    id: null,
                    tagName: undefined,
                    nodeType: 0,
                    isTSX: true,
                    isAttrSpreadTSX: true,
                    attributes: {
                    },
                    dependencies: [],
                    flags: null
                };
                result = result.replace(`=${value}`, key);
                this.saveNode(text, {
                    margin: this.textMarginStart,
                    value: allblock,
                    expressions: expression,
                    node: expression[key]
                });
            });
        }
        return result;
    }
    preserveBlocksAttrs(html, globalExpressions, expression, iterator) {
        let result = html;
        const attrTSXBlockRegExp = /(?<=\=)\d+_block\b/gi;
        let match = html.match(attrTSXBlockRegExp);
        if (match) {
            match.forEach((value)=>{
                const allblock = getDeepTranslation1(value, globalExpressions);
                const key = this.getUniquekey("attr", iterator);
                expression[key] = {
                    key,
                    expression: `=${allblock}`,
                    value: allblock.slice(1, -1),
                    type: "attr",
                    rawAttrs: "",
                    rawText: "",
                    childNodes: [],
                    parentNode: null,
                    pragma: null,
                    id: null,
                    tagName: undefined,
                    nodeType: 0,
                    isTSX: true,
                    attributes: {
                    },
                    dependencies: [],
                    flags: null
                };
                result = result.replace(`=${value}`, key);
                this.saveNode(result, {
                    margin: this.textMarginStart,
                    value,
                    expressions: expression,
                    node: expression[key]
                });
            });
        }
        return result;
    }
    parse(componentPath, html) {
        let expressions = {
        };
        let globalExpressions = {
        };
        const typedExpressions = __default12();
        let iterator2 = {
            value: 0,
            node: 0,
            text: 0
        };
        const start = '<template>';
        const end = '</template>';
        let str2 = this.template(`{% start %}{% html %}{% end %}`, {
            html,
            start,
            end
        });
        this.originalHTML = html;
        this.textMarginStart = start.length;
        this.textMarginEnd = end.length;
        str2 = this.preserveComments(str2, expressions, iterator2);
        str2 = this.preserveBlocks(str2, globalExpressions, typedExpressions);
        str2 = this.preserveBlocksAttrs(str2, globalExpressions, expressions, iterator2);
        str2 = getDeepTranslation1(str2, globalExpressions);
        str2 = this.preserveStringsAttrs(str2, expressions, iterator2);
        str2 = this.preserveStrings(str2, expressions, iterator2);
        str2 = this.preserveTemplates(str2, expressions, iterator2);
        str2 = this.preserveNodes(str2, expressions, iterator2);
        str2 = this.parseTextNodes(str2, expressions, iterator2);
        str2 = this.parseNodes(str2, expressions, componentPath);
        const rootNode = this.getRootnode(str2, expressions);
        if (rootNode) {
            let result = rootNode;
            result.id = "t";
            result.nodeList = [];
            this.cleanNodes(expressions);
            this.setNodesPragma(expressions);
            this.setElementSiblings(result);
            this.setDNA(result, result, expressions);
            result.dna = translateAll(result.dna, expressions);
            this.setInnerOuterHTML(result, expressions);
            result.tagName = null;
            return result;
        } else {
            return null;
        }
    }
}
class ComponentBuilder1 extends Utils {
    XMLParser = new XMLParser1();
    getComponent(opts) {
        try {
            const template2 = opts.rootNode.childNodes.find((n)=>n.nodeType === 1 && n.tagName === "template"
            );
            const head = template2 && template2.childNodes.find((n)=>n.nodeType === 1 && n.tagName === "head"
            );
            const protos = opts.rootNode.childNodes.filter((n)=>n.nodeType === 1 && n.tagName === "proto"
            );
            return {
                uuid: `data-${crypto.getRandomValues(new Uint32Array(1)).join('')}`,
                isTyped: false,
                dynamicImportsExpressions: "",
                esmExpressions: "",
                exportsExpressions: "",
                data: {
                },
                style: [],
                scripts: {
                    runtime: "function run(){};"
                },
                imports: {
                },
                deps: [],
                flags: [],
                for: {
                },
                refs: {
                },
                reactive: {
                },
                protocol: null,
                routes: null,
                namespace: null,
                modules: [],
                type: "component",
                requirements: null,
                hasStore: false,
                ...opts,
                mapStyleBundle: undefined,
                elements: {
                    styles: opts.rootNode.childNodes.filter((n)=>n.nodeType === 1 && n.tagName === "style"
                    ),
                    template: template2,
                    proto: protos,
                    head
                },
                context: {
                    data: '',
                    props: '',
                    protocol: '',
                    protocolClass: '',
                    reuse: template2?.attributes?.is || null,
                    engine: protos[0] && protos[0].attributes.engine ? protos[0].attributes.engine.split(' ') : []
                },
                modifiers: {
                    beforeEach: '',
                    compute: '',
                    cases: [],
                    default: '',
                    build: ''
                }
            };
        } catch (err) {
            this.error(`ComponentBuilder: ${err.message}`);
        }
    }
    read(bundle) {
        try {
            bundle.files.forEach((local, i2)=>{
                const { path: path1 , file  } = local;
                const index = path1;
                const overwrite = Array.from(MapFile.files).find((item)=>item[0].endsWith(path1)
                );
                const rootNode = this.XMLParser.parse(path1, overwrite ? overwrite[1].content : file);
                if (rootNode) {
                    const component = this.getComponent({
                        rootNode,
                        file: path1,
                        remote: null
                    });
                    bundle.components.set(path1, component);
                    bundle.repository[component.uuid] = {
                    };
                }
            });
            bundle.remotes.forEach((remote, i2)=>{
                const { path: path1 , file  } = remote;
                const index = path1;
                const rootNode = this.XMLParser.parse(path1, file);
                if (rootNode) {
                    const component = this.getComponent({
                        remote,
                        rootNode,
                        file: path1
                    });
                    bundle.components.set(path1, component);
                    bundle.repository[component.uuid] = {
                    };
                }
            });
            bundle.files.concat(bundle.remotes).forEach((localOrRemote)=>{
                if (localOrRemote.item) {
                    const parent = bundle.components.get(localOrRemote.parent);
                    if (parent) {
                        bundle.repository[parent.uuid] = bundle.repository[parent.uuid] || {
                        };
                        bundle.repository[parent.uuid][localOrRemote.item.path] = localOrRemote.path;
                    }
                }
            });
        } catch (err) {
            this.error(`ComponentBuilder: ${err.message}`);
        }
    }
}
class Constructor extends Utils {
    StoreArgumentReader = new StoreArgumentReader1();
    ComponentTypeGetter = new ComponentTypeGetter1();
    ProtocolDataProvider = new ProtocolDataProvider1();
    ComponentTopLevelAnalyzer = new ComponentTopLevelAnalyzer1();
    ComponentCompiler = new ComponentCompiler1();
    SwitchContextBuilder = new SwitchContextBuilder1();
    NodeAnalyzerCompiler = new NodeAnalyzerCompiler1();
    StylesheetBuilder = new StylesheetBuilder1();
    ForFlagBuilder = new ForFlagBuilder1();
    ImportsAnalyzer = new ImportsAnalyzer1();
    ComponentsSubscriber = new ComponentsSubscriber1();
    ComponentBuilder = new ComponentBuilder1();
    async getBundle(entrypoint) {
        try {
            const bundle = {
                uuid: `b${crypto.getRandomValues(new Uint32Array(10)).join('')}`,
                output: '',
                files: [],
                components: new Map(),
                mapRender: new Map(),
                mapClasses: new Map(),
                mapContexts: new Map(),
                remotes: [],
                repository: {
                },
                types: {
                    component: true,
                    app: true,
                    store: false,
                    async: false,
                    router: false,
                    controller: false
                }
            };
            this.trace('Bundle created');
            await this.ComponentsSubscriber.inspect(entrypoint, bundle);
            this.trace('Subscriptions done');
            await this.ComponentBuilder.read(bundle);
            this.trace('Components created');
            await MapOutput.startSavingComponentsOutput(bundle);
            this.trace('MapOuput: start saving components output');
            this.ComponentTypeGetter.setTypeOfComponents(bundle);
            this.trace('Components Protocol\'s Type Setting');
            await this.StylesheetBuilder.transformAllStyleElements(bundle);
            this.trace('Style Sheet transformation of all style elements done');
            this.ComponentTypeGetter.setApplication(bundle);
            this.trace('App Component switched to component type and Configuration.head is defined if the head was provided');
            await this.ImportsAnalyzer.inspect(bundle);
            this.trace('Imports Checking');
            await this.ComponentTopLevelAnalyzer.switchRootNodeToTemplateNode(bundle);
            this.trace('Root Node changed to the template node');
            this.ForFlagBuilder.startAnalyze(bundle);
            this.trace('Contexts analyzes done');
            await this.SwitchContextBuilder.startAnalyze(bundle);
            this.trace('Switch block context created');
            await this.ProtocolDataProvider.read(bundle);
            this.trace('Component\'s data provided');
            this.ComponentTypeGetter.assignTypeConfguration(bundle);
            this.trace('Last Component configurations');
            this.StoreArgumentReader.read(bundle);
            this.trace('Store Components analyze done');
            await this.StylesheetBuilder.read(bundle);
            this.trace('Style Sheet done');
            await this.ComponentTopLevelAnalyzer.cleanRoot(bundle);
            this.trace('Component\'s Top level cleaned');
            await this.ComponentCompiler.startAnalyze(bundle);
            this.trace('Compilation done.');
            await this.NodeAnalyzerCompiler.startAnalyze(bundle);
            this.trace('Node Analyzer done.');
            await MapOutput.getOutputs(bundle);
            return bundle;
        } catch (err) {
            this.error(`Constructor: ${err.message}`);
        }
    }
}
class Env extends Constructor {
    bundle = null;
    env = "development";
    static _env = "development";
    TSXContextCreator = new TSXContextCreator1();
    constructor(){
        super();
        this.devtool = Configuration.devtool;
        Env._devtool = Configuration.devtool;
    }
    setBundle(bundle) {
        this.bundle = bundle;
    }
    setDevTool(hasdevtool) {
        this.devtool = hasdevtool && this.env !== "production";
    }
    setEnv(env) {
        this.env = env;
        Env._env = env;
    }
    async compile(entrypoint, shouldBundle) {
        try {
            const bundle = await this.getBundle(entrypoint);
            this.sendComponentsToLSP(bundle);
            if (shouldBundle) {
                this.setBundle(bundle);
                return bundle;
            }
            return bundle;
        } catch (err) {
            this.error(`Env: ${err.message}`);
        }
    }
    sendComponentsToLSP(bundle) {
        try {
            const components1 = Array.from(bundle.components.entries()).map(([p, c])=>c
            );
            components1.forEach((component)=>{
                const lightComponent = {
                    file: component.file,
                    imports: component.imports,
                    context: component.context,
                    modifiers: component.modifiers,
                    uuid: component.uuid,
                    isTyped: component.isTyped,
                    requirements: component.requirements
                };
                OgoneWorkers.lspWebsocketClientWorker.postMessage({
                    type: Workers.LSP_SEND_COMPONENT_INFORMATIONS,
                    component: lightComponent
                });
            });
        } catch (err) {
            this.error(`Env: ${err.message}`);
        }
    }
    listenLSPWebsocket() {
        try {
            let timeoutBeforeSendingRequests;
            if (Deno.args.includes(Flags.DESIGNER)) {
                Configuration.OgoneDesignerOpened = true;
                OgoneWorkers.lspWebsocketClientWorker.postMessage({
                    type: Workers.LSP_OPEN_WEBVIEW
                });
            }
            OgoneWorkers.lspWebsocketClientWorker.addEventListener('message', (event)=>{
                if (timeoutBeforeSendingRequests !== undefined) {
                    clearTimeout(timeoutBeforeSendingRequests);
                }
                timeoutBeforeSendingRequests = setTimeout(()=>{
                    const { data  } = event;
                    switch(data.type){
                        case Workers.LSP_UPDATE_CURRENT_COMPONENT:
                            const filePath = data.data.path;
                            const file = this.template(BoilerPlate.ROOT_COMPONENT_PREVENT_COMPONENT_TYPE_ERROR, {
                                filePath: filePath.replace(Deno.cwd(), '@')
                            });
                            MapFile.files.set(filePath, {
                                content: data.data.text,
                                original: Deno.readTextFileSync(data.data.path),
                                path: data.data.path
                            });
                            const tmpFile = Deno.makeTempFileSync({
                                prefix: 'ogone_boilerplate_webview',
                                suffix: '.o3'
                            });
                            Deno.writeTextFileSync(tmpFile, file);
                            this.compile(tmpFile).then(async (bundle)=>{
                                const application = this.renderBundle(tmpFile, bundle);
                                OgoneWorkers.serviceDev.postMessage({
                                    type: Workers.LSP_UPDATE_SERVER_COMPONENT,
                                    application
                                });
                                OgoneWorkers.lspWebsocketClientWorker.postMessage({
                                    type: Workers.LSP_CURRENT_COMPONENT_RENDERED,
                                    application
                                });
                                await this.TSXContextCreator.read(bundle, {
                                    checkOnly: filePath.replace(Deno.cwd(), '')
                                });
                            }).then(()=>{
                                Deno.remove(tmpFile);
                            }).catch(()=>{
                                Deno.remove(tmpFile);
                            });
                            break;
                    }
                }, 50);
            });
        } catch (err) {
            this.error(`Env: ${err.message}`);
        }
    }
    renderBundle(entrypoint, bundle) {
        try {
            const stylesDev = Array.from(bundle.components.entries()).map((entry)=>{
                let result = "";
                if (entry[1].style.join("\n").trim().length) {
                    result = `<style id="${entry[1].uuid}">${entry[1].style.join("\n")}</style>`;
                }
                return result;
            }).join("\n");
            const esm1 = Array.from(bundle.components.entries()).map((entry)=>entry[1].dynamicImportsExpressions
            ).join("\n");
            const style = stylesDev;
            const rootComponent = bundle.components.get(entrypoint);
            const runtime = browserBuild(this.env === "production", {
                hasDevtool: this.devtool
            });
            if (rootComponent) {
                if (rootComponent && [
                    "router",
                    "store",
                    "async"
                ].includes(rootComponent.type)) {
                    this.error(`the component provided in the entrypoint option has type: ${rootComponent.type}, entrypoint option only supports basic component`);
                }
                const scriptDev = this.template(`\n        const ___perfData = window.performance.timing;\n\n        ${runtime.ogone}\n        ${runtime.router}\n        ${runtime.devTool}\n        ${bundle.output}\n        ${runtime.components}\n          {% promise %}\n        `, {
                    promise: esm1.trim().length ? `\n            Promise.all([\n              ${esm1}\n            ]).then(() => {\n              {% start %}\n              {% debugg %}\n            });\n          ` : "{%start%}",
                    start: `document.body.append(\n            document.createElement("template", {\n              is: "${rootComponent.uuid}-nt",\n            })\n          );`,
                    render: {
                    },
                    root: bundle.components.get(entrypoint),
                    destroy: {
                    },
                    nodes: {
                    },
                    debugg: `\n          // debug tools\n          const ___connectTime = ___perfData.responseEnd - ___perfData.requestStart;\n          const ___renderTime = ___perfData.domLoading - ___perfData.domComplete;\n          const ___pageLoadTime = ___perfData.navigationStart - ___perfData.loadEventEnd;\n          console.log('[Ogone] server response', ___connectTime, 'ms');\n          console.log('[Ogone] app render time', ___renderTime, 'ms');\n          console.log('[Ogone] page load time', ___pageLoadTime, 'ms');`
                });
                const DOMDev = ` `;
                let script = `\n      <script type="module">\n        ${scriptDev.trim()}\n      </script>`;
                let head = `\n          ${stylesDev}\n          ${Configuration.head || ""}`;
                let body = this.template(template1, {
                    head,
                    script,
                    dom: DOMDev
                });
                return body;
            } else {
                return "no root-component found";
            }
        } catch (err) {
            this.error(`Env: ${err.message}`);
        }
    }
    get application() {
        try {
            if (!this.bundle) {
                throw this.error("undefined bundle, please use setBundle method before accessing to the application");
            }
            return this.renderBundle(Configuration.entrypoint, this.bundle);
        } catch (err) {
            this.error(`Env: ${err.message}`);
        }
    }
    async resolveAndReadText(path) {
        try {
            const isFile = path.startsWith("/") || path.startsWith("./") || path.startsWith("../") || !path.startsWith("http://") || !path.startsWith("https://");
            const isTsFile = isFile && path.endsWith(".ts");
            if (Deno.build.os !== "windows") {
                Deno.chmodSync(path, 511);
            }
            const text = Deno.readTextFileSync(path);
            return isTsFile ? (await Deno.transpileOnly({
                [path]: text
            }, {
                sourceMap: false
            }))[path].source : text;
        } catch (err) {
            this.error(`Env: ${err.message}`);
        }
    }
    recursiveRead(opts) {
        try {
            if (!existsSync(opts.entrypoint)) {
                this.error("can't find entrypoint for this.recursiveRead");
            }
            if (Deno.build.os !== "windows") {
                Deno.chmodSync(opts.entrypoint, 511);
            }
            const stats = Deno.statSync(opts.entrypoint);
            if (stats.isFile) {
                if (Deno.build.os !== "windows") {
                    Deno.chmodSync(opts.entrypoint, 511);
                }
                const content = Deno.readTextFileSync(opts.entrypoint);
                opts.onContent(opts.entrypoint, content);
            } else if (stats.isDirectory) {
                if (Deno.build.os !== "windows") {
                    Deno.chmodSync(opts.entrypoint, 511);
                }
                const dir = Deno.readDirSync(opts.entrypoint);
                for (let p of dir){
                    const path2 = join(opts.entrypoint, p.name);
                    this.recursiveRead({
                        entrypoint: path2,
                        onContent: opts.onContent
                    });
                }
            }
        } catch (err) {
            this.error(`Env: ${err.message}`);
        }
    }
    async getBuild() {
        this.error(`\nbuild is not yet ready.\nwaiting for a fix on the ts compiler\nplease check this issue: https://github.com/denoland/deno/issues/7054`);
    }
}
const Env1 = Env;
const Env2 = Env;
class EnvServer extends Env {
    contributorMessage = __default;
    run(opts) {
        try {
            if (!opts) {
                this.error("run method is expecting for 1 argument, got 0.");
            }
            Configuration.setConfig(opts);
            Ogone2.main = `${Deno.cwd()}${Configuration.entrypoint}`;
            if (Deno.args.includes(Flags.RELEASE)) {
                Object.entries(this.contributorMessage).map(([version, message3])=>this.message(`[${version}] ${message3}`)
                );
            }
            if (opts.build) {
                if (!existsSync(opts.build)) {
                    Deno.mkdirSync(opts.build);
                }
                if (Deno.build.os !== "windows") {
                    Deno.chmodSync(opts.build, 511);
                }
                const stats = Deno.statSync(opts.build);
                if (stats.isFile) {
                    this.error(`build: build destination should be a directory. \n\tinput: ${opts.build}`);
                }
                this.setEnv("production");
                this.setDevTool(false);
                this.compile(Configuration.entrypoint, true).then(async ()=>{
                    const b = await this.getBuild();
                }).then(()=>{
                    this.infos('Love Ogone\'s project ? Join the discord here: https://discord.gg/gCnGzh2wMc');
                });
            } else {
                this.setDevTool(Configuration.devtool);
                this.listenLSPWebsocket();
                this.compile(Configuration.entrypoint, true).then(()=>{
                    this.startDevelopment();
                }).then(()=>{
                    this.infos('Love Ogone\'s project ? Join the discord here: https://discord.gg/gCnGzh2wMc');
                });
            }
        } catch (err) {
            this.error(`Ogone: ${err.message}`);
        }
    }
    async startDevelopment() {
        try {
            OgoneWorkers.serviceDev.postMessage({
                type: Workers.INIT_MESSAGE_SERVICE_DEV,
                application: this.application,
                controllers: Ogone2.controllers,
                Configuration: {
                    ...Configuration
                }
            });
            OgoneWorkers.serviceDev.addEventListener('message', async (event)=>{
                switch(event.data.type){
                    case Workers.SERVICE_DEV_READY:
                        if (this.bundle) {
                            await this.TSXContextCreator.read(this.bundle);
                        }
                        break;
                    case Workers.SERVICE_DEV_GET_PORT:
                        OgoneWorkers.lspWebsocketClientWorker.postMessage({
                            type: Workers.LSP_SEND_PORT,
                            port: event.data.port
                        });
                        break;
                }
            });
        } catch (err) {
            this.error(`EnvServer: ${err.message}`);
        }
    }
}
class OgoneBase extends EnvServer {
    static stores = {
    };
    static clients = [];
    static render = {
    };
    static contexts = {
    };
    static components = {
    };
    static classes = {
    };
    static errorPanel = null;
    static warnPanel = null;
    static successPanel = null;
    static infosPanel = null;
    static errors = 0;
    static firstErrorPerf = null;
    static mod = {
        '*': []
    };
    static instances = {
    };
    static files = [];
    static directories = [];
    static controllers = {
    };
    static main = "";
    static allowedTypes = [
        "app",
        "router",
        "store",
        "controller",
        "async",
        "component",
    ];
}
class OgoneError extends OgoneBase {
    static displayError(message, errorType, errorObject) {
        if (!OgoneError.errorPanel) {
            const p = document.createElement("div");
            Object.entries({
                zIndex: "5000000",
                background: "#00000097",
                width: "100vw",
                height: "100vh",
                position: "fixed",
                top: "0px",
                left: "0px",
                overflowY: "auto",
                justifyContent: "center",
                display: "grid",
                flexDirection: "column"
            }).forEach(([key, value])=>{
                p.style[key] = value;
            });
            OgoneError.errorPanel = p;
        }
        OgoneError.errors++;
        const err = document.createElement("div");
        Object.entries({
            zIndex: "5000000",
            background: "#000000",
            minHeight: "fit-content",
            maxWidth: "70%",
            padding: "21px",
            color: "red",
            borderLeft: "3px solid red",
            margin: "auto",
            display: "inline-flex",
            flexDirection: "column"
        }).forEach(([key, value])=>err.style[key] = value
        );
        const errorId = OgoneError.errors;
        const code = document.createElement("code");
        const stack = document.createElement("code");
        const h = document.createElement("h4");
        h.innerText = `[Ogone] Error ${errorId}: ${errorType || "Undefined Type"}`;
        code.innerText = `${message.trim()}`;
        stack.innerText = `${errorObject && errorObject.stack ? errorObject.stack.replace(message, "") : ""}`;
        if (!stack.innerText.length && errorObject && errorObject.message) {
            stack.innerText = `${errorObject && errorObject.message ? errorObject.message : ""}`;
        }
        !stack.innerText.length ? stack.innerText = "undefined stack" : "";
        code.style.marginLeft = "20px";
        code.style.whiteSpace = "pre-wrap";
        code.style.wordBreak = "break-word";
        stack.style.marginLeft = "20px";
        stack.style.color = "#dc7373";
        stack.style.padding = "17px";
        stack.style.background = "#462626";
        stack.style.whiteSpace = "pre-wrap";
        stack.style.wordBreak = "break-word";
        stack.style.border = "1px solid";
        stack.style.marginTop = "10px";
        h.style.color = "#8c8c8c";
        if (!OgoneError.firstErrorPerf) {
            OgoneError.firstErrorPerf = performance.now();
        }
        if (OgoneError.errorPanel) {
            OgoneError.errorPanel.style.paddingTop = "30px";
            err.style.gridArea = `e${errorId}`;
            const m = 2;
            let grid = "";
            let i2 = 0;
            let a = 0;
            for(i2 = 0, a = OgoneError.errorPanel.childNodes.length + 1; i2 < a; i2++){
                grid += `e${i2 + 1} `;
            }
            let b = i2;
            while(i2 % 2){
                grid += `e${b} `;
                i2++;
            }
            const cells = grid.split(" ");
            var o, j, temparray, chunk = 2;
            let newgrid = "";
            for(o = 0, j = cells.length - 1; o < j; o += chunk){
                temparray = cells.slice(o, o + chunk);
                newgrid += ` "${temparray.join(" ")}"`;
            }
            OgoneError.errorPanel.style.gridGap = "10px";
            OgoneError.errorPanel.style.gridAutoRows = "max-content";
            OgoneError.errorPanel.style.gridTemplateRows = "masonry";
            OgoneError.errorPanel.style.gridTemplateAreas = newgrid;
            err.style.animationName = "popup";
            err.style.animationIterationCount = "1";
            err.style.animationDuration = "0.5s";
            err.append(h, code, stack);
            OgoneError.errorPanel.append(err);
            OgoneError.errorPanel.style.pointerEvents = "scroll";
            !OgoneError.errorPanel.isConnected ? document.body.append(OgoneError.errorPanel) : [];
        }
    }
}
class OgoneExtends extends OgoneError {
    static setReactivity(target, updateFunction, parentKey = '') {
        const proxies = {
        };
        return new Proxy(target, {
            get (obj, key, ...args) {
                let v;
                const id = `${parentKey}.${key.toString()}`.replace(/^[^\w]+/i, '');
                if (key === 'prototype') {
                    v = Reflect.get(obj, key, ...args);
                } else if (obj[key] instanceof Object && !proxies[id]) {
                    v = OgoneExtends.setReactivity(obj[key], updateFunction, id);
                    proxies[id] = v;
                } else {
                    v = Reflect.get(obj, key, ...args);
                }
                return v;
            },
            set (obj, key, value, ...args) {
                if (obj[key] === value) return true;
                const id = `${parentKey}.${key.toString()}`.replace(/^[^\w]+/i, '');
                const v = Reflect.set(obj, key, value, ...args);
                updateFunction(id);
                return v;
            },
            deleteProperty (obj, key) {
                const id = `${parentKey}.${key.toString()}`.replace(/^[^\w]+/i, '');
                const v = Reflect.deleteProperty(obj, key);
                delete proxies[id];
                updateFunction(id);
                return v;
            }
        });
    }
    static async imp(id, url) {
        if (OgoneExtends.mod[id]) return;
        try {
            if (!url) {
                const mod5 = await import(id);
                OgoneExtends.mod[id] = mod5;
                return mod5;
            } else {
                const mod5 = await import(`/?import=${url}`);
                OgoneExtends.mod[id] = mod5;
                return mod5;
            }
        } catch (err) {
            OgoneExtends.displayError(err.message, "Error in Dynamic Import", new Error(`\n    module's url: ${id}\n    `));
        }
    }
    static construct(node) {
        const o = node.ogone;
        if (!o.type) return;
        node.dependencies = o.dependencies;
        if (o.isTemplate) {
            node.positionInParentComponent = [];
            o.component = new OgoneExtends.components[o.uuid]();
            o.component.requirements = o.requirements;
            o.component.dependencies = o.dependencies;
            o.component.type = o.type;
        }
    }
    static setOgone(node, def) {
        node.ogone = {
            isRemote: false,
            isRoot: false,
            isImported: false,
            position: [
                0
            ],
            index: 0,
            level: 0,
            uuid: '{% root.uuid %}',
            extends: '-nt',
            positionInParentComponent: [
                0
            ],
            levelInParentComponent: 0,
            component: null,
            parentComponent: null,
            render: null,
            nodes: [],
            replacer: null,
            getContext: null,
            promise: null,
            routes: null,
            locationPath: null,
            actualTemplate: null,
            actualRouteName: null,
            actualRoute: null,
            key: `n${Math.random()}`,
            routeChanged: null,
            historyState: null,
            methodsCandidate: [],
            ...def
        };
        node.ogone.render = OgoneExtends.render[node.extends];
        if (!node.ogone.isTemplate) {
            node.type = `${node.type}-node`;
        }
        node.ogone.type = node.type;
        if (node.type === "router" && def.routes) {
            node.ogone.locationPath = location.pathname;
            node.ogone.routes = def.routes;
            node.ogone.routeChanged = true;
            node.ogone.historyState = (()=>{
                const url = new URL(location.href);
                const query = new Map(url.searchParams.entries());
                return {
                    query
                };
            })();
        }
        OgoneExtends.construct(node);
    }
    static setNodeProps(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!o || !oc || !o.nodes || !o.nodeProps) return;
        function r(n, p) {
            const vl = o.getContext({
                position: o.position,
                getText: `(${p[1]})`
            });
            n.setAttribute(p[0], vl);
            return n.isConnected;
        }
        for (let n of o.nodes){
            for (let p of o.nodeProps){
                oc.react.push(()=>r(n, p)
                );
                r(n, p);
            }
        }
    }
    static setPosition(Onode) {
        const o = Onode.ogone;
        if (o.position && typeof o.level === 'number' && typeof o.index === 'number') {
            o.position[o.level] = o.index;
        }
    }
    static setProps(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!o || !oc) return;
        if (!o.index) {
            o.index = 0;
        }
        oc.props = o.props;
        if (!o.positionInParentComponent || o.levelInParentComponent !== undefined) {
            oc.positionInParentComponent = o.positionInParentComponent;
            o.positionInParentComponent[o.levelInParentComponent] = o.index;
        }
        oc.updateProps();
    }
    static useSpread(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc) return;
        const op = oc.parent;
        let reaction, parent;
        if (o.isTemplate && o.flags && o.flags.spread && op) {
            reaction = ()=>{
                const v = o.getContext({
                    position: o.positionInParentComponent,
                    getText: `{${o.flags.spread}}`
                });
                Object.entries(v).forEach(([k, value])=>{
                    oc.updateService(k, value);
                });
                return oc.activated;
            };
            parent = oc.parent;
        } else if (!o.isTemplate && o.flags && o.flags.spread) {
            reaction = ()=>{
                const v = o.getContext({
                    position: o.positionInParentComponent,
                    getText: `{${o.flags.spread}}`
                });
                Object.entries(v).forEach(([k, value])=>{
                    if (o.nodes) {
                        for (let n of o.nodes){
                            n.setAttribute(k, value);
                        }
                    }
                });
                return oc.activated;
            };
            parent = oc.react;
        }
        reaction && reaction();
        parent && reaction && parent.react.push(reaction);
    }
    static setNodes(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc || !o.render) return;
        if (o.isTemplate) {
            o.nodes = Array.from(o.render(oc).childNodes);
        } else {
            o.nodes = [
                o.render(oc, o.position, o.index, o.level)
            ];
        }
        if (o.methodsCandidate && o.methodsCandidate.length) {
            o.methodsCandidate.forEach((f, i2, arr)=>{
                if (o.nodes) {
                    for (let n of o.nodes){
                        if (n.ogone) {
                            OgoneExtends.saveUntilRender(n, f);
                        } else {
                            f(n);
                        }
                    }
                }
                delete arr[i2];
            });
        }
    }
    static setDeps(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc) return;
        if (o.originalNode && o.getContext) {
            (Onode.isComponent && oc.parent ? oc.parent : oc).react.push(()=>OgoneExtends.renderContext(Onode)
            );
            OgoneExtends.renderContext(Onode);
        }
    }
    static removeNodes(Onode) {
        const o = Onode.ogone;
        if (!o.nodes) return Onode;
        function rm(n) {
            if (n.ogone) {
                OgoneExtends.destroy(n);
                n.context.placeholder.remove();
            } else {
                n.remove();
            }
        }
        if (o.actualTemplate) {
            o.actualTemplate.forEach((n)=>{
                rm(n);
            });
        }
        o.nodes.forEach((n)=>{
            rm(n);
        });
        if (Onode.ogone.component) {
            Onode.ogone.component.activated = false;
        }
        return Onode;
    }
    static destroy(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc) return;
        Onode.context.list.forEach((n)=>{
            OgoneExtends.removeNodes(n);
            n.remove();
        });
        OgoneExtends.removeNodes(Onode);
        if (o.isTemplate) {
            oc.destroyPluggedWebcomponent();
            oc.runtime("destroy");
            oc.activated = false;
        }
        Onode.context.placeholder.remove();
        Onode.remove();
    }
    static setEvents(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!o.flags || !o.getContext || !oc || !o.nodes) return;
        const position = Onode.isComponent ? oc.positionInParentComponent : o.position;
        const c = Onode.isComponent ? oc.parent : oc;
        for (let node of o.nodes){
            for (let flag of o.flags.events){
                if (flag.type === "wheel") {
                    if (node.ogone) {
                        OgoneExtends.saveUntilRender(node, (nr)=>{
                            nr.hasWheel = true;
                            nr.addEventListener(flag.type, (ev)=>{
                                const foundWheel = ev.path.find((n)=>n && n.hasWheel
                                );
                                if (foundWheel && !foundWheel.isSameNode(node)) return;
                                if (o.getContext && c) {
                                    const filter = o.getContext({
                                        getText: `${flag.filter}`,
                                        position
                                    });
                                    const ctx = o.getContext({
                                        position
                                    });
                                    switch(true){
                                        case filter === "right" && ev.wheelDeltaX < 0:
                                            c.runtime(flag.case, ctx, ev);
                                            break;
                                        case filter === "left" && ev.wheelDeltaX > 0:
                                            c.runtime(flag.case, ctx, ev);
                                            break;
                                        case filter === "up" && ev.wheelDeltaY > 0:
                                            c.runtime(flag.case, ctx, ev);
                                            break;
                                        case filter === "down" && ev.wheelDeltaY < 0:
                                            c.runtime(flag.case, ctx, ev);
                                            break;
                                        case filter === null:
                                            c.runtime(flag.case, ctx, ev);
                                            break;
                                    }
                                }
                            });
                        });
                    } else {
                        node.hasWheel = true;
                        node.addEventListener(flag.type, (ev)=>{
                            const foundWheel = ev.path.find((n)=>n && n.hasWheel
                            );
                            if (foundWheel && !foundWheel.isSameNode(node)) return;
                            if (o.getContext && c) {
                                const filter = o.getContext({
                                    getText: `${flag.filter}`,
                                    position
                                });
                                const ctx = o.getContext({
                                    position
                                });
                                switch(true){
                                    case filter === "right" && ev.wheelDeltaX < 0:
                                        c.runtime(flag.case, ctx, ev);
                                        break;
                                    case filter === "left" && ev.wheelDeltaX > 0:
                                        c.runtime(flag.case, ctx, ev);
                                        break;
                                    case filter === "up" && ev.wheelDeltaY > 0:
                                        c.runtime(flag.case, ctx, ev);
                                        break;
                                    case filter === "down" && ev.wheelDeltaY < 0:
                                        c.runtime(flag.case, ctx, ev);
                                        break;
                                    case filter === null:
                                        c.runtime(flag.case, ctx, ev);
                                        break;
                                }
                            }
                        });
                    }
                } else if (flag.type.startsWith("key") && c) {
                    document.addEventListener(flag.type, (ev)=>{
                        const filter = o.getContext({
                            getText: `${flag.filter}`,
                            position
                        });
                        const ctx = o.getContext({
                            position
                        });
                        switch(true){
                            case ev.charCode === filter:
                                c.runtime(flag.case, ctx, ev);
                                break;
                            case ev.key === filter:
                                c.runtime(flag.case, ctx, ev);
                                break;
                            case ev.keyCode === filter:
                                c.runtime(flag.case, ctx, ev);
                                break;
                            case ev.code.toLowerCase() === filter:
                                c.runtime(flag.case, ctx, ev);
                                break;
                            case !filter:
                                c.runtime(flag.case, ctx, ev);
                                break;
                        }
                    });
                } else if (flag.name === "router-go" && flag.eval) {
                    if (node.ogone) {
                        OgoneExtends.saveUntilRender(node, (nr)=>{
                            nr.addEventListener("click", (ev)=>{
                                if (OgoneExtends.router) {
                                    OgoneExtends.router.go(o.getContext({
                                        getText: `${flag.eval}`,
                                        position
                                    }), history.state);
                                }
                            });
                        });
                    } else {
                        node.addEventListener("click", (ev)=>{
                            if (OgoneExtends.router) {
                                OgoneExtends.router.go(o.getContext({
                                    getText: `${flag.eval}`,
                                    position
                                }), history.state);
                            }
                        });
                    }
                } else if (flag.name === 'router-dev-tool' && flag.eval) {
                    node.addEventListener("click", ()=>{
                        if (OgoneExtends.router.openDevTool) {
                            OgoneExtends.router.openDevTool({
                            });
                        }
                    });
                } else if (flag.name === "event" && flag.type.startsWith('animation')) {
                    if (node.ogone) {
                        OgoneExtends.saveUntilRender(node, (nr)=>{
                            nr.addEventListener(flag.type, (ev)=>{
                                if (flag.eval !== ev.animationName) return;
                                const ctx = o.getContext({
                                    position
                                });
                                if (c) {
                                    c.runtime(flag.case, ctx, ev);
                                }
                            });
                        });
                    } else {
                        node.addEventListener(flag.type, (ev)=>{
                            if (flag.eval !== ev.animationName) return;
                            const ctx = o.getContext({
                                position
                            });
                            if (c) {
                                c.runtime(flag.case, ctx, ev);
                            }
                        });
                    }
                } else {
                    if (node.ogone) {
                        OgoneExtends.saveUntilRender(node, (nr)=>{
                            nr.addEventListener(flag.type, (ev)=>{
                                const ctx = o.getContext({
                                    position
                                });
                                if (c) {
                                    c.runtime(flag.case, ctx, ev);
                                }
                            });
                        });
                    } else {
                        node.addEventListener(flag.type, (ev)=>{
                            const ctx = o.getContext({
                                position
                            });
                            if (c) {
                                c.runtime(flag.case, ctx, ev);
                            }
                        });
                    }
                }
            }
        }
    }
    static insertElement(Onode, p, el) {
        if (!Onode.firstNode) {
            Onode.insertAdjacentElement(p, el);
            return;
        }
        let target;
        switch(p){
            case "beforebegin":
                target = Onode.firstNode;
                break;
            case "afterbegin":
                target = Onode.firstNode;
                break;
            case "beforeend":
                target = Onode.lastNode;
                break;
            case "afterend":
                target = Onode.lastNode;
                break;
        }
        return !!target.ogone ? OgoneExtends.insertElement(target.context.list[target.context.list.length - 1], p, el) : target.insertAdjacentElement(p, el);
    }
    static triggerLoad(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc) return;
        const rr = OgoneExtends.router.react;
        oc.runtime(0, o.historyState);
        rr.push((path2)=>{
            o.locationPath = path2;
            OgoneExtends.setActualRouterTemplate(Onode);
            OgoneExtends.renderRouter(Onode);
            return oc.activated;
        });
    }
    static routerSearch(Onode, route, locationPath) {
        if (typeof locationPath !== "string") return false;
        const { path: path2  } = route;
        const splitted = path2.toString().split("/");
        const locationSplit = locationPath.split("/");
        const result = {
        };
        if (!splitted.filter((r)=>r.trim().length
        ).length !== !locationSplit.filter((r)=>r.trim().length
        ).length) {
            return false;
        }
        if (splitted.length !== locationSplit.length) return false;
        const error = splitted.find((p, i2, arr)=>{
            if (!p.startsWith(":")) {
                return locationSplit[i2] !== p;
            }
        });
        if (error) return false;
        splitted.forEach((p, i2)=>{
            if (p.startsWith(":")) {
                const param = p.slice(1, p.length);
                result[param] = locationSplit[i2];
            }
        });
        route.params = result;
        return true;
    }
    static setActualRouterTemplate(node) {
        const o = node.ogone, oc = o.component;
        oc.routes = o.routes;
        oc.locationPath = o.locationPath;
        const l = oc.locationPath;
        let rendered = oc.routes.find((r)=>r.path === l || OgoneExtends.routerSearch(node, r, l) || r.path === 404
        );
        let preservedParams = rendered.params;
        while(rendered && rendered.redirect){
            rendered = oc.routes.find((r)=>r.name === rendered.redirect
            );
            if (rendered) {
                rendered.params = preservedParams;
            }
        }
        if (rendered) {
            o.actualRouteName = rendered.name || null;
        }
        if (!rendered) {
            o.actualTemplate = new Comment();
            o.actualRoute = null;
            o.routeChanged = true;
        } else if (rendered && !(rendered.once || o.actualRoute === rendered.component)) {
            const { component: uuidC  } = rendered;
            const co = document.createElement("template", {
                is: uuidC
            });
            o.actualTemplate = co;
            o.actualRoute = rendered.component;
            o.routeChanged = true;
            let ogoneOpts = {
                isTemplate: true,
                isRouter: false,
                isStore: false,
                isAsync: false,
                isAsyncNode: false,
                requirements: o.requirements,
                routes: o.routes,
                originalNode: false,
                dependencies: [],
                extends: "-nt",
                uuid: rendered.uuid,
                tree: o.tree,
                params: rendered.params || null,
                props: o.props,
                parentComponent: o.parentComponent,
                parentCTXId: o.parentCTXId,
                positionInParentComponent: o.positionInParentComponent.slice(),
                levelInParentComponent: o.levelInParentComponent,
                index: o.index,
                level: o.level,
                position: o.position,
                flags: o.flags,
                isRoot: false,
                name: rendered.name || rendered.component,
                parentNodeKey: o.key
            };
            OgoneExtends.setOgone(co, ogoneOpts);
            ogoneOpts = null;
            if (rendered.title) {
                document.title = rendered.title;
            }
        } else {
            o.routeChanged = false;
        }
    }
    static setNodeAsyncContext(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc) return;
        if (o.flags && o.flags.await) {
            const promise = new Promise((resolve2, reject)=>{
                if (typeof o.flags.await === "boolean") {
                    Onode.firstNode.addEventListener("load", ()=>{
                        resolve2(false);
                    });
                } else {
                    const type1 = o.getContext({
                        getText: o.flags.await,
                        position: o.position
                    });
                    Onode.firstNode.addEventListener(type1, ()=>{
                        resolve2(false);
                    });
                }
            });
            oc.promises.push(promise);
        }
    }
    static setAsyncContext(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc) return;
        if (o.flags && o.flags.then) {
            oc.async.then = o.flags.then;
        }
        if (o.flags && o.flags.catch) {
            oc.async.catch = o.flags.catch;
        }
        if (o.flags && o.flags.finally) {
            oc.async.finally = o.flags.finally;
        }
        if (o.flags && o.flags.defer) {
            const promise = oc.parentContext({
                getText: o.flags.defer,
                position: o.positionInParentComponent
            });
            oc.promises.push(promise);
        }
    }
    static recycleWebComponent(Onode, opts) {
        const { injectionStyle , id , name , component , isSync  } = opts;
        let webcomponent;
        if (opts.extends) {
            const original = opts.extends;
            webcomponent = document.createElement(original, {
                is: name
            });
        } else {
            webcomponent = document.createElement(name);
        }
        webcomponent.setAttribute(id, '');
        Onode[injectionStyle || 'append'](webcomponent);
        component.plugWebComponent(webcomponent, isSync);
        return webcomponent;
    }
}
class OgoneContext extends OgoneExtends {
    static setContext(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc || !o.key) return;
        if (o.isTemplate) {
            oc.key = o.key;
            oc.dependencies = o.dependencies;
            if (o.parentComponent) {
                oc.parent = o.parentComponent;
                oc.parent.childs.push(oc);
            }
            if (OgoneContext.contexts[o.parentCTXId] && o.parentComponent) {
                const gct = OgoneContext.contexts[o.parentCTXId].bind(o.parentComponent.data);
                oc.parentContext = gct;
                o.getContext = gct;
            }
        } else if (OgoneContext.contexts[Onode.extends] && oc) {
            o.getContext = OgoneContext.contexts[Onode.extends].bind(oc.data);
        }
        if (o.type === "store" && oc.parent) {
            oc.namespace = Onode.getAttribute("namespace") || null;
            oc.parent.store[oc.namespace] = oc;
        }
    }
    static setHMRContext(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (o.isTemplate && oc && o.uuid) {
            OgoneContext.instances[o.uuid].push(oc);
        }
        OgoneContext.mod[Onode.extends].push((pragma)=>{
            OgoneContext.render[Onode.extends] = eval(pragma);
            if (!o.nodes) return;
            if (o.isTemplate) {
                return true;
            } else if (oc) {
                const invalidatedNodes = o.nodes.slice();
                const ns = Array.from(o.nodes);
                o.render = OgoneContext.render[Onode.extends];
                OgoneContext.renderingProcess(Onode);
                invalidatedNodes.forEach((n, i2)=>{
                    if (n.ogone) {
                        if (i2 === 0) n.firstNode.replaceWith(...ns);
                        OgoneContext.destroy(n);
                    } else {
                        if (i2 === 0) n.replaceWith(...ns);
                        n.remove();
                    }
                });
                oc.renderTexts(true);
                return true;
            }
        });
    }
    static setDevToolContext(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc) return;
        const ocp = oc.parent;
        const tree = o.tree ? o.tree.replace("null", Onode.isComponent ? ocp.key : oc.key).split(">") : [
            o.key
        ];
        OgoneContext.ComponentCollectionManager.read({
            tree,
            key: o.key,
            parentNodeKey: o.parentNodeKey,
            name: o.name || tree[tree.length - 1],
            ctx: oc,
            isRoot: o.isRoot,
            parentCTX: ocp,
            type: o.isTemplate ? o.isRoot ? "root" : oc.type : "element"
        });
    }
}
class OgoneBinder extends OgoneContext {
    static bindValue(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!o.flags || !o.flags.bind || !oc || !o.nodes) return;
        function r(n, dependency) {
            const k = o.flags.bind;
            const evl = o.getContext({
                position: o.position,
                getText: k
            });
            if (dependency === true) {
                n.value = evl;
            }
            if (typeof k === "string" && k.indexOf(dependency) > -1 && evl !== undefined && n.value !== evl) {
                n.value = evl;
            }
            return n.isConnected;
        }
        for (let n of o.nodes){
            n.addEventListener("keydown", (ev)=>{
                const k = o.flags.bind;
                const evl = o.getContext({
                    position: o.position,
                    getText: k
                });
                if (evl !== n.value) {
                    const ctx = o.getContext({
                        position: o.position
                    });
                    const values = Object.values(ctx);
                    const keys = Object.keys(ctx);
                    const fn = new Function(...keys, "n", `${k} = n.value;`);
                    fn.bind(oc.data)(...values, n);
                    oc.update(k, ev);
                }
            });
            n.addEventListener("keyup", (ev)=>{
                const k = o.flags.bind;
                const evl = o.getContext({
                    position: o.position,
                    getText: k
                });
                if (evl !== n.value) {
                    const ctx = o.getContext({
                        position: o.position
                    });
                    const values = Object.values(ctx);
                    const keys = Object.keys(ctx);
                    const fn = new Function(...keys, "n", `${k} = n.value;`);
                    fn.bind(oc.data)(...values, n);
                    oc.update(k, ev);
                }
            });
            n.addEventListener("change", (ev)=>{
                const k = o.flags.bind;
                const evl = o.getContext({
                    position: o.position,
                    getText: k
                });
                if (evl !== n.value) {
                    const ctx = o.getContext({
                        position: o.position
                    });
                    const values = Object.values(ctx);
                    const keys = Object.keys(ctx);
                    const fn = new Function(...keys, "n", `${k} = n.value;`);
                    fn.bind(oc.data)(...values, n);
                    oc.update(k, ev);
                }
            });
            oc.react.push((dependency)=>r(n, dependency)
            );
            r(n, true);
        }
    }
    static bindClass(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!o.flags || !o.flags.class || !oc || !o.nodes) return;
        function r(n) {
            const vl = o.getContext({
                position: o.position,
                getText: o.flags.class
            });
            if (typeof vl === "string") {
                n.classList.value = vl;
            } else if (typeof vl === "object") {
                const keys = Object.keys(vl);
                n.classList.add(...keys.filter((key)=>vl[key]
                ));
                n.classList.remove(...keys.filter((key)=>!vl[key]
                ));
            } else if (Array.isArray(vl)) {
                n.classList.value = vl.join(" ");
            }
            return n.isConnected;
        }
        for (let node of o.nodes){
            oc.react.push(()=>r(node)
            );
            r(node);
        }
    }
    static bindHTML(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!o.flags || !o.flags.html || !oc || !o.nodes || o.isTemplate) return;
        function r(n) {
            const vl = o.getContext({
                position: o.position,
                getText: o.flags.html
            });
            if (typeof vl === "string") {
                n.innerHTML = '';
                n.insertAdjacentHTML('beforeend', vl);
            }
            return n.isConnected;
        }
        for (let node of o.nodes){
            oc.react.push(()=>r(node)
            );
            r(node);
        }
    }
    static bindStyle(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!o.flags || !o.flags.style || !oc || !o.nodes) return;
        function r(n) {
            const vl = o.getContext({
                position: o.position,
                getText: o.flags.style
            });
            if (typeof vl === "string") {
                Object.keys(n.style).forEach((key)=>{
                    n.style[key] = vl[key];
                });
            } else if (typeof vl === "object") {
                Object.entries(vl).forEach(([k, v])=>n.style[k] = v
                );
            }
            return n.isConnected;
        }
        for (let n of o.nodes){
            oc.react.push(()=>r(n)
            );
            r(n);
        }
    }
}
class OgoneRender extends OgoneBinder {
    static renderSlots(Onode) {
        const o = Onode.ogone;
        if (!o.nodes) return;
        const slots = Array.from(Onode.querySelectorAll("[slot]"));
        for (let node of o.nodes.filter((n)=>n.nodeType === 1
        )){
            const d = node.querySelector("slot:not([name])");
            if (d) {
                d.replaceWith(...Array.from(Onode.childNodes));
            }
        }
        for (let slotted of slots){
            const sn = slotted.getAttribute("slot");
            for (let n of o.nodes){
                const s = n.querySelector(`slot[name="${sn}"]`);
                if (s) {
                    slotted.removeAttribute("slot");
                    s.replaceWith(slotted);
                }
            }
        }
    }
    static renderNode(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc) return;
        if (o.isTemplate) {
            oc.updateProps();
            if (Onode.childNodes.length) {
                OgoneRender.renderSlots(Onode);
            }
            if (o.type === "async") {
                Onode.context.placeholder.replaceWith(...o.nodes);
            } else {
                Onode.replaceWith(...o.nodes);
            }
            oc.renderTexts(true);
            if (o.type !== "async") {
                oc.startLifecycle({
                    router: {
                        params: o.params,
                        state: history.state,
                        path: location.pathname
                    }
                });
            }
        } else if (oc) {
            if (Onode.childNodes.length) {
                OgoneRender.renderSlots(Onode);
            }
            oc.renderTexts(true);
            Onode.replaceWith(...o.nodes);
        }
    }
    static renderStore(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc) return;
        if (oc.namespace !== o.namespace) {
            const error = "the attribute namespace is not the same provided in the component store";
            const BadNamspaceException = new Error(`[Ogone] ${error}`);
            OgoneRender.displayError(error, "Store Module: Bad Namsepace Exception", new Error(`\n      store namespace: ${o.namespace}\n      attribute namespace: ${oc.namespace}\n      `));
            throw BadNamspaceException;
        }
        oc.startLifecycle();
        OgoneRender.removeNodes(Onode);
        Onode.remove();
    }
    static renderRouter(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc) return;
        oc.updateProps();
        if (!o.replacer) {
            o.replacer = document.createElement('section');
        }
        if (Onode.parentNode) {
            Onode.replaceWith(o.replacer);
        }
        if (o.routeChanged) {
            o.replacer.innerHTML = "";
            o.replacer.append(o.actualTemplate);
        }
        oc.runtime(`router:${o.actualRouteName || o.locationPath}`, history.state);
    }
    static renderAsyncRouter(Onode) {
        const o = Onode.ogone;
        if (!o.nodes) return;
        const filter = (t)=>t.component && t.component.type === "router"
        ;
        const s = o.nodes.filter(filter);
        for (let n of o.nodes.filter((n1)=>n1.nodeType === 1
        )){
            const arrayOfTemplates = Array.from(n.querySelectorAll("template")).filter(filter);
            for (let template2 of arrayOfTemplates){
                s.push(template2);
            }
        }
        for (let t of s){
            t.connectedCallback();
        }
    }
    static renderAsyncStores(Onode) {
        const o = Onode.ogone;
        if (!o.nodes) return;
        const filter = (t)=>t.component && t.component.type === "store"
        ;
        const asyncStores = o.nodes.filter(filter);
        for (let n of o.nodes.filter((n1)=>n1.nodeType === 1
        )){
            const arrayOfTemplates = Array.from(n.querySelectorAll("template")).filter(filter);
            for (let template2 of arrayOfTemplates){
                asyncStores.push(template2);
            }
        }
        for (let t of asyncStores){
            t.connectedCallback();
            OgoneRender.removeNodes(t);
            t.remove();
        }
    }
    static renderAsyncComponent(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc || !o || !o.nodes) return;
        const filter = (t)=>t.component && t.component.type === "async"
        ;
        for (let node of o.nodes.filter((n)=>n.nodeType === 1
        )){
            const awaitingNodes = Array.from(node.querySelectorAll("template")).filter(filter);
            if (node.isComponent && node.ogone && node.ogone.component && node.ogone.component.type === "async") {
                awaitingNodes.push(node);
            }
            for (let awaitingNode of awaitingNodes){
                const ev = new CustomEvent(`${o.key}:${awaitingNode.ogone.key}:resolve`);
                awaitingNode.component.dispatchAwait = ()=>{
                    awaitingNode.dispatchEvent(ev);
                };
                const promise = new Promise((resolve2)=>{
                    if (awaitingNode.component.promiseResolved) {
                        resolve2(true);
                    } else {
                        awaitingNode.addEventListener(`${o.key}:${awaitingNode.ogone.key}:resolve`, ()=>{
                            resolve2(true);
                        });
                    }
                });
                oc.promises.push(promise);
            }
        }
    }
    static renderComponent(Onode) {
        const o = Onode.ogone;
        if (!o.nodes) return;
        const filter = (t)=>t.component && t.component.type === "component"
        ;
        for (let node of o.nodes.filter((n)=>n.nodeType === 1
        )){
            const components2 = Array.from(node.querySelectorAll("template")).filter(filter);
            let n = node;
            if (n.isComponent && n.ogone && n.ogone.component && n.ogone.component.type === "component") {
                components2.push(n);
            }
            for (let onode of components2){
                OgoneRender.renderingProcess(onode);
            }
        }
    }
    static renderAsync(Onode, shouldReportToParentComponent) {
        const o = Onode.ogone, oc = o.component;
        if (!oc) return;
        OgoneRender.renderAsyncStores(Onode);
        OgoneRender.renderAsyncRouter(Onode);
        OgoneRender.renderComponent(Onode);
        OgoneRender.renderAsyncComponent(Onode);
        const chs = Array.from(Onode.childNodes);
        const placeholder = Onode.context.placeholder;
        const txt = chs.find((n)=>n.nodeType === 3
        );
        if (txt) {
            const UnwrappedTextnodeOnAsyncComponentException = new Error(`[Ogone] Top level textnode are not supported for Async component placeholder.\n            Please wrap this text into an element.\n            textnode data: "${txt.data}"`);
            OgoneRender.displayError(UnwrappedTextnodeOnAsyncComponentException.message, "Async Component placeholder TypeError", UnwrappedTextnodeOnAsyncComponentException);
            throw UnwrappedTextnodeOnAsyncComponentException;
        }
        if (chs.length) {
            Onode.replaceWith(...chs);
        } else {
            Onode.replaceWith(placeholder);
        }
        oc.resolve = (...args)=>{
            return new Promise((resolve2)=>{
                setTimeout(()=>{
                    OgoneRender.setAsyncContext(Onode);
                    if (chs.length) {
                        const { isConnected  } = chs[0];
                        if (isConnected) {
                            chs.slice(1).forEach((ch)=>{
                                if (ch.ogone) {
                                    OgoneRender.removeNodes(ch);
                                    ch.remove();
                                    return;
                                }
                                ch.remove();
                            });
                            chs[0].replaceWith(placeholder);
                        }
                    }
                    resolve2(true);
                }, 0);
            }).then(()=>{
                Promise.all(oc.promises).then((p)=>{
                    OgoneRender.renderNode(Onode);
                    if (oc.async.then && shouldReportToParentComponent && oc.parent) {
                        oc.parent.runtime(oc.async.then, {
                            value: args,
                            await: p
                        });
                    }
                }).catch((err)=>{
                    if (oc.async.catch && shouldReportToParentComponent && oc.parent) {
                        oc.parent.runtime(oc.async.catch, err);
                    }
                    OgoneRender.displayError(err.message, `Error in Async component. component: ${o.name}`, err);
                }).finally(()=>{
                    if (oc.async.finally && shouldReportToParentComponent && oc.parent) {
                        oc.parent.runtime(oc.async.finally);
                    }
                });
            });
        };
        oc.startLifecycle(o.params, o.historyState);
    }
    static renderingProcess(Onode) {
        const o = Onode.ogone;
        OgoneRender.setNodes(Onode);
        if (o.isAsyncNode) {
            OgoneRender.setNodeAsyncContext(Onode);
        }
        if (o.originalNode) OgoneRender.setDeps(Onode);
        if (!o.isTemplate && o.nodeProps) {
            OgoneRender.setNodeProps(Onode);
        }
        OgoneRender.setEvents(Onode);
        OgoneRender.bindClass(Onode);
        OgoneRender.bindStyle(Onode);
        OgoneRender.bindValue(Onode);
        OgoneRender.bindHTML(Onode);
        OgoneRender.useSpread(Onode);
        if (o.type === "router") {
            OgoneRender.triggerLoad(Onode);
        }
    }
    static renderContext(Onode) {
        const o = Onode.ogone, oc = o.component;
        if (!oc || !o.getContext) return false;
        const length = o.getContext({
            getLength: true,
            position: o.position
        });
        (o.isTemplate && oc.parent ? oc.parent : oc).render(Onode, {
            callingNewComponent: o.isTemplate,
            length
        });
        return true;
    }
    static saveUntilRender(Onode, f) {
        if (Onode.ogone.methodsCandidate) {
            Onode.ogone.methodsCandidate.push(f);
        }
    }
}
class Ogone extends OgoneRender {
}
Ogone.classes.extends = (klass)=>class extends klass {
        get firstNode() {
            const o = this.ogone;
            return o.nodes[0];
        }
        get lastNode() {
            const o = this.ogone;
            return o.nodes[o.nodes.length - 1];
        }
        get extends() {
            const o = this.ogone;
            return `${o.uuid}${o.extends}`;
        }
        get name() {
            return this.isComponent ? "template" : this.tagName.toLowerCase();
        }
        get isComponent() {
            const o = this.ogone;
            return o.isTemplate;
        }
        get isRecursiveConnected() {
            return !!(this.ogone?.nodes?.length && this.firstNode.isConnected && this.lastNode.isConnected);
        }
        get isConnected() {
            if (!this.firstNode) {
                return false;
            }
            return !!this.ogone?.nodes?.find((n)=>n.isConnected
            );
        }
        get context() {
            const o = this.ogone, oc = o.component;
            if (!oc.contexts.for[o.key]) {
                oc.contexts.for[o.key] = {
                    list: [
                        this
                    ],
                    placeholder: document.createElement("template"),
                    parentNode: this.parentNode,
                    name: this.name
                };
            }
            return oc.contexts.for[o.key];
        }
        constructor(){
            super();
            this.ogone = {
            };
        }
    }
;
Ogone.classes.component = (klass, componentType = "component")=>class extends Ogone.classes.extends(klass) {
        constructor(){
            super();
            this.type = componentType;
            if (!Ogone.root) {
                let opts = {
                    props: null,
                    parentCTXId: '',
                    dependencies: null,
                    requirements: null,
                    routes: null,
                    isRoot: true,
                    isTemplate: true,
                    isAsync: false,
                    isAsyncNode: false,
                    isRouter: false,
                    isStore: false,
                    isImported: false,
                    isRemote: false,
                    index: 0,
                    level: 0,
                    position: [
                        0
                    ],
                    flags: null,
                    originalNode: true,
                    uuid: '{% root.uuid %}',
                    extends: '-nt'
                };
                Ogone.setOgone(this, opts);
                opts = null;
                Ogone.root = true;
            }
        }
        connectedCallback() {
            if (this.type === "controller") {
                this.remove();
                return;
            }
            const o = this.ogone;
            Ogone.setPosition(this);
            Ogone.setContext(this);
            if (o.type === "router") {
                Ogone.setActualRouterTemplate(this);
            }
            if (o.isTemplate && o.component) {
                Ogone.setProps(this);
                o.component.updateProps();
            }
            Ogone.renderingProcess(this);
            switch(true){
                case o.type === "router":
                    Ogone.renderRouter(this);
                    break;
                case o.type === "store":
                    Ogone.renderStore(this);
                    break;
                case o.type === "async":
                    Ogone.renderAsync(this);
                    break;
                default:
                    Ogone.renderNode(this);
                    break;
            }
        }
    }
;
const CAN_NOT_DISPLAY = "[Cannot display]";
class AssertionError extends Error {
    constructor(message3){
        super(message3);
        this.name = "AssertionError";
    }
}
function _format1(v) {
    let string = globalThis.Deno ? Deno.inspect(v, {
        depth: Infinity,
        sorted: true,
        trailingComma: true,
        compact: false,
        iterableLimit: Infinity
    }) : String(v);
    if (typeof v == "string") {
        string = `"${string.replace(/(?=["\\])/g, "\\")}"`;
    }
    return string;
}
var DiffType;
(function(DiffType1) {
    DiffType1["removed"] = "removed";
    DiffType1["common"] = "common";
    DiffType1["added"] = "added";
})(DiffType || (DiffType = {
}));
function createCommon(A, B, reverse) {
    const common = [];
    if (A.length === 0 || B.length === 0) return [];
    for(let i2 = 0; i2 < Math.min(A.length, B.length); i2 += 1){
        if (A[reverse ? A.length - i2 - 1 : i2] === B[reverse ? B.length - i2 - 1 : i2]) {
            common.push(A[reverse ? A.length - i2 - 1 : i2]);
        } else {
            return common;
        }
    }
    return common;
}
function diff(A, B) {
    const prefixCommon = createCommon(A, B);
    const suffixCommon = createCommon(A.slice(prefixCommon.length), B.slice(prefixCommon.length), true).reverse();
    A = suffixCommon.length ? A.slice(prefixCommon.length, -suffixCommon.length) : A.slice(prefixCommon.length);
    B = suffixCommon.length ? B.slice(prefixCommon.length, -suffixCommon.length) : B.slice(prefixCommon.length);
    const swapped = B.length > A.length;
    [A, B] = swapped ? [
        B,
        A
    ] : [
        A,
        B
    ];
    const M = A.length;
    const N = B.length;
    if (!M && !N && !suffixCommon.length && !prefixCommon.length) return [];
    if (!N) {
        return [
            ...prefixCommon.map((c)=>({
                    type: DiffType.common,
                    value: c
                })
            ),
            ...A.map((a)=>({
                    type: swapped ? DiffType.added : DiffType.removed,
                    value: a
                })
            ),
            ...suffixCommon.map((c)=>({
                    type: DiffType.common,
                    value: c
                })
            ),
        ];
    }
    const offset = N;
    const delta = M - N;
    const size = M + N + 1;
    const fp = new Array(size).fill({
        y: -1
    });
    const routes = new Uint32Array((M * N + size + 1) * 2);
    const diffTypesPtrOffset = routes.length / 2;
    let ptr = 0;
    let p = -1;
    function backTrace(A1, B1, current, swapped1) {
        const M1 = A1.length;
        const N1 = B1.length;
        const result = [];
        let a = M1 - 1;
        let b = N1 - 1;
        let j = routes[current.id];
        let type1 = routes[current.id + diffTypesPtrOffset];
        while(true){
            if (!j && !type1) break;
            const prev = j;
            if (type1 === 1) {
                result.unshift({
                    type: swapped1 ? DiffType.removed : DiffType.added,
                    value: B1[b]
                });
                b -= 1;
            } else if (type1 === 3) {
                result.unshift({
                    type: swapped1 ? DiffType.added : DiffType.removed,
                    value: A1[a]
                });
                a -= 1;
            } else {
                result.unshift({
                    type: DiffType.common,
                    value: A1[a]
                });
                a -= 1;
                b -= 1;
            }
            j = routes[j];
            type1 = routes[j + diffTypesPtrOffset];
        }
        return result;
    }
    function createFP(slide, down, k, M1) {
        if (slide && slide.y === -1 && down && down.y === -1) {
            return {
                y: 0,
                id: 0
            };
        }
        if (down && down.y === -1 || k === M1 || (slide && slide.y) > (down && down.y) + 1) {
            const prev = slide.id;
            ptr++;
            routes[ptr] = prev;
            routes[ptr + diffTypesPtrOffset] = 3;
            return {
                y: slide.y,
                id: ptr
            };
        } else {
            const prev = down.id;
            ptr++;
            routes[ptr] = prev;
            routes[ptr + diffTypesPtrOffset] = 1;
            return {
                y: down.y + 1,
                id: ptr
            };
        }
    }
    function snake(k, slide, down, _offset, A1, B1) {
        const M1 = A1.length;
        const N1 = B1.length;
        if (k < -N1 || M1 < k) return {
            y: -1,
            id: -1
        };
        const fp1 = createFP(slide, down, k, M1);
        while(fp1.y + k < M1 && fp1.y < N1 && A1[fp1.y + k] === B1[fp1.y]){
            const prev = fp1.id;
            ptr++;
            fp1.id = ptr;
            fp1.y += 1;
            routes[ptr] = prev;
            routes[ptr + diffTypesPtrOffset] = 2;
        }
        return fp1;
    }
    while(fp[delta + N].y < N){
        p = p + 1;
        for(let k = -p; k < delta; ++k){
            fp[k + N] = snake(k, fp[k - 1 + N], fp[k + 1 + N], N, A, B);
        }
        for(let k1 = delta + p; k1 > delta; --k1){
            fp[k1 + N] = snake(k1, fp[k1 - 1 + N], fp[k1 + 1 + N], N, A, B);
        }
        fp[delta + N] = snake(delta, fp[delta - 1 + N], fp[delta + 1 + N], N, A, B);
    }
    return [
        ...prefixCommon.map((c)=>({
                type: DiffType.common,
                value: c
            })
        ),
        ...backTrace(A, B, fp[delta + N], swapped),
        ...suffixCommon.map((c)=>({
                type: DiffType.common,
                value: c
            })
        ),
    ];
}
function createColor(diffType) {
    switch(diffType){
        case DiffType.added:
            return (s)=>green(bold(s))
            ;
        case DiffType.removed:
            return (s)=>red(bold(s))
            ;
        default:
            return white;
    }
}
function createSign(diffType) {
    switch(diffType){
        case DiffType.added:
            return "+   ";
        case DiffType.removed:
            return "-   ";
        default:
            return "    ";
    }
}
function buildMessage(diffResult) {
    const messages = [];
    messages.push("");
    messages.push("");
    messages.push(`    ${gray(bold("[Diff]"))} ${red(bold("Actual"))} / ${green(bold("Expected"))}`);
    messages.push("");
    messages.push("");
    diffResult.forEach((result)=>{
        const c = createColor(result.type);
        messages.push(c(`${createSign(result.type)}${result.value}`));
    });
    messages.push("");
    return messages;
}
function isKeyedCollection(x) {
    return [
        Symbol.iterator,
        "size"
    ].every((k)=>k in x
    );
}
function equal(c, d) {
    const seen = new Map();
    return (function compare(a, b) {
        if (a && b && (a instanceof RegExp && b instanceof RegExp || a instanceof URL && b instanceof URL)) {
            return String(a) === String(b);
        }
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime();
        }
        if (Object.is(a, b)) {
            return true;
        }
        if (a && typeof a === "object" && b && typeof b === "object") {
            if (seen.get(a) === b) {
                return true;
            }
            if (Object.keys(a || {
            }).length !== Object.keys(b || {
            }).length) {
                return false;
            }
            if (isKeyedCollection(a) && isKeyedCollection(b)) {
                if (a.size !== b.size) {
                    return false;
                }
                let unmatchedEntries = a.size;
                for (const [aKey, aValue] of a.entries()){
                    for (const [bKey, bValue] of b.entries()){
                        if (aKey === aValue && bKey === bValue && compare(aKey, bKey) || compare(aKey, bKey) && compare(aValue, bValue)) {
                            unmatchedEntries--;
                        }
                    }
                }
                return unmatchedEntries === 0;
            }
            const merged = {
                ...a,
                ...b
            };
            for(const key in merged){
                if (!compare(a && a[key], b && b[key])) {
                    return false;
                }
            }
            seen.set(a, b);
            return true;
        }
        return false;
    })(c, d);
}
function assert1(expr, msg = "") {
    if (!expr) {
        throw new AssertionError(msg);
    }
}
const SEP1 = isWindows ? `(?:\\\\|\\/)` : `\\/`;
const SEP_ESC = isWindows ? `\\\\` : `/`;
const SEP_RAW = isWindows ? `\\` : `/`;
const GLOBSTAR = `(?:(?:[^${SEP_ESC}/]*(?:${SEP_ESC}|\/|$))*)`;
const WILDCARD = `(?:[^${SEP_ESC}/]*)`;
const GLOBSTAR_SEGMENT = `((?:[^${SEP_ESC}/]*(?:${SEP_ESC}|\/|$))*)`;
const WILDCARD_SEGMENT = `(?:[^${SEP_ESC}/]*)`;
function globrex(glob, { extended =false , globstar =false , strict =false , filepath =false , flags =""  } = {
}) {
    const sepPattern = new RegExp(`^${SEP1}${strict ? "" : "+"}$`);
    let regex = "";
    let segment = "";
    let pathRegexStr = "";
    const pathSegments = [];
    let inGroup = false;
    let inRange = false;
    const ext = [];
    function add(str2, options1 = {
        split: false,
        last: false,
        only: ""
    }) {
        const { split , last , only  } = options1;
        if (only !== "path") regex += str2;
        if (filepath && only !== "regex") {
            pathRegexStr += str2.match(sepPattern) ? SEP1 : str2;
            if (split) {
                if (last) segment += str2;
                if (segment !== "") {
                    if (!flags.includes("g")) segment = `^${segment}$`;
                    pathSegments.push(new RegExp(segment, flags));
                }
                segment = "";
            } else {
                segment += str2;
            }
        }
    }
    let c, n;
    for(let i2 = 0; i2 < glob.length; i2++){
        c = glob[i2];
        n = glob[i2 + 1];
        if ([
            "\\",
            "$",
            "^",
            ".",
            "="
        ].includes(c)) {
            add(`\\${c}`);
            continue;
        }
        if (c.match(sepPattern)) {
            add(SEP1, {
                split: true
            });
            if (n != null && n.match(sepPattern) && !strict) regex += "?";
            continue;
        }
        if (c === "(") {
            if (ext.length) {
                add(`${c}?:`);
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === ")") {
            if (ext.length) {
                add(c);
                const type1 = ext.pop();
                if (type1 === "@") {
                    add("{1}");
                } else if (type1 === "!") {
                    add(WILDCARD);
                } else {
                    add(type1);
                }
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "|") {
            if (ext.length) {
                add(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "+") {
            if (n === "(" && extended) {
                ext.push(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "@" && extended) {
            if (n === "(") {
                ext.push(c);
                continue;
            }
        }
        if (c === "!") {
            if (extended) {
                if (inRange) {
                    add("^");
                    continue;
                }
                if (n === "(") {
                    ext.push(c);
                    add("(?!");
                    i2++;
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "?") {
            if (extended) {
                if (n === "(") {
                    ext.push(c);
                } else {
                    add(".");
                }
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "[") {
            if (inRange && n === ":") {
                i2++;
                let value = "";
                while(glob[++i2] !== ":")value += glob[i2];
                if (value === "alnum") add("(?:\\w|\\d)");
                else if (value === "space") add("\\s");
                else if (value === "digit") add("\\d");
                i2++;
                continue;
            }
            if (extended) {
                inRange = true;
                add(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "]") {
            if (extended) {
                inRange = false;
                add(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "{") {
            if (extended) {
                inGroup = true;
                add("(?:");
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "}") {
            if (extended) {
                inGroup = false;
                add(")");
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === ",") {
            if (inGroup) {
                add("|");
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "*") {
            if (n === "(" && extended) {
                ext.push(c);
                continue;
            }
            const prevChar = glob[i2 - 1];
            let starCount = 1;
            while(glob[i2 + 1] === "*"){
                starCount++;
                i2++;
            }
            const nextChar = glob[i2 + 1];
            if (!globstar) {
                add(".*");
            } else {
                const isGlobstar = starCount > 1 && [
                    SEP_RAW,
                    "/",
                    undefined
                ].includes(prevChar) && [
                    SEP_RAW,
                    "/",
                    undefined
                ].includes(nextChar);
                if (isGlobstar) {
                    add(GLOBSTAR, {
                        only: "regex"
                    });
                    add(GLOBSTAR_SEGMENT, {
                        only: "path",
                        last: true,
                        split: true
                    });
                    i2++;
                } else {
                    add(WILDCARD, {
                        only: "regex"
                    });
                    add(WILDCARD_SEGMENT, {
                        only: "path"
                    });
                }
            }
            continue;
        }
        add(c);
    }
    if (!flags.includes("g")) {
        regex = `^${regex}$`;
        segment = `^${segment}$`;
        if (filepath) pathRegexStr = `^${pathRegexStr}$`;
    }
    const result = {
        regex: new RegExp(regex, flags)
    };
    if (filepath) {
        pathSegments.push(new RegExp(segment, flags));
        result.path = {
            regex: new RegExp(pathRegexStr, flags),
            segments: pathSegments,
            globstar: new RegExp(!flags.includes("g") ? `^${GLOBSTAR_SEGMENT}$` : GLOBSTAR_SEGMENT, flags)
        };
    }
    return result;
}
function normalizeGlob(glob, { globstar =false  } = {
}) {
    if (glob.match(/\0/g)) {
        throw new Error(`Glob contains invalid characters: "${glob}"`);
    }
    if (!globstar) {
        return normalize(glob);
    }
    const s = SEP_PATTERN.source;
    const badParentPattern = new RegExp(`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`, "g");
    return normalize(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
function deferred() {
    let methods;
    const promise = new Promise((resolve2, reject)=>{
        methods = {
            resolve: resolve2,
            reject
        };
    });
    return Object.assign(promise, methods);
}
function emptyReader() {
    return {
        read (_) {
            return Promise.resolve(null);
        }
    };
}
function bodyReader(contentLength, r) {
    let totalRead = 0;
    let finished = false;
    async function read(buf) {
        if (finished) return null;
        let result;
        const remaining = contentLength - totalRead;
        if (remaining >= buf.byteLength) {
            result = await r.read(buf);
        } else {
            const readBuf = buf.subarray(0, remaining);
            result = await r.read(readBuf);
        }
        if (result !== null) {
            totalRead += result;
        }
        finished = totalRead === contentLength;
        return result;
    }
    return {
        read
    };
}
function findIndex(source, pat) {
    const s = pat[0];
    for(let i2 = 0; i2 < source.length; i2++){
        if (source[i2] !== s) continue;
        const pin = i2;
        let matched = 1;
        let j = i2;
        while(matched < pat.length){
            j++;
            if (source[j] !== pat[j - i2]) {
                break;
            }
            matched++;
        }
        if (matched === pat.length) {
            return i2;
        }
    }
    return -1;
}
function concat(origin, b) {
    const output = new Uint8Array(origin.length + b.length);
    output.set(origin, 0);
    output.set(b, origin.length);
    return output;
}
function copyBytes(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/g;
const encoder = new TextEncoder();
function encode(input) {
    return encoder.encode(input);
}
const decoder = new TextDecoder();
function decode(input) {
    return decoder.decode(input);
}
function str2(buf) {
    if (buf == null) {
        return "";
    } else {
        return decode(buf);
    }
}
function charCode(s) {
    return s.charCodeAt(0);
}
class TextProtoReader {
    constructor(r1){
        this.r = r1;
    }
    async readLine() {
        const s = await this.readLineSlice();
        if (s === null) return null;
        return str2(s);
    }
    async readMIMEHeader() {
        const m = new Headers();
        let line;
        let buf = await this.r.peek(1);
        if (buf === null) {
            return null;
        } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
            line = await this.readLineSlice();
        }
        buf = await this.r.peek(1);
        if (buf === null) {
            throw new Deno.errors.UnexpectedEof();
        } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
            throw new Deno.errors.InvalidData(`malformed MIME header initial line: ${str2(line)}`);
        }
        while(true){
            const kv = await this.readLineSlice();
            if (kv === null) throw new Deno.errors.UnexpectedEof();
            if (kv.byteLength === 0) return m;
            let i2 = kv.indexOf(charCode(":"));
            if (i2 < 0) {
                throw new Deno.errors.InvalidData(`malformed MIME header line: ${str2(kv)}`);
            }
            const key = str2(kv.subarray(0, i2));
            if (key == "") {
                continue;
            }
            i2++;
            while(i2 < kv.byteLength && (kv[i2] == charCode(" ") || kv[i2] == charCode("\t"))){
                i2++;
            }
            const value = str2(kv.subarray(i2)).replace(invalidHeaderCharRegex, encodeURI);
            try {
                m.append(key, value);
            } catch  {
            }
        }
    }
    async readLineSlice() {
        let line;
        while(true){
            const r1 = await this.r.readLine();
            if (r1 === null) return null;
            const { line: l , more  } = r1;
            if (!line && !more) {
                if (this.skipSpace(l) === 0) {
                    return new Uint8Array(0);
                }
                return l;
            }
            line = line ? concat(line, l) : l;
            if (!more) {
                break;
            }
        }
        return line;
    }
    skipSpace(l) {
        let n = 0;
        for(let i2 = 0; i2 < l.length; i2++){
            if (l[i2] === charCode(" ") || l[i2] === charCode("\t")) {
                continue;
            }
            n++;
        }
        return n;
    }
}
function chunkedBodyReader(h, r1) {
    const tp = new TextProtoReader(r1);
    let finished = false;
    const chunks = [];
    async function read(buf) {
        if (finished) return null;
        const [chunk] = chunks;
        if (chunk) {
            const chunkRemaining = chunk.data.byteLength - chunk.offset;
            const readLength = Math.min(chunkRemaining, buf.byteLength);
            for(let i2 = 0; i2 < readLength; i2++){
                buf[i2] = chunk.data[chunk.offset + i2];
            }
            chunk.offset += readLength;
            if (chunk.offset === chunk.data.byteLength) {
                chunks.shift();
                if (await tp.readLine() === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
            }
            return readLength;
        }
        const line = await tp.readLine();
        if (line === null) throw new Deno.errors.UnexpectedEof();
        const [chunkSizeString] = line.split(";");
        const chunkSize = parseInt(chunkSizeString, 16);
        if (Number.isNaN(chunkSize) || chunkSize < 0) {
            throw new Error("Invalid chunk size");
        }
        if (chunkSize > 0) {
            if (chunkSize > buf.byteLength) {
                let eof = await r1.readFull(buf);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                const restChunk = new Uint8Array(chunkSize - buf.byteLength);
                eof = await r1.readFull(restChunk);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                } else {
                    chunks.push({
                        offset: 0,
                        data: restChunk
                    });
                }
                return buf.byteLength;
            } else {
                const bufToFill = buf.subarray(0, chunkSize);
                const eof = await r1.readFull(bufToFill);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                if (await tp.readLine() === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                return chunkSize;
            }
        } else {
            assert(chunkSize === 0);
            if (await r1.readLine() === null) {
                throw new Deno.errors.UnexpectedEof();
            }
            await readTrailers(h, r1);
            finished = true;
            return null;
        }
    }
    return {
        read
    };
}
function isProhibidedForTrailer(key) {
    const s = new Set([
        "transfer-encoding",
        "content-length",
        "trailer"
    ]);
    return s.has(key.toLowerCase());
}
async function readTrailers(headers, r1) {
    const trailers = parseTrailer(headers.get("trailer"));
    if (trailers == null) return;
    const trailerNames = [
        ...trailers.keys()
    ];
    const tp = new TextProtoReader(r1);
    const result = await tp.readMIMEHeader();
    if (result == null) {
        throw new Deno.errors.InvalidData("Missing trailer header.");
    }
    const undeclared = [
        ...result.keys()
    ].filter((k)=>!trailerNames.includes(k)
    );
    if (undeclared.length > 0) {
        throw new Deno.errors.InvalidData(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
    }
    for (const [k, v] of result){
        headers.append(k, v);
    }
    const missingTrailers = trailerNames.filter((k1)=>!result.has(k1)
    );
    if (missingTrailers.length > 0) {
        throw new Deno.errors.InvalidData(`Missing trailers: ${Deno.inspect(missingTrailers)}.`);
    }
    headers.delete("trailer");
}
function parseTrailer(field) {
    if (field == null) {
        return undefined;
    }
    const trailerNames = field.split(",").map((v)=>v.trim().toLowerCase()
    );
    if (trailerNames.length === 0) {
        throw new Deno.errors.InvalidData("Empty trailer header.");
    }
    const prohibited = trailerNames.filter((k)=>isProhibidedForTrailer(k)
    );
    if (prohibited.length > 0) {
        throw new Deno.errors.InvalidData(`Prohibited trailer names: ${Deno.inspect(prohibited)}.`);
    }
    return new Headers(trailerNames.map((key)=>[
            key,
            ""
        ]
    ));
}
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
class BufferFullError extends Error {
    name = "BufferFullError";
    constructor(partial){
        super("Buffer full");
        this.partial = partial;
    }
}
class PartialReadError extends Deno.errors.UnexpectedEof {
    name = "PartialReadError";
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader {
    r = 0;
    w = 0;
    eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader ? r : new BufReader(r, size);
    }
    constructor(rd1, size1 = 4096){
        if (size1 < 16) {
            size1 = 16;
        }
        this._reset(new Uint8Array(size1), rd1);
    }
    size() {
        return this.buf.byteLength;
    }
    buffered() {
        return this.w - this.r;
    }
    async _fill() {
        if (this.r > 0) {
            this.buf.copyWithin(0, this.r, this.w);
            this.w -= this.r;
            this.r = 0;
        }
        if (this.w >= this.buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i2 = 100; i2 > 0; i2--){
            const rr = await this.rd.read(this.buf.subarray(this.w));
            if (rr === null) {
                this.eof = true;
                return;
            }
            assert(rr >= 0, "negative read");
            this.w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    }
    reset(r) {
        this._reset(this.buf, r);
    }
    _reset(buf, rd) {
        this.buf = buf;
        this.rd = rd;
        this.eof = false;
    }
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.r === this.w) {
            if (p.byteLength >= this.buf.byteLength) {
                const rr1 = await this.rd.read(p);
                const nread = rr1 ?? 0;
                assert(nread >= 0, "negative read");
                return rr1;
            }
            this.r = 0;
            this.w = 0;
            rr = await this.rd.read(this.buf);
            if (rr === 0 || rr === null) return rr;
            assert(rr >= 0, "negative read");
            this.w += rr;
        }
        const copied = copyBytes(this.buf.subarray(this.r, this.w), p, 0);
        this.r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                err.partial = p.subarray(0, bytesRead);
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.r === this.w){
            if (this.eof) return null;
            await this._fill();
        }
        const c = this.buf[this.r];
        this.r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer = await this.readSlice(delim.charCodeAt(0));
        if (buffer === null) return null;
        return new TextDecoder().decode(buffer);
    }
    async readLine() {
        let line;
        try {
            line = await this.readSlice(LF);
        } catch (err) {
            let { partial: partial1  } = err;
            assert(partial1 instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            if (!this.eof && partial1.byteLength > 0 && partial1[partial1.byteLength - 1] === CR) {
                assert(this.r > 0, "bufio: tried to rewind past start of buffer");
                this.r--;
                partial1 = partial1.subarray(0, partial1.byteLength - 1);
            }
            return {
                line: partial1,
                more: !this.eof
            };
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i2 = this.buf.subarray(this.r + s, this.w).indexOf(delim);
            if (i2 >= 0) {
                i2 += s;
                slice = this.buf.subarray(this.r, this.r + i2 + 1);
                this.r += i2 + 1;
                break;
            }
            if (this.eof) {
                if (this.r === this.w) {
                    return null;
                }
                slice = this.buf.subarray(this.r, this.w);
                this.r = this.w;
                break;
            }
            if (this.buffered() >= this.buf.byteLength) {
                this.r = this.w;
                const oldbuf = this.buf;
                const newbuf = this.buf.slice(0);
                this.buf = newbuf;
                throw new BufferFullError(oldbuf);
            }
            s = this.w - this.r;
            try {
                await this._fill();
            } catch (err) {
                err.partial = slice;
                throw err;
            }
        }
        return slice;
    }
    async peek(n) {
        if (n < 0) {
            throw Error("negative count");
        }
        let avail = this.w - this.r;
        while(avail < n && avail < this.buf.byteLength && !this.eof){
            try {
                await this._fill();
            } catch (err) {
                err.partial = this.buf.subarray(this.r, this.w);
                throw err;
            }
            avail = this.w - this.r;
        }
        if (avail === 0 && this.eof) {
            return null;
        } else if (avail < n && this.eof) {
            return this.buf.subarray(this.r, this.r + avail);
        } else if (avail < n) {
            throw new BufferFullError(this.buf.subarray(this.r, this.w));
        }
        return this.buf.subarray(this.r, this.r + n);
    }
}
class AbstractBufBase {
    usedBufferBytes = 0;
    err = null;
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter extends AbstractBufBase {
    static create(writer, size = 4096) {
        return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
    }
    constructor(writer1, size2 = 4096){
        super();
        this.writer = writer1;
        if (size2 <= 0) {
            size2 = 4096;
        }
        this.buf = new Uint8Array(size2);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            await Deno.writeAll(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.writer.write(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copyBytes(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copyBytes(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync extends AbstractBufBase {
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync ? writer : new BufWriterSync(writer, size);
    }
    constructor(writer2, size3 = 4096){
        super();
        this.writer = writer2;
        if (size3 <= 0) {
            size3 = 4096;
        }
        this.buf = new Uint8Array(size3);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            Deno.writeAllSync(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.writer.writeSync(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copyBytes(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copyBytes(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
function createLPS(pat) {
    const lps = new Uint8Array(pat.length);
    lps[0] = 0;
    let prefixEnd = 0;
    let i2 = 1;
    while(i2 < lps.length){
        if (pat[i2] == pat[prefixEnd]) {
            prefixEnd++;
            lps[i2] = prefixEnd;
            i2++;
        } else if (prefixEnd === 0) {
            lps[i2] = 0;
            i2++;
        } else {
            prefixEnd = pat[prefixEnd - 1];
        }
    }
    return lps;
}
async function* readDelim(reader, delim) {
    const delimLen = delim.length;
    const delimLPS = createLPS(delim);
    let inputBuffer = new Deno.Buffer();
    const inspectArr = new Uint8Array(Math.max(1024, delimLen + 1));
    let inspectIndex = 0;
    let matchIndex = 0;
    while(true){
        const result = await reader.read(inspectArr);
        if (result === null) {
            yield inputBuffer.bytes();
            return;
        }
        if (result < 0) {
            return;
        }
        const sliceRead = inspectArr.subarray(0, result);
        await Deno.writeAll(inputBuffer, sliceRead);
        let sliceToProcess = inputBuffer.bytes();
        while(inspectIndex < sliceToProcess.length){
            if (sliceToProcess[inspectIndex] === delim[matchIndex]) {
                inspectIndex++;
                matchIndex++;
                if (matchIndex === delimLen) {
                    const matchEnd = inspectIndex - delimLen;
                    const readyBytes = sliceToProcess.subarray(0, matchEnd);
                    const pendingBytes = sliceToProcess.slice(inspectIndex);
                    yield readyBytes;
                    sliceToProcess = pendingBytes;
                    inspectIndex = 0;
                    matchIndex = 0;
                }
            } else {
                if (matchIndex === 0) {
                    inspectIndex++;
                } else {
                    matchIndex = delimLPS[matchIndex - 1];
                }
            }
        }
        inputBuffer = new Deno.Buffer(sliceToProcess);
    }
}
async function* readStringDelim(reader, delim) {
    const encoder1 = new TextEncoder();
    const decoder1 = new TextDecoder();
    for await (const chunk of readDelim(reader, encoder1.encode(delim))){
        yield decoder1.decode(chunk);
    }
}
async function writeChunkedBody(w, r2) {
    const writer3 = BufWriter.create(w);
    for await (const chunk of Deno.iter(r2)){
        if (chunk.byteLength <= 0) continue;
        const start = encoder.encode(`${chunk.byteLength.toString(16)}\r\n`);
        const end = encoder.encode("\r\n");
        await writer3.write(start);
        await writer3.write(chunk);
        await writer3.write(end);
    }
    const endChunk = encoder.encode("0\r\n\r\n");
    await writer3.write(endChunk);
}
async function writeTrailers(w, headers, trailers) {
    const trailer = headers.get("trailer");
    if (trailer === null) {
        throw new TypeError("Missing trailer header.");
    }
    const transferEncoding = headers.get("transfer-encoding");
    if (transferEncoding === null || !transferEncoding.match(/^chunked/)) {
        throw new TypeError(`Trailers are only allowed for "transfer-encoding: chunked", got "transfer-encoding: ${transferEncoding}".`);
    }
    const writer3 = BufWriter.create(w);
    const trailerNames = trailer.split(",").map((s)=>s.trim().toLowerCase()
    );
    const prohibitedTrailers = trailerNames.filter((k)=>isProhibidedForTrailer(k)
    );
    if (prohibitedTrailers.length > 0) {
        throw new TypeError(`Prohibited trailer names: ${Deno.inspect(prohibitedTrailers)}.`);
    }
    const undeclared = [
        ...trailers.keys()
    ].filter((k)=>!trailerNames.includes(k)
    );
    if (undeclared.length > 0) {
        throw new TypeError(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
    }
    for (const [key, value] of trailers){
        await writer3.write(encoder.encode(`${key}: ${value}\r\n`));
    }
    await writer3.write(encoder.encode("\r\n"));
    await writer3.flush();
}
var Status;
(function(Status1) {
    Status1[Status1["Continue"] = 100] = "Continue";
    Status1[Status1["SwitchingProtocols"] = 101] = "SwitchingProtocols";
    Status1[Status1["Processing"] = 102] = "Processing";
    Status1[Status1["EarlyHints"] = 103] = "EarlyHints";
    Status1[Status1["OK"] = 200] = "OK";
    Status1[Status1["Created"] = 201] = "Created";
    Status1[Status1["Accepted"] = 202] = "Accepted";
    Status1[Status1["NonAuthoritativeInfo"] = 203] = "NonAuthoritativeInfo";
    Status1[Status1["NoContent"] = 204] = "NoContent";
    Status1[Status1["ResetContent"] = 205] = "ResetContent";
    Status1[Status1["PartialContent"] = 206] = "PartialContent";
    Status1[Status1["MultiStatus"] = 207] = "MultiStatus";
    Status1[Status1["AlreadyReported"] = 208] = "AlreadyReported";
    Status1[Status1["IMUsed"] = 226] = "IMUsed";
    Status1[Status1["MultipleChoices"] = 300] = "MultipleChoices";
    Status1[Status1["MovedPermanently"] = 301] = "MovedPermanently";
    Status1[Status1["Found"] = 302] = "Found";
    Status1[Status1["SeeOther"] = 303] = "SeeOther";
    Status1[Status1["NotModified"] = 304] = "NotModified";
    Status1[Status1["UseProxy"] = 305] = "UseProxy";
    Status1[Status1["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    Status1[Status1["PermanentRedirect"] = 308] = "PermanentRedirect";
    Status1[Status1["BadRequest"] = 400] = "BadRequest";
    Status1[Status1["Unauthorized"] = 401] = "Unauthorized";
    Status1[Status1["PaymentRequired"] = 402] = "PaymentRequired";
    Status1[Status1["Forbidden"] = 403] = "Forbidden";
    Status1[Status1["NotFound"] = 404] = "NotFound";
    Status1[Status1["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    Status1[Status1["NotAcceptable"] = 406] = "NotAcceptable";
    Status1[Status1["ProxyAuthRequired"] = 407] = "ProxyAuthRequired";
    Status1[Status1["RequestTimeout"] = 408] = "RequestTimeout";
    Status1[Status1["Conflict"] = 409] = "Conflict";
    Status1[Status1["Gone"] = 410] = "Gone";
    Status1[Status1["LengthRequired"] = 411] = "LengthRequired";
    Status1[Status1["PreconditionFailed"] = 412] = "PreconditionFailed";
    Status1[Status1["RequestEntityTooLarge"] = 413] = "RequestEntityTooLarge";
    Status1[Status1["RequestURITooLong"] = 414] = "RequestURITooLong";
    Status1[Status1["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
    Status1[Status1["RequestedRangeNotSatisfiable"] = 416] = "RequestedRangeNotSatisfiable";
    Status1[Status1["ExpectationFailed"] = 417] = "ExpectationFailed";
    Status1[Status1["Teapot"] = 418] = "Teapot";
    Status1[Status1["MisdirectedRequest"] = 421] = "MisdirectedRequest";
    Status1[Status1["UnprocessableEntity"] = 422] = "UnprocessableEntity";
    Status1[Status1["Locked"] = 423] = "Locked";
    Status1[Status1["FailedDependency"] = 424] = "FailedDependency";
    Status1[Status1["TooEarly"] = 425] = "TooEarly";
    Status1[Status1["UpgradeRequired"] = 426] = "UpgradeRequired";
    Status1[Status1["PreconditionRequired"] = 428] = "PreconditionRequired";
    Status1[Status1["TooManyRequests"] = 429] = "TooManyRequests";
    Status1[Status1["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
    Status1[Status1["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
    Status1[Status1["InternalServerError"] = 500] = "InternalServerError";
    Status1[Status1["NotImplemented"] = 501] = "NotImplemented";
    Status1[Status1["BadGateway"] = 502] = "BadGateway";
    Status1[Status1["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    Status1[Status1["GatewayTimeout"] = 504] = "GatewayTimeout";
    Status1[Status1["HTTPVersionNotSupported"] = 505] = "HTTPVersionNotSupported";
    Status1[Status1["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
    Status1[Status1["InsufficientStorage"] = 507] = "InsufficientStorage";
    Status1[Status1["LoopDetected"] = 508] = "LoopDetected";
    Status1[Status1["NotExtended"] = 510] = "NotExtended";
    Status1[Status1["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(Status || (Status = {
}));
const STATUS_TEXT = new Map([
    [
        Status.Continue,
        "Continue"
    ],
    [
        Status.SwitchingProtocols,
        "Switching Protocols"
    ],
    [
        Status.Processing,
        "Processing"
    ],
    [
        Status.EarlyHints,
        "Early Hints"
    ],
    [
        Status.OK,
        "OK"
    ],
    [
        Status.Created,
        "Created"
    ],
    [
        Status.Accepted,
        "Accepted"
    ],
    [
        Status.NonAuthoritativeInfo,
        "Non-Authoritative Information"
    ],
    [
        Status.NoContent,
        "No Content"
    ],
    [
        Status.ResetContent,
        "Reset Content"
    ],
    [
        Status.PartialContent,
        "Partial Content"
    ],
    [
        Status.MultiStatus,
        "Multi-Status"
    ],
    [
        Status.AlreadyReported,
        "Already Reported"
    ],
    [
        Status.IMUsed,
        "IM Used"
    ],
    [
        Status.MultipleChoices,
        "Multiple Choices"
    ],
    [
        Status.MovedPermanently,
        "Moved Permanently"
    ],
    [
        Status.Found,
        "Found"
    ],
    [
        Status.SeeOther,
        "See Other"
    ],
    [
        Status.NotModified,
        "Not Modified"
    ],
    [
        Status.UseProxy,
        "Use Proxy"
    ],
    [
        Status.TemporaryRedirect,
        "Temporary Redirect"
    ],
    [
        Status.PermanentRedirect,
        "Permanent Redirect"
    ],
    [
        Status.BadRequest,
        "Bad Request"
    ],
    [
        Status.Unauthorized,
        "Unauthorized"
    ],
    [
        Status.PaymentRequired,
        "Payment Required"
    ],
    [
        Status.Forbidden,
        "Forbidden"
    ],
    [
        Status.NotFound,
        "Not Found"
    ],
    [
        Status.MethodNotAllowed,
        "Method Not Allowed"
    ],
    [
        Status.NotAcceptable,
        "Not Acceptable"
    ],
    [
        Status.ProxyAuthRequired,
        "Proxy Authentication Required"
    ],
    [
        Status.RequestTimeout,
        "Request Timeout"
    ],
    [
        Status.Conflict,
        "Conflict"
    ],
    [
        Status.Gone,
        "Gone"
    ],
    [
        Status.LengthRequired,
        "Length Required"
    ],
    [
        Status.PreconditionFailed,
        "Precondition Failed"
    ],
    [
        Status.RequestEntityTooLarge,
        "Request Entity Too Large"
    ],
    [
        Status.RequestURITooLong,
        "Request URI Too Long"
    ],
    [
        Status.UnsupportedMediaType,
        "Unsupported Media Type"
    ],
    [
        Status.RequestedRangeNotSatisfiable,
        "Requested Range Not Satisfiable"
    ],
    [
        Status.ExpectationFailed,
        "Expectation Failed"
    ],
    [
        Status.Teapot,
        "I'm a teapot"
    ],
    [
        Status.MisdirectedRequest,
        "Misdirected Request"
    ],
    [
        Status.UnprocessableEntity,
        "Unprocessable Entity"
    ],
    [
        Status.Locked,
        "Locked"
    ],
    [
        Status.FailedDependency,
        "Failed Dependency"
    ],
    [
        Status.TooEarly,
        "Too Early"
    ],
    [
        Status.UpgradeRequired,
        "Upgrade Required"
    ],
    [
        Status.PreconditionRequired,
        "Precondition Required"
    ],
    [
        Status.TooManyRequests,
        "Too Many Requests"
    ],
    [
        Status.RequestHeaderFieldsTooLarge,
        "Request Header Fields Too Large"
    ],
    [
        Status.UnavailableForLegalReasons,
        "Unavailable For Legal Reasons"
    ],
    [
        Status.InternalServerError,
        "Internal Server Error"
    ],
    [
        Status.NotImplemented,
        "Not Implemented"
    ],
    [
        Status.BadGateway,
        "Bad Gateway"
    ],
    [
        Status.ServiceUnavailable,
        "Service Unavailable"
    ],
    [
        Status.GatewayTimeout,
        "Gateway Timeout"
    ],
    [
        Status.HTTPVersionNotSupported,
        "HTTP Version Not Supported"
    ],
    [
        Status.VariantAlsoNegotiates,
        "Variant Also Negotiates"
    ],
    [
        Status.InsufficientStorage,
        "Insufficient Storage"
    ],
    [
        Status.LoopDetected,
        "Loop Detected"
    ],
    [
        Status.NotExtended,
        "Not Extended"
    ],
    [
        Status.NetworkAuthenticationRequired,
        "Network Authentication Required"
    ],
]);
async function writeResponse(w, r2) {
    const protoMajor = 1;
    const protoMinor = 1;
    const statusCode = r2.status || 200;
    const statusText = STATUS_TEXT.get(statusCode);
    const writer3 = BufWriter.create(w);
    if (!statusText) {
        throw new Deno.errors.InvalidData("Bad status code");
    }
    if (!r2.body) {
        r2.body = new Uint8Array();
    }
    if (typeof r2.body === "string") {
        r2.body = encoder.encode(r2.body);
    }
    let out = `HTTP/${1}.${1} ${statusCode} ${statusText}\r\n`;
    const headers = r2.headers ?? new Headers();
    if (r2.body && !headers.get("content-length")) {
        if (r2.body instanceof Uint8Array) {
            out += `content-length: ${r2.body.byteLength}\r\n`;
        } else if (!headers.get("transfer-encoding")) {
            out += "transfer-encoding: chunked\r\n";
        }
    }
    for (const [key, value] of headers){
        out += `${key}: ${value}\r\n`;
    }
    out += `\r\n`;
    const header = encoder.encode(out);
    const n = await writer3.write(header);
    assert(n === header.byteLength);
    if (r2.body instanceof Uint8Array) {
        const n1 = await writer3.write(r2.body);
        assert(n1 === r2.body.byteLength);
    } else if (headers.has("content-length")) {
        const contentLength = headers.get("content-length");
        assert(contentLength != null);
        const bodyLength = parseInt(contentLength);
        const n1 = await Deno.copy(r2.body, writer3);
        assert(n1 === bodyLength);
    } else {
        await writeChunkedBody(writer3, r2.body);
    }
    if (r2.trailers) {
        const t = await r2.trailers();
        await writeTrailers(writer3, headers, t);
    }
    await writer3.flush();
}
function parseHTTPVersion(vers) {
    switch(vers){
        case "HTTP/1.1":
            return [
                1,
                1
            ];
        case "HTTP/1.0":
            return [
                1,
                0
            ];
        default:
            {
                const Big = 1000000;
                if (!vers.startsWith("HTTP/")) {
                    break;
                }
                const dot = vers.indexOf(".");
                if (dot < 0) {
                    break;
                }
                const majorStr = vers.substring(vers.indexOf("/") + 1, dot);
                const major = Number(majorStr);
                if (!Number.isInteger(major) || major < 0 || major > 1000000) {
                    break;
                }
                const minorStr = vers.substring(dot + 1);
                const minor = Number(minorStr);
                if (!Number.isInteger(minor) || minor < 0 || minor > 1000000) {
                    break;
                }
                return [
                    major,
                    minor
                ];
            }
    }
    throw new Error(`malformed HTTP version ${vers}`);
}
class ServerRequest {
    done = deferred();
    _contentLength = undefined;
    get contentLength() {
        if (this._contentLength === undefined) {
            const cl = this.headers.get("content-length");
            if (cl) {
                this._contentLength = parseInt(cl);
                if (Number.isNaN(this._contentLength)) {
                    this._contentLength = null;
                }
            } else {
                this._contentLength = null;
            }
        }
        return this._contentLength;
    }
    _body = null;
    get body() {
        if (!this._body) {
            if (this.contentLength != null) {
                this._body = bodyReader(this.contentLength, this.r);
            } else {
                const transferEncoding = this.headers.get("transfer-encoding");
                if (transferEncoding != null) {
                    const parts = transferEncoding.split(",").map((e)=>e.trim().toLowerCase()
                    );
                    assert(parts.includes("chunked"), 'transfer-encoding must include "chunked" if content-length is not set');
                    this._body = chunkedBodyReader(this.headers, this.r);
                } else {
                    this._body = emptyReader();
                }
            }
        }
        return this._body;
    }
    async respond(r) {
        let err;
        try {
            await writeResponse(this.w, r);
        } catch (e) {
            try {
                this.conn.close();
            } catch  {
            }
            err = e;
        }
        this.done.resolve(err);
        if (err) {
            throw err;
        }
    }
    finalized = false;
    async finalize() {
        if (this.finalized) return;
        const body = this.body;
        const buf = new Uint8Array(1024);
        while(await body.read(buf) !== null){
        }
        this.finalized = true;
    }
}
async function readRequest(conn, bufr) {
    const tp = new TextProtoReader(bufr);
    const firstLine = await tp.readLine();
    if (firstLine === null) return null;
    const headers = await tp.readMIMEHeader();
    if (headers === null) throw new Deno.errors.UnexpectedEof();
    const req = new ServerRequest();
    req.conn = conn;
    req.r = bufr;
    [req.method, req.url, req.proto] = firstLine.split(" ", 3);
    [req.protoMinor, req.protoMajor] = parseHTTPVersion(req.proto);
    req.headers = headers;
    fixLength(req);
    return req;
}
function fixLength(req) {
    const contentLength = req.headers.get("Content-Length");
    if (contentLength) {
        const arrClen = contentLength.split(",");
        if (arrClen.length > 1) {
            const distinct = [
                ...new Set(arrClen.map((e)=>e.trim()
                ))
            ];
            if (distinct.length > 1) {
                throw Error("cannot contain multiple Content-Length headers");
            } else {
                req.headers.set("Content-Length", distinct[0]);
            }
        }
        const c = req.headers.get("Content-Length");
        if (req.method === "HEAD" && c && c !== "0") {
            throw Error("http: method cannot contain a Content-Length");
        }
        if (c && req.headers.has("transfer-encoding")) {
            throw new Error("http: Transfer-Encoding and Content-Length cannot be send together");
        }
    }
}
class MuxAsyncIterator {
    iteratorCount = 0;
    yields = [];
    throws = [];
    signal = deferred();
    add(iterator) {
        ++this.iteratorCount;
        this.callIteratorNext(iterator);
    }
    async callIteratorNext(iterator) {
        try {
            const { value , done  } = await iterator.next();
            if (done) {
                --this.iteratorCount;
            } else {
                this.yields.push({
                    iterator,
                    value
                });
            }
        } catch (e) {
            this.throws.push(e);
        }
        this.signal.resolve();
    }
    async *iterate() {
        while(this.iteratorCount > 0){
            await this.signal;
            for(let i2 = 0; i2 < this.yields.length; i2++){
                const { iterator: iterator2 , value  } = this.yields[i2];
                yield value;
                this.callIteratorNext(iterator2);
            }
            if (this.throws.length) {
                for (const e of this.throws){
                    throw e;
                }
                this.throws.length = 0;
            }
            this.yields.length = 0;
            this.signal = deferred();
        }
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
}
class Server {
    closing = false;
    connections = [];
    constructor(listener){
        this.listener = listener;
    }
    close() {
        this.closing = true;
        this.listener.close();
        for (const conn of this.connections){
            try {
                conn.close();
            } catch (e) {
                if (!(e instanceof Deno.errors.BadResource)) {
                    throw e;
                }
            }
        }
    }
    async *iterateHttpRequests(conn) {
        const reader = new BufReader(conn);
        const writer3 = new BufWriter(conn);
        while(!this.closing){
            let request;
            try {
                request = await readRequest(conn, reader);
            } catch (error) {
                if (error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof) {
                    await writeResponse(writer3, {
                        status: 400,
                        body: encode(`${error.message}\r\n\r\n`)
                    });
                }
                break;
            }
            if (request === null) {
                break;
            }
            request.w = writer3;
            yield request;
            const responseError = await request.done;
            if (responseError) {
                this.untrackConnection(request.conn);
                return;
            }
            await request.finalize();
        }
        this.untrackConnection(conn);
        try {
            conn.close();
        } catch (e) {
        }
    }
    trackConnection(conn) {
        this.connections.push(conn);
    }
    untrackConnection(conn) {
        const index = this.connections.indexOf(conn);
        if (index !== -1) {
            this.connections.splice(index, 1);
        }
    }
    async *acceptConnAndIterateHttpRequests(mux) {
        if (this.closing) return;
        let conn;
        try {
            conn = await this.listener.accept();
        } catch (error) {
            if (error instanceof Deno.errors.BadResource || error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof) {
                return mux.add(this.acceptConnAndIterateHttpRequests(mux));
            }
            throw error;
        }
        this.trackConnection(conn);
        mux.add(this.acceptConnAndIterateHttpRequests(mux));
        yield* this.iterateHttpRequests(conn);
    }
    [Symbol.asyncIterator]() {
        const mux = new MuxAsyncIterator();
        mux.add(this.acceptConnAndIterateHttpRequests(mux));
        return mux.iterate();
    }
}
function _parseAddrFromStr(addr) {
    let url;
    try {
        const host = addr.startsWith(":") ? `0.0.0.0${addr}` : addr;
        url = new URL(`http://${host}`);
    } catch  {
        throw new TypeError("Invalid address.");
    }
    if (url.username || url.password || url.pathname != "/" || url.search || url.hash) {
        throw new TypeError("Invalid address.");
    }
    return {
        hostname: url.hostname,
        port: url.port === "" ? 80 : Number(url.port)
    };
}
function serve(addr) {
    if (typeof addr === "string") {
        addr = _parseAddrFromStr(addr);
    }
    const listener1 = Deno.listen(addr);
    return new Server(listener1);
}
function serveTLS(options1) {
    const tlsOptions = {
        ...options1,
        transport: "tcp"
    };
    const listener1 = Deno.listenTls(tlsOptions);
    return new Server(listener1);
}
const __default15 = Ogone;
export { __default15 as default };
const Ogone1 = Ogone;
const Ogone2 = Ogone;
console.warn(Ogone.getBundle)