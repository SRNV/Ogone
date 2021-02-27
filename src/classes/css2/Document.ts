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
  data: {[key: string]: string | { [exported: string]: string; }};
}
export default class Document extends Utils implements DocumentOptions {
  static mapComponents: Map<string, Rules["mapExportableLiteralVariables"]> = new Map();
  mapRules: Map<string, Rules>  = new Map();
  constructor(
    public text: DocumentOptions['text'],
    public expressions: DocumentOptions['expressions'],
    public typedExpressions: DocumentOptions['typedExpressions'],
    public data: DocumentOptions['data'],
  ) {
    super();
    this.parseDocument();
  }
    /**
   * main method to start parsing the document
   * we will use all blocks expressions
   */
  public parseDocument() {
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
}