import { existsSync } from "../../deps/deps.ts";
import type { Component, ImportDescription } from "../ogone.main.d.ts";
import AssetsParser from "./AssetsParser.ts";
import Env from "./Env.ts";
import { MapPosition, Position } from "./MapPosition.ts";
import TSTranspiler from "./TSTranspiler.ts";
import { Utils } from "./Utils.ts";

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
            if (Dependency.depsRegistry.includes(this.absolutePathURL.pathname)) {
                return;
            }
            if (this.component.deps.find((dep) => dep.absolutePathURL === this.absolutePathURL)) {
                return;
            }
            Dependency.depsRegistry.push(this.absolutePathURL.pathname);
            this.infos(`Dep: ${this.absolutePathURL.pathname}`);
            this.getTranspiledFile();
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
        return new URL(this.data.path, this.origin);
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
        return this.input.replace(this.data.path, `${this.absolutePathURL.pathname}?uuid=${this.component.uuid}`);
    }
    /**
     * exposes the import statement with the absolute path to the module
     */
    get structuredOgoneRequire(): string {
        const { defaultName, allAsName, members, path } = this.data;
        let importStatement = `
/**
 * struct import for ${this.component.file}
 * */
${this.importStatementAbsolutePath}
/**
 * save imports for ${this.component.file}
*/
Ogone.require['{% absolute %}'] = Ogone.require['{% absolute %}'] || {};
        `;
        members.forEach(member => {
            if (member.alias) {
                importStatement += `
/** aliased member */
Ogone.require['{% absolute %}'].${member.alias} = ${member.alias}
                `;
            } else {
                importStatement += `
/** member */
Ogone.require['{% absolute %}'].${member.name} = ${member.name}
                `;
            }
        });
        /**
         * save if the user uses
         * import Name from '...'
         */
        if (defaultName) {
            importStatement += `
/** default */
Ogone.require['{% absolute %}'].${defaultName} = ${defaultName}
`;
        }
        /**
         * save if the user uses
         * import * as Name from '...'
         */
        if (allAsName) {
            importStatement += `
/** default */
Ogone.require['{% absolute %}'].${allAsName} = ${allAsName}
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
        const { defaultName, allAsName, members, path } = this.data;
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
}