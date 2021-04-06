import getTypedExpression from "../../../utils/typedExpressions.ts";
import elements from "../../../utils/elements.ts";
import notParsedElements from "../../../utils/not-parsed.ts";
// import forceInlineElements from "../../../utils/forceInlineElements.ts";
// import getDeepTranslation from "../../../utils/template-recursive.ts";
import read from "../../../utils/agnostic-transformer.ts";
import { Utils } from "../Utils.ts";
import Rules from './Rules.ts';
import type {
  Expressions,
  ProtocolScriptRegExpList,
  TypedExpressions,
} from "../../ogone.main.d.ts";

export interface DocumentOptions {
  text: string;
  expressions: Expressions;
  typedExpressions: TypedExpressions;
  data?: {[key: string]: string | { [exported: string]: string; }};
}
export default class Document extends Utils implements DocumentOptions {
  mapRules: Map<string, Rules>  = new Map();
  /**
   * all the variables that are not handling a selector
   * @const varName = 12px;
   * varName with 12px as value
   */
  public mapLitteralVariables: Map<string, string> = new Map();
  /**
   * same as MapLiteralVariables
   * but should only save the exported variables like following
   * @export const Varname = 12px;
   * varName with 12px as value
   */
  public mapExportableLitteralVariables: Map<string, string> = new Map();
  /**
   * any children rule that is saved into a variable.
   * @export const RuleName = div {};
   */
  public mapAssignedRules: Map<string, Rules> = new Map();
  data?: DocumentOptions['data'];
  constructor(
    /**
     * the text to parse and to create the document with
     */
    public text: DocumentOptions['text'],
    /**
     * all tokens/expressions of the text
     */
    public expressions: DocumentOptions['expressions'],
    /**
     * all the typed expressions of the text
     */
    public typedExpressions: DocumentOptions['typedExpressions'],
  ) {
    super();
  }
  /**
   * all the data of the current document,
   * will overwrite the document's data
   * after setting the data, the document will start parsing and save all the rules inside it
   */
  use(data: DocumentOptions['data']) {
    this.data = data;
    this.parseDocument();
  }
  /**
   * main method to start parsing the document
   * we will use all blocks expressions
   */
  private parseDocument() {
    const blocks = Object.entries(this.typedExpressions.blocks)
      .reverse();
    /**
     * start creating rules with all the parsed blocks
     */
    blocks.forEach(([key, block]) => {
      const rules = new Rules({
        source: block,
        id: key,
        document: this,
      });
      this.mapRules.set(key, rules);
    });
  }
  /**
   * returns the top level rule
   */
  get topLevel (): Rules | undefined {
    const entries = Array.from(this.mapRules);
    const result = entries.find(([, rule]) => rule.isTopLevel);
    return result && result[1];
  }
  /**
   * returns a conform CSS string
   */
  render(
    /**
     * rendering options for the document
     */
    opts: {
      minify?: boolean
    }
  ): string {
    const { minify } = opts;
    let result = '';
    const entries = this.mapRules.entries();
    for (let entry of entries) {
      const [key, rule] = entry;
      result += rule.render(opts);
    }
    return result;
  }
}