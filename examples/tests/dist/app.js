class Obj {
    position = [];
    texture = [];
    normal = [];
    objects = [];
    materialLibs = [];
    static parse(text, options = {
        strict: false
    }) {
        const dat = new Obj();
        let obj = {
            name: "default",
            groups: []
        };
        let group;
        for (const line of text.split("\n")){
            if (line.length === 0 || line.startsWith("#")) {
                continue;
            }
            const parts = line.split(/\s+/);
            const keyword = parts.shift();
            switch(keyword){
                case "v":
                    dat.position.push([
                        otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        }),
                        otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        }),
                        otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        }), 
                    ]);
                    break;
                case "vt":
                    dat.texture.push([
                        otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        }),
                        otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        }), 
                    ]);
                    break;
                case "vn":
                    dat.normal.push([
                        otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        }),
                        otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        }),
                        otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        }), 
                    ]);
                    break;
                case "f":
                    {
                        const poly = dat.parseFace(parts);
                        if (group === undefined) {
                            group = {
                                name: "default",
                                index: 0,
                                polys: [
                                    poly
                                ]
                            };
                        } else {
                            group.polys.push(poly);
                        }
                    }
                    break;
                case "o":
                    if (group !== undefined) {
                        obj.groups.push(group);
                        dat.objects.push(obj);
                        group = undefined;
                    }
                    obj = line.length > 2 ? {
                        name: line.slice(keyword.length).trim(),
                        groups: []
                    } : {
                        name: "default",
                        groups: []
                    };
                    break;
                case "g":
                    if (group !== undefined) {
                        obj.groups.push(group);
                    }
                    if (line.length > 2) {
                        group = {
                            name: line.slice(keyword.length).trim(),
                            index: 0,
                            polys: []
                        };
                    }
                    break;
                case "mtllib":
                    dat.materialLibs.push(new Mtl(line.slice(keyword.length).trim()));
                    break;
                case "usemtl":
                    {
                        const g = otherwise(group, (g1)=>g1
                        , ()=>({
                                name: "default",
                                index: 0,
                                polys: []
                            })
                        );
                        if (g.material !== undefined) {
                            obj.groups.push(g);
                            g.index += 1;
                            g.polys = [];
                        }
                        g.material = otherwise(parts.shift(), (ref)=>({
                                ref
                            })
                        , ()=>{
                            throw IncorrectArguments;
                        });
                        group = g;
                    }
                    break;
                case "s": break;
                case "l": break;
                default:
                    if (options.unhandled) {
                        options.unhandled(keyword, parts);
                    }
                    if (options.strict) {
                        throw new SyntaxError(`Unhandled keyword ${keyword} on line ${line + 1}`);
                    }
                    break;
            }
        }
        if (group !== undefined) {
            obj.groups.push(group);
        }
        dat.objects.push(obj);
        return dat;
    }
    parseFace(items) {
        const ret = [];
        if (items.length < 3) {
            throw new RangeError("Face command has less than 3 vertices");
        }
        for (const item of items){
            ret.push(this.parseGroup(item));
        }
        return ret;
    }
    parseGroup(group) {
        const groupSplit = group.split("/");
        const p = then(groupSplit.shift(), parseFloat);
        const t = then(groupSplit.shift(), (idx)=>{
            if (idx !== "") {
                return parseFloat(idx);
            }
        });
        const n = then(groupSplit.shift(), parseFloat);
        if (p !== undefined) {
            const normalized = normalize(p, this.position.length);
            if (normalized === undefined) {
                throw new SyntaxError("Zero vertex numbers are invalid");
            }
            return [
                normalized,
                then(t, (t1)=>normalize(t1, this.texture.length)
                ),
                then(n, (n1)=>normalize(n1, this.normal.length)
                ), 
            ];
        }
        throw new SyntaxError("Malformed face group");
    }
}
class Mtl {
    constructor(name1){
        this.name = name1;
        this.materials = [];
    }
    static parse(name, text, options = {
        strict: false
    }) {
        const mtl = new Mtl(name);
        let material = undefined;
        for (const line of text.split("\n")){
            if (line.length === 0 || line.startsWith("#")) {
                continue;
            }
            const parts = line.split(/\s+/);
            const keyword = parts.shift();
            switch(keyword){
                case "newmtl":
                    if (material !== undefined) {
                        mtl.materials.push(material);
                    }
                    material = {
                        name: otherwise(parts.shift(), (n)=>n
                        , ()=>{
                            throw new SyntaxError("Missing material name");
                        })
                    };
                    break;
                case "Ka":
                    if (material !== undefined) {
                        material.ka = mtl.parseVec(parts);
                    }
                    break;
                case "Kd":
                    if (material !== undefined) {
                        material.kd = mtl.parseVec(parts);
                    }
                    break;
                case "Ks":
                    if (material !== undefined) {
                        material.ks = mtl.parseVec(parts);
                    }
                    break;
                case "Ke":
                    if (material !== undefined) {
                        material.ke = mtl.parseVec(parts);
                    }
                    break;
                case "Ns":
                    if (material !== undefined) {
                        material.ns = otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        });
                    }
                    break;
                case "Ni":
                    if (material !== undefined) {
                        material.ni = otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        });
                    }
                    break;
                case "Km":
                    if (material !== undefined) {
                        material.km = otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        });
                    }
                    break;
                case "d":
                    if (material !== undefined) {
                        material.d = otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        });
                    }
                    break;
                case "Tr":
                    if (material !== undefined) {
                        material.tr = otherwise(parts.shift(), parseFloat, ()=>{
                            throw IncorrectArguments;
                        });
                    }
                    break;
                case "Tf":
                    if (material !== undefined) {
                        material.tf = mtl.parseVec(parts);
                    }
                    break;
                case "illum":
                    if (material !== undefined) {
                        material.illum = otherwise(parts.shift(), parseInt, ()=>{
                            throw IncorrectArguments;
                        });
                    }
                    break;
                case "map_Ka":
                    if (material !== undefined) {
                        material.mapKa = line.slice(keyword.length).trim();
                    }
                    break;
                case "map_Kd":
                    if (material !== undefined) {
                        material.mapKd = line.slice(keyword.length).trim();
                    }
                    break;
                case "map_Ks":
                    if (material !== undefined) {
                        material.mapKs = line.slice(keyword.length).trim();
                    }
                    break;
                case "map_Ns":
                    if (material !== undefined) {
                        material.mapNs = line.slice(keyword.length).trim();
                    }
                    break;
                case "map_d":
                    if (material !== undefined) {
                        material.mapD = line.slice(keyword.length).trim();
                    }
                    break;
                case "map_refl":
                case "refl":
                    if (material !== undefined) {
                        material.mapD = line.slice(keyword.length).trim();
                    }
                    break;
                case "map_bump":
                case "map_Bump":
                case "bump":
                    if (material !== undefined) {
                        material.mapBump = line.slice(keyword.length).trim();
                    }
                    break;
                case "map_disp":
                case "map_Disp":
                case "dip":
                    if (material !== undefined) {
                        material.mapDisp = line.slice(keyword.length).trim();
                    }
                    break;
                default:
                    if (options.unhandled) {
                        options.unhandled(keyword, parts);
                    }
                    if (options.strict) {
                        throw new SyntaxError(`Unhandled keyword ${keyword} on line ${line + 1}`);
                    }
                    break;
            }
        }
        return mtl;
    }
    parseVec(parts) {
        return [
            otherwise(parts.shift(), parseFloat, ()=>{
                throw IncorrectArguments;
            }),
            otherwise(parts.shift(), parseFloat, ()=>{
                throw IncorrectArguments;
            }),
            otherwise(parts.shift(), parseFloat, ()=>{
                throw IncorrectArguments;
            }), 
        ];
    }
}
const IncorrectArguments = new SyntaxError("An argument list either has unparsable arguments or is missing arguments");
function then(v, f) {
    if (v !== undefined) {
        return f(v);
    }
}
function otherwise(v, f, o) {
    if (v !== undefined) {
        return f(v);
    }
    return o();
}
function normalize(idx, len) {
    if (idx < 0) {
        return len + idx;
    }
    if (idx > 0) {
        return idx - 1;
    }
}
const __default = (n)=>n * 7 + 75
;
const __default1 = (...args)=>{
    console.warn('second print changed avv', __default(19), ...args);
};
const __default2 = (...args)=>{
    console.warn('printed from a module', ...args);
    __default1('test importing files aa baaaa');
    return 'print works well';
};
const ROOT_UUID = "o1370160080";
const _ogone_node_ = "o-node";
const Ogone = {
    types: {
    },
    root: false,
    require: {
    },
    stores: {
    },
    clients: [],
    arrays: {
    },
    render: {
    },
    protocols: {
    },
    contexts: {
    },
    components: {
    },
    classes: {
    },
    errorPanel: null,
    warnPanel: null,
    successPanel: null,
    infosPanel: null,
    errors: 0,
    firstErrorPerf: null,
    mod: {
        '*': []
    },
    ComponentCollectionManager: null,
    instances: {
    },
    routerReactions: [],
    actualRoute: null,
    displayError (message, errorType, errorObject) {
        if (!Ogone.errorPanel) {
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
            Ogone.errorPanel = p;
        }
        Ogone.errors++;
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
        const errorId = Ogone.errors;
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
        if (!Ogone.firstErrorPerf) {
            Ogone.firstErrorPerf = performance.now();
        }
        if (Ogone.errorPanel) {
            Ogone.errorPanel.style.paddingTop = "30px";
            err.style.gridArea = `e${errorId}`;
            const m = 2;
            let grid = "";
            let i = 0;
            let a = 0;
            for((i = 0, a = Ogone.errorPanel.childNodes.length + 1); i < a; i++){
                grid += `e${i + 1} `;
            }
            let b = i;
            while(i % 2){
                grid += `e${b} `;
                i++;
            }
            const cells = grid.split(" ");
            var o, j, temparray, chunk = 2;
            let newgrid = "";
            for((o = 0, j = cells.length - 1); o < j; o += chunk){
                temparray = cells.slice(o, o + chunk);
                newgrid += ` "${temparray.join(" ")}"`;
            }
            Ogone.errorPanel.style.gridGap = "10px";
            Ogone.errorPanel.style.gridAutoRows = "max-content";
            Ogone.errorPanel.style.gridTemplateRows = "masonry";
            Ogone.errorPanel.style.gridTemplateAreas = newgrid;
            err.style.animationName = "popup";
            err.style.animationIterationCount = "1";
            err.style.animationDuration = "0.5s";
            err.append(h, code, stack);
            Ogone.errorPanel.append(err);
            Ogone.errorPanel.style.pointerEvents = "scroll";
            !Ogone.errorPanel.isConnected ? document.body.append(Ogone.errorPanel) : [];
        }
    },
    files: [],
    directories: [],
    controllers: {
    },
    main: '',
    allowedTypes: [
        "app",
        "router",
        "store",
        "controller",
        "async",
        "component", 
    ],
    router: {
        react: [],
        actualRoute: null,
        go: (...args)=>{
            routerGo(...args);
        }
    },
    get isDeno () {
        return typeof Deno !== "undefined" && !!Deno.chmod;
    }
};
var ClientRole;
(function(ClientRole1) {
    ClientRole1[ClientRole1["Standard"] = 0] = "Standard";
    ClientRole1[ClientRole1["Edition"] = 1] = "Edition";
})(ClientRole || (ClientRole = {
}));
class HMR {
    static FIFOMessages = [];
    static port = 3434;
    static isInErrorState = false;
    static isWaitingForServerPort = false;
    static heartBeatIntervalTime = 500;
    static components = {
    };
    static clients = new Map();
    static listeners = new Map();
    static get connect() {
        return `ws://0.0.0.0:${this.port}/`;
    }
    static startHandshake() {
    }
    static async sendError(error, diagnostics) {
        this.postMessage({
            error,
            diagnostics
        });
    }
    static get isInBrowser() {
        return typeof document !== 'undefined';
    }
    static get panelInformations() {
        if (!this.isInBrowser) throw new Error('cannot use panelInformations outside the browser');
        return this._panelInformations || (this._panelInformations = document.createElement('ul'));
    }
    static useOgone(ogone) {
        if (this.isInBrowser) {
            this.ogone = ogone;
            this.clientSettings();
        }
    }
    static clientSettings(shouldReload) {
        try {
            this.client = new WebSocket(this.connect);
        } catch (err) {
            return;
        }
        setTimeout(()=>{
            if (this.checkHeartBeat()) {
                if (shouldReload) {
                    this.clearInterval();
                    this.showHMRMessage('HMR reconnected, waiting for reload message', 'success');
                    this.showHMRMessage(`<span class="link" onclick="window.location.reload()">click here to reload it manually</span>`);
                    this.isWaitingForServerPort = true;
                }
            } else {
                this.showHMRMessage('heart beat goes on false', 'warn');
            }
        }, this.heartBeatIntervalTime);
        this.client.onmessage = (evt)=>{
            const payload = JSON.parse(evt.data);
            const { uuid , output , error , errorFile , diagnostics , type , pathToModule , uuidReq , port  } = payload;
            if (type === 'server') {
                const { search , pathname  } = window.location;
                window.location.replace(`http://localhost:${port}${pathname}${search}`);
                return;
            }
            if (type === 'reload') {
                window.location.reload();
                return;
            }
            if (type === 'resolved') {
                this.isInErrorState = false;
                this.hideHMRMessage();
                return;
            }
            if (type === 'style') {
                let style = document.querySelector(`style#${uuid}`);
                if (style) {
                    if (output !== style.innerHTML) style.innerHTML = output;
                } else {
                    style = document.createElement('style');
                    style.id = uuid;
                    style.innerHTML = output;
                    document.head.append(style);
                }
                return;
            }
            if (type === 'module') {
                this.getModule(pathToModule, uuidReq, uuid);
            }
            if (error) {
                this.hideHMRMessage();
                this.isInErrorState = true;
                console.error(error);
                let errorUuid;
                diagnostics.forEach((diag)=>{
                    let errorMessage = '';
                    const { sourceLine , messageText  } = diag;
                    if (diag) {
                        errorUuid = diag.fileName && diag.fileName.match(/(?<=\/)(?<uuid>[\w\d\-]+?)\.tsx$/)?.groups?.uuid || undefined;
                    }
                    const start = diag.start && diag.start.character || 0;
                    const end = diag.end && diag.end.character || 0;
                    const repeatNumber = end - start - 1;
                    let sourceline = diag && sourceLine || '';
                    sourceline = repeatNumber >= 0 ? sourceline.substring(0, start) + '<span class="critic">' + sourceline.substring(start, end) + '</span>' + sourceline.substring(end) : sourceline;
                    errorMessage = `\n<span class="critic">TS${diag && diag.code} [ERROR] </span>${diag && diag.messageChain && diag.messageChain.messageText || diag && diag.messageText || ''}\n${this.renderChainedDiags(diag && diag.messageChain && diag.messageChain.next || [])}\n${sourceline}\n`;
                    this.showHMRMessage(`\n${messageText || errorFile || 'Error found in application.'}\n${errorMessage}\n          `);
                });
                return;
            }
            this.rerenderComponents(uuid, output);
        };
        this.startHearBeat();
    }
    static renderChainedDiags(chainedDiags) {
        let result = ``;
        if (chainedDiags && chainedDiags.length) {
            for (const d of chainedDiags){
                const diag = d;
                result += `<span class="critic">TS${diag.code} [ERROR] </span>`;
                result += `${diag && diag.messageText}\n`;
            }
        }
        return result;
    }
    static rerenderComponents(uuid, output) {
        const savedComponents = this.components[uuid];
        if (savedComponents) {
            const setComponentToRerender = new Set();
            savedComponents.filter((c)=>c.routerCalling?.isRouter && c.routerCalling.isOriginalNode
            ).forEach((c)=>{
                setComponentToRerender.add(c.routerCalling);
            });
            savedComponents.forEach((component)=>{
                if (component.isTemplate && component.original) {
                    setComponentToRerender.add(component.original);
                }
            });
            if (output) {
                const replacement = eval(`((Ogone) => {\n          ${output}\n          console.warn('[Ogone] references are updated.');\n        })`);
                replacement(Ogone);
            }
            console.warn('[Ogone] rendering new components.');
            setComponentToRerender.forEach((component)=>{
                if (component) component.rerender();
            });
        }
    }
    static async getModule(pathToModule, uuidReq, uuid) {
        const iframe = document.createElement('iframe');
        document.body.append(iframe);
        iframe.name = 'HMR_IFRAME';
        iframe.srcdoc = `\n    < script>\n      window.loadModule = async (listener, path) => {\n        listener(await import(path));\n      };\n      window.postMessage('ready');\n    </ script>\n    `.replace(/\<(\/{0,1})\s+script/gi, '<$1script');
        iframe.addEventListener('load', ()=>{
            if (iframe.contentWindow) {
                iframe.contentWindow.addEventListener('message', async ()=>{
                    const { loadModule  } = iframe.contentWindow;
                    if (this.listeners.has(pathToModule)) {
                        const { listeners , graph  } = this.listeners.get(pathToModule);
                        for (let listener of listeners){
                            await loadModule(listener, pathToModule + `?uuid_req=${uuidReq}`);
                        }
                    } else {
                        const entries = Array.from(this.listeners.entries());
                        const candidate = entries.find(([key, moduleGraph])=>{
                            return moduleGraph.graph.includes(pathToModule);
                        });
                        if (candidate) {
                            const [dependencyPath, dependency] = candidate;
                            for (let listener of dependency.listeners){
                                await loadModule(listener, dependencyPath + `?uuid_req=${uuidReq}`);
                            }
                        } else {
                            console.warn('[Ogone] module not found.');
                            return;
                        }
                    }
                    iframe.remove();
                    this.rerenderComponents(uuid);
                });
            }
        });
        console.warn('[Ogone] updating module.');
    }
    static setServer(server) {
        this.server = server;
        this.server.on('connection', (ws)=>{
            this.cleanClients();
            const key = `client_${crypto.getRandomValues(new Uint16Array(10)).join('')}`;
            HMR.clients.set(key, {
                ready: false,
                connection: ws,
                role: 0
            });
        });
    }
    static postMessage(obj) {
        this.cleanClients();
        const message = JSON.stringify(obj);
        const entries = Array.from(this.clients.entries());
        entries.forEach(([key, client])=>{
            if (client?.connection.state !== 1 && !client.connection.isClosed && !this.FIFOMessages.includes(message)) {
                this.FIFOMessages.push(message);
            } else if (!client.ready) {
                this.sendFIFOMessages(key);
            }
            if (client && !client.connection.isClosed) {
                try {
                    client.connection.send(message);
                } catch (err) {
                }
            }
        });
    }
    static cleanClients() {
        const entries = Array.from(this.clients.entries());
        entries.forEach(([key, client])=>{
            if (client.connection.isClosed) {
                this.clients.delete(key);
            }
        });
    }
    static async sendFIFOMessages(id) {
        const entries = Array.from(this.clients.entries()).filter(([key, client])=>!client.ready && key === id
        );
        entries.forEach(([key, client])=>{
            this.FIFOMessages.forEach((m)=>{
                client.connection.send(m);
                client.ready = client.connection.state === 1 && true;
            });
        });
    }
    static subscribe(pathToModule, listener) {
        if (!this.listeners.has(pathToModule)) this.listeners.set(pathToModule, {
            listeners: [
                listener
            ],
            graph: []
        });
        else {
            const candidate = this.listeners.get(pathToModule);
            candidate.listeners.push(listener);
        }
    }
    static setGraph(pathToModule, graph) {
        if (this.listeners.has(pathToModule)) {
            const candidate = this.listeners.get(pathToModule);
            if (candidate) candidate.graph = candidate.graph.concat(graph);
        }
    }
    static beforeClosing() {
        if (typeof document === 'undefined') {
            this.postMessage({
                type: 'close'
            });
        } else if (this.client) {
            this.clearInterval();
            this.client.send(JSON.stringify({
                type: 'close'
            }));
        }
    }
    static clearInterval() {
        clearInterval(this.heartBeatInterval);
    }
    static checkHeartBeat() {
        let heartbeat = true;
        if (this.client) {
            if (this.client.readyState > 1) {
                heartbeat = false;
            } else {
                try {
                    this.client.send('');
                } catch (err) {
                    heartbeat = false;
                }
            }
        }
        return heartbeat;
    }
    static startHearBeat() {
        this.clearInterval();
        this.heartBeatInterval = setInterval(()=>{
            if (!this.checkHeartBeat()) {
                this.showHMRMessage('HMR disconnected - retrying in 1s ...');
                this.clearInterval();
                setTimeout(()=>{
                    this.showHMRMessage('HMR disconnected - sending heart beat message');
                    this.clientSettings(true);
                }, 1000);
            }
        }, this.heartBeatIntervalTime);
    }
    static showHMRMessage(message, messageType = '') {
        if (this.isInBrowser) {
            if (!this.panelInformations.isConnected) {
                const style = document.createElement('style');
                style.innerHTML = `\n        .hmr--panel {\n          display: flex;\n          flex-direction: column;\n          justify-content: flex-end;\n          position: fixed;\n          z-index: 50000;\n          background: #2a2a2d;\n          width: 100vw;\n          height: 100vh;\n          padding-right: 15px;\n          top: 0;\n          margin: 0;\n          overflow: auto;\n          list-style: none;\n        }\n        .hmr--message {\n          padding: 5px;\n          margin: 0px 2px;\n          color: #9ea0a0;\n          font-family: sans-serif;\n        }\n        .hmr--message .hmr--infos {\n          color: #4a4a4d;\n        }\n        .hmr--message .hmr--title {\n          color: #7d7a7d;\n        }\n        .hmr--message .hmr--message {\n          color: inherit;\n          white-space: pre-wrap;\n        }\n        .hmr--message .error {\n          color: #fb7191;\n        }\n        .hmr--message .success {\n          color: #91fba1;\n        }\n        .hmr--message .critic {\n          color: #ff7191;\n          text-decoration: underline;\n        }\n        .hmr--message .link {\n          text-decoration: underline;\n          cursor: pointer;\n        }\n        .hmr--message .warn {\n          color: #fff2ae;\n        }\n        `;
                document.body.append(this.panelInformations);
                document.head.append(style);
            }
            this.addMessageToHMR(message, messageType);
            if (!this.panelInformations.classList.contains('hmr--panel')) {
                this.panelInformations.classList.add('hmr--panel');
            }
        }
    }
    static addMessageToHMR(message, type = '') {
        this.panelInformations.innerHTML += `\n    <li class="hmr--message">\n      <span class="hmr--infos">${new Date().toUTCString()}</span><span class="hmr--title"> Ogone - </span><span class="hmr--message ${type}"> ${message}</span> </li>\n    `;
    }
    static hideHMRMessage() {
        if (this.isInErrorState) return;
        this.panelInformations.classList.remove('hmr--panel');
        this.panelInformations.innerHTML = '';
    }
}
HMR.useOgone(Ogone);
window.addEventListener('unload', ()=>{
    HMR.beforeClosing();
});
class OgoneBaseClass extends HTMLElement {
    key = null;
    data = null;
    pluggedWebComponentIsSync = false;
    dependencies = null;
    state = 0;
    activated = true;
    namespace = null;
    store = {
    };
    contexts = {
        for: {
        }
    };
    promises = [];
    resolve = null;
    async = {
        then: null,
        catch: null,
        finally: null
    };
    dispatchAwait = null;
    promiseResolved = false;
    react = [];
    texts = [];
    childs = [];
    refs = {
    };
    type = "component";
    constructor(){
        super();
        if (!Ogone.root) {
            let opts = {
                props: null,
                parentCTXId: '',
                dependencies: null,
                requirements: null,
                routes: null,
                isRoot: true,
                isTemplate: true,
                isTemplatePrivate: false,
                isTemplateProtected: false,
                isAsync: false,
                isController: false,
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
                isOriginalNode: true,
                uuid: ROOT_UUID,
                extends: '-nt'
            };
            setOgone(this, opts);
            opts = null;
            Ogone.root = true;
        }
    }
    get firstNode() {
        return this.nodes[0];
    }
    get lastNode() {
        return this.nodes[this.nodes.length - 1];
    }
    get extending() {
        return `${this.uuid}${this.extends}`;
    }
    get name() {
        return _ogone_node_;
    }
    set name(v) {
    }
    get isComponent() {
        return this.isTemplate;
    }
    get isRecursiveConnected() {
        return !!(this.nodes?.length && this.firstNode.isConnected && this.lastNode.isConnected);
    }
    get isConnected() {
        if (!this.firstNode) {
            return false;
        }
        return !!this.nodes?.find((n)=>n.isConnected
        );
    }
    get context() {
        const o = this, oc = this.component;
        if (!oc) return;
        if (!oc.contexts.for[o.key]) {
            oc.contexts.for[o.key] = {
                list: [
                    this
                ],
                parentNode: this.parentNode,
                name: this.name
            };
        }
        return oc.contexts.for[o.key];
    }
    connectedCallback() {
        if (this.isController) {
            this.remove();
            return;
        }
        setPosition(this);
        setContext(this);
        if (this.type === "router") {
            setActualRouterTemplate(this);
        }
        if (this.isTemplate) {
            setProps(this);
            OnodeUpdateProps(this);
        }
        renderingProcess(this);
        switch(true){
            case this.type === "router":
                renderRouter(this);
                break;
            case this.type === "store":
                renderStore(this);
                break;
            case this.type === "async":
                renderAsync(this);
                break;
            default:
                renderNode(this);
                break;
        }
    }
    rerender() {
        if (this.isRoot) {
            Ogone.root = false;
            document.body.innerHTML = '';
            document.body.append(document.createElement(_ogone_node_));
            return;
        }
        if (this.isRouter) {
            this.actualRoute = null;
            setActualRouterTemplate(this);
            renderRouter(this);
            return;
        }
        for(let i = this.context.list.length, a = 0; i > a; i--){
            destroy(this.context.list.pop());
        }
        renderContext(this, true);
    }
}
window.customElements.define(_ogone_node_, OgoneBaseClass);
window.addEventListener('popstate', (event)=>{
    routerGo(location.pathname, event.state);
});
const mapProxies = new Map();
function setReactivity(target, updateFunction, parentKey = '') {
    return new Proxy(target, {
        get (obj, key, ...args) {
            let v;
            const id = `${parentKey}.${key.toString()}`.replace(/^[^\w]+/i, '');
            if (key === 'prototype') {
                v = Reflect.get(obj, key, ...args);
            } else if (mapProxies.get(obj[key])) {
                return mapProxies.get(obj[key]);
            } else if ((obj[key] instanceof Object || Array.isArray(obj[key])) && !mapProxies.has(obj[key])) {
                v = setReactivity(obj[key], updateFunction, id);
                mapProxies.set(obj[key], v);
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
            updateFunction(id);
            return v;
        }
    });
}
function _ap(p, n) {
    n.placeholder ? p.append(n, n.placeholder) : p.append(n);
}
function _h(...a) {
    return document.createElement(...a);
}
function _at(n, a, b) {
    return n.setAttribute(a, b);
}
function construct(Onode) {
    const o = Onode;
    if (!o.type) return;
    Onode.dependencies = o.dependencies;
    if (Onode.isComponent) {
        const { data , runtime , Refs  } = Ogone.components[o.uuid](Onode);
        Onode.data = data;
        Onode.component = Onode;
        Onode.runtime = runtime;
        Onode.component.runtime = runtime;
        Onode.component.refs = Refs;
        Onode.requirements = o.requirements;
        Onode.props = o.props;
        Onode.type = Ogone.types[Onode.extending];
    }
}
function setOgone(Onode, def) {
    const params = {
        original: Onode,
        isRemote: false,
        isRoot: false,
        isImported: false,
        position: [
            0
        ],
        index: 0,
        level: 0,
        uuid: '',
        extends: '-nt',
        positionInParentComponent: [
            0
        ],
        levelInParentComponent: 0,
        component: Onode,
        parentComponent: def.parentComponent,
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
        methodsCandidate: []
    };
    Object.assign(Onode, params, def);
    Onode.renderNodes = Ogone.render[Onode.extending];
    if (Onode.isRouter) {
        Onode.locationPath = location.pathname;
        Onode.routeChanged = true;
        const url = new URL(location.href);
        const query = new Map(url.searchParams.entries());
        Onode.historyState = {
            query
        };
    }
    construct(Onode);
    if (Onode.isComponent) {
        HMR.components[Onode.uuid] = HMR.components[Onode.uuid] || [];
        HMR.components[Onode.uuid].push(Onode);
    }
}
function setNodeProps(Onode) {
    const o = Onode, oc = Onode;
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
            oc.component.react.push(()=>r(n, p)
            );
            r(n, p);
        }
    }
}
function setPosition(Onode) {
    const o = Onode;
    if (o.position && typeof o.level === 'number' && typeof o.index === 'number') {
        o.position[o.level] = o.index;
    }
}
function setProps(Onode) {
    const o = Onode, oc = Onode;
    if (!o || !oc) return;
    if (!o.index) {
        o.index = 0;
    }
    oc.props = o.props;
    if (!o.positionInParentComponent || o.levelInParentComponent !== undefined) {
        oc.positionInParentComponent = o.positionInParentComponent;
        o.positionInParentComponent[o.levelInParentComponent] = o.index;
    }
    OnodeUpdateProps(Onode);
}
function useSpread(Onode) {
    const o = Onode, oc = Onode;
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
                OnodeUpdateService(oc, k, value);
            });
            return Onode.component.activated;
        };
        parent = oc.parent;
    } else if (!o.isTemplate && o.flags && o.flags.spread) {
        reaction = ()=>{
            const v = o.getContext({
                position: o.position,
                getText: `{${o.flags.spread}}`
            });
            Object.entries(v).forEach(([k, value])=>{
                if (o.nodes) {
                    for (let n of o.nodes){
                        n.setAttribute(k, value);
                    }
                }
            });
            return Onode.component.activated;
        };
        parent = oc.component;
    }
    reaction && reaction();
    parent && reaction && parent.react.push(reaction);
}
function setNodes(Onode) {
    const o = Onode;
    if (!o.renderNodes) return;
    if (o.isTemplate) {
        o.nodes = Array.from(o.renderNodes(Onode.component).childNodes);
    } else {
        o.nodes = [
            o.renderNodes(Onode.component, o.position, o.index, o.level)
        ];
    }
    if (o.methodsCandidate && o.methodsCandidate.length) {
        o.methodsCandidate.forEach((f, i, arr)=>{
            if (o.nodes) {
                for (let n of o.nodes){
                    if (n.extending) {
                        saveUntilRender(n, f);
                    } else {
                        f(n);
                    }
                }
            }
            delete arr[i];
        });
    }
}
function removeNodes(Onode) {
    const o = Onode;
    if (!o.nodes) return Onode;
    function rm(n) {
        if (n.extending) {
            destroy(n);
        } else {
            n.remove();
        }
    }
    if (o.actualTemplate) {
        rm(o.actualTemplate);
    }
    o.nodes.forEach((n)=>{
        rm(n);
    });
    return Onode;
}
function destroy(Onode) {
    const o = Onode, oc = Onode;
    if (!oc) return;
    Onode.context.list.forEach((n)=>{
        removeNodes(n);
        n.remove();
    });
    removeNodes(Onode);
    if (o.isTemplate) {
        OnodeDestroyPluggedWebcomponent(oc);
        oc.component.runtime("destroy");
        o.component.activated = false;
        Onode.component.texts.splice(0);
        Onode.component.react.splice(0);
    }
    Onode.context.list.splice(0);
    Onode.remove();
}
function setEvents(Onode) {
    const o = Onode, oc = Onode;
    if (!o.flags || !o.getContext || !oc || !o.nodes) return;
    const position = Onode.isComponent ? oc.positionInParentComponent : o.position;
    const c = Onode.isComponent ? Onode.parentComponent : oc;
    for (let node of o.nodes){
        for (let flag of o.flags.events){
            if (flag.type === "wheel") {
                if (node.extending) {
                    saveUntilRender(node, (nr)=>{
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
                                        c.component.runtime(flag.case, ctx, ev);
                                        break;
                                    case filter === "left" && ev.wheelDeltaX > 0:
                                        c.component.runtime(flag.case, ctx, ev);
                                        break;
                                    case filter === "up" && ev.wheelDeltaY > 0:
                                        c.component.runtime(flag.case, ctx, ev);
                                        break;
                                    case filter === "down" && ev.wheelDeltaY < 0:
                                        c.component.runtime(flag.case, ctx, ev);
                                        break;
                                    case filter === null:
                                        c.component.runtime(flag.case, ctx, ev);
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
                                    c.component.runtime(flag.case, ctx, ev);
                                    break;
                                case filter === "left" && ev.wheelDeltaX > 0:
                                    c.component.runtime(flag.case, ctx, ev);
                                    break;
                                case filter === "up" && ev.wheelDeltaY > 0:
                                    c.component.runtime(flag.case, ctx, ev);
                                    break;
                                case filter === "down" && ev.wheelDeltaY < 0:
                                    c.component.runtime(flag.case, ctx, ev);
                                    break;
                                case filter === null:
                                    c.component.runtime(flag.case, ctx, ev);
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
                            c.component.runtime(flag.case, ctx, ev);
                            break;
                        case ev.key === filter:
                            c.component.runtime(flag.case, ctx, ev);
                            break;
                        case ev.keyCode === filter:
                            c.component.runtime(flag.case, ctx, ev);
                            break;
                        case ev.code.toLowerCase() === filter:
                            c.component.runtime(flag.case, ctx, ev);
                            break;
                        case !filter:
                            c.component.runtime(flag.case, ctx, ev);
                            break;
                    }
                });
            } else if (flag.name === "router-go" && flag.eval) {
                if (node.extending) {
                    saveUntilRender(node, (nr)=>{
                        nr.addEventListener("click", (ev)=>{
                            routerGo(o.getContext({
                                getText: `${flag.eval}`,
                                position
                            }), history.state);
                        });
                    });
                } else {
                    node.addEventListener("click", (ev)=>{
                        routerGo(o.getContext({
                            getText: `${flag.eval}`,
                            position
                        }), history.state);
                    });
                }
            } else if (flag.name === 'router-dev-tool' && flag.eval) {
                node.addEventListener("click", ()=>{
                });
            } else if (flag.name === "event" && flag.type.startsWith('animation')) {
                if (node.extending) {
                    saveUntilRender(node, (nr)=>{
                        nr.addEventListener(flag.type, (ev)=>{
                            if (flag.eval !== ev.animationName) return;
                            const ctx = o.getContext({
                                position
                            });
                            if (c) {
                                c.component.runtime(flag.case, ctx, ev);
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
                            c.component.runtime(flag.case, ctx, ev);
                        }
                    });
                }
            } else {
                if (node.extending) {
                    saveUntilRender(node, (nr)=>{
                        nr.addEventListener(flag.type, (ev)=>{
                            const ctx = o.getContext({
                                position
                            });
                            if (c) {
                                c.component.runtime(flag.case, ctx, ev);
                            }
                        });
                    });
                } else {
                    node.addEventListener(flag.type, (ev)=>{
                        const ctx = o.getContext({
                            position
                        });
                        if (c) {
                            c.component.runtime(flag.case, ctx, ev);
                        }
                    });
                }
            }
        }
    }
}
function routerSearch(Onode, route, locationPath) {
    if (typeof locationPath !== "string") return false;
    const { path  } = route;
    const splitted = path.toString().split("/");
    const locationSplit = locationPath.split("/");
    const result = {
    };
    if (!splitted.filter((r)=>r.trim().length
    ).length !== !locationSplit.filter((r)=>r.trim().length
    ).length) {
        return false;
    }
    if (splitted.length !== locationSplit.length) return false;
    const error = splitted.find((p, i, arr)=>{
        if (!p.startsWith(":")) {
            return locationSplit[i] !== p;
        }
    });
    if (error) return false;
    splitted.forEach((p, i)=>{
        if (p.startsWith(":")) {
            const param = p.slice(1, p.length);
            result[param] = locationSplit[i];
        }
    });
    route.params = result;
    return true;
}
function setActualRouterTemplate(Onode) {
    const o = Onode, oc = Onode;
    oc.routes = o.routes;
    oc.locationPath = o.locationPath;
    const l = oc.locationPath;
    let rendered = oc.routes.find((r)=>r.path === l || routerSearch(Onode, r, l) || r.path === 404
    );
    let preservedParams = rendered && rendered.params;
    while(rendered && rendered.redirect){
        rendered = oc.routes.find((r)=>rendered && r.name === rendered.redirect
        );
        if (rendered) {
            rendered.params = preservedParams;
        }
    }
    if (rendered) {
        o.actualRouteName = rendered.name || null;
    }
    if (!rendered) {
        o.actualTemplate = new Text(' ');
        o.actualRoute = null;
        o.routeChanged = true;
    } else if (rendered && !(rendered.once || o.actualRoute === rendered.component)) {
        const co = document.createElement(_ogone_node_);
        o.actualTemplate = co;
        o.actualRoute = rendered.component;
        o.routeChanged = true;
        let ogoneOpts = {
            isTemplate: true,
            isTemplatePrivate: rendered.isTemplatePrivate,
            isTemplateProtected: rendered.isTemplateProtected,
            isRouter: rendered.isRouter,
            isStore: false,
            isAsync: rendered.isAsync,
            isAsyncNode: false,
            isController: false,
            placeholder: new Text(' '),
            requirements: o.requirements,
            routes: o.routes,
            isOriginalNode: false,
            dependencies: [],
            extends: "-nt",
            uuid: rendered.uuid,
            tree: o.tree,
            params: rendered.params || null,
            props: o.props,
            parentComponent: o.parentComponent,
            parentCTXId: o.component.parentCTXId,
            positionInParentComponent: o.positionInParentComponent.slice(),
            levelInParentComponent: o.levelInParentComponent,
            index: o.index,
            level: o.level,
            position: o.position,
            flags: o.flags,
            isRoot: false,
            name: rendered.name || rendered.component,
            parentNodeKey: o.key,
            routerCalling: o
        };
        setOgone(co, ogoneOpts);
        ogoneOpts = null;
        co.isAsync = co.type === 'async';
        co.isRouter = co.type === 'router';
        co.isStore = co.type === 'store';
        if (rendered.title) {
            document.title = rendered.title;
        }
    } else {
        o.routeChanged = false;
    }
}
function setNodeAsyncContext(Onode) {
    const o = Onode;
    if (o.flags && o.flags.await) {
        const promise = new Promise((resolve, reject)=>{
            try {
                if (typeof o.flags.await === "boolean") {
                    Onode.firstNode.addEventListener("load", ()=>{
                        resolve(false);
                    });
                } else {
                    const type = o.getContext({
                        getText: o.flags.await,
                        position: o.position
                    });
                    Onode.firstNode.addEventListener(type, ()=>{
                        resolve(false);
                    });
                }
            } catch (err) {
                reject(err);
            }
        });
        o.component.promises.push(promise);
    }
}
function setAsyncContext(Onode) {
    const o = Onode, oc = Onode;
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
        oc.component.promises.push(promise);
    }
}
function saveUntilRender(Onode, f) {
    if (Onode.methodsCandidate) {
        Onode.methodsCandidate.push(f);
    }
}
function bindValue(Onode) {
    const o = Onode, oc = Onode;
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
        if (typeof dependency === "string" && k.indexOf(dependency) > -1 && evl !== undefined && n.value !== evl) {
            n.value = evl;
        }
        return n.isConnected;
    }
    for (let n of o.nodes){
        function bound() {
        }
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
                fn.bind(oc.component.data)(...values, n);
                OnodeUpdate(oc, k);
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
                fn.bind(oc.component.data)(...values, n);
                OnodeUpdate(oc, k);
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
                fn.bind(oc.component.data)(...values, n);
                OnodeUpdate(oc, k);
            }
        });
        oc.component.react.push((dependency)=>r(n, dependency)
        );
        r(n, true);
    }
}
function bindClass(Onode) {
    const o = Onode, oc = Onode;
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
        oc.component.react.push(()=>r(node)
        );
        r(node);
    }
}
function bindHTML(Onode) {
    const o = Onode, oc = Onode;
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
        oc.component.react.push(()=>r(node)
        );
        r(node);
    }
}
function bindStyle(Onode) {
    const o = Onode, oc = Onode;
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
        oc.component.react.push(()=>r(n)
        );
        r(n);
    }
}
function setContext(Onode) {
    const o = Onode;
    if (!o.key) return;
    if (o.isTemplate) {
        if (o.parentComponent) {
            o.parent = o.parentComponent;
            o.parent.childs.push(o);
        }
        if (Ogone.contexts[o.component.parentCTXId] && o.parentComponent) {
            const gct = Ogone.contexts[o.component.parentCTXId].bind(o.parentComponent.data);
            o.parentContext = gct;
            o.getContext = gct;
        }
    } else if (Ogone.contexts[Onode.extending] && o && o.component) {
        o.getContext = Ogone.contexts[Onode.extending].bind(o.component.data);
    }
    if (o.type === "store" && o.parent) {
        o.namespace = Onode.getAttribute("namespace") || undefined;
        o.parent.store[o.namespace] = o;
    }
}
function displayError(message, errorType, errorObject) {
    HMR.showHMRMessage(`\n  ${message}\n  <span class="critic">${errorType}</span>\n  <span class="critic">${errorObject && errorObject.message ? errorObject.message : ''}</span>\n  `);
}
function renderSlots(Onode) {
    const o = Onode;
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
function renderNode(Onode) {
    const o = Onode, oc = Onode;
    if (!Onode) return;
    if (o.isTemplate) {
        OnodeUpdateProps(Onode);
        if (o.isTemplatePrivate || o.isTemplateProtected) {
            const shadow = Onode.attachShadow({
                mode: o.isTemplatePrivate ? 'closed' : 'open'
            });
            shadow.append(...o.nodes);
        } else {
            if (Onode.childNodes.length) {
                renderSlots(Onode);
            }
            if (o.type === "async") {
                Onode.placeholder.replaceWith(...o.nodes, Onode.placeholder);
            } else {
                Onode.replaceWith(...o.nodes);
            }
        }
        OnodeRenderTexts(Onode, true);
        if (o.type !== "async") {
            OnodeTriggerDefault(oc, {
                router: {
                    params: o.params,
                    state: history.state,
                    path: location.pathname
                }
            });
        }
    } else {
        if (Onode.childNodes.length) {
            renderSlots(Onode);
        }
        Onode.replaceWith(...o.nodes);
    }
}
function renderStore(Onode) {
    const o = Onode, oc = Onode;
    if (!oc) return;
    if (oc.namespace !== o.namespace) {
        const error = "the attribute namespace is not the same provided in the component store";
        const BadNamspaceException = new Error(`[Ogone] ${error}`);
        displayError(error, "Store Module: Bad Namsepace Exception", new Error(`\n      store namespace: ${o.namespace}\n      attribute namespace: ${oc.namespace}\n      `));
        throw BadNamspaceException;
    }
    OnodeTriggerDefault(oc);
    removeNodes(Onode);
    Onode.remove();
}
function renderRouter(Onode) {
    const o = Onode, oc = Onode;
    if (!oc) return;
    OnodeUpdateProps(Onode);
    if (!o.replacer) {
        o.replacer = document.createElement('section');
    }
    if (Onode.parentNode) {
        Onode.replaceWith(o.replacer);
    }
    if (o.routeChanged) {
        o.replacer.innerHTML = "";
        o.replacer.append(o.actualTemplate, o.actualTemplate.placeholder);
    }
    oc.component.runtime(`router:${o.actualRouteName || o.locationPath}`, history.state);
}
function renderAsyncRouter(Onode) {
    const o = Onode;
    if (!o.nodes) return;
    const filter = (t)=>t.isComponent && t.isRouter
    ;
    const s = o.nodes.filter(filter);
    for (let n of o.nodes.filter((n1)=>n1.nodeType === 1
    )){
        const arrayOfTemplates = Array.from(n.querySelectorAll(_ogone_node_)).filter(filter);
        for (let template of arrayOfTemplates){
            s.push(template);
        }
    }
    for (let t of s){
        t.connectedCallback();
    }
}
function renderAsyncStores(Onode) {
    const o = Onode;
    if (!o.nodes) return;
    const filter = (t)=>t.isComponent && t.component && t.isStore
    ;
    const asyncStores = o.nodes.filter(filter);
    for (let n of o.nodes.filter((n1)=>n1.nodeType === 1
    )){
        const arrayOfTemplates = Array.from(n.querySelectorAll(_ogone_node_)).filter(filter);
        for (let template of arrayOfTemplates){
            asyncStores.push(template);
        }
    }
    for (let t of asyncStores){
        t.connectedCallback();
        removeNodes(t);
        t.remove();
    }
}
function renderAsyncComponent(Onode) {
    const o = Onode, oc = Onode;
    if (!oc || !o || !o.nodes) return;
    const filter = (t)=>t.isComponent && t.isAsync && t.flags && t.flags.await
    ;
    for (let node of o.nodes.filter((n)=>n.nodeType === 1
    )){
        const awaitingNodes = Array.from(node.querySelectorAll(_ogone_node_)).filter(filter);
        if (node.isComponent && node && node.component && node.component.type === "async") {
            awaitingNodes.push(node);
        }
        for (let awaitingNode of awaitingNodes){
            if (awaitingNode.component) {
                const ev = new CustomEvent(`${o.key}:${awaitingNode.key}:resolve`);
                awaitingNode.component.dispatchAwait = ()=>{
                    awaitingNode.dispatchEvent(ev);
                };
                const promise = new Promise((resolve)=>{
                    if (awaitingNode && awaitingNode.component.promiseResolved) {
                        resolve(true);
                    } else {
                        awaitingNode.addEventListener(`${o.key}:${awaitingNode.key}:resolve`, ()=>{
                            resolve(true);
                        });
                    }
                });
                oc.component.promises.push(promise);
            }
        }
    }
}
function renderComponent(Onode) {
    const o = Onode;
    if (!o.nodes) return;
    const filter = (t)=>t.component && t.component.type === "component"
    ;
    for (let node of o.nodes.filter((n)=>n.nodeType === 1
    )){
        const components = Array.from(node.querySelectorAll(_ogone_node_)).filter(filter);
        let n = node;
        if (n.isComponent && n.extending && n.component && n.component.type === "component") {
            components.push(n);
        }
        for (let onode of components){
            renderingProcess(onode);
        }
    }
}
function renderAsync(Onode, shouldReportToParentComponent) {
    const o = Onode, oc = Onode;
    if (!oc) return;
    renderAsyncStores(Onode);
    renderAsyncRouter(Onode);
    renderComponent(Onode);
    renderAsyncComponent(Onode);
    const chs = Array.from(Onode.childNodes);
    const placeholder = Onode.placeholder;
    if (chs.length) {
    } else if (!Onode.isTemplatePrivate && !Onode.isTemplateProtected) {
        Onode.replaceWith(placeholder);
    }
    oc.component.resolve = (...args)=>{
        return new Promise((resolve)=>{
            setTimeout(()=>{
                setAsyncContext(Onode);
                resolve(true);
            }, 0);
        }).then(()=>{
            Promise.all(oc.component.promises).then((p)=>{
                renderNode(Onode);
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
                displayError(err.message, `Error in Async component. component: ${o.name}`, err);
            }).finally(()=>{
                if (oc.async.finally && shouldReportToParentComponent && oc.parent) {
                    oc.parent.runtime(oc.async.finally);
                }
            });
        });
    };
    OnodeTriggerDefault(oc, o.params, o.historyState);
}
function renderingProcess(Onode) {
    const o = Onode;
    setNodes(Onode);
    if (o.isAsyncNode) {
        setNodeAsyncContext(Onode);
    }
    if (o.isOriginalNode) setDeps(Onode);
    if (!o.isTemplate && o.nodeProps) {
        setNodeProps(Onode);
    }
    setEvents(Onode);
    bindClass(Onode);
    bindStyle(Onode);
    bindValue(Onode);
    bindHTML(Onode);
    useSpread(Onode);
    if (o.type === "router") {
        triggerLoad(Onode);
    }
}
function renderContext(Onode, force) {
    const o = Onode, oc = Onode;
    if (!force && (!oc || !o.getContext || !o.isOriginalNode)) return false;
    if (!o.getContext) return false;
    const length = o.getContext({
        getLength: true,
        position: o.position
    });
    OnodeListRendering(Onode, {
        callingNewComponent: o.isTemplate,
        length
    });
    return true;
}
function triggerLoad(Onode) {
    const o = Onode, oc = Onode;
    if (!oc) return;
    const rr = Ogone.routerReactions;
    oc.component.runtime(0, o.historyState);
    rr.push((path)=>{
        o.locationPath = path;
        setActualRouterTemplate(Onode);
        renderRouter(Onode);
        return oc.component.activated;
    });
}
function setDeps(Onode) {
    const o = Onode;
    if (o.isOriginalNode && o.getContext && o.original) {
        (o.isComponent && o.parentComponent ? o.parentComponent : o.component).react.push(()=>renderContext(o)
        );
        renderContext(o);
    }
}
function routerGo(url, state) {
    if (Ogone.actualRoute === url) return;
    Ogone.actualRoute = url;
    Ogone.routerReactions.forEach((r, i, arr)=>{
        if (r && !r(url, state)) delete arr[i];
    });
    history.pushState(state || {
    }, "", url || "/");
}
function OnodeTriggerDefault(Onode, params, event) {
    if (!Onode.component.activated) return;
    if (Onode.type === "store") {
        initStore(Onode);
    }
    OnodeUpdateProps(Onode);
    Onode.component.runtime(0, params, event);
}
function OnodeUpdate(Onode, dependency) {
    if (Onode.type === "store") {
        OnodeUpdateStore(Onode, dependency);
        return;
    }
    Onode.component.runtime(`update:${dependency}`);
    OnodeReactions(Onode, dependency);
    OnodeRenderTexts(Onode, dependency);
    Onode.component.childs.filter((c)=>c.type !== "store"
    ).forEach((c)=>{
        OnodeUpdateProps(c, dependency);
    });
}
function OnodeRenderTexts(Onode, dependency, opts = {
}) {
    Onode.component.texts.forEach((t, i, arr)=>{
        const { code , position , dependencies , getContext  } = t;
        if (dependencies && !dependencies.includes(dependency)) return;
        if (Onode.component.activated) {
            if (!getContext) return delete arr[i];
            if (typeof dependency === 'string' && code.indexOf(dependency) < 0) return;
            const v = getContext({
                getText: code,
                position
            });
            if (t.data !== v) t.data = v.length ? v : ' ';
        } else {
            delete arr[i];
        }
    });
}
function OnodeReactions(Onode, dependency) {
    Onode.component.react.forEach((t, i, arr)=>{
        if (t && !t(dependency)) delete arr[i];
    });
}
function initStore(Onode) {
    if (!Ogone.stores[Onode.namespace]) {
        Ogone.stores[Onode.namespace] = {
            ...Onode.component.data
        };
    }
    Ogone.clients.push([
        Onode.key,
        (namespace, key, overwrite)=>{
            const parent = Onode.parentComponent;
            const { data  } = Onode.component;
            if (namespace === Onode.namespace && data && parent && parent.data) {
                if (!overwrite) {
                    data[key] = Ogone.stores[Onode.namespace][key];
                } else {
                    Ogone.stores[Onode.namespace][key] = data[key];
                }
                if (parent.data[key] !== data[key]) {
                    parent.data[key] = data[key];
                    OnodeUpdate(parent, key);
                }
            }
            return Onode.component.activated;
        }
    ]);
}
function OnodeUpdateStore(Onode, dependency) {
    const [key, client] = Ogone.clients.find(([key1])=>key1 === Onode.key
    );
    if (client) {
        client(Onode.component.namespace, dependency, true);
        Ogone.clients.filter(([key1])=>key1 !== Onode.key
        ).forEach(([key1, f], i, arr)=>{
            if (f && !f(Onode.component.namespace, dependency, false)) {
                delete arr[i];
            }
        });
    }
}
function OnodeUpdateService(Onode, key, value, force) {
    const { data  } = Onode.component;
    if (data && value !== data[key] || force && data) {
        const previous = data[key];
        data[key] = value;
        if (Onode.pluggedWebComponentIsSync) {
            if (Onode.pluggedWebComponent && typeof Onode.pluggedWebComponent.beforeUpdate === 'function') {
                Onode.pluggedWebComponent.beforeUpdate(key, data[key], value);
            }
            if (Onode.pluggedWebComponent && value !== Onode.pluggedWebComponent[key]) {
                Onode.pluggedWebComponent[key] = value;
            }
        }
        if (Onode.pluggedWebComponent && typeof Onode.pluggedWebComponent.attributeChangedCallback === 'function') {
            Onode.pluggedWebComponent.attributeChangedCallback(key, previous, value);
        }
        OnodeUpdate(Onode, key);
        if (Onode.type === "async") {
            if (!Onode.dependencies) return;
            if (key && Onode.dependencies.find((d)=>d.indexOf(key) > -1
            )) {
                Onode.component.runtime("async:update", {
                    updatedParentProp: key
                });
            }
        }
    }
}
function OnodeUpdateProps(Onode, dependency) {
    if (!Onode.component.activated) return;
    if (Onode.type === "store") return;
    if (!Onode?.component?.requirements || !Onode.props) return;
    Onode.component.requirements.forEach(([key])=>{
        const prop = Onode.props.find((prop1)=>prop1[0] === key
        );
        if (!prop) return;
        const value = Onode.parentContext({
            getText: `${prop[1]}`,
            position: Onode.positionInParentComponent
        });
        OnodeUpdateService(Onode, key, value, !!dependency);
    });
}
function OnodeDestroyPluggedWebcomponent(Onode) {
    if (Onode.pluggedWebComponent && typeof Onode.pluggedWebComponent.beforeDestroy === 'function') {
        Onode.pluggedWebComponent.beforeDestroy();
    }
    if (Onode.pluggedWebComponent) {
        Onode.pluggedWebComponent = false;
        Onode.pluggedWebComponentIsSync = false;
    }
}
function OnodeListRendering(Onode, opts) {
    if (!Onode || !opts) return;
    let { callingNewComponent , length: dataLength  } = opts;
    typeof dataLength === "object" ? dataLength = 1 : [];
    const context = Onode.context;
    if (!context) return;
    if (context.list.length === dataLength) return;
    for(let i = context.list.length, a = dataLength; i < a; i++){
        let node;
        node = document.createElement(context.name, {
            is: Onode.extending
        });
        let ogoneOpts = {
            type: Onode.type,
            index: i,
            isOriginalNode: false,
            level: Onode.level,
            placeholder: new Text(' '),
            position: Onode.position.slice(),
            flags: Onode.flags,
            original: Onode,
            isRoot: false,
            name: Onode.name,
            tree: Onode.tree,
            namespace: Onode.namespace,
            isTemplate: Onode.isTemplate,
            isTemplatePrivate: Onode.isTemplatePrivate,
            isTemplateProtected: Onode.isTemplateProtected,
            isImported: Onode.isImported,
            isAsync: Onode.isAsync,
            isAsyncNode: Onode.isAsyncNode,
            isRouter: Onode.isRouter,
            isStore: Onode.isStore,
            isRemote: Onode.isRemote,
            extends: Onode.extends,
            uuid: Onode.uuid,
            routes: Onode.routes,
            parentNodeKey: Onode.parentNodeKey
        };
        Object.assign(ogoneOpts, !callingNewComponent ? {
            component: Onode.component,
            nodeProps: Onode.nodeProps
        } : {
            props: Onode.props,
            dependencies: Onode.dependencies,
            requirements: Onode.requirements,
            params: Onode.params,
            parentComponent: Onode.parentComponent,
            parentCTXId: Onode.parentCTXId,
            positionInParentComponent: Onode.positionInParentComponent ? Onode.positionInParentComponent.slice() : [],
            levelInParentComponent: Onode.levelInParentComponent
        });
        setOgone(node, ogoneOpts);
        ogoneOpts = null;
        Onode.placeholder.replaceWith(node, Onode.placeholder);
        context.list.push(node);
    }
    if (context.list.length === dataLength) return;
    for(let i1 = context.list.length, a1 = dataLength; i1 > a1; i1--){
        destroy(context.list.pop());
    }
    return true;
}
const ogone_types_component = "component";
const ogone_types_store = "store";
const ogone_types_async = "async";
const ogone_types_router = "router";
const ogone_types_controller = "controller";
const ___template_ = 'template';
const ___style_ = 'style';
const ___div_ = 'div';
const ___img_ = 'img';
const ___span_ = 'span';
const ___slot_ = 'slot';
const ___h2_ = 'h2';
const ___p_ = 'p';
const ___pre_ = 'pre';
const ___code_ = 'code';
const o1370160080 = 'o1370160080';
const o1370160080_nt = 'o1370160080-nt';
const o1370160080_n12 = 'o1370160080-n12';
const o1370160080_n13 = 'o1370160080-n13';
const o1370160080_nd14 = 'o1370160080-nd14';
const o1370160080_nd17 = 'o1370160080-nd17';
const o1370160080_t37 = 'o1370160080-t37';
const o1370160080_n19 = 'o1370160080-n19';
const o1370160080_n21 = 'o1370160080-n21';
const o1370160080_n22 = 'o1370160080-n22';
const o1370160080_nd23 = 'o1370160080-nd23';
const o262107635 = 'o262107635';
const o262107635_nt = 'o262107635-nt';
const o262107635_n3 = 'o262107635-n3';
const o262107635_t7 = 'o262107635-t7';
const o262107635_n5 = 'o262107635-n5';
const o262107635_t12 = 'o262107635-t12';
const o1580687313 = 'o1580687313';
const o1580687313_nt = 'o1580687313-nt';
const o1580687313_n3 = 'o1580687313-n3';
const o1580687313_t8 = 'o1580687313-t8';
const o1580687313_n5 = 'o1580687313-n5';
const o1580687313_nd6 = 'o1580687313-nd6';
const o918636327 = 'o918636327';
const o918636327_nt = 'o918636327-nt';
const o918636327_n5 = 'o918636327-n5';
const o918636327_n6 = 'o918636327-n6';
const o918636327_nd7 = 'o918636327-nd7';
const o918636327_n9 = 'o918636327-n9';
const o918636327_n10 = 'o918636327-n10';
const o841766682 = 'o841766682';
const o841766682_nt = 'o841766682-nt';
const o841766682_n5 = 'o841766682-n5';
const o841766682_nd6 = 'o841766682-nd6';
const o841766682_nd7 = 'o841766682-nd7';
const o841766682_n9 = 'o841766682-n9';
const o841766682_n11 = 'o841766682-n11';
const o44758046 = 'o44758046';
const o44758046_nt = 'o44758046-nt';
const o44758046_t3 = 'o44758046-t3';
const o44758046_2 = 'o44758046-2';
const o44758046_t6 = 'o44758046-t6';
const o776663872 = 'o776663872';
const o776663872_nt = 'o776663872-nt';
const o776663872_2 = 'o776663872-2';
const o776663872_t5 = 'o776663872-t5';
const o776663872_n3 = 'o776663872-n3';
const o776663872_t8 = 'o776663872-t8';
const o776663872_t11 = 'o776663872-t11';
const o2164776294 = 'o2164776294';
const o2164776294_nt = 'o2164776294-nt';
const o2164776294_nd5 = 'o2164776294-nd5';
const o2164776294_t13 = 'o2164776294-t13';
const o2164776294_nd6 = 'o2164776294-nd6';
const o2164776294_nd8 = 'o2164776294-nd8';
const o2164776294_nd10 = 'o2164776294-nd10';
const o3575752143 = 'o3575752143';
const o3575752143_nt = 'o3575752143-nt';
const o3575752143_n5 = 'o3575752143-n5';
const o3575752143_nd6 = 'o3575752143-nd6';
const o3575752143_n7 = 'o3575752143-n7';
const o3575752143_nd8 = 'o3575752143-nd8';
const o3575752143_n10 = 'o3575752143-n10';
const o3575752143_t23 = 'o3575752143-t23';
const o3575752143_n13 = 'o3575752143-n13';
const o3575752143_nd14 = 'o3575752143-nd14';
const o3575752143_nd17 = 'o3575752143-nd17';
const o1304491614 = 'o1304491614';
const o1304491614_nt = 'o1304491614-nt';
const o1304491614_n5 = 'o1304491614-n5';
const o1304491614_nd6 = 'o1304491614-nd6';
const o1304491614_n7 = 'o1304491614-n7';
const o1304491614_t17 = 'o1304491614-t17';
const o1304491614_nd9 = 'o1304491614-nd9';
const o1304491614_t22 = 'o1304491614-t22';
const o1304491614_nd11 = 'o1304491614-nd11';
const o1304491614_t27 = 'o1304491614-t27';
const o1304491614_nd13 = 'o1304491614-nd13';
const o1304491614_t32 = 'o1304491614-t32';
const o1304491614_nd16 = 'o1304491614-nd16';
const o1304491614_n17 = 'o1304491614-n17';
const o1304491614_nd18 = 'o1304491614-nd18';
const o246739052 = 'o246739052';
const o246739052_nt = 'o246739052-nt';
const o246739052_n5 = 'o246739052-n5';
const o246739052_n6 = 'o246739052-n6';
const o246739052_n7 = 'o246739052-n7';
const o246739052_n8 = 'o246739052-n8';
const o3244593960 = 'o3244593960';
const o3244593960_nt = 'o3244593960-nt';
const o3244593960_n3 = 'o3244593960-n3';
const o3244593960_t7 = 'o3244593960-t7';
const o3244593960_n5 = 'o3244593960-n5';
const o3244593960_n6 = 'o3244593960-n6';
const o402642107 = 'o402642107';
const o402642107_nt = 'o402642107-nt';
const o402642107_t3 = 'o402642107-t3';
const o402642107_2 = 'o402642107-2';
const o402642107_t6 = 'o402642107-t6';
const o2509604044 = 'o2509604044';
const o2509604044_nt = 'o2509604044-nt';
const o2509604044_n5 = 'o2509604044-n5';
const o2509604044_nd6 = 'o2509604044-nd6';
const o1177399929 = 'o1177399929';
const o1177399929_nt = 'o1177399929-nt';
const o1177399929_n5 = 'o1177399929-n5';
const o1177399929_n6 = 'o1177399929-n6';
const o1177399929_n7 = 'o1177399929-n7';
const o1177399929_t16 = 'o1177399929-t16';
const o1177399929_n9 = 'o1177399929-n9';
const o1177399929_t21 = 'o1177399929-t21';
const o1177399929_nd12 = 'o1177399929-nd12';
const o1177399929_nd13 = 'o1177399929-nd13';
const o1177399929_t30 = 'o1177399929-t30';
const o1177399929_n15 = 'o1177399929-n15';
const o1177399929_n16 = 'o1177399929-n16';
const o1177399929_t37 = 'o1177399929-t37';
const o3498884249 = 'o3498884249';
const o3498884249_nt = 'o3498884249-nt';
const o3498884249_n3 = 'o3498884249-n3';
const o3498884249_t8 = 'o3498884249-t8';
const o3498884249_n5 = 'o3498884249-n5';
const o3498884249_n6 = 'o3498884249-n6';
const o3498884249_n7 = 'o3498884249-n7';
const o3498884249_n9 = 'o3498884249-n9';
const o3498884249_t21 = 'o3498884249-t21';
Ogone.types[o1370160080_nd17] = ogone_types_component;
Ogone.types[o1370160080_nt] = ogone_types_component;
Ogone.types[o262107635_nt] = ogone_types_component;
Ogone.types[o1580687313_nd6] = ogone_types_async;
Ogone.types[o1580687313_nt] = ogone_types_async;
Ogone.types[o918636327_nt] = ogone_types_component;
Ogone.types[o841766682_nd7] = ogone_types_component;
Ogone.types[o841766682_nd6] = ogone_types_component;
Ogone.types[o841766682_nt] = ogone_types_component;
Ogone.types[o44758046_nt] = ogone_types_store;
Ogone.types[o776663872_nt] = ogone_types_controller;
Ogone.types[o2164776294_nd6] = ogone_types_component;
Ogone.types[o2164776294_nd8] = ogone_types_component;
Ogone.types[o2164776294_nd10] = ogone_types_component;
Ogone.types[o2164776294_nd5] = ogone_types_component;
Ogone.types[o2164776294_nt] = ogone_types_component;
Ogone.types[o3575752143_nd6] = ogone_types_component;
Ogone.types[o3575752143_nd17] = ogone_types_component;
Ogone.types[o3575752143_nt] = ogone_types_component;
Ogone.types[o1304491614_nd9] = ogone_types_component;
Ogone.types[o1304491614_nd11] = ogone_types_component;
Ogone.types[o1304491614_nd13] = ogone_types_component;
Ogone.types[o1304491614_nd6] = ogone_types_component;
Ogone.types[o1304491614_nd16] = ogone_types_component;
Ogone.types[o1304491614_nt] = ogone_types_component;
Ogone.types[o246739052_nt] = ogone_types_component;
Ogone.types[o3244593960_nt] = ogone_types_component;
Ogone.types[o402642107_nt] = ogone_types_router;
Ogone.types[o2509604044_nt] = ogone_types_component;
Ogone.types[o1177399929_nd13] = ogone_types_component;
Ogone.types[o1177399929_nd12] = ogone_types_component;
Ogone.types[o1177399929_nt] = ogone_types_component;
Ogone.types[o3498884249_nt] = ogone_types_component;
Ogone.components[o1370160080] = function(Onode) {
    const { Obj: Obj1  } = Ogone.require['dep_6426190445621257115'];
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    Ogone.protocols[o1370160080] = Ogone.protocols[o1370160080] || class Protocol {
        test = Obj1;
        scrollY = 0;
        setScrollY(n) {
            this.scrollY = n;
        }
    };
    const data = setReactivity(new Ogone.protocols[o1370160080], (prop)=>OnodeUpdate(Onode, prop)
    );
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                const { Obj: Obj11  } = Ogone.require['dep_6426190445621257115'];
                if (typeof _state === "string" && ![].includes(_state)) {
                    return;
                }
                switch(_state){
                    default:
                        const [header] = Refs.head;
                        this.setScrollY(window.scrollY);
                        window.addEventListener('scroll', (ev)=>{
                            if (header) {
                                if (window.scrollY > this.scrollY) {
                                    header.style.top = '-100px';
                                } else {
                                    header.style.top = '0px';
                                }
                            }
                            this.setScrollY(window.scrollY);
                        });
                        break;
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/Application.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o262107635] = function(Onode) {
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    const data = {
        "scrollY": 0
    };
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                switch(_state){
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/components/RightSection.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o1580687313] = function(Onode) {
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    const Async = {
        resolve: (...args)=>{
            if (Onode.component.resolve) {
                const promise = Onode.component.resolve(...args);
                if (Onode.component.dispatchAwait) {
                    Onode.component.dispatchAwait();
                    Onode.component.dispatchAwait = false;
                    Onode.component.promiseResolved = true;
                }
                Onode.component.resolve = null;
                return promise;
            } else if (Onode.component.resolve === null) {
                const DoubleUseOfResolveException = new Error('Double use of resolution in async component');
                displayError(DoubleUseOfResolveException.message, 'Double Resolution of Promise', {
                    message: `component: examples/app/asyncs/AsyncLogo.o3`
                });
                throw DoubleUseOfResolveException;
            }
        }
    };
    Object.freeze(Async);
    const data = {
    };
    return {
        data,
        Refs,
        runtime: (async function runtime(_state, ctx, event, _once = 0) {
            try {
                if (typeof _state === "string" && ![].includes(_state)) {
                    return;
                }
                switch(_state){
                    default:
                        Async.resolve();
                        break;
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/asyncs/AsyncLogo.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o918636327] = function(Onode) {
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    const data = {
        "menu": [
            {
                "name": "Docs",
                "route": "/doc",
                "status": "in-progress"
            },
            {
                "name": "Api",
                "route": "/api",
                "status": "todo"
            },
            {
                "name": "todos",
                "route": "/todos/testParams",
                "status": "todo"
            },
            {
                "name": "project",
                "route": "/project",
                "status": "todo"
            },
            {
                "name": "support",
                "route": "/support",
                "status": "todo"
            }
        ]
    };
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                switch(_state){
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/components/menu/MenuContent.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o841766682] = function(Onode) {
    const { print ,  } = Ogone.require['dep_51506147711985763655'];
    const { attr ,  } = Ogone.require['dep_58806555621990634570'];
    let Controllers;
    const Store = {
        dispatch: (id, ctx)=>{
            const path = id.split('/');
            if (path.length > 1) {
                const [namespace, action] = path;
                const mod = Onode.component.store[namespace];
                if (mod && mod.runtime) {
                    return mod.runtime(`action:${action}`, ctx).catch((err)=>displayError(err.message, `Error in dispatch. action: ${action} component: examples/app/components/Burger.o3`, err)
                    );
                }
            } else {
                const mod = Onode.component.store[null];
                if (mod && mod.runtime) {
                    return mod.runtime(`action:${id}`, ctx).catch((err)=>displayError(err.message, `Error in dispatch. action: ${action} component: examples/app/components/Burger.o3`, err)
                    );
                }
            }
        },
        commit: (id, ctx)=>{
            const path = id.split('/');
            if (path.length > 1) {
                const [namespace, mutation] = path;
                const mod = Onode.component.store[namespace];
                if (mod && mod.runtime) {
                    return mod.runtime(`mutation:${mutation}`, ctx).catch((err)=>displayError(err.message, `Error in commit. mutation: ${mutation} component: examples/app/components/Burger.o3`, err)
                    );
                }
            } else {
                const mod = Onode.component.store[null];
                if (mod && mod.runtime) {
                    return mod.runtime(`mutation:${id}`, ctx).catch((err)=>displayError(err.message, `Error in commit. mutation: ${id} component: examples/app/components/Burger.o3`, err)
                    );
                }
            }
        },
        get: (id)=>{
            const path = id.split('/');
            if (path.length > 1) {
                const [namespace, get] = path;
                const mod = Onode.component.store[namespace];
                if (mod && mod.data) {
                    return mod.data[get];
                }
            } else {
                const mod = Onode.component.store[null];
                if (mod && mod.data) {
                    return mod.data[id];
                }
            }
        }
    };
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    Ogone.protocols[o841766682] = Ogone.protocols[o841766682] || class Protocol {
        isOpen = false;
    };
    const data = setReactivity(new Ogone.protocols[o841766682], (prop)=>OnodeUpdate(Onode, prop)
    );
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                const { print: print1 ,  } = Ogone.require['dep_51506147711985763655'];
                const { attr: attr1 ,  } = Ogone.require['dep_58806555621990634570'];
                if (typeof _state === "string" && ![
                    'click:openMenu'
                ].includes(_state)) {
                    return;
                }
                switch(_state){
                    case 'click:openMenu':
                        print1(10, 'this is a test for modules');
                        Store.dispatch('menu/toggle');
                        Store.dispatch('menu/checkController').then((res)=>{
                            console.warn(res);
                        });
                        break;
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/components/Burger.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o44758046] = function(Onode) {
    const Controllers = {
    };
    Controllers["UserController"] = {
        async get (rte) {
            return await (await (await fetch(`test${rte}`)).blob()).text();
        },
        async post (rte, data = {
        }, op = {
        }) {
            return await (await (await fetch(`test${rte}`, {
                ...op,
                body: JSON.stringify(data || {
                }),
                method: 'POST'
            })).blob()).text();
        },
        async put (rte, data = {
        }, op = {
        }) {
            return await (await (await fetch(`test${rte}`, {
                ...op,
                body: JSON.stringify(data || {
                }),
                method: 'PUT'
            })).blob()).text();
        },
        async delete (rte, data = {
        }, op = {
        }) {
            return await (await (await fetch(`test${rte}`, {
                ...op,
                body: JSON.stringify(data || {
                }),
                method: 'DELETE'
            })).blob()).text();
        },
        async patch (rte, data = {
        }, op = {
        }) {
            return await (await (await fetch(`test${rte}`, {
                ...op,
                body: JSON.stringify(data || {
                }),
                method: 'PATCH'
            })).blob()).text();
        }
    };
    Object.seal(Controllers);
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    Ogone.protocols[o44758046] = Ogone.protocols[o44758046] || class Protocol {
        isOpen = false;
    };
    const data = setReactivity(new Ogone.protocols[o44758046], (prop)=>OnodeUpdate(Onode, prop)
    );
    return {
        data,
        Refs,
        runtime: (async function runtime(_state, ctx, event, _once = 0) {
            try {
                const { UserController  } = Controllers;
                if (typeof _state === "string" && ![
                    'action:toggle',
                    'action:checkController'
                ].includes(_state)) {
                    return;
                }
                switch(_state){
                    case 'action:toggle':
                        this.isOpen = !this.isOpen;
                        break;
                    case 'action:checkController':
                        const res = await UserController.get('/');
                        return res;
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/stores/StoreMenu.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o776663872] = function(Onode) {
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    Ogone.protocols[o776663872] = Ogone.protocols[o776663872] || class Protocol {
        name = "SRNV";
    };
    const data = setReactivity(new Ogone.protocols[o776663872], (prop)=>OnodeUpdate(Onode, prop)
    );
    return {
        data,
        Refs,
        runtime: (async function runtime(_state, ctx, event, _once = 0) {
            try {
                if (typeof _state === "string" && ![
                    'GET:/',
                    'GET:/2'
                ].includes(_state)) {
                    return;
                }
                switch(_state){
                    case 'GET:/':
                        return `Hello ${this.name}`;
                    case 'GET:/2':
                        return '<h1 > test </h1>';
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/controllers/ControllerUser.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o2164776294] = function(Onode) {
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    Ogone.protocols[o2164776294] = Ogone.protocols[o2164776294] || class Protocol {
        buttonOpts = {
            name: 'Test',
            route: '',
            status: 'todo'
        };
    };
    const data = setReactivity(new Ogone.protocols[o2164776294], (prop)=>OnodeUpdate(Onode, prop)
    );
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                switch(_state){
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/components/menu/MenuButton.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o3575752143] = function(Onode) {
    let Controllers;
    const Store = {
        dispatch: (id, ctx)=>{
            const path = id.split('/');
            if (path.length > 1) {
                const [namespace, action] = path;
                const mod = Onode.component.store[namespace];
                if (mod && mod.runtime) {
                    return mod.runtime(`action:${action}`, ctx).catch((err)=>displayError(err.message, `Error in dispatch. action: ${action} component: examples/app/components/menu/MenuMain.o3`, err)
                    );
                }
            } else {
                const mod = Onode.component.store[null];
                if (mod && mod.runtime) {
                    return mod.runtime(`action:${id}`, ctx).catch((err)=>displayError(err.message, `Error in dispatch. action: ${action} component: examples/app/components/menu/MenuMain.o3`, err)
                    );
                }
            }
        },
        commit: (id, ctx)=>{
            const path = id.split('/');
            if (path.length > 1) {
                const [namespace, mutation] = path;
                const mod = Onode.component.store[namespace];
                if (mod && mod.runtime) {
                    return mod.runtime(`mutation:${mutation}`, ctx).catch((err)=>displayError(err.message, `Error in commit. mutation: ${mutation} component: examples/app/components/menu/MenuMain.o3`, err)
                    );
                }
            } else {
                const mod = Onode.component.store[null];
                if (mod && mod.runtime) {
                    return mod.runtime(`mutation:${id}`, ctx).catch((err)=>displayError(err.message, `Error in commit. mutation: ${id} component: examples/app/components/menu/MenuMain.o3`, err)
                    );
                }
            }
        },
        get: (id)=>{
            const path = id.split('/');
            if (path.length > 1) {
                const [namespace, get] = path;
                const mod = Onode.component.store[namespace];
                if (mod && mod.data) {
                    return mod.data[get];
                }
            } else {
                const mod = Onode.component.store[null];
                if (mod && mod.data) {
                    return mod.data[id];
                }
            }
        }
    };
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    const data = {
        "menu": [
            {
                "name": "Introduction",
                "route": "/intro"
            },
            {
                "name": "Ogone theory",
                "route": "/theory"
            },
            {
                "name": "Documentation",
                "route": "/doc",
                "children": [
                    {
                        "name": "Install",
                        "route": "/doc/install"
                    },
                    {
                        "name": "Get Started",
                        "route": "/doc/get-started"
                    },
                    {
                        "name": "Flags",
                        "route": "/flags",
                        "children": [
                            {
                                "name": "--if --else --else-if",
                                "status": "ok"
                            },
                            {
                                "name": "--for",
                                "status": "ok"
                            },
                            {
                                "name": "--await --defer",
                                "status": "ok"
                            },
                            {
                                "name": "--then:...",
                                "status": "ok"
                            },
                            {
                                "name": "--catch:...",
                                "status": "ok"
                            },
                            {
                                "name": "--finally:...",
                                "status": "ok"
                            },
                            {
                                "name": "--class --style",
                                "status": "ok"
                            },
                            {
                                "name": "--anim",
                                "status": "todo"
                            },
                            {
                                "name": "--router-go",
                                "status": "ok"
                            },
                            {
                                "name": "--<DOM L3>:..",
                                "status": "ok"
                            },
                            {
                                "name": "--drag:...",
                                "status": "todo"
                            },
                            {
                                "name": "--dragstart:...",
                                "status": "todo"
                            },
                            {
                                "name": "--dragend:...",
                                "status": "todo"
                            },
                            {
                                "name": "--event:animationstart:...",
                                "status": "ok"
                            },
                            {
                                "name": "--event:animationend:...",
                                "status": "ok"
                            },
                            {
                                "name": "--spread",
                                "status": "ok"
                            }
                        ]
                    },
                    {
                        "name": "Components",
                        "route": "/doc/components",
                        "status": "ok",
                        "children": [
                            {
                                "name": "Components Anatomy",
                                "route": "/doc/components/components-anatomy"
                            },
                            {
                                "name": "Counter",
                                "route": "/doc/components/counter"
                            },
                            {
                                "name": "Greeting App",
                                "route": "/doc/components/cgc"
                            },
                            {
                                "name": "Recursive Tree Button",
                                "route": "/doc/components/rtb"
                            }
                        ]
                    },
                    {
                        "name": "Async Components",
                        "status": "ok",
                        "route": "/doc/async-components"
                    },
                    {
                        "name": "Router",
                        "route": "/doc/router",
                        "status": "in-progress",
                        "children": [
                            {
                                "name": "Router anatomy",
                                "route": "/doc/router/router-anatomy"
                            }
                        ]
                    },
                    {
                        "name": "Store",
                        "status": "in-progress",
                        "route": "/doc/store",
                        "children": [
                            {
                                "name": "Store anatomy",
                                "route": "/doc/store/store-anatomy"
                            }
                        ]
                    },
                    {
                        "name": "Controllers",
                        "status": "in-progress",
                        "route": "/doc/controllers",
                        "children": [
                            {
                                "name": "Controllers anatomy",
                                "route": "/doc/controllers/controllers-anatomy"
                            }
                        ]
                    },
                    {
                        "name": "Api",
                        "route": "/api",
                        "children": [
                            {
                                "name": "Refs",
                                "status": "in-progress"
                            },
                            {
                                "name": "Store",
                                "status": "in-progress"
                            },
                            {
                                "name": "Async",
                                "status": "in-progress"
                            },
                            {
                                "name": "Tests Cases",
                                "status": "todo"
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Project",
                "route": "/project"
            },
            {
                "name": "Todos",
                "route": "/todos"
            },
            {
                "name": "Support",
                "route": "/support"
            }
        ]
    };
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                if (typeof _state === "string" && ![
                    'click:toggle-menu'
                ].includes(_state)) {
                    return;
                }
                switch(_state){
                    case 'click:toggle-menu':
                        Store.dispatch('menu/toggle');
                        break;
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/components/menu/MenuMain.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o1304491614] = function(Onode) {
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    Ogone.protocols[o1304491614] = Ogone.protocols[o1304491614] || class Protocol {
        openTree = false;
        inp = this.openTree ? 'open' : 'closed';
        item = {
            name: 'no name',
            route: '',
            status: 'todo',
            children: []
        };
    };
    const data = setReactivity(new Ogone.protocols[o1304491614], (prop)=>OnodeUpdate(Onode, prop)
    );
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                if (typeof _state === "string" && ![
                    'click:toggle'
                ].includes(_state)) {
                    return;
                }
                switch(_state){
                    case 'click:toggle':
                        this.openTree = !this.openTree;
                        this.inp = this.openTree ? 'open' : 'closed';
                        break;
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/components/menu/TreeRecursiveButton.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o246739052] = function(Onode) {
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    const data = {
    };
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                switch(_state){
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/components/Scroll.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o3244593960] = function(Onode) {
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    const data = {
    };
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                switch(_state){
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/components/Logo.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o402642107] = function(Onode) {
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    const data = {
    };
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                switch(_state){
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/routers/Router.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o2509604044] = function(Onode) {
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    const data = {
        "articles": [
            {
                "title": "Experimental tool for a fullstack use.",
                "text": "Ogone for Front-end fields using Deno. Designed differently, start creating differently.\nEverything is a component because everything is a part of the composition.\nActually Ogone is too young to be used for production, expect breaking chnages until the 1.0.0.\nOgone has it own extension *.o3 which allow some new features.\n",
                "code": null
            },
            {
                "title": "Install Ogone",
                "text": "install ogone by using the command: deno install\nDeno will print the next instruction that you will need to follow to use Ogone\n",
                "code": "deno install -Afq --unstable https://deno.land/x/ogone@0.28.0/cli/ogone.ts\n"
            },
            {
                "title": "Start the development of your application",
                "text": "keeping ogone minimalist is one of it's main goal.\nto run the server of development use the command:\n\n  ogone run ...\n",
                "code": "ogone run path/to/Application.o3\n",
                "page": "terminal"
            }
        ]
    };
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                switch(_state){
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/pages/Body.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o1177399929] = function(Onode) {
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    Ogone.protocols[o1177399929] = Ogone.protocols[o1177399929] || class Protocol {
        title = 'untitled';
        text = 'no text';
        code = "...";
        page = "";
    };
    const data = setReactivity(new Ogone.protocols[o1177399929], (prop)=>OnodeUpdate(Onode, prop)
    );
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                switch(_state){
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/components/ContentPage.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.components[o3498884249] = function(Onode) {
    let Controllers;
    let Store;
    const ___ = (prop, inst, value)=>{
        OnodeUpdate(Onode, prop);
        return value;
    };
    const ____r = (name2, use, once)=>{
        Onode.component.runtime(name2, use[0], use[1], once);
    };
    const Refs = {
    };
    let Async;
    const data = {
    };
    return {
        data,
        Refs,
        runtime: (function runtime(_state, ctx, event, _once = 0) {
            try {
                switch(_state){
                    default:
                }
            } catch (err) {
                displayError('Error in the component: \n\t examples/app/components/404.o3', err.message, err);
                throw err;
            }
        }).bind(data)
    };
};
Ogone.contexts[o3498884249_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/404.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o3498884249_n5] = Ogone.contexts[o3498884249_nt];
Ogone.contexts[o3498884249_n9] = Ogone.contexts[o3498884249_n5];
Ogone.contexts[o3498884249_t21] = Ogone.contexts[o3498884249_n9];
Ogone.contexts[o3498884249_n6] = Ogone.contexts[o3498884249_n5];
Ogone.contexts[o3498884249_n7] = Ogone.contexts[o3498884249_n6];
Ogone.contexts[o3498884249_n3] = Ogone.contexts[o3498884249_nt];
Ogone.contexts[o3498884249_t8] = Ogone.contexts[o3498884249_n3];
Ogone.contexts[o1177399929_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/ContentPage.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1177399929_n5] = Ogone.contexts[o1177399929_nt];
Ogone.contexts[o1177399929_nd12] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    if (GET_LENGTH && !this.code) {
        return 0;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/ContentPage.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1177399929_n15] = Ogone.contexts[o1177399929_nd12];
Ogone.contexts[o1177399929_n16] = Ogone.contexts[o1177399929_n15];
Ogone.contexts[o1177399929_t37] = Ogone.contexts[o1177399929_n16];
Ogone.contexts[o1177399929_nd13] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    if (GET_LENGTH && !this.page) {
        return 0;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/ContentPage.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1177399929_t30] = Ogone.contexts[o1177399929_nd13];
Ogone.contexts[o1177399929_n6] = Ogone.contexts[o1177399929_n5];
Ogone.contexts[o1177399929_n9] = Ogone.contexts[o1177399929_n6];
Ogone.contexts[o1177399929_t21] = Ogone.contexts[o1177399929_n9];
Ogone.contexts[o1177399929_n7] = Ogone.contexts[o1177399929_n6];
Ogone.contexts[o1177399929_t16] = Ogone.contexts[o1177399929_n7];
Ogone.contexts[o2509604044_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/pages/Body.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o2509604044_n5] = Ogone.contexts[o2509604044_nt];
Ogone.contexts[o2509604044_nd6] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    const _____a_7 = Ogone.arrays[o2509604044_nd6] || !!this.articles && this.articles || [];
    let i6 = POSITION[2], article = _____a_7[i6];
    if (Ogone.arrays[o2509604044_nd6] !== _____a_7) Ogone.arrays[o2509604044_nd6] = _____a_7;
    if (GET_LENGTH) {
        if (!_____a_7) {
            return 0;
        }
        return _____a_7.length;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
            i6,
            article
        };
    } catch (err) {
        if (typeof article === 'undefined' || !article) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/pages/Body.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o402642107_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/routers/Router.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o402642107_t6] = Ogone.contexts[o402642107_2];
Ogone.contexts[o402642107_t3] = Ogone.contexts[o402642107_nt];
Ogone.contexts[o402642107_2] = Ogone.contexts[o402642107_nt];
Ogone.contexts[o3244593960_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/Logo.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o3244593960_n5] = Ogone.contexts[o3244593960_nt];
Ogone.contexts[o3244593960_n6] = Ogone.contexts[o3244593960_n5];
Ogone.contexts[o3244593960_n3] = Ogone.contexts[o3244593960_nt];
Ogone.contexts[o3244593960_t7] = Ogone.contexts[o3244593960_n3];
Ogone.contexts[o246739052_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/Scroll.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o246739052_n5] = Ogone.contexts[o246739052_nt];
Ogone.contexts[o246739052_n6] = Ogone.contexts[o246739052_n5];
Ogone.contexts[o246739052_n7] = Ogone.contexts[o246739052_n6];
Ogone.contexts[o246739052_n8] = Ogone.contexts[o246739052_n7];
Ogone.contexts[o1304491614_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/TreeRecursiveButton.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1304491614_n5] = Ogone.contexts[o1304491614_nt];
Ogone.contexts[o1304491614_nd16] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    if (GET_LENGTH && !this.item.children) {
        return 0;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/TreeRecursiveButton.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1304491614_n17] = Ogone.contexts[o1304491614_nd16];
Ogone.contexts[o1304491614_nd18] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    const _____a_5 = !!this.item && this.item.children || [];
    let i4 = POSITION[4], child = _____a_5[i4];
    if (GET_LENGTH) {
        if (!_____a_5) {
            return 0;
        }
        return _____a_5.length;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
            i4,
            child
        };
    } catch (err) {
        if (typeof child === 'undefined' || !child) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/TreeRecursiveButton.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1304491614_nd6] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/TreeRecursiveButton.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1304491614_nd13] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    if (GET_LENGTH && this.item.children && !this.openTree) {
        return 0;
    } else if (GET_LENGTH && !(this.item.children && this.openTree)) {
        return 0;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/TreeRecursiveButton.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1304491614_t32] = Ogone.contexts[o1304491614_nd13];
Ogone.contexts[o1304491614_nd11] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    if (GET_LENGTH && !(this.item.children && !this.openTree)) {
        return 0;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/TreeRecursiveButton.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1304491614_t27] = Ogone.contexts[o1304491614_nd11];
Ogone.contexts[o1304491614_nd9] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/TreeRecursiveButton.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1304491614_t22] = Ogone.contexts[o1304491614_nd9];
Ogone.contexts[o1304491614_n7] = Ogone.contexts[o1304491614_nd6];
Ogone.contexts[o1304491614_t17] = Ogone.contexts[o1304491614_n7];
Ogone.contexts[o3575752143_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/MenuMain.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o3575752143_nd17] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/MenuMain.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o3575752143_nd6] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/MenuMain.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o3575752143_n13] = Ogone.contexts[o3575752143_nd6];
Ogone.contexts[o3575752143_nd14] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    const _____a_3 = Ogone.arrays[o3575752143_nd14] || !!this.menu && this.menu || [];
    let i2 = POSITION[3], item = _____a_3[i2];
    if (Ogone.arrays[o3575752143_nd14] !== _____a_3) Ogone.arrays[o3575752143_nd14] = _____a_3;
    if (GET_LENGTH) {
        if (!_____a_3) {
            return 0;
        }
        return _____a_3.length;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
            i2,
            item
        };
    } catch (err) {
        if (typeof item === 'undefined' || !item) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/MenuMain.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o3575752143_n7] = Ogone.contexts[o3575752143_nd6];
Ogone.contexts[o3575752143_n10] = Ogone.contexts[o3575752143_n7];
Ogone.contexts[o3575752143_t23] = Ogone.contexts[o3575752143_n10];
Ogone.contexts[o3575752143_nd8] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/MenuMain.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o3575752143_n5] = Ogone.contexts[o3575752143_nt];
Ogone.contexts[o2164776294_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/MenuButton.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o2164776294_nd5] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/MenuButton.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o2164776294_nd10] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    if (GET_LENGTH && !(this.buttonOpts.status === 'in-progress')) {
        return 0;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/MenuButton.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o2164776294_nd8] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    if (GET_LENGTH && !(this.buttonOpts.status === 'todo')) {
        return 0;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/MenuButton.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o2164776294_nd6] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    if (GET_LENGTH && !(this.buttonOpts.status === 'ok')) {
        return 0;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/MenuButton.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o2164776294_t13] = Ogone.contexts[o2164776294_nd5];
Ogone.contexts[o776663872_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/controllers/ControllerUser.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o776663872_t11] = Ogone.contexts[o776663872_2];
Ogone.contexts[o776663872_n3] = Ogone.contexts[o776663872_2];
Ogone.contexts[o776663872_t8] = Ogone.contexts[o776663872_n3];
Ogone.contexts[o776663872_t5] = Ogone.contexts[o776663872_2];
Ogone.contexts[o776663872_2] = Ogone.contexts[o776663872_nt];
Ogone.contexts[o44758046_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/stores/StoreMenu.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o44758046_t6] = Ogone.contexts[o44758046_2];
Ogone.contexts[o44758046_t3] = Ogone.contexts[o44758046_nt];
Ogone.contexts[o44758046_2] = Ogone.contexts[o44758046_nt];
Ogone.contexts[o841766682_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    const { print ,  } = Ogone.require['dep_51506147711985763655'];
    const { attr ,  } = Ogone.require['dep_58806555621990634570'];
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/Burger.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o841766682_nd6] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    const { print ,  } = Ogone.require['dep_51506147711985763655'];
    const { attr ,  } = Ogone.require['dep_58806555621990634570'];
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/Burger.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o841766682_n11] = Ogone.contexts[o841766682_nd6];
Ogone.contexts[o841766682_n9] = Ogone.contexts[o841766682_nd6];
Ogone.contexts[o841766682_nd7] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    const { print ,  } = Ogone.require['dep_51506147711985763655'];
    const { attr ,  } = Ogone.require['dep_58806555621990634570'];
    if (GET_LENGTH) {
        return 1;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/Burger.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o841766682_n5] = Ogone.contexts[o841766682_nt];
Ogone.contexts[o918636327_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/MenuContent.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o918636327_n5] = Ogone.contexts[o918636327_nt];
Ogone.contexts[o918636327_n9] = Ogone.contexts[o918636327_n5];
Ogone.contexts[o918636327_n10] = Ogone.contexts[o918636327_n9];
Ogone.contexts[o918636327_n6] = Ogone.contexts[o918636327_n5];
Ogone.contexts[o918636327_nd7] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    const _____a_1 = Ogone.arrays[o918636327_nd7] || !!this.menu && this.menu || [];
    let i0 = POSITION[3], t = _____a_1[i0];
    if (Ogone.arrays[o918636327_nd7] !== _____a_1) Ogone.arrays[o918636327_nd7] = _____a_1;
    if (GET_LENGTH) {
        if (!_____a_1) {
            return 0;
        }
        return _____a_1.length;
    }
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
            i0,
            t
        };
    } catch (err) {
        if (typeof t === 'undefined' || !t) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/menu/MenuContent.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1580687313_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/asyncs/AsyncLogo.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1580687313_n5] = Ogone.contexts[o1580687313_nt];
Ogone.contexts[o1580687313_nd6] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/asyncs/AsyncLogo.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1580687313_n3] = Ogone.contexts[o1580687313_nt];
Ogone.contexts[o1580687313_t8] = Ogone.contexts[o1580687313_n3];
Ogone.contexts[o262107635_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/components/RightSection.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o262107635_n5] = Ogone.contexts[o262107635_nt];
Ogone.contexts[o262107635_t12] = Ogone.contexts[o262107635_n5];
Ogone.contexts[o262107635_n3] = Ogone.contexts[o262107635_nt];
Ogone.contexts[o262107635_t7] = Ogone.contexts[o262107635_n3];
Ogone.contexts[o1370160080_nt] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    const { Obj: Obj1  } = Ogone.require['dep_6426190445621257115'];
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/Application.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1370160080_nd23] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    const { Obj: Obj1  } = Ogone.require['dep_6426190445621257115'];
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/Application.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1370160080_n22] = Ogone.contexts[o1370160080_nt];
Ogone.contexts[o1370160080_n21] = Ogone.contexts[o1370160080_nt];
Ogone.contexts[o1370160080_n12] = Ogone.contexts[o1370160080_nt];
Ogone.contexts[o1370160080_n19] = Ogone.contexts[o1370160080_n12];
Ogone.contexts[o1370160080_nd17] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    const { Obj: Obj1  } = Ogone.require['dep_6426190445621257115'];
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/Application.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.contexts[o1370160080_t37] = Ogone.contexts[o1370160080_nd17];
Ogone.contexts[o1370160080_n13] = Ogone.contexts[o1370160080_n12];
Ogone.contexts[o1370160080_nd14] = function(opts) {
    const GET_TEXT = opts.getText;
    const GET_LENGTH = opts.getLength;
    const POSITION = opts.position;
    const { Obj: Obj1  } = Ogone.require['dep_6426190445621257115'];
    try {
        if (GET_TEXT) {
            return eval('(' + GET_TEXT + ')');
        }
        return {
        };
    } catch (err) {
        if (typeof undefined === 'undefined' || !undefined) {
            return undefined;
        }
        displayError('Error in component:\n\t examples/app/Application.o3 ' + `${GET_TEXT}`, err.message, err);
        throw err;
    }
};
Ogone.render[o1370160080_nd17] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd17 = _h(___div_), t37 = `Dev`;
    _at(nd17, o1370160080, '');
    _at(nd17, 'class', 'open-dev-tool');
    _ap(nd17, t37);
    return nd17;
};
Ogone.render[o1370160080_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), n12 = _h(___div_), n13 = _h(___div_), nd14 = _h(_ogone_node_), nd17 = _h(_ogone_node_), t37 = `Dev`, n19 = _h(_ogone_node_), n21 = _h(_ogone_node_), n22 = _h(_ogone_node_), nd23 = _h(_ogone_node_);
    _at(nt, o1370160080, '');
    l++;
    _at(n12, o1370160080, '');
    ctx.refs['head'] = ctx.refs['head'] || [];
    ctx.refs['head'][i] = n12;
    _at(n12, 'class', 'header');
    l++;
    _at(n13, o1370160080, '');
    _at(n13, 'class', 'logo');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd14,
        placeholder: new Text(' '),
        name: "AsyncLogoEl",
        tree: "null>div>div>AsyncLogoEl",
        flags: {
            "events": [
                {
                    "type": "click",
                    "name": "router-go",
                    "eval": "'/'"
                }
            ],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: true,
        isTemplateProtected: false,
        isAsync: true,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o1370160080',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o1370160080-nd14',
        props: [],
        uuid: 'o1580687313',
        routes: null,
        namespace: '',
        requirements: [],
        dependencies: []
    };
    nd14.placeholder = o.placeholder;
    setOgone(nd14, o);
    o = null;
    _at(nd14, o1370160080, '');
    l--;
    _ap(n13, nd14);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd17,
        placeholder: new Text(' '),
        tree: "null>div>div",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "events": [
                {
                    "type": "click",
                    "name": "router-dev-tool",
                    "eval": true
                }
            ],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd17',
        uuid: 'o1370160080'
    };
    nd17.placeholder = o.placeholder;
    setOgone(nd17, o);
    o = null;
    _at(nd17, o1370160080, '');
    _ap(nd17, t37);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: n19,
        placeholder: new Text(' '),
        name: "MenuContent",
        tree: "null>div>MenuContent",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o1370160080',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o1370160080-n19',
        props: [],
        uuid: 'o918636327',
        routes: null,
        namespace: '',
        requirements: [],
        dependencies: []
    };
    n19.placeholder = o.placeholder;
    setOgone(n19, o);
    o = null;
    _at(n19, o1370160080, '');
    l--;
    _ap(n12, n13);
    _ap(n12, nd17);
    _ap(n12, n19);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: n21,
        placeholder: new Text(' '),
        name: "RouterComponent",
        tree: "null>RouterComponent",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: true,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o1370160080',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o1370160080-n21',
        props: [],
        uuid: 'o402642107',
        routes: [
            {
                "path": "/doc",
                "name": "documentation",
                "component": "o2509604044-nt",
                "title": "Ogone - documentation",
                "uuid": "o2509604044",
                "isAsync": false,
                "isRouter": false,
                "isTemplatePrivate": false,
                "isTemplateProtected": false
            },
            {
                "path": "/todos/:id",
                "component": "o3498884249-nt",
                "name": "todo",
                "uuid": "o3498884249",
                "isAsync": false,
                "isRouter": false,
                "isTemplatePrivate": true,
                "isTemplateProtected": false
            },
            {
                "path": 404,
                "name": 404,
                "component": "o3498884249-nt",
                "title": "404 route not found",
                "uuid": "o3498884249",
                "isAsync": false,
                "isRouter": false,
                "isTemplatePrivate": true,
                "isTemplateProtected": false
            }
        ],
        namespace: '',
        requirements: [],
        dependencies: []
    };
    n21.placeholder = o.placeholder;
    setOgone(n21, o);
    o = null;
    _at(n21, o1370160080, '');
    _at(n21, 'namespace', 'new');
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: n22,
        placeholder: new Text(' '),
        name: "MenuMain",
        tree: "null>MenuMain",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o1370160080',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o1370160080-n22',
        props: [],
        uuid: 'o3575752143',
        routes: null,
        namespace: '',
        requirements: [],
        dependencies: []
    };
    n22.placeholder = o.placeholder;
    setOgone(n22, o);
    o = null;
    _at(n22, o1370160080, '');
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd23,
        placeholder: new Text(' '),
        name: "RightSection",
        tree: "null>RightSection",
        flags: {
            "events": [],
            "spread": "...this",
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: true,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o1370160080',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o1370160080-nd23',
        props: [],
        uuid: 'o262107635',
        routes: null,
        namespace: '',
        requirements: [
            [
                "scrollY",
                "unknown"
            ]
        ],
        dependencies: []
    };
    nd23.placeholder = o.placeholder;
    setOgone(nd23, o);
    o = null;
    _at(nd23, o1370160080, '');
    l--;
    _ap(nt, n12);
    _ap(nt, n21);
    _ap(nt, n22);
    _ap(nt, nd23);
    return nt;
};
Ogone.render[o262107635_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), n3 = _h(___style_), t7 = `.container { position: fixed;top: 35%;width: 40px;height: 300px;right: 0;background: #2f3035;border-radius: 5px 0 0 5px;filter: drop-shadow(0px 2px 4px #00000086);; }`, n5 = _h(___div_), t12 = new Text(' ');
    l++;
    _ap(n3, t7);
    _at(n5, 'class', 'container');
    l++;
    t12.getContext = Ogone.contexts[o262107635_t12] ? Ogone.contexts[o262107635_t12].bind(ctx.data) : null;
    t12.code = '`${this.scrollY}`';
    const ptt12 = p.slice();
    ptt12[l - 2] = i;
    t12.position = ptt12;
    ctx.texts.push(t12);
    l--;
    _ap(n5, t12);
    l--;
    _ap(nt, n3);
    _ap(nt, n5);
    return nt;
};
Ogone.render[o1580687313_nd6] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd6 = _h(___img_);
    _at(nd6, 'class', 'img');
    _at(nd6, 'src', 'src/public/ogone.svg');
    return nd6;
};
Ogone.render[o1580687313_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), n3 = _h(___style_), t8 = `.img, .container { width: 60px;height: auto;; }`, n5 = _h(___div_), nd6 = _h(_ogone_node_);
    l++;
    _ap(n3, t8);
    _at(n5, 'class', 'container');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd6,
        placeholder: new Text(' '),
        tree: "null>div>img",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "await": true,
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: true,
        isImported: false,
        isRemote: false,
        extends: '-nd6',
        uuid: 'o1580687313'
    };
    nd6.placeholder = o.placeholder;
    setOgone(nd6, o);
    o = null;
    ctx.promises.push(new Promise((rs)=>{
        nd6.connectedCallback();
        for (let n of nd6.nodes){
            n.addEventListener('load', ()=>{
                rs();
            });
        }
    }));
    l--;
    _ap(n5, nd6);
    l--;
    _ap(nt, n3);
    _ap(nt, n5);
    return nt;
};
Ogone.render[o918636327_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), n5 = _h(___div_), n6 = _h(___div_), nd7 = _h(_ogone_node_), n9 = _h(___div_), n10 = _h(_ogone_node_);
    _at(nt, o918636327, '');
    l++;
    _at(n5, o918636327, '');
    _at(n5, 'id', 'test');
    _at(n5, 'class', 'menu');
    l++;
    _at(n6, o918636327, '');
    _at(n6, 'class', 'displayButtons');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd7,
        placeholder: new Text(' '),
        name: "MenuButton",
        tree: "null>div>div>MenuButton",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o918636327',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o918636327-nd7',
        props: [
            [
                "buttonOpts",
                "t"
            ]
        ],
        uuid: 'o2164776294',
        routes: null,
        namespace: '',
        requirements: [
            [
                "buttonOpts",
                " ButtonInterface "
            ]
        ],
        dependencies: []
    };
    nd7.placeholder = o.placeholder;
    setOgone(nd7, o);
    o = null;
    _at(nd7, o918636327, '');
    l--;
    _ap(n6, nd7);
    _at(n9, o918636327, '');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: n10,
        placeholder: new Text(' '),
        name: "Burger",
        tree: "null>div>div>Burger",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o918636327',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o918636327-n10',
        props: [],
        uuid: 'o841766682',
        routes: null,
        namespace: '',
        requirements: [],
        dependencies: []
    };
    n10.placeholder = o.placeholder;
    setOgone(n10, o);
    o = null;
    _at(n10, o918636327, '');
    l--;
    _ap(n9, n10);
    l--;
    _ap(n5, n6);
    _ap(n5, n9);
    l--;
    _ap(nt, n5);
    return nt;
};
Ogone.render[o841766682_nd7] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd7 = _h(___div_);
    _at(nd7, o841766682, '');
    _at(nd7, 'class', 'line');
    return nd7;
};
Ogone.render[o841766682_nd6] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd6 = _h(___div_), nd7 = _h(_ogone_node_), n9 = _h(___div_), n11 = _h(___div_);
    _at(nd6, o841766682, '');
    _at(nd6, 'class', 'container');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd7,
        placeholder: new Text(' '),
        tree: "null>div>div",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd7',
        uuid: 'o841766682',
        nodeProps: [
            [
                "attr",
                "attr(20) + '' + this.isOpen"
            ]
        ]
    };
    nd7.placeholder = o.placeholder;
    setOgone(nd7, o);
    o = null;
    _at(nd7, o841766682, '');
    _at(n9, o841766682, '');
    _at(n9, 'class', 'line');
    _at(n11, o841766682, '');
    _at(n11, 'class', 'line');
    l--;
    _ap(nd6, nd7);
    _ap(nd6, n9);
    _ap(nd6, n11);
    return nd6;
};
Ogone.render[o841766682_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), n5 = _h(_ogone_node_), nd6 = _h(_ogone_node_), nd7 = _h(_ogone_node_), n9 = _h(___div_), n11 = _h(___div_);
    _at(nt, o841766682, '');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: n5,
        placeholder: new Text(' '),
        name: "StoreMenu",
        tree: "null>StoreMenu",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: true,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o841766682',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o841766682-n5',
        props: [],
        uuid: 'o44758046',
        routes: null,
        namespace: 'menu',
        requirements: [],
        dependencies: []
    };
    n5.placeholder = o.placeholder;
    setOgone(n5, o);
    o = null;
    _at(n5, o841766682, '');
    _at(n5, 'namespace', 'menu');
    n5.connectedCallback();
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd6,
        placeholder: new Text(' '),
        tree: "null>div",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "events": [
                {
                    "type": "click",
                    "case": "click:openMenu",
                    "filter": null,
                    "target": null
                }
            ],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd6',
        uuid: 'o841766682'
    };
    nd6.placeholder = o.placeholder;
    setOgone(nd6, o);
    o = null;
    _at(nd6, o841766682, '');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd7,
        placeholder: new Text(' '),
        tree: "null>div>div",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd7',
        uuid: 'o841766682',
        nodeProps: [
            [
                "attr",
                "attr(20) + '' + this.isOpen"
            ]
        ]
    };
    nd7.placeholder = o.placeholder;
    setOgone(nd7, o);
    o = null;
    _at(nd7, o841766682, '');
    _at(n9, o841766682, '');
    _at(n9, 'class', 'line');
    _at(n11, o841766682, '');
    _at(n11, 'class', 'line');
    l--;
    _ap(nd6, nd7);
    _ap(nd6, n9);
    _ap(nd6, n11);
    l--;
    _ap(nt, n5);
    _ap(nt, nd6);
    return nt;
};
Ogone.render[o44758046_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), t3 = ``;
    _at(nt, o44758046, '');
    _ap(nt, t3);
    return nt;
};
Ogone.render[o776663872_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_);
    _at(nt, o776663872, '');
    return nt;
};
Ogone.render[o2164776294_nd6] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd6 = _h(___span_);
    _at(nd6, o2164776294, '');
    _at(nd6, 'class', 'ok');
    return nd6;
};
Ogone.render[o2164776294_nd8] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd8 = _h(___span_);
    _at(nd8, o2164776294, '');
    _at(nd8, 'class', 'todo');
    return nd8;
};
Ogone.render[o2164776294_nd10] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd10 = _h(___span_);
    _at(nd10, o2164776294, '');
    _at(nd10, 'class', 'in-progress');
    return nd10;
};
Ogone.render[o2164776294_nd5] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd5 = _h(___div_), t13 = new Text(' '), nd6 = _h(_ogone_node_), nd8 = _h(_ogone_node_), nd10 = _h(_ogone_node_);
    _at(nd5, o2164776294, '');
    _at(nd5, 'class', 'container');
    l++;
    t13.getContext = Ogone.contexts[o2164776294_t13] ? Ogone.contexts[o2164776294_t13].bind(ctx.data) : null;
    t13.code = '`${this.buttonOpts.name}`';
    const ptt13 = p.slice();
    ptt13[l - 2] = i;
    t13.position = ptt13;
    ctx.texts.push(t13);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd6,
        placeholder: new Text(' '),
        tree: "null>div>span",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "if": "this.buttonOpts.status === 'ok'",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd6',
        uuid: 'o2164776294'
    };
    nd6.placeholder = o.placeholder;
    setOgone(nd6, o);
    o = null;
    _at(nd6, o2164776294, '');
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd8,
        placeholder: new Text(' '),
        tree: "null>div>span",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "if": "this.buttonOpts.status === 'todo'",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd8',
        uuid: 'o2164776294'
    };
    nd8.placeholder = o.placeholder;
    setOgone(nd8, o);
    o = null;
    _at(nd8, o2164776294, '');
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd10,
        placeholder: new Text(' '),
        tree: "null>div>span",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "if": "this.buttonOpts.status === 'in-progress'",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd10',
        uuid: 'o2164776294'
    };
    nd10.placeholder = o.placeholder;
    setOgone(nd10, o);
    o = null;
    _at(nd10, o2164776294, '');
    l--;
    _ap(nd5, t13);
    _ap(nd5, nd6);
    _ap(nd5, nd8);
    _ap(nd5, nd10);
    return nd5;
};
Ogone.render[o2164776294_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), nd5 = _h(_ogone_node_), t13 = new Text(' '), nd6 = _h(_ogone_node_), nd8 = _h(_ogone_node_), nd10 = _h(_ogone_node_);
    _at(nt, o2164776294, '');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd5,
        placeholder: new Text(' '),
        tree: "null>div",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "events": [
                {
                    "type": "click",
                    "name": "router-go",
                    "eval": "this.buttonOpts.route"
                }
            ],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd5',
        uuid: 'o2164776294'
    };
    nd5.placeholder = o.placeholder;
    setOgone(nd5, o);
    o = null;
    _at(nd5, o2164776294, '');
    l++;
    t13.getContext = Ogone.contexts[o2164776294_t13] ? Ogone.contexts[o2164776294_t13].bind(ctx.data) : null;
    t13.code = '`${this.buttonOpts.name}`';
    const ptt13 = p.slice();
    ptt13[l - 2] = i;
    t13.position = ptt13;
    ctx.texts.push(t13);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd6,
        placeholder: new Text(' '),
        tree: "null>div>span",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "if": "this.buttonOpts.status === 'ok'",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd6',
        uuid: 'o2164776294'
    };
    nd6.placeholder = o.placeholder;
    setOgone(nd6, o);
    o = null;
    _at(nd6, o2164776294, '');
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd8,
        placeholder: new Text(' '),
        tree: "null>div>span",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "if": "this.buttonOpts.status === 'todo'",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd8',
        uuid: 'o2164776294'
    };
    nd8.placeholder = o.placeholder;
    setOgone(nd8, o);
    o = null;
    _at(nd8, o2164776294, '');
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd10,
        placeholder: new Text(' '),
        tree: "null>div>span",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "if": "this.buttonOpts.status === 'in-progress'",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd10',
        uuid: 'o2164776294'
    };
    nd10.placeholder = o.placeholder;
    setOgone(nd10, o);
    o = null;
    _at(nd10, o2164776294, '');
    l--;
    _ap(nd5, t13);
    _ap(nd5, nd6);
    _ap(nd5, nd8);
    _ap(nd5, nd10);
    l--;
    _ap(nt, nd5);
    return nt;
};
Ogone.render[o3575752143_nd6] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd6 = _h(___div_), n7 = _h(___div_), nd8 = _h(_ogone_node_), n10 = _h(___div_), t23 = `0.1.0`, n13 = _h(___div_), nd14 = _h(_ogone_node_);
    _at(nd6, o3575752143, '');
    _at(nd6, 'class', 'left-menu');
    l++;
    _at(n7, o3575752143, '');
    _at(n7, 'class', 'header');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd8,
        placeholder: new Text(' '),
        name: "LogoEl",
        tree: "null>div>div>LogoEl",
        flags: {
            "events": [
                {
                    "type": "click",
                    "case": "click:toggle-menu",
                    "filter": null,
                    "target": null
                }
            ],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: true,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o3575752143',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o3575752143-nd8',
        props: [],
        uuid: 'o3244593960',
        routes: null,
        namespace: '',
        requirements: null,
        dependencies: []
    };
    nd8.placeholder = o.placeholder;
    setOgone(nd8, o);
    o = null;
    _at(nd8, o3575752143, '');
    _at(n10, o3575752143, '');
    _ap(n10, t23);
    l--;
    _ap(n7, nd8);
    _ap(n7, n10);
    _at(n13, o3575752143, '');
    _at(n13, 'class', 'tree');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd14,
        placeholder: new Text(' '),
        name: "TreeRecursive",
        tree: "null>div>div>TreeRecursive",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o3575752143',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o3575752143-nd14',
        props: [
            [
                "item",
                "item"
            ]
        ],
        uuid: 'o1304491614',
        routes: null,
        namespace: '',
        requirements: [
            [
                "item",
                " TreeRecursive "
            ]
        ],
        dependencies: []
    };
    nd14.placeholder = o.placeholder;
    setOgone(nd14, o);
    o = null;
    _at(nd14, o3575752143, '');
    l--;
    _ap(n13, nd14);
    l--;
    _ap(nd6, n7);
    _ap(nd6, n13);
    return nd6;
};
Ogone.render[o3575752143_nd17] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd17 = _h(___div_);
    _at(nd17, o3575752143, '');
    return nd17;
};
Ogone.render[o3575752143_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), n5 = _h(_ogone_node_), nd6 = _h(_ogone_node_), n7 = _h(___div_), nd8 = _h(_ogone_node_), n10 = _h(___div_), t23 = `0.1.0`, n13 = _h(___div_), nd14 = _h(_ogone_node_), nd17 = _h(_ogone_node_);
    _at(nt, o3575752143, '');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: n5,
        placeholder: new Text(' '),
        name: "StoreMenu",
        tree: "null>StoreMenu",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: true,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o3575752143',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o3575752143-n5',
        props: [],
        uuid: 'o44758046',
        routes: null,
        namespace: 'menu',
        requirements: [],
        dependencies: []
    };
    n5.placeholder = o.placeholder;
    setOgone(n5, o);
    o = null;
    _at(n5, o3575752143, '');
    _at(n5, 'namespace', 'menu');
    n5.connectedCallback();
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd6,
        placeholder: new Text(' '),
        tree: "null>div",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "class": "{ close: !this.isOpen }",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd6',
        uuid: 'o3575752143'
    };
    nd6.placeholder = o.placeholder;
    setOgone(nd6, o);
    o = null;
    _at(nd6, o3575752143, '');
    l++;
    _at(n7, o3575752143, '');
    _at(n7, 'class', 'header');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd8,
        placeholder: new Text(' '),
        name: "LogoEl",
        tree: "null>div>div>LogoEl",
        flags: {
            "events": [
                {
                    "type": "click",
                    "case": "click:toggle-menu",
                    "filter": null,
                    "target": null
                }
            ],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: true,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o3575752143',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o3575752143-nd8',
        props: [],
        uuid: 'o3244593960',
        routes: null,
        namespace: '',
        requirements: null,
        dependencies: []
    };
    nd8.placeholder = o.placeholder;
    setOgone(nd8, o);
    o = null;
    _at(nd8, o3575752143, '');
    _at(n10, o3575752143, '');
    _ap(n10, t23);
    l--;
    _ap(n7, nd8);
    _ap(n7, n10);
    _at(n13, o3575752143, '');
    _at(n13, 'class', 'tree');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd14,
        placeholder: new Text(' '),
        name: "TreeRecursive",
        tree: "null>div>div>TreeRecursive",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o3575752143',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o3575752143-nd14',
        props: [
            [
                "item",
                "item"
            ]
        ],
        uuid: 'o1304491614',
        routes: null,
        namespace: '',
        requirements: [
            [
                "item",
                " TreeRecursive "
            ]
        ],
        dependencies: []
    };
    nd14.placeholder = o.placeholder;
    setOgone(nd14, o);
    o = null;
    _at(nd14, o3575752143, '');
    l--;
    _ap(n13, nd14);
    l--;
    _ap(nd6, n7);
    _ap(nd6, n13);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd17,
        placeholder: new Text(' '),
        tree: "null>div",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "class": "{ darken: this.isOpen }",
            "events": [
                {
                    "type": "click",
                    "case": "click:toggle-menu",
                    "filter": null,
                    "target": null
                }
            ],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd17',
        uuid: 'o3575752143'
    };
    nd17.placeholder = o.placeholder;
    setOgone(nd17, o);
    o = null;
    _at(nd17, o3575752143, '');
    l--;
    _ap(nt, n5);
    _ap(nt, nd6);
    _ap(nt, nd17);
    return nt;
};
Ogone.render[o1304491614_nd9] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd9 = _h(___span_), t22 = new Text(' ');
    _at(nd9, o1304491614, '');
    l++;
    t22.getContext = Ogone.contexts[o1304491614_t22] ? Ogone.contexts[o1304491614_t22].bind(ctx.data) : null;
    t22.code = '`${!this.item.children && this.item.status ? this.item.status : \'\'}`';
    const ptt22 = p.slice();
    ptt22[l - 2] = i;
    t22.position = ptt22;
    ctx.texts.push(t22);
    l--;
    _ap(nd9, t22);
    return nd9;
};
Ogone.render[o1304491614_nd11] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd11 = _h(___span_), t27 = `>`;
    _at(nd11, o1304491614, '');
    _ap(nd11, t27);
    return nd11;
};
Ogone.render[o1304491614_nd13] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd13 = _h(___span_), t32 = `<`;
    _at(nd13, o1304491614, '');
    _ap(nd13, t32);
    return nd13;
};
Ogone.render[o1304491614_nd6] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd6 = _h(___div_), n7 = _h(___span_), t17 = new Text(' '), nd9 = _h(_ogone_node_), t22 = new Text(' '), nd11 = _h(_ogone_node_), t27 = `>`, nd13 = _h(_ogone_node_), t32 = `<`;
    _at(nd6, o1304491614, '');
    _at(nd6, 'class', 'title');
    l++;
    _at(n7, o1304491614, '');
    l++;
    t17.getContext = Ogone.contexts[o1304491614_t17] ? Ogone.contexts[o1304491614_t17].bind(ctx.data) : null;
    t17.code = '`${this.item.name}`';
    const ptt17 = p.slice();
    ptt17[l - 2] = i;
    t17.position = ptt17;
    ctx.texts.push(t17);
    l--;
    _ap(n7, t17);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd9,
        placeholder: new Text(' '),
        tree: "null>div>div>span",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "class": "!this.item.children && this.item.status ? `status ${this.item.status}` : ''",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd9',
        uuid: 'o1304491614'
    };
    nd9.placeholder = o.placeholder;
    setOgone(nd9, o);
    o = null;
    _at(nd9, o1304491614, '');
    l++;
    t22.getContext = Ogone.contexts[o1304491614_t22] ? Ogone.contexts[o1304491614_t22].bind(ctx.data) : null;
    t22.code = '`${!this.item.children && this.item.status ? this.item.status : \'\'}`';
    const ptt22 = p.slice();
    ptt22[l - 2] = i;
    t22.position = ptt22;
    ctx.texts.push(t22);
    l--;
    _ap(nd9, t22);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd11,
        placeholder: new Text(' '),
        tree: "null>div>div>span",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "if": "this.item.children && !this.openTree",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd11',
        uuid: 'o1304491614'
    };
    nd11.placeholder = o.placeholder;
    setOgone(nd11, o);
    o = null;
    _at(nd11, o1304491614, '');
    _ap(nd11, t27);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd13,
        placeholder: new Text(' '),
        tree: "null>div>div>span",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "events": [],
            "elseIf": "this.item.children && this.openTree",
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd13',
        uuid: 'o1304491614'
    };
    nd13.placeholder = o.placeholder;
    setOgone(nd13, o);
    o = null;
    _at(nd13, o1304491614, '');
    _ap(nd13, t32);
    l--;
    _ap(nd6, n7);
    _ap(nd6, nd9);
    _ap(nd6, nd11);
    _ap(nd6, nd13);
    return nd6;
};
Ogone.render[o1304491614_nd16] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd16 = _h(___div_), n17 = _h(_ogone_node_), nd18 = _h(_ogone_node_);
    _at(nd16, o1304491614, '');
    _at(nd16, 'class', 'child');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: n17,
        placeholder: new Text(' '),
        name: "ScrollComponent",
        tree: "null>div>div>ScrollComponent",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o1304491614',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o1304491614-n17',
        props: [],
        uuid: 'o246739052',
        routes: null,
        namespace: '',
        requirements: null,
        dependencies: []
    };
    n17.placeholder = o.placeholder;
    setOgone(n17, o);
    o = null;
    _at(n17, o1304491614, '');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd18,
        placeholder: new Text(' '),
        name: "Self",
        tree: "null>div>div>ScrollComponent>Self",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o1304491614',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o1304491614-nd18',
        props: [
            [
                "item",
                "child"
            ]
        ],
        uuid: 'o1304491614',
        routes: null,
        namespace: '',
        requirements: [
            [
                "item",
                " TreeRecursive "
            ]
        ],
        dependencies: []
    };
    nd18.placeholder = o.placeholder;
    setOgone(nd18, o);
    o = null;
    _at(nd18, o1304491614, '');
    l--;
    _ap(n17, nd18);
    l--;
    _ap(nd16, n17);
    return nd16;
};
Ogone.render[o1304491614_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), n5 = _h(___div_), nd6 = _h(_ogone_node_), n7 = _h(___span_), t17 = new Text(' '), nd9 = _h(_ogone_node_), t22 = new Text(' '), nd11 = _h(_ogone_node_), t27 = `>`, nd13 = _h(_ogone_node_), t32 = `<`, nd16 = _h(_ogone_node_), n17 = _h(_ogone_node_), nd18 = _h(_ogone_node_);
    _at(nt, o1304491614, '');
    l++;
    _at(n5, o1304491614, '');
    _at(n5, 'class', 'container');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd6,
        placeholder: new Text(' '),
        tree: "null>div>div",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "events": [
                {
                    "type": "click",
                    "case": "click:toggle",
                    "filter": null,
                    "target": null
                },
                {
                    "type": "click",
                    "name": "router-go",
                    "eval": "this.item.route"
                }
            ],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd6',
        uuid: 'o1304491614'
    };
    nd6.placeholder = o.placeholder;
    setOgone(nd6, o);
    o = null;
    _at(nd6, o1304491614, '');
    l++;
    _at(n7, o1304491614, '');
    l++;
    t17.getContext = Ogone.contexts[o1304491614_t17] ? Ogone.contexts[o1304491614_t17].bind(ctx.data) : null;
    t17.code = '`${this.item.name}`';
    const ptt17 = p.slice();
    ptt17[l - 2] = i;
    t17.position = ptt17;
    ctx.texts.push(t17);
    l--;
    _ap(n7, t17);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd9,
        placeholder: new Text(' '),
        tree: "null>div>div>span",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "class": "!this.item.children && this.item.status ? `status ${this.item.status}` : ''",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd9',
        uuid: 'o1304491614'
    };
    nd9.placeholder = o.placeholder;
    setOgone(nd9, o);
    o = null;
    _at(nd9, o1304491614, '');
    l++;
    t22.getContext = Ogone.contexts[o1304491614_t22] ? Ogone.contexts[o1304491614_t22].bind(ctx.data) : null;
    t22.code = '`${!this.item.children && this.item.status ? this.item.status : \'\'}`';
    const ptt22 = p.slice();
    ptt22[l - 2] = i;
    t22.position = ptt22;
    ctx.texts.push(t22);
    l--;
    _ap(nd9, t22);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd11,
        placeholder: new Text(' '),
        tree: "null>div>div>span",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "if": "this.item.children && !this.openTree",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd11',
        uuid: 'o1304491614'
    };
    nd11.placeholder = o.placeholder;
    setOgone(nd11, o);
    o = null;
    _at(nd11, o1304491614, '');
    _ap(nd11, t27);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd13,
        placeholder: new Text(' '),
        tree: "null>div>div>span",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "events": [],
            "elseIf": "this.item.children && this.openTree",
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd13',
        uuid: 'o1304491614'
    };
    nd13.placeholder = o.placeholder;
    setOgone(nd13, o);
    o = null;
    _at(nd13, o1304491614, '');
    _ap(nd13, t32);
    l--;
    _ap(nd6, n7);
    _ap(nd6, nd9);
    _ap(nd6, nd11);
    _ap(nd6, nd13);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd16,
        placeholder: new Text(' '),
        tree: "null>div>div",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "if": "this.item.children",
            "class": "{ 'child-open': this.openTree }",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd16',
        uuid: 'o1304491614'
    };
    nd16.placeholder = o.placeholder;
    setOgone(nd16, o);
    o = null;
    _at(nd16, o1304491614, '');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: n17,
        placeholder: new Text(' '),
        name: "ScrollComponent",
        tree: "null>div>div>ScrollComponent",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o1304491614',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o1304491614-n17',
        props: [],
        uuid: 'o246739052',
        routes: null,
        namespace: '',
        requirements: null,
        dependencies: []
    };
    n17.placeholder = o.placeholder;
    setOgone(n17, o);
    o = null;
    _at(n17, o1304491614, '');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd18,
        placeholder: new Text(' '),
        name: "Self",
        tree: "null>div>div>ScrollComponent>Self",
        flags: {
            "events": [],
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o1304491614',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o1304491614-nd18',
        props: [
            [
                "item",
                "child"
            ]
        ],
        uuid: 'o1304491614',
        routes: null,
        namespace: '',
        requirements: [
            [
                "item",
                " TreeRecursive "
            ]
        ],
        dependencies: []
    };
    nd18.placeholder = o.placeholder;
    setOgone(nd18, o);
    o = null;
    _at(nd18, o1304491614, '');
    l--;
    _ap(n17, nd18);
    l--;
    _ap(nd16, n17);
    l--;
    _ap(n5, nd6);
    _ap(n5, nd16);
    l--;
    _ap(nt, n5);
    return nt;
};
Ogone.render[o246739052_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), n5 = _h(___div_), n6 = _h(___div_), n7 = _h(___div_), n8 = _h(___slot_);
    _at(nt, o246739052, '');
    l++;
    _at(n5, o246739052, '');
    _at(n5, 'class', 'container');
    l++;
    _at(n6, o246739052, '');
    ctx.refs['view'] = ctx.refs['view'] || [];
    ctx.refs['view'][i] = n6;
    _at(n6, 'class', 'view');
    l++;
    _at(n7, o246739052, '');
    ctx.refs['content'] = ctx.refs['content'] || [];
    ctx.refs['content'][i] = n7;
    _at(n7, 'class', 'content');
    l++;
    _at(n8, o246739052, '');
    l--;
    _ap(n7, n8);
    l--;
    _ap(n6, n7);
    l--;
    _ap(n5, n6);
    l--;
    _ap(nt, n5);
    return nt;
};
Ogone.render[o3244593960_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), n3 = _h(___style_), t7 = `.container { width: 60px;height: auto; } .container .img { width: 60px;height: auto;; }`, n5 = _h(___div_), n6 = _h(___img_);
    l++;
    _ap(n3, t7);
    _at(n5, 'class', 'container');
    l++;
    _at(n6, 'class', 'img');
    _at(n6, 'src', '/src/public/ogone.svg');
    l--;
    _ap(n5, n6);
    l--;
    _ap(nt, n3);
    _ap(nt, n5);
    return nt;
};
Ogone.render[o402642107_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), t3 = ``;
    _at(nt, o402642107, '');
    _ap(nt, t3);
    return nt;
};
Ogone.render[o2509604044_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), n5 = _h(___div_), nd6 = _h(_ogone_node_);
    _at(nt, o2509604044, '');
    l++;
    _at(n5, o2509604044, '');
    _at(n5, 'class', 'container');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd6,
        placeholder: new Text(' '),
        name: "ContentPage",
        tree: "null>div>ContentPage",
        flags: {
            "events": [],
            "spread": "...article",
            "else": false
        },
        isTemplate: true,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: true,
        isRemote: false,
        extends: '-nt',
        uuid: 'o2509604044',
        positionInParentComponent: p,
        levelInParentComponent: l,
        parentComponent: ctx,
        parentCTXId: 'o2509604044-nd6',
        props: [],
        uuid: 'o1177399929',
        routes: null,
        namespace: '',
        requirements: [
            [
                "title",
                " string "
            ],
            [
                "text",
                " string "
            ],
            [
                "code",
                " string "
            ],
            [
                "page",
                " string "
            ]
        ],
        dependencies: []
    };
    nd6.placeholder = o.placeholder;
    setOgone(nd6, o);
    o = null;
    _at(nd6, o2509604044, '');
    l--;
    _ap(n5, nd6);
    l--;
    _ap(nt, n5);
    return nt;
};
Ogone.render[o1177399929_nd13] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd13 = _h(___p_), t30 = new Text(' ');
    _at(nd13, o1177399929, '');
    _at(nd13, 'class', 'page');
    l++;
    t30.getContext = Ogone.contexts[o1177399929_t30] ? Ogone.contexts[o1177399929_t30].bind(ctx.data) : null;
    t30.code = '`${this.page}`';
    const ptt30 = p.slice();
    ptt30[l - 2] = i;
    t30.position = ptt30;
    ctx.texts.push(t30);
    l--;
    _ap(nd13, t30);
    return nd13;
};
Ogone.render[o1177399929_nd12] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nd12 = _h(___div_), nd13 = _h(_ogone_node_), t30 = new Text(' '), n15 = _h(___pre_), n16 = _h(___code_), t37 = new Text(' ');
    _at(nd12, o1177399929, '');
    _at(nd12, 'class', 'right');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd13,
        placeholder: new Text(' '),
        tree: "null>div>div>p",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "if": "this.page",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd13',
        uuid: 'o1177399929'
    };
    nd13.placeholder = o.placeholder;
    setOgone(nd13, o);
    o = null;
    _at(nd13, o1177399929, '');
    l++;
    t30.getContext = Ogone.contexts[o1177399929_t30] ? Ogone.contexts[o1177399929_t30].bind(ctx.data) : null;
    t30.code = '`${this.page}`';
    const ptt30 = p.slice();
    ptt30[l - 2] = i;
    t30.position = ptt30;
    ctx.texts.push(t30);
    l--;
    _ap(nd13, t30);
    _at(n15, o1177399929, '');
    l++;
    _at(n16, o1177399929, '');
    _at(n16, 'class', 'javascript');
    l++;
    t37.getContext = Ogone.contexts[o1177399929_t37] ? Ogone.contexts[o1177399929_t37].bind(ctx.data) : null;
    t37.code = '`${this.code}`';
    const ptt37 = p.slice();
    ptt37[l - 2] = i;
    t37.position = ptt37;
    ctx.texts.push(t37);
    l--;
    _ap(n16, t37);
    l--;
    _ap(n15, n16);
    l--;
    _ap(nd12, nd13);
    _ap(nd12, n15);
    return nd12;
};
Ogone.render[o1177399929_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), n5 = _h(___div_), n6 = _h(___div_), n7 = _h(___h2_), t16 = new Text(' '), n9 = _h(___p_), t21 = new Text(' '), nd12 = _h(_ogone_node_), nd13 = _h(_ogone_node_), t30 = new Text(' '), n15 = _h(___pre_), n16 = _h(___code_), t37 = new Text(' ');
    _at(nt, o1177399929, '');
    l++;
    _at(n5, o1177399929, '');
    _at(n5, 'class', 'container');
    l++;
    _at(n6, o1177399929, '');
    _at(n6, 'class', 'left');
    l++;
    _at(n7, o1177399929, '');
    _at(n7, 'class', 'title');
    l++;
    t16.getContext = Ogone.contexts[o1177399929_t16] ? Ogone.contexts[o1177399929_t16].bind(ctx.data) : null;
    t16.code = '`${this.title}`';
    const ptt16 = p.slice();
    ptt16[l - 2] = i;
    t16.position = ptt16;
    ctx.texts.push(t16);
    l--;
    _ap(n7, t16);
    _at(n9, o1177399929, '');
    _at(n9, 'class', 'text');
    l++;
    t21.getContext = Ogone.contexts[o1177399929_t21] ? Ogone.contexts[o1177399929_t21].bind(ctx.data) : null;
    t21.code = '`${this.text}`';
    const ptt21 = p.slice();
    ptt21[l - 2] = i;
    t21.position = ptt21;
    ctx.texts.push(t21);
    l--;
    _ap(n9, t21);
    l--;
    _ap(n6, n7);
    _ap(n6, n9);
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd12,
        placeholder: new Text(' '),
        tree: "null>div>div",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "if": "this.code",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd12',
        uuid: 'o1177399929'
    };
    nd12.placeholder = o.placeholder;
    setOgone(nd12, o);
    o = null;
    _at(nd12, o1177399929, '');
    l++;
    o = {
        isRoot: false,
        isOriginalNode: true,
        original: nd13,
        placeholder: new Text(' '),
        tree: "null>div>div>p",
        position: p,
        level: l,
        index: i,
        component: ctx,
        flags: {
            "if": "this.page",
            "events": [],
            "else": false
        },
        isTemplate: false,
        isTemplatePrivate: false,
        isTemplateProtected: false,
        isAsync: false,
        isRouter: false,
        isStore: false,
        isController: false,
        isAsyncNode: false,
        isImported: false,
        isRemote: false,
        extends: '-nd13',
        uuid: 'o1177399929'
    };
    nd13.placeholder = o.placeholder;
    setOgone(nd13, o);
    o = null;
    _at(nd13, o1177399929, '');
    l++;
    t30.getContext = Ogone.contexts[o1177399929_t30] ? Ogone.contexts[o1177399929_t30].bind(ctx.data) : null;
    t30.code = '`${this.page}`';
    const ptt30 = p.slice();
    ptt30[l - 2] = i;
    t30.position = ptt30;
    ctx.texts.push(t30);
    l--;
    _ap(nd13, t30);
    _at(n15, o1177399929, '');
    l++;
    _at(n16, o1177399929, '');
    _at(n16, 'class', 'javascript');
    l++;
    t37.getContext = Ogone.contexts[o1177399929_t37] ? Ogone.contexts[o1177399929_t37].bind(ctx.data) : null;
    t37.code = '`${this.code}`';
    const ptt37 = p.slice();
    ptt37[l - 2] = i;
    t37.position = ptt37;
    ctx.texts.push(t37);
    l--;
    _ap(n16, t37);
    l--;
    _ap(n15, n16);
    l--;
    _ap(nd12, nd13);
    _ap(nd12, n15);
    l--;
    _ap(n5, n6);
    _ap(n5, nd12);
    l--;
    _ap(nt, n5);
    return nt;
};
Ogone.render[o3498884249_nt] = function(ctx, pos = [], i = 0, l = 0) {
    let p = pos.slice();
    let o = null;
    const nt = _h(___template_), n3 = _h(___style_), t8 = `.container { display: flex;justify-content: center;margin: auto;flex-direction: column;height: 100vh; } .container .text { font-weight: 400;font-size: 24pt;text-align: center;color: #9e9e9e;margin: 40px;; } .logo-back { filter: drop-shadow(2px 4px 6px var(--o-primary));border-radius: 100%;padding: 56px;animation-name: popup;animation-duration: 0.5s;animation-timing-function: cubic-bezier(0.1, -0.6, 0.2, 0);max-width: 500px;margin: auto; } .logo-back img.logo { width: 500px;height: auto;animation-name: rotate;animation-duration: 5s;animation-timing-function: ease;animation-iteration-count: infinite;animation-direction: alternate;; }`, n5 = _h(___div_), n6 = _h(___div_), n7 = _h(___img_), n9 = _h(___div_), t21 = `404 route not found.`;
    l++;
    _ap(n3, t8);
    _at(n5, 'class', 'container');
    l++;
    _at(n6, 'class', 'logo-back');
    l++;
    _at(n7, 'class', 'logo');
    _at(n7, 'src', '/src/public/ogone.svg');
    l--;
    _ap(n6, n7);
    _at(n9, 'class', 'text');
    _ap(n9, t21);
    l--;
    _ap(n5, n6);
    _ap(n5, n9);
    l--;
    _ap(nt, n3);
    _ap(nt, n5);
    return nt;
};
Ogone.require['dep_6426190445621257115'] = Ogone.require['dep_6426190445621257115'] || {
};
Ogone.require['dep_6426190445621257115'].Obj = Obj;
Ogone.require['dep_51506147711985763655'] = Ogone.require['dep_51506147711985763655'] || {
};
Ogone.require['dep_51506147711985763655'].print = __default2;
Ogone.require['dep_58806555621990634570'] = Ogone.require['dep_58806555621990634570'] || {
};
Ogone.require['dep_58806555621990634570'].attr = __default;
