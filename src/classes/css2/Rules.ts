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
        }
        console.warn(this.selector);
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
}