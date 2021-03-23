import { colors, existsSync, absolute } from "../../deps/deps.ts";
import type { Component, ImportDescription } from "../ogone.main.d.ts";
import AssetsParser from "./AssetsParser.ts";
import Env from "./Env.ts";
import HMR from "./HMR.ts";
import { MapPosition, Position } from "./MapPosition.ts";
import TSTranspiler from "./TSTranspiler.ts";
import { Utils } from "./Utils.ts";
import transformPathFileToUUID from '../../utils/transformPathFileToUUID.ts';

/**
 * a class to expose all the dependencies of a component
 * even the submodules
 */
export default class Dependency extends Utils {
    static depsRegistry: string[] = [];
    private AssetsParser: AssetsParser = new AssetsParser();
    private children: Dependency[] = [];
    public file: string = '';
    constructor(
        public component: Component,
        /**
         * all informations of the import statement
         */
        private data: ImportDescription,
        public parent: Dependency | null = null,
        ) {
            super();
            this.resolveRemoteComponentDependency();
            if (Dependency.depsRegistry.includes(this.absolutePathURL.pathname)) {
                return;
            }
            if (this.component.deps.find((dep) => dep.absolutePathURL === this.absolutePathURL)) {
                return;
            }
            Dependency.depsRegistry.push(this.absolutePathURL.pathname);
            this.trace(`Dep: ${this.absolutePathURL.pathname}`);
            this.getTranspiledFile();
            (async () => {
                this.getChildren();
            })().then(() => {
                this.watch();
            });
        }
    get isRemote(): boolean {
        return !!this.data.isRemote;
    }
    /**
     * absolute path to the component
     * or to the parent dependency
     */
    get origin(): URL {
        return this.parent && this.parent.absolutePathURL || new URL( this.component.file, `file://${Deno.cwd()}/`);
    }
    /**
     * the position of the statement
     */
    get position(): Position | undefined {
        const position = MapPosition.mapTokens.get(this.data.key);
        return position;
    }
    /**
     * the URL to the dependency
     */
    get absolutePathURL(): URL {
        if (this.isRemote) {
            return new URL(this.data.path);
        }
        const url = new URL(this.data.path, this.origin);
        if (!existsSync(url.pathname)) {
            const position = this.position;
            if (position) {
                const { blue } = colors
                const line = MapPosition.getLine(this.component.source, position);
                const column = MapPosition.getColumn(this.component.source, position);
                this.error(`${this.component.file}:${line}:${column}
                Cannot resolve module: ${blue(url.pathname)}
                    from ${blue(this.component.file)}
                    input: ${blue(this.data.path)}
                `)
            }
        }
        return url;
    }
    /**
     * the type of the import
     * absolute, relative or remote
     */
    get type(): string | undefined {
        return this.data.type;
    }
    /**
     * the input from the user
     */
    get input(): string {
        return this.data.value;
    }
    /**
     * exposes the import statement with the absolute path to the module
     */
    get importStatementAbsolutePath(): string {
        if (this.isRemote) return this.input;
        if (Env._env !== 'production') return this.input.replace(this.data.path, `${this.absolutePathURL.pathname}?uuid=${this.component.uuid}`);
        return this.input.replace(this.data.path, this.absolutePathURL.pathname);
    }
    /**
     * exposes the import statement with the dependency's url in parameter
     */
    get importRemoteDepencyForDev(): string | null {
        if (!this.isRemote) return null;
        if (Env._env !== 'production') {
            return this.input.replace(this.data.path, `/?serve_module=${this.absolutePathURL.href}`);
        }
        return this.input;
    }
    /**
     * exposes the import statement with the absolute path to the module
     */
    get structuredOgoneRequire(): string {
        const { defaultName, allAsName, members, path, isType, isRemote } = this.data;
        if (isType) return '';
        const graph = this.graphAbsolutePaths;
        function getStructure(pathToModule: string, memberName: string, opts: { isDefault: boolean, isAllAs: boolean, isMember: boolean }): string {
            const { isDefault, isMember, isAllAs } = opts;
            if (isRemote) `Ogone.require[${pathToModule}].${memberName} = ${memberName}`;
            let result = `
            Ogone.require[${pathToModule}].${memberName} = ${memberName}
            `;
            if (Env._env !== 'production') {
                result += `
                HMR.subscribe(${pathToModule}, (mod) => {
                    Ogone.require[${pathToModule}].${memberName} = mod${isDefault ? '.default' : isAllAs ? '' : memberName}
                });
                HMR.setGraph(${pathToModule}, ${JSON.stringify(graph)});`;
            }
            return result
        }
        let importStatement = `
/**
 * struct import for ${this.component.file}
 * */
${this.importRemoteDepencyForDev || this.importStatementAbsolutePath}
/**
 * save imports for ${this.component.file}
*/
Ogone.require['{% absolute %}'] = Ogone.require['{% absolute %}'] || {};`;
        members.forEach(member => {
            importStatement += `
/** member */
${getStructure("'{% absolute %}'", member.alias || member.name, {
    isDefault: false,
    isAllAs: false,
    isMember: true,
})}
            `;
        });
        /**
         * save if the user uses
         * import Name from '...'
         */
        if (defaultName) {
            importStatement += `
/** default */
${getStructure("'{% absolute %}'", defaultName, {
    isDefault: true,
    isAllAs: false,
    isMember: false,
})}
`;
        }
        /**
         * save if the user uses
         * import * as Name from '...'
         */
        if (allAsName) {
            importStatement += `
/** default */
${getStructure("'{% absolute %}'", allAsName, {
    isDefault: false,
    isAllAs: true,
    isMember: false,
})}
`;
        }
        return this.template(importStatement, {
            absolute: this.absolutePathURL.pathname
        });
    }
    /**
     * for the component's runtime and context
     * we expose the dependencies from Ogone.require
     * returns an empty string if the environment isn't development
     */
    get destructuredOgoneRequire(): string {
        if (Env._env === 'production') return '';
        const { defaultName, allAsName, members, path, isType } = this.data;
        if (isType) return '';
        let destructured = `
        ${defaultName ? defaultName + ',' : ''}
        ${allAsName ? allAsName + ',' : ''}
        ${members.map(member => member.alias || member.name).join(', ')}
        `
        return this.template(`const { {% destructured %} } = Ogone.require['{% absolute %}'];
`, {
            destructured,
            absolute: this.absolutePathURL.pathname
        });
    }
    /**
     * returns all the children of the dependecy recursively
     */
    private getChildren(): Dependency[] {
        const result: Dependency[] = [];
        if (existsSync(this.absolutePathURL.pathname)) {
            const file = Deno.readTextFileSync(this.absolutePathURL.pathname);
            this.file = file;
            const importBody = this.AssetsParser.parseImportStatement(file);
            if (importBody.body && importBody.body.imports) {
                const { imports } = importBody.body;
                const deps = (Object.values(imports) as ImportDescription[])
                  .filter((imp: ImportDescription) => !imp.isComponent)
                  .map((imp: ImportDescription): Dependency => new Dependency(this.component, imp, this));
                result.push(...deps);
                this.children.push(...deps);
                this.component.deps.push(...deps);
            }

            if (importBody.body && importBody.body.exports) {
                const deps = (Object.values(importBody.body.exports) as ImportDescription[])
                  .filter((exp: ImportDescription) => exp.path.length)
                  .map((exp: ImportDescription): Dependency => new Dependency(this.component, exp, this));
                result.push(...deps);
                this.children.push(...deps);
                this.component.deps.push(...deps);
            }
        }
        return result;
    }
    async getTranspiledFile() {
        if (this.data.path.endsWith('.ts')) {
            this.file = await TSTranspiler.transpile(this.file);
        }
    }
    async watch() {
        if (this.isRemote) return;
        /**
         * start watching the dependency and trigger HMR.postMessage whenever there's a change
         */
        const watcher = Deno.watchFs(this.absolutePathURL.pathname);
        for await (const event of watcher) {
          const { kind } = event;
          this.invalidate();
          if (kind === "access") {
            HMR.postMessage({
                uuid: this.component.uuid,
                type: 'module',
                pathToModule: this.absolutePathURL.pathname,
                uuidReq: `i${crypto.getRandomValues(new Uint32Array(10)).join('')}`,
            });
          }
        }
    }
    get graphAbsolutePaths(): string[] {
        if (this.children.length) {
            return [
                ...this.children.map((dep) => dep.absolutePathURL.pathname),
                ...this.children.map((dep) => dep.graphAbsolutePaths).flat(),
            ]
        } else {
            return [];
        }
    }
    get firstAncestor(): Dependency {
        if (this.parent) return this.parent.firstAncestor;
        else return this;
    }
    invalidate() {
        const dependency_path = this.absolutePathURL.pathname;
        const cachePaths = [
            `.ogone/.cache/${transformPathFileToUUID(dependency_path)}`,
        ];
        for (let p of cachePaths) {
            if (existsSync(p)) {
                Deno.removeSync(p);
            }
        }
    }
    resolveRemoteComponentDependency() {
        if (!this.data.isRemote && !!this.component.remote) {
            const remotePath = this.component.remote.path;
            const newPath = absolute(remotePath, this.data.path);
            this.data.isRemote = true;
            this.data.path = newPath;
        }
    }
}