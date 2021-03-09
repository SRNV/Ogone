import getTypedExpression from "../../../utils/typedExpressions.ts";
import elements from "../../../utils/elements.ts";
import notParsedElements from "../../../utils/not-parsed.ts";
// import forceInlineElements from "../../../utils/forceInlineElements.ts";
// import getDeepTranslation from "../../../utils/template-recursive.ts";
import read from "../../../utils/agnostic-transformer.ts";
import { Utils } from "../Utils.ts";
import type {
  ProtocolScriptRegExpList,
} from "../../ogone.main.d.ts";
import RegExpTransformable from "../RegExpTransformable.ts";
import Document, {
  DocumentOptions,
} from './Document.ts';

/**
 * built-in css preprocessor for Ogone
 * should be usable into the browser
 * don't use Deno inside
 * or any reference from Ogone
 */
interface StyleOptions {
  data: DocumentOptions['data'];
}
export default class Style extends Utils {
  private static currentDocument: Document;
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
   */
  public static createDocument(css: string): Document {
    // to create the top level of the document
    // we will add some curly and edit the inputs
    // of the end user
    const toplevel = `{${css}}`;
    // we will now parse the document by using the read function
    // which parses all regular expressions to a specific id
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
      data: void 0,
    });
    return this.currentDocument;
  }
  public static setCurrentDocument(document: DocumentOptions) {
    this.currentDocument = new Document(
      document.text,
      document.expressions,
      document.typedExpressions,
    );
  }
}
const test1 = Style.createDocument(`
@const flex = 10px;
@const rule = div {
  color: blue-shark;
};
@export const test = 20px;
@trait DeclaredC {
  color;
  justify-content;
}
.container {
  overflow: hidden;
  display: flex;
  flex-direction: row-reverse;
  ...$Belf;
  @<Colored>.view {
    flex: 18;
    flex-direction::media(
      row: default;
      column: 500px;
    );
    color::media(
      default: green;
      300px: red;
    );
    overflow: auto;
    .content, ul {
      flex: $flex;
      ...$rule;
    }
  }
}
`);
test1.use({
  Belf: {
    color: 'red',
    var: "17",
  }
});
const transformed = test1.render({ });
console.log(transformed);