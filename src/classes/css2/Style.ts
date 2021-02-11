import getTypedExpression from "../../../utils/typedExpressions.ts";
import elements from "../../../utils/elements.ts";
import notParsedElements from "../../../utils/not-parsed.ts";
// import forceInlineElements from "../../../utils/forceInlineElements.ts";
// import getDeepTranslation from "../../../utils/template-recursive.ts";
import read from "../../../utils/agnostic-transformer.ts";
import { Utils } from "../Utils.ts";
import type {
  Expressions,
  ProtocolScriptRegExpList,
  TypedExpressions,
} from "../../ogone.main.d.ts";
import RegExpTransformable from "../RegExpTransformable.ts";

interface StyleOptions {
  vars: { [k: string]: string | StyleOptions["vars"] }
}
interface StyleDocumentOptions {
  text: string;
  expressions: Expressions;
  typedExpressions: TypedExpressions
}
class StyleDocument implements StyleDocumentOptions {
  constructor(
    public text: StyleDocumentOptions['text'],
    public expressions: StyleDocumentOptions['expressions'],
    public typedExpressions: StyleDocumentOptions['typedExpressions']
  ) {}
}
export default class Style extends Utils {
  private static currentDocument: StyleDocument;
  private static readonly variables: ProtocolScriptRegExpList = [
    // exportable variables
    new RegExpTransformable(/(\b@export)(\s+const(?<evaluated>\*){0,1}\b)(?<name>.+?)(\=)/, () => '')
      .setName('declaration'),
    // variable declaration
    new RegExpTransformable(/(\b@const(?<evaluated>\*){0,1}\b)(?<name>.+?)(\=)/, () => '')
      .setName('declaration'),
  ];
  private static readonly structure: ProtocolScriptRegExpList = [
    // describing all children rules
    new RegExpTransformable(/(?<=\d+_block|^|\;|\{)(?<selector>[^;]+?)(?<rules>\d+_block)/, () => '')
      .setName('rule'),
    // any property in the rule
    new RegExpTransformable(/(\b.+?)(\s*)(\:)/, () => '')
      .setName('property'),
    // spread variable content
    new RegExpTransformable(/(\.{3})(?<variable>\d+_variable)/, () => '')
      .setName('spread'),
    // value of any property
    new RegExpTransformable(/(?<=\d+_property)(?<value>.+?)(?:(\;|\}|\d+_property|\d+_declaration))/, () => '')
      .setName('property_value'),
    // value of a variable
    new RegExpTransformable(/(?<=\d+_declaration)(?<value>.+?)(?:(\;|\}|\d+_property|\d+_declaration))/, () => '')
      .setName('declaration_value'),
  ];
  private static readonly references: ProtocolScriptRegExpList = [
    // variable use
    new RegExpTransformable(/(?<!\-{2})\$(?<code>\w([^\s]+?))/, () => '')
      .setName('references'),
    // reference to a property
    new RegExpTransformable(/(?<!\-{2})\@(?<code>\w([^\s]+?))/, () => '')
      .setName('references'),
    // parent reference
    new RegExpTransformable(/(\b&\b)/, () => '')
      .setName('references'),
  ];
  /**
   * use this method to transform the style of the components
   * @param css {string}
   * @param opts {StyleOptions}
   */
  public static transform(css: string, opts: StyleOptions): string {
    // to create the top level of the document
    // we will add some curly and edit the inputs
    // of the end user
    const toplevel = `{${css}}`;
    // we will now parse the document by using the read function
    // which transforms all regular expressions to a specific id
    const typedExpressions = getTypedExpression();
    const expressions = {};
    let result = read({
      value: toplevel,
      expressions,
      typedExpressions,
      array: notParsedElements
        .concat(elements),
    });
    this.setCurrentDocument({
      expressions,
      typedExpressions,
      text: result,
    });
    this.parseDocument();
    return result;
  }
  public static setCurrentDocument(document: StyleDocumentOptions) {
    this.currentDocument = new StyleDocument(document.text, document.expressions, document.typedExpressions);
  }
  /**
   * main method to start parsing the document
   * we will use all blocks expressions
   */
  public static parseDocument() {
    if (!this.currentDocument.typedExpressions) return;
    Object.entries(this.currentDocument.typedExpressions.blocks)
      .reverse()
      .forEach(([key, value]) => {
        console.log(key, value);
      });
  }
}
const test1 = Style.transform(`
  @const var1 = test;
  div {
    ...$var1;
    color: red;
    span {
      element {
        a {
          color: blue;
        }
      }
    }
  }
`, {
  vars: {},
});
console.warn(test1);