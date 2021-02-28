import { Utils } from "../Utils.ts";
import Document from "./Document.ts";

export interface RulesOptions {
    readonly id: string;
    readonly source: string;
    parent?: Rules;
    selector?: string;
    document: Document;
}
/**
 * class Rules that will define its own selector
 * by fetching it into the parent Rule
 */
export default class Rules extends Utils {
    private _selector: string | null = null;
    /**
     * all the properties used inside the current rule
     */
    private _data: { [k: string]: string } = {};
    public children: Rules[] = [];
    /**
     * all the variables that are not handling a selector
     * @const varName = 12px;
     * varName with 12px as value
     */
    public mapLiteralVariables: Map<string, string> = new Map();
    /**
     * same as MapLiteralVariables
     * but should only save the exported variables like following
     * @export const Varname = 12px;
     * varName with 12px as value
     */
    public mapExportableLiteralVariables: Map<string, string> = new Map();
    constructor(public opts: RulesOptions) {
        super();
        const { parent } = this;
        if (parent) {
            parent.children.push(this);
            // save into this.opts.document.mapAssignedRules
            // if the current rule is saved into a var
            this.saveConst();
        }
        // this.readVariables();
        this.readProperties();
        console.warn(this._data);
    }
    /**
     * regular expression to identify the selector of the current rule
     *
     */
    get regExpIdentifier(): RegExp {
        return new RegExp(`(?:(;|\\{|^))(?<selector>[\\S\\s]+?)(?<!\$)(${this.opts.id})`, 'i');
    }
    /**
     * the content of the
     */
    get source(): string {
        return this.opts.source;
    }
     /**
     * returns the parent of the current rule
     */
    get parent(): Rules | undefined {
        const entries = Object.entries(this.opts.document.typedExpressions.blocks);
        const maybeParent = entries.find(([, block]: string[]) => {
            return block.includes(this.opts.id);
        });
        if (maybeParent) {
            const [key, ] = maybeParent;
            const result = this.opts.document.mapRules.get(key);
            this.opts.parent = result;
            return result;
        }
    }
    get selector(): string | null {
        if (this._selector) return this._selector;
        const { parent } = this;
        if (parent) {
            const reg = this.regExpIdentifier;
            const match = parent.opts.source.match(reg);
            if (match && match.groups) {
                const { selector } = match.groups;
                const regSplit = /(?:\d+_block|;)/gi;
                const splitted = selector.split(regSplit);
                const realName = splitted[splitted.length - 1];
                if (realName) {
                    let result = realName.trim()
                    this._selector = result;
                    return result;
                }
            }
        }
        return null;
    }
    get isMedia(): boolean { return !!this.selector && !!this.selector.match(/^\@media\b/) }
    get isKeyframes(): boolean { return !!this.selector && !!this.selector.match(/^\@keyframes\b/) }
    get isConst(): boolean { return !!this.selector && !!this.selector.match(/^\@const\b/) }
    get isExport(): boolean { return !!this.selector && !!this.selector.match(/^\@export\s+const\b/) }
    get isSupports(): boolean { return !!this.selector && !!this.selector.match(/^\@supports\b/) }
    get isDocument(): boolean { return !!this.selector && !!this.selector.match(/^\@document\b/) }
    get isTopLevel(): boolean { return !this.parent };
    /**
     * need to provide specs here
     *   @interface TypeName<U,T,V> {
     *       color;
     *  }
     */
    get isInterface(): boolean { return !!this.selector && !!this.selector.match(/^\@interface\b/) }
    get isTyped(): boolean { return !!this.selector && !!this.selector.match(/^\@\<([\s\S]*?)\>\b/) }
    /**
     * real query of the rule
     */
    get query(): string | null {
        if (this.isConst || this.isExport) {
            let match, { selector } = this;
            if ((match = selector!.match(/^@(export\s+const|const)\s+(?<name>[\S]+?)\s*=(?<query>[\s\S]+?)$/)) && match.groups) {
                const { query } = match.groups;
                return query;
            }
        }
        return this.selector;
    }
    /**
     * save the current rule if the property isConst or isExport is true
     */
    saveConst(): void {
        if (this.isConst || this.isExport) {
            const { parent, selector } = this;
            const { document } = this.opts;
            if (document && document.mapAssignedRules) {
                // get the variable name
                let match;
                if ((match = selector!.match(/^@(export\s+const|const)\s+(?<name>[\S]+?)\s*=/)) && match.groups) {
                    let { name } = match.groups;
                    if (name) document.mapAssignedRules.set(name, this);
                }
            }
        }
    }
    /**
     * start getting all the properties of the current rule
     * those will be saved into the data object
     */
    readProperties(): void {
        const reg = /(?:\;|\{|^|\d+_block|\n)\s*((?<property>[^\:\n]+?)\s*(:)\s*(?<value>[^\:\;]+?)|(\.){3}\$(?<spreaded>[\S]+?))(\;|\}|$)/i;
        let source = this.source.trim();
        let match;
        while(match = source.match(reg)) {
            // any named group is captured
            if (match.groups) {
                // a property/value group is captured by the regexp
                if (match.groups.property) {
                    // save the value and property into the private data object
                    this._data[match.groups.property] = match.groups.value;
                }
                // user can spread variables and rules's children into the current rule
                // by using the following syntax ...$Spreaded;
                if (match.groups.spreaded) {
                    const { spreaded } = match.groups;
                    const obj = Object.assign({},
                        Object.fromEntries(this.mapLiteralVariables.entries()),
                        Object.fromEntries(this.mapExportableLiteralVariables.entries()),
                        Object.fromEntries(this.opts.document.mapAssignedRules.entries()),
                        this.opts.document.data,
                    );
                    const sourceEntries = Object.entries(obj);
                    const entries = sourceEntries.filter(([, value]: [string, unknown]) => !(value instanceof Rules)
                        && !(value instanceof String));
                    const keys = entries.map(([key]) => key);
                    const values = entries.map(([, value]) => value);

                    // create the util to spread all the variables
                    if (keys.length) {
                        const assignFunction = new Function('$$origin', ...keys, `return Object.assign($$origin, ${spreaded || '{}'});`);
                        assignFunction(this._data, ...values);
                    }

                    // now start spreading rules's children
                    const entriesRules = sourceEntries.filter(([, value]: [string, unknown]) => value instanceof Rules);
                    const keysRules = entriesRules.map(([key]) => key);
                    const valuesRules = entriesRules.map(([, value]) => value);

                    // create the util function to spread the children
                    if (keysRules.length) {
                        const spreadChildrenFunction = new Function('currentRule', 'constructor', ...keysRules, `
                            if (typeof ${spreaded} === undefined || !(${spreaded} instanceof constructor)) return;
                            return currentRule.push(...(${spreaded || '{ children: [] }'}).children);
                        `);
                        spreadChildrenFunction(this, Rules, ...valuesRules);
                    }
                }
            }
            source = source.replace(reg, '');
        }
    }
    /**
     * transformed data with
     * - parent references
     * - self references
     */
    get data() {
        return;
    }
}