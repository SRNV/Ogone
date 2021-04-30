/**
 * author: Rudy Alula
 *
 * we will use this lexer in different engine
 * it shouldn't import anything
 * to make it isomorphic with Node and Deno
 *
 * for this this file shouldn't use the Deno namespace
 */
export interface ContextReaderOptions {
  contexts?: ContextReader[],
  unexpected?: ContextReader[],
  checkOnly?: boolean,
}
export const checkOnlyOptions: ContextReaderOptions = { checkOnly: true };
export type ContextReader = (this: OgoneLexer, opts?: ContextReaderOptions) => boolean;
export interface CursorDescriber {
  column: number;
  line: number;
  x: number;
}
export interface OgooneLexerParseOptions {
  /**
   * url of the current document
   */
  url?: URL;
  /**
   * optional contexts
   * to use with the type custom
   */
  contexts?: ContextReader[];
  /**
   * the type of the document
   */
  type: 'component'
  | 'lexer'
  | 'custom'
  | 'stylesheet'
  | 'protocol';
}

export enum Reason { };

export const SupportedStyleSheetPseudoElements = [
  'after',
  'backdrop',
  'before',
  'cue',
  'cue-region',
  'first-letter',
  'first-line',
  'grammar-error',
  'marker',
  'part',
  'placeholder',
  'selection',
  'slotted',
  'spelling-error',
  'target-text'
];

export const SupportedStyleSheetPseudoClasses = [
  'active',
  'any-link',
  'blank',
  'checked',
  'current',
  'default',
  'defined',
  'dir',
  'disabled',
  'empty',
  'enabled',
  'first',
  'first-child',
  'first-of-type',
  'focus',
  'focus-visible',
  'focus-within',
  'fullscreen',
  'future',
  'has',
  'host',
  'host-context',
  'hover',
  'in-range',
  'indeterminate',
  'invalid',
  'is',
  'lang',
  'last-child',
  'last-of-type',
  'left',
  'link',
  'local-link',
  'not',
  'nth-child',
  'nth-col',
  'nth-last-child',
  'nth-last-col',
  'nth-last-of-type',
  'nth-of-type',
  'only-child',
  'only-of-type',
  'optional',
  'out-of-range',
  'past',
  'paused',
  'picture-in-picture',
  'placeholder-shown',
  'playing',
  'read-only',
  'read-write',
  'required',
  'right',
  'root',
  'scope',
  'target',
  'target-within',
  'user-invalid',
  'user-valid',
  'valid',
  'visited',
  'where'
];

export const SupportedStyleSheetFunctionalNotations = [
  'abs',
  'acos',
  'annotation',
  'asin',
  'atan',
  'atan2',
  'attr',
  'blur',
  'brightness',
  'calc',
  'character-variant',
  'circle',
  'clamp',
  'color',
  'conic-gradient',
  'cos',
  'counter',
  'counters',
  'contrast',
  'cross-fade',
  'cubic-bezier',
  'device-cmyk',
  'drop-shadow',
  'element',
  'env',
  'ellipse',
  'exp',
  'fit-content',
  'format',
  'grayscale',
  'hsl',
  'hsla',
  'hue-rotate',
  'hwb',
  'hypot',
  'image',
  'image-set',
  'inset',
  'invert',
  'lab',
  'lch',
  'leader',
  'linear-gradient',
  'local',
  'log',
  'matrix',
  'matrix3d',
  'max',
  'min',
  'minmax',
  'mod',
  'opacity',
  'ornaments',
  'paint',
  'path',
  'perspective',
  'polygon',
  'pow',
  'radial-gradient',
  'rem',
  'repeat',
  'repeating-linear-gradient',
  'repeating-radial-gradient',
  'repeating-conic-gradient',
  'rgb',
  'rgba',
  'rotate',
  'rotate3d',
  'rotateX',
  'rotateY',
  'rotateZ',
  'round',
  'saturate',
  'scale',
  'scale3d',
  'scaleX',
  'scaleY',
  'scaleZ',
  'sepia',
  'sign',
  'sin',
  'skew',
  'skewX',
  'skewY',
  'sqrt',
  'steps',
  'styleset',
  'stylistic',
  'swash',
  'symbols',
  'tan',
  'target-counter',
  'target-counters',
  'target-text',
  'toggle',
  'translate',
  'translate3d',
  'translateX',
  'translateY',
  'translateZ',
  'url',
  'var'
];

export const SupportedStyleSheetProperties = [
  'align-content',
  'align-items',
  'align-self',
  'align-tracks',
  'all',
  'animation',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-timing-function',
  'appearance',
  'aspect-ratio',
  'backdrop-filter',
  'backface-visibility',
  'background',
  'background-attachment',
  'background-blend-mode',
  'background-clip',
  'background-color',
  'background-image',
  'background-origin',
  'background-position',
  'background-position-x',
  'background-position-y',
  'background-repeat',
  'background-size',
  'block-size',
  'border',
  'border-block',
  'border-block-color',
  'border-block-end',
  'border-block-end-color',
  'border-block-end-style',
  'border-block-end-width',
  'border-block-start',
  'border-block-start-color',
  'border-block-start-style',
  'border-block-start-width',
  'border-block-style',
  'border-block-width',
  'border-bottom',
  'border-bottom-color',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-bottom-style',
  'border-bottom-width',
  'border-collapse',
  'border-color',
  'border-end-end-radius',
  'border-end-start-radius',
  'border-image',
  'border-image-outset',
  'border-image-repeat',
  'border-image-slice',
  'border-image-source',
  'border-image-width',
  'border-inline',
  'border-inline-color',
  'border-inline-end',
  'border-inline-end-color',
  'border-inline-end-style',
  'border-inline-end-width',
  'border-inline-start',
  'border-inline-start-color',
  'border-inline-start-style',
  'border-inline-start-width',
  'border-inline-style',
  'border-inline-width',
  'border-left',
  'border-left-color',
  'border-left-style',
  'border-left-width',
  'border-radius',
  'border-right',
  'border-right-color',
  'border-right-style',
  'border-right-width',
  'border-spacing',
  'border-start-end-radius',
  'border-start-start-radius',
  'border-style',
  'border-top',
  'border-top-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-top-style',
  'border-top-width',
  'border-width',
  'bottom',
  'box-decoration-break',
  'box-shadow',
  'box-sizing',
  'break-after',
  'break-before',
  'break-inside',
  'caption-side',
  'caret-color',
  'clear',
  'clip',
  'clip-path',
  'color',
  'color-adjust',
  'color-scheme',
  'column-count',
  'column-fill',
  'column-gap',
  'column-rule',
  'column-rule-color',
  'column-rule-style',
  'column-rule-width',
  'column-span',
  'column-width',
  'columns',
  'contain',
  'content',
  'content-visibility',
  'counter-increment',
  'counter-reset',
  'counter-set',
  'cursor',
  'length#ch',
  'length#cm',
  'angle#deg',
  'direction',
  'display',
  'resolution#dpcm',
  'resolution#dpi',
  'resolution#dppx',
  'empty-cells',
  'length#em',
  'length#ex',
  'filter',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'flex_value#fr',
  'float',
  'font',
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-language-override',
  'font-optical-sizing',
  'font-size',
  'font-size-adjust',
  'font-stretch',
  'font-style',
  'font-synthesis',
  'font-variant',
  'font-variant-alternates',
  'font-variant-caps',
  'font-variant-east-asian',
  'font-variant-ligatures',
  'font-variant-numeric',
  'font-variant-position',
  'font-variation-settings',
  'font-weight',
  'forced-color-adjust',
  'angle#grad',
  'gap',
  'grid',
  'grid-area',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-auto-rows',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'grid-template',
  'grid-template-areas',
  'grid-template-columns',
  'grid-template-rows',
  'frequency#Hz',
  'hanging-punctuation',
  'height',
  'hyphens',
  'image-orientation',
  'image-rendering',
  'image-resolution',
  'inherit',
  'initial',
  'initial-letter',
  'initial-letter-align',
  'inline-size',
  'inset',
  'inset-block',
  'inset-block-end',
  'inset-block-start',
  'inset-inline',
  'inset-inline-end',
  'inset-inline-start',
  'isolation',
  'length#in',
  'justify-content',
  'justify-items',
  'justify-self',
  'justify-tracks',
  'frequency#kHz',
  'left',
  'letter-spacing',
  'line-break',
  'line-height',
  'line-height-step',
  'list-style',
  'list-style-image',
  'list-style-position',
  'list-style-type',
  'length#mm',
  'margin',
  'margin-block',
  'margin-block-end',
  'margin-block-start',
  'margin-bottom',
  'margin-inline',
  'margin-inline-end',
  'margin-inline-start',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-trim',
  'mask',
  'mask-border',
  'mask-border-mode',
  'mask-border-outset',
  'mask-border-repeat',
  'mask-border-slice',
  'mask-border-source',
  'mask-border-width',
  'mask-clip',
  'mask-composite',
  'mask-image',
  'mask-mode',
  'mask-origin',
  'mask-position',
  'mask-repeat',
  'mask-size',
  'mask-type',
  'masonry-auto-flow',
  'math-style',
  'max-block-size',
  'max-height',
  'max-inline-size',
  'max-width',
  'min-block-size',
  'min-height',
  'min-inline-size',
  'min-width',
  'mix-blend-mode',
  'time#ms',
  'object-fit',
  'object-position',
  'offset',
  'offset-anchor',
  'offset-distance',
  'offset-path',
  'offset-position',
  'offset-rotate',
  'opacity',
  'order',
  'orphans',
  'outline',
  'outline-color',
  'outline-offset',
  'outline-style',
  'outline-width',
  'overflow',
  'overflow-anchor',
  'overflow-block',
  'overflow-clip-margin',
  'overflow-inline',
  'overflow-wrap',
  'overflow-x',
  'overflow-y',
  'overscroll-behavior',
  'overscroll-behavior-block',
  'overscroll-behavior-inline',
  'overscroll-behavior-x',
  'overscroll-behavior-y',
  'Pseudo-classes',
  'Pseudo-elements',
  'length#pc',
  'length#pt',
  'length#px',
  'padding',
  'padding-block',
  'padding-block-end',
  'padding-block-start',
  'padding-bottom',
  'padding-inline',
  'padding-inline-end',
  'padding-inline-start',
  'padding-left',
  'padding-right',
  'padding-top',
  'page-break-after',
  'page-break-before',
  'page-break-inside',
  'paint-order',
  'perspective',
  'perspective-origin',
  'place-content',
  'place-items',
  'place-self',
  'pointer-events',
  'position',
  'length#Q',
  'quotes',
  'angle#rad',
  'length#rem',
  'resize',
  'revert',
  'right',
  'rotate',
  'row-gap',
  'ruby-align',
  'ruby-position',
  'scale',
  'scroll-behavior',
  'scroll-margin',
  'scroll-margin-block',
  'scroll-margin-block-end',
  'scroll-margin-block-start',
  'scroll-margin-bottom',
  'scroll-margin-inline',
  'scroll-margin-inline-end',
  'scroll-margin-inline-start',
  'scroll-margin-left',
  'scroll-margin-right',
  'scroll-margin-top',
  'scroll-padding',
  'scroll-padding-block',
  'scroll-padding-block-end',
  'scroll-padding-block-start',
  'scroll-padding-bottom',
  'scroll-padding-inline',
  'scroll-padding-inline-end',
  'scroll-padding-inline-start',
  'scroll-padding-left',
  'scroll-padding-right',
  'scroll-padding-top',
  'scroll-snap-align',
  'scroll-snap-stop',
  'scroll-snap-type',
  'scrollbar-color',
  'scrollbar-gutter',
  'scrollbar-width',
  'shape-image-threshold',
  'shape-margin',
  'shape-outside',
  'time#s',
  'angle#turn',
  'tab-size',
  'table-layout',
  'text-align',
  'text-align-last',
  'text-combine-upright',
  'text-decoration',
  'text-decoration-color',
  'text-decoration-line',
  'text-decoration-skip',
  'text-decoration-skip-ink',
  'text-decoration-style',
  'text-decoration-thickness',
  'text-emphasis',
  'text-emphasis-color',
  'text-emphasis-position',
  'text-emphasis-style',
  'text-indent',
  'text-justify',
  'text-orientation',
  'text-overflow',
  'text-rendering',
  'text-shadow',
  'text-size-adjust',
  'text-transform',
  'text-underline-offset',
  'text-underline-position',
  'top',
  'touch-action',
  'transform',
  'transform-box',
  'transform-origin',
  'transform-style',
  'transition',
  'transition-delay',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
  'translate',
  'unicode-bidi',
  'unset',
  'user-select',
  'length#vh',
  'length#vmax',
  'length#vmin',
  'length#vw',
  'vertical-align',
  'visibility',
  'white-space',
  'widows',
  'width',
  'will-change',
  'word-break',
  'word-spacing',
  'word-wrap',
  'writing-mode',
  'resolution#x',
  'z-index',
];

/**
 * all the css colors
 */
export const SupportedStyleSheetColors = [
  /**
   * basic color keywords
   */
  'aqua',
  'black',
  'blue',
  'fuchsia',
  'gray',
  'green',
  'lime',
  'maroon',
  'navy',
  'olive',
  'purple',
  'red',
  'silver',
  'teal',
  'white',
  'yellow',
  /**
   * all colors
   */
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'navyblue',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
];

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
  /**
   * all contexts involved into protocol
   */
  Protocol = 'Protocol',
  /**
   * all contexts involved into stylesheet
   */
  StyleSheet = 'StyleSheet',
  StyleSheetRule = 'StyleSheetRule',
  StyleSheetAtRule = 'StyleSheetAtRule',
  StyleSheetAtRuleName = 'StyleSheetAtRuleName',
  StyleSheetTypeAssignment = 'StyleSheetTypeAssignment',
  StyleSheetConst = 'StyleSheetConst',
  StyleSheetConstValue = 'StyleSheetConstValue',
  StyleSheetExportConstValue = 'StyleSheetExportConstValue',
  StyleSheetExportConst = 'StyleSheetExportConst',
  StyleSheetCurlyBraces = 'StyleSheetCurlyBraces',
  StyleSheetSelector = 'StyleSheetSelector',
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
 * @README
 * this class exists to improve the performances
 * of the Ogone Compiler
 * it should provide all the contexts of an Ogone Component
 * and expose a way to parse error and unexpected tokens
 *
 * 0.29.0: a component can't reach 250 lines without performance issues
 *
 * so this lexer should go quick without any issues
 *
 */
export class OgoneLexer {
  /**
   * cache for contexts
   * where the key is the text
   * if the text match, should return all the retrieved contexts
   */
  static mapContexts: Map<string, OgoneLexerContext[]> = new Map();
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
  private scopedTopLevel: Record<OgooneLexerParseOptions['type'], ContextReader[]> = {
    lexer: [
      this.comment_CTX,
      this.comment_block_CTX,
      this.line_break_CTX,
      this.multiple_spaces_CTX,
      this.space_CTX,
      this.string_template_quote_CTX,
    ],
    component: [
      this.comment_CTX,
      this.comment_block_CTX,
      this.line_break_CTX,
      this.multiple_spaces_CTX,
      this.space_CTX,
      this.string_single_quote_CTX,
      this.string_double_quote_CTX,
      this.import_ambient_CTX,
      this.import_statements_CTX,
      this.html_comment_CTX,
      this.node_CTX,
      this.protocol_CTX,
      this.stylesheet_CTX,
      this.textnode_CTX,
    ],
    stylesheet: [
      this.comment_CTX,
      this.comment_block_CTX,
      this.line_break_CTX,
      this.multiple_spaces_CTX,
      this.space_CTX,
      this.stylesheet_CTX,
    ],
    protocol: [
      this.line_break_CTX,
      this.multiple_spaces_CTX,
      this.space_CTX,
      this.protocol_CTX,
    ],
    custom: [],
  };
  private parseOptions: OgooneLexerParseOptions | null = null;
  constructor(private onError: (reason: string, cursor: CursorDescriber, context: OgoneLexerContext) => any) { }
  /**
   * find through the first argument the children context
   * will push the contexts to the second argument
   */
  saveContextsTo(
    /**
     * the contexts to check
     */
    fromContexts: ContextReader[],
    /**
     * the array used to save the children contexts
     */
    to: OgoneLexerContext[]) {
    fromContexts.forEach((reader) => {
      const recognized = reader.apply(this, []);
      if (recognized) {
        to.push(this.lastContext);
      }
    });
  }
  /**
   * returns if the current character is starting a new element
   */
  isStartingNode(): boolean {
    return [
      '<',
    ].includes(this.char)
      && (this.node_CTX(checkOnlyOptions)
        || this.html_comment_CTX(checkOnlyOptions));
  }
  /**
   * move the cursor and the column,
   * this method is used during parsing step
   */
  shift(movement: number = 1) {
    this.cursor.x += + movement;
    this.cursor.column += + movement;
  }
  /**
   * parse the text and retrieve all the contexts
   */
  parse(text: string, opts: OgooneLexerParseOptions): OgoneLexerContext[] {
    try {
      /**
       * save the options argument
       */
      this.parseOptions = opts;
      /**
       * save the current parsed text
       * to source
       * used internally
       */
      this.source = text;
      /**
       * retrieve the top level contexts
       * if custom is used as the opts.type of the method
       * push the opts.contexts or an empty array
       */
      const toplevel = this.scopedTopLevel[opts.type];
      if (opts.type === 'custom') {
        toplevel.push(...(opts.contexts || []));
      }
      while (!this.isEOF) {
        // we are at the top level
        // start using context readers
        const isValid = this.topCTX(toplevel);
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
      const isUnexpected = reader.apply(this, [checkOnlyOptions]);
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
   */
  comment_block_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "/" || char === "/" && next !== '*') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts: ContextReader[] = [
        this.line_break_CTX,
      ];
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "/" && this.prev === '*') {
          this.shift(1);
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
   */
  comment_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "/" || char === "/" && next !== '/') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (this.char === "\n") {
          this.cursor.x++;
          this.cursor.line++;
          this.cursor.column = 0;
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
   */
  string_single_quote_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      let { source } = this;
      const { x, column, line } = this.cursor;
      if (char !== "'" || char === "'" && prev === '\\') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected || [
          this.line_break_CTX
        ]);
        if (this.char === "'" && this.prev !== '\\') {
          this.shift(1);
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
   */
  string_double_quote_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      let { source } = this;
      const { x, column, line } = this.cursor;
      if (char !== "\"" || char === "\"" && prev === '\\') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected || [
          this.line_break_CTX
        ]);
        if (this.char === "\"" && this.prev !== '\\') {
          this.shift(1);
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
   */
  string_template_quote_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "`" || char === "`" && prev === '\\') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.string_template_quote_eval_CTX,
      ];
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "`" && this.prev !== '\\') {
          this.shift(1);
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
   */
  string_template_quote_eval_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "$" || char === "$" && prev === '\\' || char === "$" && next !== '{') return false;
      if (opts?.checkOnly) return true;
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
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "}" && this.prev !== '\\') {
          this.shift(1);
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
   */
  braces_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "(") return false;
      if (opts?.checkOnly) return true;
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
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === ")") {
          this.shift(1);
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
   */
  curly_braces_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "{") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = opts?.contexts || [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.curly_braces_CTX,
      ];
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "}") {
          this.shift(1);
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
   */
  array_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "[") return false;
      if (opts?.checkOnly) return true;
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
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "]") {
          this.shift(1);
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
   * @returns true if the current character and the next characters are spaces
   */
  multiple_spaces_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char, next, source } = this;
      if (char !== ' ' || next !== ' ') return false;
      const { x, column, line } = this.cursor;
      let result = false;
      while (this.char === ' ') {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
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
   */
  textnode_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const lastIsANode = Boolean(lastContext && [ContextTypes.Node, ContextTypes.NodeClosing, ContextTypes.HTMLComment].includes(lastContext.type));
      const isValid = prev && ['>'].includes(prev) && lastIsANode ||
        char !== '<'
        && !this.import_statements_CTX(checkOnlyOptions)
        && !this.node_CTX(checkOnlyOptions)
        && !this.comment_CTX(checkOnlyOptions);
      if (!isValid || !this.nodeContextStarted) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: OgoneLexerContext[] = [];
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_template_quote_eval_CTX,
      ];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.isStartingNode()) {
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
   */
  node_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "<"
        || char === "<" && [' ', '<', '!'].includes(next!)
        || next && /([^a-zA-Z0-9\[\/])/i.test(next)
      ) return false;
      if (opts?.checkOnly) return true;
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
        this.shift(1);
        this.isValidChar(opts?.unexpected || [
          // shouldn't start a new node
          this.node_CTX,
          this.html_comment_CTX,
        ]);
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
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "<") {
          break;
        } else if (this.char === ">") {
          this.shift(1);
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
            openTag.data.closed = true;
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
   */
  node_name_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if ([' ', '[', '!', '-', '\n', '/'].includes(char)) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
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
   */
  html_comment_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const sequence = [char, next, source[x + 2], source[x + 3]];
      if (char !== '<'
        || sequence.join('') !== '<!--') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected || [
          this.html_comment_CTX,
        ]);
        if (this.char === ">" && this.prev === '-' && source[this.cursor.x - 2] === '-') {
          this.shift(1);
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
   */
  import_ambient_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (!/^import\s*(["'])(.*?)(\1)/i.test(this.nextPart)) return false;
      if (opts?.checkOnly) return true;
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
        this.shift(1);
        this.isValidChar(opts?.unexpected);
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
   */
  // TODO create contexts for the tokens between import and from
  import_statements_CTX(opts?: ContextReaderOptions): boolean {
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
      if (opts?.checkOnly) return true;
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
        this.shift(1);
        this.isValidChar(opts?.unexpected);
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
   */
  flag_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== '-' || next !== '-') return false;
      if (opts?.checkOnly) return true;
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
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (!isNamed) {
          isNamed = Boolean(
            this.flag_name_CTX()
            && related.push(this.lastContext));
        }
        this.saveContextsTo(allSubContexts, children);
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
  flag_name_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char === '-') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected || [
          this.array_CTX,
          this.braces_CTX,
          this.curly_braces_CTX,
        ]);
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
  flag_spread_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== '{' || !/^\{(\s*)(\.){3}/i.test(this.nextPart)) return false;
      if (opts?.checkOnly) return true;
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
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(readers, children);
        if (['}',].includes(this.char)) {
          this.shift(1);
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
   */
  attributes_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (prev
        && prev !== ' '
        || char
        && !(/[a-zA-Z0-9\$\_]/i.test(char))) return false;
      if (opts?.checkOnly) return true;
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
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
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
  attribute_boolean_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char === '-' || !/^([^\s=\<\>\/]+?)(\s|\n|\>)/i.test(this.nextPart)) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected || [
          this.array_CTX,
          this.braces_CTX,
          this.curly_braces_CTX,
        ]);
        if ([' ', '/', '>', '<', '\n'].includes(this.next!)) {
          this.shift(1);
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
  attribute_name_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char === '-') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected || [
          this.array_CTX,
          this.braces_CTX,
          this.curly_braces_CTX,
        ]);
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
  attribute_unquoted_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (prev !== '=') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected || [
          this.array_CTX,
          this.braces_CTX,
          this.curly_braces_CTX,
        ]);
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
  /**
   * ====================================================
   *
   * special section for the component's protcol
   * note that all the following context readers should
   * participate to the proto element
   * ```
   * <proto>
   *   ... (all the contexts)
   * </proto>
   * ```
   * ====================================================
   */
  /**
   * reads the textnode that should match (protocol)> ... </(protocol)
   */
  protocol_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const lastIsAStyleNode = this.currentContexts.find((context) => context.type === ContextTypes.Node
        && context.related.find((node) => node.type === ContextTypes.NodeName
          && node.source === 'proto')
        && !context.related.find((node) => node.type === ContextTypes.NodeClosing));
      const isValid = !!lastIsAStyleNode;
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: OgoneLexerContext[] = [];
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
      ];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.isStartingNode() && this.nextPart.startsWith('</proto')) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.Protocol, token, {
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
   * ====================================================
   *
   * special section for css stylesheet
   * and the custom css preprocessor
   *
   * please note that here are only accepted
   * all the context that are used for styling
   *
   * ====================================================
   */

  /**
   * returns true if the parse method is configured has stylesheet
   */
  get isParsingStylesheet(): boolean {
    return Boolean(this.parseOptions && this.parseOptions.type === 'stylesheet');
  }
  /**
   * reads the textnodes that should match (style)> ... </(style)
   */
  private isEndOfStylesheet(): boolean {
    return this.isStartingNode() && this.nextPart.startsWith('</style');
  }
  /**
   * all regular at rules
   * that aren't followed by curly braces
   */
  private regularAtRulesNames: string[] = [
    'charset',
    'import',
    'namespace',
    'const',
    'export'
  ];
  stylesheet_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const lastIsAStyleNode = this.currentContexts.find((context) => context.type === ContextTypes.Node
        && context.related.find((node) => node.type === ContextTypes.NodeName
          && node.source === 'style')
        && !context.related.find((node) => node.type === ContextTypes.NodeClosing));
      const isValid = !!lastIsAStyleNode || this.isParsingStylesheet;
      if (!isValid) return false;
      if (opts?.checkOnly) return !this.isEndOfStylesheet();
      let result = true;
      const children: OgoneLexerContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_at_rule_CTX,
      ];
      this.saveContextsTo(allSubContexts, children);
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.isEndOfStylesheet()) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheet, token, {
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
  stylesheet_at_rule_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = Boolean(prev === '@'
        && char !== ' ');
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isTyped = false;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      const describers: ContextReader[] = [
        this.stylesheet_at_rule_name_CTX,
        this.stylesheet_type_assignment_CTX,
      ];
      const allSubContexts: ContextReader[] = [];
      const related: OgoneLexerContext[] = [];
      this.saveContextsTo(describers, related);
      isTyped = !!related.find((context) => context.type === ContextTypes.StyleSheetTypeAssignment);
      // retrieve the atrule name
      const atRuleName = related.find((context) => context.type === ContextTypes.StyleSheetAtRuleName);
      const shouldEndWithCurlyBraces = atRuleName
        && !this.regularAtRulesNames.includes(atRuleName.source)
        || !atRuleName;
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (shouldEndWithCurlyBraces && this.char === '{'
          || !shouldEndWithCurlyBraces && this.char === ';'
          || this.isEndOfStylesheet()) {
          break;
        }
      }
      /**
       * the at rule should be followed by curly bras
       */
      const subCurlyBracesContexts: ContextReader[] = [];
      isClosed = this.curly_braces_CTX({
        contexts: subCurlyBracesContexts,
      });
      if (isClosed) {
        const { lastContext } = this;
        lastContext.type = ContextTypes.StyleSheetCurlyBraces;
        children.push(lastContext);
      }
      // create and finish the current context
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheetAtRule, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      context.related.push(...related);
      context.data.isTyped = isTyped;
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(`the ${ContextTypes.StyleSheetAtRule} isn\'t closed`, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_type_assignment_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = char === '<' && prev === '@';
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      const allSubContexts: ContextReader[] = (opts?.contexts || [
        // this.stylesheet_type_name_CTX,
      ]);
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected || [
          this.stylesheet_type_assignment_CTX,
          this.stylesheet_at_rule_CTX,
        ]);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === '>') {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheetTypeAssignment, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(`the ${ContextTypes.StyleSheetTypeAssignment} isn\'t closed`, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_at_rule_name_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = ![' ', '@', '<'].includes(char);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: OgoneLexerContext[] = [];
      const allSubContexts: ContextReader[] = (opts?.contexts || []);
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === ' ') {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheetAtRuleName, token, {
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
}