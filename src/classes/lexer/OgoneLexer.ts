/**
 * we will use this lexer in different engine
 * it shouldn't import anything
 * to make it isomorphic with Node and Deno
 *
 * for this this file shouldn't use the Deno namespace
 */
export type ContextReader = (contexts?: ContextReader[]) => boolean;
export interface CursorDescriber {
  column: number;
  line: number;
  x: number;
}

export enum Reason { };

export const SupportedFlags = [
  /**
   * structural flags
   */
  '--for',
  '--await',
  '--if',
  '--else-if',
  '--else',
  /**
   * DOM L3 events
   */
  '--click',
  '--dblclick',
  '--mouseenter',
  '--mouseover',
  '--mousemove',
  '--mousedown',
  '--mouseup',
  '--mouseleave',
  '--keypress',
  '--keydown',
  '--keyup',
  '--wheel',
  /**
   * custom event flags
   */
  '--event',
  /**
   * style flags
   */
  '--class',
  '--style',
  '--keyframes',
  /**
   * value flags
   */
  '--bind',
  /**
   * router flags
   */
  '--router-go',
  '--router-dev-tool',
  /**
   * async flags
   */
  '--defer',
  '--then',
  '--finally',
  '--catch',
];

export enum ContextTypes {
  Unexpected = 'Unexpected',
  Space = 'Space',
  SemiColon = 'SemiColon',
  MultipleSpaces = 'MultipleSpaces',
  LineBreak = 'LineBreak',
  StringSingleQuote = 'StringSingleQuote',
  StringDoubleQuote = 'StringDoubleQuote',
  StringTemplateQuote = 'StringTemplateQuote',
  StringTemplateQuoteEval = 'StringTemplateQuoteEval',
  Comment = 'Comment',
  CommentBlock = 'CommentBlock',
  Braces = 'Braces',
  CurlyBraces = 'CurlyBraces',
  Array = 'Array',
  HTMLComment = 'HTMLComment',
  ImportAmbient = 'ImportAmbient',
  ImportStatement = 'ImportStatement',
  InjectAmbient = 'InjectAmbient',
  TextNode = 'TextNode',
  Node = 'Node',
  NodeName = 'NodeName',
  NodeOpening = 'NodeOpening',
  NodeOpeningEnd = 'NodeOpeningEnd',
  NodeClosing = 'NodeClosing',
  NodeClosingEnd = 'NodeClosingEnd',
  Flag = 'Flag',
  FlagName = 'FlagName',
  FlagSpread = 'FlagSpread',
  Attribute = 'Attribute',
  AttributeName = 'AttributeName',
  AttributeBoolean = 'AttributeBoolean',
  AttributeValueQuoteSingle = 'AttributeValueQuoteSingle',
  AttributeValueQuoteDouble = 'AttributeValueQuoteDouble',
  AttributeValueQuoteTemplate = 'AttributeValueQuoteTemplate',
  AttributeValueCurlyBraces = 'AttributeValueCurlyBraces',
  AttributeValueUnquoted = 'AttributeValueUnquoted',
  AttributeValueBraces = 'AttributeValueBraces',
  AttributeValueArray = 'AttributeValueArray',
  AttributeValueContent = 'AttributeValueContent',
  AttributeValueStart = 'AttributeValueStart',
  AttributeValueEnd = 'AttributeValueEnd',
}
export class OgoneLexerContext {
  public children: OgoneLexerContext[] = [];
  public related: OgoneLexerContext[] = [];
  public data: { [k: string]: any } = {};
  constructor(
    public type: ContextTypes,
    public source: string,
    public position: {
      start: number;
      end: number;
      line: number;
      column: number;
    }
  ) { }
}
/**
 * this class exists to improve the performances
 * of the Ogone Compiler
 * it should provide all the contexts of an Ogone Component
 * and expose a way to parse error and unexpected tokens
 *
 * 0.29.0: a component can't reach 250 lines without performance issues
 *
 * so this lexer should go quick without any issues
 */
export class OgoneLexer {
  /**
   * cache for contexts
   * where the key is the text
   * if the text match, should return all the retrieved contexts
   */
  static mapDocuments: Map<string, OgoneLexerContext[]> = new Map();
  /**
   * you should save here all the retrieved context
   * of the document
   */
  private currentContexts: OgoneLexerContext[] = [];
  // to retrieve all remaining open tag
  private openTags: OgoneLexerContext[] = [];
  /**
   * this will shift the cursor into the document
   */
  private cursor: CursorDescriber = {
    x: 0,
    line: 0,
    column: 0,
  };
  private source: string = '';
  /**
   * the current character
   */
  private get char(): string {
    return this.source[this.cursor.x];
  };
  /**
  * the next character
  */
  private get next(): string | undefined {
    return this.source[this.cursor.x + 1];
  };
  /**
  * the previous character
  */
  private get prev(): string | undefined {
    return this.source[this.cursor.x - 1];
  };
  /**
   * the following part
   * from the cursor index until the end of the document
   */
  private get nextPart(): string {
    return this.source.slice(this.cursor.x);
  }
  /**
   * the following part
   * from the cursor index until the end of the document
   */
  private get previousPart(): string {
    return this.source.slice(0, this.cursor.x);
  }
  /**
   * should return the previously defined context
   */
  private get lastContext(): OgoneLexerContext {
    const last = this.currentContexts[this.currentContexts.length - 1]
      ||
      new OgoneLexerContext(ContextTypes.Unexpected, this.source.slice(this.cursor.x), {
        start: this.cursor.x,
        line: this.cursor.line,
        column: this.cursor.column,
        end: this.cursor.x + 1,
      });
    return last;
  }
  // returns if a node context has been declared
  private get nodeContextStarted(): boolean {
    return Boolean(this.currentContexts.find((context) => [ContextTypes.Node].includes(context.type)))
  }
  constructor(private onError: (reason: string, cursor: CursorDescriber, context: OgoneLexerContext) => any) { }
  parse(text: string, url: URL): OgoneLexerContext[] {
    try {
      const item = OgoneLexer.mapDocuments.get(text);
      if (item) return item;
      /**
       * save the current parsed text
       * to source
       * used internally
       */
      this.source = text;
      while (!this.isEOF) {
        // we are at the top level
        // start using context readers
        const isValid = this.topCTX([
          this.comment_CTX,
          this.comment_block_CTX,
          this.line_break_CTX,
          this.multiple_spaces_CTX,
          this.space_CTX,
          this.string_single_quote_CTX,
          this.string_double_quote_CTX,
          this.import_ambient_CTX,
          this.import_statements_CTX,
          // just for tests but shouldn't be supported on top level
          this.string_template_quote_CTX,
          this.html_comment_CTX,
          this.node_CTX,
          this.textnode_CTX,
        ]);
        if (!isValid) {
          this.onError('Unexpected token', this.cursor, this.lastContext);
          break;
        }
      }
      if (this.openTags.length) {
        const lastNode = this.openTags[this.openTags.length - 1];
        this.onError('Unexpected: Remaining open tag without closing tag', this.cursor, lastNode);
      }
      return this.currentContexts;
    } catch (err) {
      throw err;
    }
  }
  /**
   * returns if the lexer has finished to read
   */
  get isEOF(): boolean {
    return Boolean(this.source.length === this.cursor.x);
  }
  /**
   * should validate if the character is accepted inside the current context
   * if it's not the ogone lexer will use the error function passed into the constructor
   */
  isValidChar(unexpected?: ContextReader[]) {
    if (!unexpected) return;
    for (let reader of unexpected) {
      const isUnexpected = reader.apply(this, [[]]);
      if (isUnexpected) {
        this.onError(`Unexpected token: ${this.char}`, this.cursor, this.lastContext);
      }
    }
  }
  /**
   * read the top level of the current document
   * @param readers array of context readers which will shift the cursor of the lexer
   */
  topCTX(readers: ContextReader[]): boolean {
    try {
      return Boolean(
        readers.find((reader) => reader.apply(this, []))
      );
    } catch (err) {
      throw err;
    }
  }
  /**
   * will parse any comment blocks starting with /* and ending with * /
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the comment_block_context
   */
  comment_block_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "/" || char === "/" && next !== '*') return false;
      let result = true;
      let isClosed = false;
      const allSubContexts: ContextReader[] = [
        this.line_break_CTX,
      ];
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        allSubContexts.forEach((reader) => {
          const recognized = reader.apply(this, []);
          if (recognized) {
            children.push(this.lastContext);
          }
        });
        if (this.char === "/" && this.prev === '*') {
          this.cursor.x++;
          this.cursor.column++;
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.CommentBlock, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError('the CommentBlock isn\'t closed', this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * will parse any comment blocks starting with /* and ending with * /
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the comment_block_context
   */
  comment_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "/" || char === "/" && next !== '/') return false;
      let result = true;
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        if (this.char === "\n") {
          this.cursor.x++;
          this.cursor.column++;
          this.cursor.line++;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.Comment, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reads the all strings starting with a '
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the string_single_quote_context
   */
  string_single_quote_CTX(unexpected: ContextReader[] = [
    this.line_break_CTX
  ]): boolean {
    try {
      let { char, prev, next } = this;
      let { source } = this;
      const { x, column, line } = this.cursor;
      if (char !== "'" || char === "'" && prev === '\\') return false;
      let result = true;
      let isClosed = false;
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        if (this.char === "'" && this.prev !== '\\') {
          this.cursor.x++;
          this.cursor.column++;
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StringSingleQuote, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(`the StringSingleQuote isn't closed`, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reads the all strings starting with a "
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the string_double_quote_context
   */
  string_double_quote_CTX(unexpected: ContextReader[] = [
    this.line_break_CTX
  ]): boolean {
    try {
      let { char, prev, next } = this;
      let { source } = this;
      const { x, column, line } = this.cursor;
      if (char !== "\"" || char === "\"" && prev === '\\') return false;
      let result = true;
      let isClosed = false;
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        if (this.char === "\"" && this.prev !== '\\') {
          this.cursor.x++;
          this.cursor.column++;
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StringDoubleQuote, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(`the StringDoubleQuote isn't closed`, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reads the all strings starting with a `
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the string_template_quote_context
   */
  string_template_quote_CTX(unexpected: ContextReader[]): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "`" || char === "`" && prev === '\\') return false;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.string_template_quote_eval_CTX,
      ];
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        allSubContexts.forEach((reader) => {
          const recognized = reader.apply(this, []);
          if (recognized) {
            children.push(this.lastContext);
          }
        });
        if (this.char === "`" && this.prev !== '\\') {
          this.cursor.x++;
          this.cursor.column++;
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StringTemplateQuote, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(`the StringTemplateQuote isn't closed`, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * checks inside a string_template_quote_context if there's an evaluation
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the string_template_quote_context
   */
  string_template_quote_eval_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "$" || char === "$" && prev === '\\' || char === "$" && next !== '{') return false;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_template_quote_CTX,
      ];
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        allSubContexts.forEach((reader) => {
          const recognized = reader.apply(this, []);
          if (recognized) {
            children.push(this.lastContext);
          }
        });
        if (this.char === "}" && this.prev !== '\\') {
          this.cursor.x++;
          this.cursor.column++;
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StringTemplateQuoteEval, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError('the StringTemplateQuoteEval isn\'t closed', this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * should match with ( ... ) and is recursive
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the braces_context
   */
  braces_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char, } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "(") return false;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.braces_CTX,
      ];
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        allSubContexts.forEach((reader) => {
          const recognized = reader.apply(this, []);
          if (recognized) {
            children.push(this.lastContext);
          }
        });
        if (this.char === ")") {
          this.cursor.x++;
          this.cursor.column++;
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.Braces, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(`the Braces isn't closed`, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * should match with {...} and is recursive
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the braces_context
   */
  curly_braces_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char, } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "{") return false;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.curly_braces_CTX,
      ];
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        allSubContexts.forEach((reader) => {
          const recognized = reader.apply(this, []);
          if (recognized) {
            children.push(this.lastContext);
          }
        });
        if (this.char === "}") {
          this.cursor.x++;
          this.cursor.column++;
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.CurlyBraces, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(`the CurlyBraces isn't closed`, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * should match with [...] and is recursive
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the braces_context
   */
  array_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char, } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "[") return false;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.array_CTX,
      ];
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        allSubContexts.forEach((reader) => {
          const recognized = reader.apply(this, []);
          if (recognized) {
            children.push(this.lastContext);
          }
        });
        if (this.char === "]") {
          this.cursor.x++;
          this.cursor.column++;
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.Array, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(`the Array isn't closed`, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reads if the cursor's character is a space
   * @param unexpected array of context readers which shift the cursor of the lewer
   * those readers shouldnt participate to the multiple_spaces_context
   * @returns true if the current character and the next characters are spaces
   */
  multiple_spaces_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      const { char, next, source } = this;
      if (char !== ' ' || next !== ' ') return false;
      const { x, column, line } = this.cursor;
      let result = false;
      while (this.char === ' ') {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
      }
      result = x !== this.cursor.x;
      if (result) {
        const token = source.slice(x, this.cursor.x);
        this.currentContexts.push(new OgoneLexerContext(ContextTypes.MultipleSpaces, token, {
          start: x,
          end: this.cursor.x,
          line,
          column,
        }));
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  space_CTX() {
    let result = this.char === ' ' && this.next !== this.char;
    if (result) {
      this.currentContexts.push(new OgoneLexerContext(ContextTypes.Space, this.char, {
        start: this.cursor.x,
        end: this.cursor.x + 1,
        line: this.cursor.line,
        column: this.cursor.column,
      }))
      this.cursor.x++;
      this.cursor.column++;
    }
    return result;
  }
  semicolon_CTX() {
    let result = this.char === ';';
    if (result) {
      this.currentContexts.push(new OgoneLexerContext(ContextTypes.SemiColon, this.char, {
        start: this.cursor.x,
        end: this.cursor.x + 1,
        line: this.cursor.line,
        column: this.cursor.column,
      }))
      this.cursor.x++;
      this.cursor.column++;
    }
    return result;
  }
  line_break_CTX() {
    let result = this.char === '\n';
    if (result) {
      this.currentContexts.push(new OgoneLexerContext(ContextTypes.LineBreak, this.char, {
        start: this.cursor.x,
        end: this.cursor.x + 1,
        line: this.cursor.line,
        column: this.cursor.column,
      }))
      this.cursor.column = 0;
      this.cursor.line++;
      this.cursor.x++;
    }
    return result;
  }
  /**
   * reads the textnodes that should match (node)> ... <(node)
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the textnode_context
   */
  textnode_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const lastIsANode = Boolean(lastContext && [ContextTypes.Node, ContextTypes.NodeClosing, ContextTypes.HTMLComment].includes(lastContext.type));
      const isValid = prev && ['>'].includes(prev) && lastIsANode ||
        char !== '<'
        && !this.import_statements_CTX()
        && !this.node_CTX()
        && !this.comment_CTX();
      if (!isValid || !this.nodeContextStarted) return false;
      let result = true;
      const children: OgoneLexerContext[] = [];
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_template_quote_eval_CTX,
      ];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        allSubContexts.forEach((reader) => {
          const recognized = reader.apply(this, []);
          if (recognized) {
            children.push(this.lastContext);
          }
        });
        if ([
          '<',
        ].includes(this.char)) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.TextNode, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * should output all the html in the document
   * any sequence starting with a < and that is followed by a character is a node
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the node_context
   */
  node_CTX(unexpected: ContextReader[] = [
    // shouldn't start a new node
    this.node_CTX,
    this.html_comment_CTX,
  ]): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "<"
        || char === "<" && [' ', '<', '!'].includes(next!)
        || next && /([^a-zA-Z0-9\[\/])/i.test(next)
      ) return false;
      let result = true;
      let isClosed = false;
      let isAutoClosing = false;
      let isNamed = false;
      let isProto = false;
      let isTemplate = false;
      let isStyle = false;
      let isNodeClosing = this.nextPart.startsWith('</');
      const subcontextEvaluatedOnce: ContextReader[] = [
        this.node_name_CTX,
      ];
      const allSubContexts: ContextReader[] = isNodeClosing
        ? [
          this.line_break_CTX,
          this.space_CTX,
          this.multiple_spaces_CTX,
        ]
        : [
          this.line_break_CTX,
          this.space_CTX,
          this.multiple_spaces_CTX,
          this.flag_spread_CTX,
          this.attribute_boolean_CTX,
          this.attributes_CTX,
          this.flag_CTX,
        ];
      const children: OgoneLexerContext[] = [];
      const related: OgoneLexerContext[] = [];
      /**
       * start rendering the nodes
       */
      while (!this.isEOF) {
        /**
         * for any closing tag
         * should ensure that after the tagname
         * there's nothing else than spaces, line breaks, or >
         */
        if (isNodeClosing && isNamed) {
          if (!([' ', '>', '\n'].includes(this.char))) {
            const token = source.slice(x, this.cursor.x);
            const context = new OgoneLexerContext(ContextTypes.Unexpected, token, {
              start: x,
              end: this.cursor.x,
              line,
              column,
            });
            this.onError(`Unexpected token ${this.char}`, this.cursor, context);
          }
        }
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        if (!isNamed) {
          subcontextEvaluatedOnce.forEach((reader) => {
            const recognized = reader.apply(this, []);
            if (recognized) {
              let context = this.lastContext;
              related.push(context);
              isNamed = context.type === ContextTypes.NodeName;
              isProto = isNamed && context.source === 'proto';
              isTemplate = isNamed && context.source === 'template';
              isStyle = isNamed && context.source === 'style';
            }
          });
        }
        // TODO fix autoclosing tags
        allSubContexts.forEach((reader) => {
          const recognized = reader.apply(this, []);
          if (recognized) {
            children.push(this.lastContext);
          }
        });
        if (this.char === "<") {
          break;
        } else if (this.char === ">") {
          this.cursor.x++;
          this.cursor.column++;
          isClosed = true;
          isAutoClosing = this.previousPart.endsWith('/>');
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(isNodeClosing ? ContextTypes.NodeClosing : ContextTypes.Node, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      context.related.push(...related);
      Object.assign(context.data, {
        isTemplate,
        isProto,
        isStyle,
        isAutoClosing,
        isNodeClosing
      });
      this.currentContexts.push(context);
      // start resolving open and closing tags
      if (!isAutoClosing) {
        if (isClosed
          && !isNodeClosing) {
          this.openTags.push(context);
        } else if (isClosed
          && isNodeClosing) {
          const openTag = this.openTags
            .slice()
            .reverse()
            .find((nodeContext) => nodeContext.related[0]
              && nodeContext.related[0].type === ContextTypes.NodeName
              && nodeContext.related[0].source === context.related[0].source);
          if (!openTag) {
            this.onError(`cannot close an element that is not open`, this.cursor, context);
          } else {
            const index = this.openTags.indexOf(openTag);
            this.openTags.splice(index, 1);
            // save the closing tag
            openTag.related.push(context);
          }
        }
      }
      if (!isClosed) {
        this.onError(`the Node isn't closed`, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reads the tagname right after the <
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the node_name_context
   */
  node_name_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if ([' ', '[', '!', '-', '\n', '/'].includes(char)) return false;
      let result = true;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        if ([
          ' ',
          '/',
          '<',
          '\n',
          '>'
        ].includes(this.char)) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.NodeName, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reads the tagname right after the <
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the html_comment_context
   */
  html_comment_CTX(unexpected: ContextReader[] = [
    this.html_comment_CTX,
  ]): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const sequence = [char, next, source[x + 2], source[x + 3]];
      if (char !== '<'
        || sequence.join('') !== '<!--') return false;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        if (this.char === ">" && this.prev === '-' && source[this.cursor.x - 2] === '-') {
          this.cursor.x++;
          this.cursor.column++;
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.HTMLComment, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError('the HTMLComment isnt closed', this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * should read all ambient import statements
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the import_ambient_CTX
   */
  import_ambient_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (!/^import\s*(["'])(.*?)(\1)/i.test(this.nextPart)) return false;
      let result = true;
      let isClosed = false;
      const related: OgoneLexerContext[] = [];
      /**
       * expected next contexts
       */
      const nextContexts: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
        this.semicolon_CTX,
      ];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        if (this.char === " " || ['"', "'"].includes(this.char)) {
          break;
        }
      }
      nextContexts.forEach((reader: ContextReader, i: number, arr) => {
        const recognized = reader.apply(this, []);
        if (recognized) {
          related.push(this.lastContext);
          delete arr[i];
        }
      });
      isClosed = Boolean(related.find((context) => [
        ContextTypes.StringDoubleQuote,
        ContextTypes.StringSingleQuote,
      ].includes(context.type))
        && related.find((context) => [
          ContextTypes.SemiColon].includes(context.type))
      );
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.ImportAmbient, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });

      context.related.push(...related);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError('the ImportAmbient isnt closed', this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * should read all import statements
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the html_comment_context
   */
  // TODO create contexts for the tokens between import and from
  import_statements_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const sequence = char +
        next +
        source[x + 2] +
        source[x + 3] +
        source[x + 4] +
        source[x + 5] +
        source[x + 6];
      if (char !== 'i'
        || sequence !== 'import ') return false;
      let result = true;
      let isClosed = false;
      const related: OgoneLexerContext[] = [];
      const otherImportStatements: ContextReader[] = [
        this.import_ambient_CTX
      ];
      /**
       * expected next contexts
       */
      const nextContexts: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
        this.semicolon_CTX,
      ];
      otherImportStatements.forEach((reader) => reader.apply(this, []));
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        const sequenceEnd = this.char
          + this.next
          + source[this.cursor.x + 2]
          + source[this.cursor.x + 3];
        if (sequenceEnd === 'from') {
          this.cursor.x += + 4;
          this.cursor.column += + 4;
          break;
        }
      }
      nextContexts.forEach((reader: ContextReader, i: number, arr) => {
        const recognized = reader.apply(this, []);
        if (recognized) {
          related.push(this.lastContext);
          delete arr[i];
        }
      });
      isClosed = Boolean(related.find((context) => [
        ContextTypes.StringSingleQuote,
        ContextTypes.StringDoubleQuote,].includes(context.type))
        && related.find((context) => [
          ContextTypes.SemiColon,].includes(context.type))
      );
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.ImportStatement, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.related.push(...related);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError('the ImportStatement isnt closed', this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reads the flags after the tag name
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the flag_context
   */
  flag_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== '-' || next !== '-') return false;
      let result = true;
      let isClosed = false;
      let isNamed = false;
      const children: OgoneLexerContext[] = [];
      const related: OgoneLexerContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.curly_braces_CTX,
        this.braces_CTX,
      ];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        if (!isNamed) {
          isNamed = Boolean(
            this.flag_name_CTX()
            && related.push(this.lastContext));
        }
        allSubContexts.forEach((reader) => {
          const recognized = reader.apply(this, []);
          if (recognized) {
            children.push(this.lastContext);
          }
        });
        if ([' ', '>', '\n'].includes(this.char)) {
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.Flag, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      context.related.push(...related);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError('the Flag isnt closed', this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  flag_name_CTX(unexpected: ContextReader[] = [
    this.array_CTX,
    this.braces_CTX,
    this.curly_braces_CTX,
  ]): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char === '-') return false;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        if ([' ', '>', '=', '\n'].includes(this.char)) {
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);

      const context = new OgoneLexerContext(ContextTypes.FlagName, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError('the FlagName isnt closed', this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  flag_spread_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== '{' || !/^\{(\s*)(\.){3}/i.test(this.nextPart)) return false;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      const readers: ContextReader[] = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.array_CTX,
        this.curly_braces_CTX,
      ];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        readers.forEach((reader) => {
          const recognized = reader.apply(this, []);
          if (recognized) {
            children.push(this.lastContext);
          }
        });
        if (['}',].includes(this.char)) {
          this.cursor.x++;
          this.cursor.column++;
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.FlagSpread, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError('the FlagSpread isnt closed', this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reads the flags after the tag name
   * @param unexpected array of context readers which shift the cursor of the lexer
   * those readers shouldnt participate to the flag_context
   */
  attributes_CTX(unexpected: ContextReader[] = []): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (prev
        && prev !== ' '
        || char
        && !(/[a-zA-Z0-9\$\_]/i.test(char))) return false;
      let result = true;
      let isClosed = false;
      let isNamed = false;
      const children: OgoneLexerContext[] = [];
      const related: OgoneLexerContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
        this.string_template_quote_CTX,
        this.braces_CTX,
        this.attribute_unquoted_CTX,
      ];
      if (!isNamed) {
        isNamed = Boolean(
          this.attribute_name_CTX()
          && related.push(this.lastContext));
      }
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        allSubContexts.forEach((reader) => {
          const recognized = reader.apply(this, []);
          if (recognized) {
            children.push(this.lastContext);
          }
        });
        if ([' ', '>', '\n'].includes(this.char)) {
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.Attribute, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      context.related.push(...related);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError('the Attribute isnt closed', this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  attribute_boolean_CTX(unexpected: ContextReader[] = [
    this.array_CTX,
    this.braces_CTX,
    this.curly_braces_CTX,
  ]): boolean {
    try {
      let { char } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char === '-' || !/^([^\s=\<\>\/]+?)(\s|\n|\>)/i.test(this.nextPart)) return false;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        if ([' ', '/', '>', '<', '\n'].includes(this.next!)) {
          this.cursor.x++;
          this.cursor.column++;
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.AttributeBoolean, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError('the AttributeBoolean isnt closed', this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  attribute_name_CTX(unexpected: ContextReader[] = [
    this.array_CTX,
    this.braces_CTX,
    this.curly_braces_CTX,
  ]): boolean {
    try {
      let { char } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char === '-') return false;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        if ([' ', '/', '>', '=', '\n'].includes(this.char)) {
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.AttributeName, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError('the AttributeName isnt closed', this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  attribute_unquoted_CTX(unexpected: ContextReader[] = [
    this.array_CTX,
    this.braces_CTX,
    this.curly_braces_CTX,
  ]): boolean {
    try {
      let { char, prev } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (prev !== '=') return false;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.cursor.x++;
        this.cursor.column++;
        this.isValidChar(unexpected);
        if ([' ', '>', '\n'].includes(this.char)) {
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.AttributeValueUnquoted, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError('the AttributeValueUnquoted isnt closed', this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
}