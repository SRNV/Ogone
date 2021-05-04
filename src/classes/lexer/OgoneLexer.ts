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
  /**
   * pass custom data to context readers
   */
  data?: { [k: string]: unknown },
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

export enum Reason {
  UnexpectedToken = 1436,
  HTMLTagNotClosed = 1443,
  CommentBlockOpen = 1519,
  StringSingleQuoteOpen = 1593,
  StringDoubleQuoteOpen = 1633,
  StringTemplateQuoteOpen = 1678,
  StringTemplateQuoteEvaluationOpen = 1725,
  BracesOpen = 1773,
  CurlyBracesOpen = 1819,
  ArrayOpen = 1866,
  HTMLClosingTagWithoutOpening = 2116,
  HTMLTagNotFinish = 2128,
  HTMLCommentOpen = 2211,
  ImportAmbientStringMissing = 2274,
  ImportStatementNotFinish = 2354,
  OgoneFlagNotFinish = 2406,
  OgoneSpreadFlagNotClosed = 2491,
  HTMLAttributeNotClosed = 2549,
  HTMLBooleanAttributeNotClosed = 2590,
  HTMLAttributeNameNotClosed = 2630,
  HTMLAttributeValueUnquotedNotClosed = 2670,
  StyleSheetAtRuleCharsetInvalid = 2887,
  StyleSheetAtRuleCharsetStringIsMissing = 2890,
  StyleSheetAtRuleCharsetNotFinish = 2894,
  StyleSheetAtRuleCurlyBracesAreMissing = 2960,
  StyleSheetTypeAssignmentNotFinish = 3004,
};

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
export const SupportedStyleSheetUnits = [
  'px', // pixels
  'vh', // viewport height
  'vw', // viewport with
  'vmin', // viewport min
  'vmax', // viewport max
  'em',
  'percent', // percentage
  'Q', // quarter
  'in', // inches
  'pc', // picas
  'pt', // points
  'ex',
  'ch',
  'rem',
  '1h',
  'fr', // grid fragment
  'auto',
];
// available constants types
export const SupportedStyleSheetAtRuleConstantTypes = [
  // functions
  ...SupportedStyleSheetFunctionalNotations,
  // colors
  'color',
  'hex',
  'basic-color',
  // units
  ...SupportedStyleSheetUnits,
  // rules
  'rule',
]
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

export const SupportedStyleSheetCharset = [
  'US-ASCII',
  'ISO_8859-1:1987',
  'ISO_8859-2:1987',
  'ISO_8859-3:1988',
  'ISO_8859-4:1988',
  'ISO_8859-5:1988',
  'ISO_8859-6:1987',
  'ISO_8859-7:1987',
  'ISO_8859-8:1988',
  'ISO_8859-9:1989',
  'ISO-8859-10',
  'ISO_6937-2-add',
  'JIS_X0201',
  'JIS_Encoding',
  'Shift_JIS',
  'Extended_UNIX_Code_Packed_Format_for_Japanese',
  'Extended_UNIX_Code_Fixed_Width_for_Japanese',
  'BS_4730',
  'SEN_850200_C',
  'IT',
  'ES',
  'DIN_66003',
  'NS_4551-1',
  'NF_Z_62-010',
  'ISO-10646-UTF-1',
  'ISO_646.basic:1983',
  'INVARIANT',
  'ISO_646.irv:1983',
  'NATS-SEFI',
  'NATS-SEFI-ADD',
  'NATS-DANO',
  'NATS-DANO-ADD',
  'SEN_850200_B',
  'KS_C_5601-1987',
  'ISO-2022-KR',
  'EUC-KR',
  'ISO-2022-JP',
  'ISO-2022-JP-2',
  'JIS_C6220-1969-jp',
  'JIS_C6220-1969-ro',
  'PT',
  'greek7-old',
  'latin-greek',
  'NF_Z_62-010_(1973)',
  'Latin-greek-1',
  'ISO_5427',
  'JIS_C6226-1978',
  'BS_viewdata',
  'INIS',
  'INIS-8',
  'INIS-cyrillic',
  'ISO_5427:1981',
  'ISO_5428:1980',
  'GB_1988-80',
  'GB_2312-80',
  'NS_4551-2',
  'videotex-suppl',
  'PT2',
  'ES2',
  'MSZ_7795.3',
  'JIS_C6226-1983',
  'greek7',
  'ASMO_449',
  'iso-ir-90',
  'JIS_C6229-1984-a',
  'JIS_C6229-1984-b',
  'JIS_C6229-1984-b-add',
  'JIS_C6229-1984-hand',
  'JIS_C6229-1984-hand-add',
  'JIS_C6229-1984-kana',
  'ISO_2033-1983',
  'ANSI_X3.110-1983',
  'T.61-7bit',
  'T.61-8bit',
  'ECMA-cyrillic',
  'CSA_Z243.4-1985-1',
  'CSA_Z243.4-1985-2',
  'CSA_Z243.4-1985-gr',
  'ISO_8859-6-E',
  'ISO_8859-6-I',
  'T.101-G2',
  'ISO_8859-8-E',
  'ISO_8859-8-I',
  'CSN_369103',
  'JUS_I.B1.002',
  'IEC_P27-1',
  'JUS_I.B1.003-serb',
  'JUS_I.B1.003-mac',
  'greek-ccitt',
  'NC_NC00-10:81',
  'ISO_6937-2-25',
  'GOST_19768-74',
  'ISO_8859-supp',
  'ISO_10367-box',
  'latin-lap',
  'JIS_X0212-1990',
  'DS_2089',
  'us-dk',
  'dk-us',
  'KSC5636',
  'UNICODE-1-1-UTF-7',
  'ISO-2022-CN',
  'ISO-2022-CN-EXT',
  'UTF-8',
  'ISO-8859-13',
  'ISO-8859-14',
  'ISO-8859-15',
  'ISO-8859-16',
  'GBK',
  'GB18030',
  'OSD_EBCDIC_DF04_15',
  'OSD_EBCDIC_DF03_IRV',
  'OSD_EBCDIC_DF04_1',
  'ISO-11548-1',
  'KZ-1048',
  'ISO-10646-UCS-2',
  'ISO-10646-UCS-4',
  'ISO-10646-UCS-Basic',
  'ISO-10646-Unicode-Latin1',
  'ISO-10646-J-1',
  'ISO-Unicode-IBM-1261',
  'ISO-Unicode-IBM-1268',
  'ISO-Unicode-IBM-1276',
  'ISO-Unicode-IBM-1264',
  'ISO-Unicode-IBM-1265',
  'UNICODE-1-1',
  'SCSU',
  'UTF-7',
  'UTF-16BE',
  'UTF-16LE',
  'UTF-16',
  'CESU-8',
  'UTF-32',
  'UTF-32BE',
  'UTF-32LE',
  'BOCU-1',
  'UTF-7-IMAP',
  'ISO-8859-1-Windows-3.0-Latin-1',
  'ISO-8859-1-Windows-3.1-Latin-1',
  'ISO-8859-2-Windows-Latin-2',
  'ISO-8859-9-Windows-Latin-5',
  'hp-roman8',
  'Adobe-Standard-Encoding',
  'Ventura-US',
  'Ventura-International',
  'DEC-MCS',
  'IBM850',
  'PC8-Danish-Norwegian',
  'IBM862',
  'PC8-Turkish',
  'IBM-Symbols',
  'IBM-Thai',
  'HP-Legal',
  'HP-Pi-font',
  'HP-Math8',
  'Adobe-Symbol-Encoding',
  'HP-DeskTop',
  'Ventura-Math',
  'Microsoft-Publishing',
  'Windows-31J',
  'GB2312',
  'Big5',
  'macintosh',
  'IBM037',
  'IBM038',
  'IBM273',
  'IBM274',
  'IBM275',
  'IBM277',
  'IBM278',
  'IBM280',
  'IBM281',
  'IBM284',
  'IBM285',
  'IBM290',
  'IBM297',
  'IBM420',
  'IBM423',
  'IBM424',
  'IBM437',
  'IBM500',
  'IBM851',
  'IBM852',
  'IBM855',
  'IBM857',
  'IBM860',
  'IBM861',
  'IBM863',
  'IBM864',
  'IBM865',
  'IBM868',
  'IBM869',
  'IBM870',
  'IBM871',
  'IBM880',
  'IBM891',
  'IBM903',
  'IBM904',
  'IBM905',
  'IBM918',
  'IBM1026',
  'EBCDIC-AT-DE',
  'EBCDIC-AT-DE-A',
  'EBCDIC-CA-FR',
  'EBCDIC-DK-NO',
  'EBCDIC-DK-NO-A',
  'EBCDIC-FI-SE',
  'EBCDIC-FI-SE-A',
  'EBCDIC-FR',
  'EBCDIC-IT',
  'EBCDIC-PT',
  'EBCDIC-ES',
  'EBCDIC-ES-A',
  'EBCDIC-ES-S',
  'EBCDIC-UK',
  'EBCDIC-US',
  'UNKNOWN-8BIT',
  'MNEMONIC',
  'MNEM',
  'VISCII',
  'VIQR',
  'KOI8-R',
  'HZ-GB-2312',
  'IBM866',
  'IBM775',
  'KOI8-U',
  'IBM00858',
  'IBM00924',
  'IBM01140',
  'IBM01141',
  'IBM01142',
  'IBM01143',
  'IBM01144',
  'IBM01145',
  'IBM01146',
  'IBM01147',
  'IBM01148',
  'IBM01149',
  'Big5-HKSCS',
  'IBM1047',
  'PTCP154',
  'Amiga-1251',
  'KOI7-switched',
  'BRF',
  'TSCII',
  'CP51932',
  'windows-874',
  'windows-1250',
  'windows-1251',
  'windows-1252',
  'windows-1253',
  'windows-1254',
  'windows-1255',
  'windows-1256',
  'windows-1257',
  'windows-1258',
  'TIS-620',
  'CP50220',
  'Alexander Uskov',
  'Alexei Veremeev',
  'Chris Wendt',
  'Florian Weimer',
  'Hank Nussbacher',
  'Internet Assigned Numbers Authority',
  'Jun Murai',
  'Katya Lazhintseva',
  'Keld Simonsen',
  'Keld Simonsen',
  'Kuppuswamy Kalyanasundaram',
  'Mark Davis',
  'Markus Scherer',
  'Masataka Ohta',
  'Nicky Yick',
  'Reuel Robrigado',
  'Rick Pond',
  'Sairan M. Kikkarin',
  'Samuel Thibault',
  'Shawn Steele',
  'Tamer Mahdi',
  'Toby Phipps',
  'Trin Tantsetthi',
  'Vladas Tumasonis',
  'Woohyong Choi',
  'Yui Naruse'
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
  Coma = 'Coma',
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
  StyleSheetAtRuleCharset = 'StyleSheetAtRuleCharset',
  StyleSheetTypeAssignment = 'StyleSheetTypeAssignment',
  StyleSheetAtRuleConst = 'StyleSheetAtRuleConst',
  StyleSheetAtRuleConstName = 'StyleSheetAtRuleConstName',
  StyleSheetAtRuleConstType = 'StyleSheetAtRuleConstType',
  StyleSheetAtRuleConstEqual = 'StyleSheetAtRuleConstEqual',
  StyleSheetAtRuleConstValue = 'StyleSheetAtRuleConstValue',
  StyleSheetAtRuleExport = 'StyleSheetAtRuleExport',
  StyleSheetType = 'StyleSheetType',
  StyleSheetCurlyBraces = 'StyleSheetCurlyBraces',
  StyleSheetSelector = 'StyleSheetSelector',
  StyleSheetSelectorList = 'StyleSheetSelectorList',
  StyleSheetSelectorHTMLElement = 'StyleSheetSelectorHTMLElement',
  StyleSheetSelectorClass = 'StyleSheetSelectorClass',
  StyleSheetSelectorId = 'StyleSheetSelectorId',
  StyleSheetSelectorAttribute = 'StyleSheetSelectorAttribute',
  StyleSheetSelectorPseudoClass = 'StyleSheetSelectorPseudoClass',
  StyleSheetSelectorPseudoElement = 'StyleSheetSelectorPseudoElement',
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
  private get unexpected(): OgoneLexerContext {
    return new OgoneLexerContext(ContextTypes.Unexpected, this.source.slice(this.cursor.x), {
      start: this.cursor.x,
      line: this.cursor.line,
      column: this.cursor.column,
      end: this.cursor.x + 1,
    });
  }
  private get lastContext(): OgoneLexerContext {
    const last = this.currentContexts[this.currentContexts.length - 1]
      || this.unexpected;
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
      this.stylesheet_CTX,
      this.protocol_CTX,
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
  constructor(private onError: (reason: Reason, cursor: CursorDescriber, context: OgoneLexerContext) => any) { }
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
    to: OgoneLexerContext[],
    opts?: ContextReaderOptions) {
    fromContexts.forEach((reader) => {
      const recognized = reader.apply(this, [opts || {}]);
      if (recognized) {
        to.push(this.lastContext);
      }
    });
  }
  /**
   * same as saveContextsTo but if no context is found,
   * the function onError iscalled
   */
  saveStrictContextsTo(
    /**
     * the contexts to check
     */
    fromContexts: ContextReader[],
    /**
     * the array used to save the children contexts
     */
    to: OgoneLexerContext[],
    opts?: ContextReaderOptions) {
    const { length } = to;
    fromContexts.forEach((reader) => {
      const recognized = reader.apply(this, [opts || {}]);
      if (recognized) {
        to.push(this.lastContext);
      }
    });
    // no changes
    if (to.length === length && !this.isEOF) {
      this.onError(Reason.UnexpectedToken, this.cursor, this.unexpected);
    }
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
  shiftUntilEndOf(text: string): boolean {
    if (!this.nextPart.startsWith(text)) return false;
    let result = '';
    while (result !== text) {
      result += this.char;
      this.shift(1);
    }
    return true;
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
          this.onError(Reason.UnexpectedToken, this.cursor, this.lastContext);
          break;
        }
      }
      if (this.openTags.length) {
        const lastNode = this.openTags[this.openTags.length - 1];
        this.onError(Reason.HTMLTagNotClosed, this.cursor, lastNode);
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
        this.onError(Reason.UnexpectedToken, this.cursor, this.lastContext);
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
        this.onError(Reason.CommentBlockOpen, this.cursor, context);
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
        this.onError(Reason.StringSingleQuoteOpen, this.cursor, context);
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
        this.onError(Reason.StringDoubleQuoteOpen, this.cursor, context);
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
        this.onError(Reason.StringTemplateQuoteOpen, this.cursor, context);
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
        this.onError(Reason.StringTemplateQuoteEvaluationOpen, this.cursor, context);
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
        this.onError(Reason.BracesOpen, this.cursor, context);
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
        this.onError(Reason.CurlyBracesOpen, this.cursor, context);
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
        this.onError(Reason.ArrayOpen, this.cursor, context);
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
  coma_CTX() {
    let result = this.char === ',';
    if (result) {
      this.currentContexts.push(new OgoneLexerContext(ContextTypes.Coma, this.char, {
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
      let { char, prev, next, nextPart } = this;
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
            this.onError(Reason.UnexpectedToken, this.cursor, context);
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
            .find((nodeContext) => {
              const name = nodeContext.related.find((related) => related.type === ContextTypes.NodeName);
              const targetName = context.related.find((related) => related.type === ContextTypes.NodeName)
              return name
              && targetName
              && !nodeContext.data.closed
              && name.type === ContextTypes.NodeName
              && name.source === targetName.source
            });
          if (!openTag) {
            this.onError(Reason.HTMLClosingTagWithoutOpening, this.cursor, context);
          } else {
            const index = this.openTags.indexOf(openTag);
            const deleted = this.openTags.splice(index, 1);
            // save the closing tag
            openTag.related.push(context);
            openTag.data.closed = true;
          }
        }
      }
      if (!isClosed) {
        this.onError(Reason.HTMLTagNotFinish, this.cursor, context);
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
        this.onError(Reason.HTMLCommentOpen, this.cursor, context);
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
        this.onError(Reason.ImportAmbientStringMissing, this.cursor, context);
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
        this.onError(Reason.ImportStatementNotFinish, this.cursor, context);
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
        this.onError(Reason.OgoneFlagNotFinish, this.cursor, context);
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
        this.onError(Reason.OgoneFlagNotFinish, this.cursor, context);
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
        this.onError(Reason.OgoneSpreadFlagNotClosed, this.cursor, context);
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
        this.onError(Reason.HTMLAttributeNotClosed, this.cursor, context);
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
        this.onError(Reason.HTMLBooleanAttributeNotClosed, this.cursor, context);
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
        this.onError(Reason.HTMLAttributeNameNotClosed, this.cursor, context);
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
        this.onError(Reason.HTMLAttributeValueUnquotedNotClosed, this.cursor, context);
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
        this.comment_block_CTX,
        this.comment_CTX,
        // at-rules specs
        // last should be the default at rule
        this.stylesheet_charset_at_rule_CTX,
        this.stylesheet_const_at_rule_CTX,
        this.stylesheet_export_at_rule_CTX,
        this.stylesheet_default_at_rule_CTX,
        this.stylesheet_selector_list_CTX,
        // TODO implement property list
        this.curly_braces_CTX,
      ];
      this.saveContextsTo(allSubContexts, children);
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveStrictContextsTo(allSubContexts, children);
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
  /**
   * reader for the at-rule @charset
   * @charset should be followed by a string (double or single);
   */
  stylesheet_charset_at_rule_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const sequence = [
        char, // c
        next, // h
        source[x + 2], // a
        source[x + 3], // r
        source[x + 4], // s
        source[x + 5], // e
        source[x + 6], // t
      ].join('');
      const isValid = Boolean(prev === '@'
        && sequence === 'charset');
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
      ];
      // retrieve the atrule name
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === ';') {
          break;
        }
      }
      // check if the at rule is ending correctly
      const isClosedBySemicolon = this.semicolon_CTX();
      isClosed = Boolean(isClosedBySemicolon && children.length && children.find((context) => [
        ContextTypes.StringSingleQuote,
        ContextTypes.StringDoubleQuote
      ].includes(context.type)));
      // create and finish the current context
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheetAtRuleCharset, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      // now check if everything is good with the charset
      const str = children.find((context) => [
        ContextTypes.StringSingleQuote,
        ContextTypes.StringDoubleQuote
      ].includes(context.type));
      if (str) {
        let isValidCharset = false;
        const strCharset = str.source.slice(1, -1);
        SupportedStyleSheetCharset.forEach((charset) => {
          if (charset.toLowerCase() === strCharset || charset === strCharset) {
            isValidCharset = true;
          }
        });
        if (!isValidCharset) {
          this.onError(Reason.StyleSheetAtRuleCharsetInvalid, this.cursor, context)
        }
      } else {
        this.onError(Reason.StyleSheetAtRuleCharsetStringIsMissing, this.cursor, context);
      }
      if (!isClosed) {
        this.onError(Reason.StyleSheetAtRuleCharsetNotFinish, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reader for the at-rule @export
   * should retrieve all the exportable token
   */
  stylesheet_export_at_rule_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const sequence = [
        char, // e
        next, // x
        source[x + 2], // p
        source[x + 3], // o
        source[x + 4], // r
        source[x + 5], // t
        source[x + 6], // space
      ].join('');
      const isValid = Boolean(prev === '@'
        && sequence === 'export ');
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: OgoneLexerContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_const_at_rule_CTX,
      ];
      // shift until end of export
      const shifted = this.shiftUntilEndOf('export');
      if (!shifted) return false;
      // retrieve the atrule name
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveStrictContextsTo(allSubContexts, children, {
          data: {
            isExportStatement: true
          }
        });
        if (this.char === ';' || this.prev === ';') {
          break;
        }
      }
      // create and finish the current context
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheetAtRuleExport, token, {
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
   * reader for the at-rule @const
   * the rule should follow this pattern
   * @const <name> : <type> = <value>;
   *
   * where name type and value are required
   */
  stylesheet_const_at_rule_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const sequence = [
        char, // c
        next, // o
        source[x + 2], // n
        source[x + 3], // s
        source[x + 4], // t
        source[x + 5], // space
      ].join('');
      const isValid = Boolean((prev === '@' || opts?.data?.isExportStatement)
        && sequence === 'const ');
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isNamed = false;
      const children: OgoneLexerContext[] = [];
      const related: OgoneLexerContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
      ];
      const describers: ContextReader[] = [
        this.stylesheet_const_at_rule_name_CTX,
        this.stylesheet_type_assignment_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_const_at_rule_equal_CTX,
      ];
      //  shift cursor until the end of the const
      const shifted = this.shiftUntilEndOf('const');
      if (!shifted) return false;
      // retrieve the atrule name
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (!isNamed) {
          // retrieve name
          this.saveContextsTo(describers, related, {
            data: {
              // force type assignment
              force_type_assignment_context: true,
            }
          });
          isNamed = Boolean(related.find((context) => context.type === ContextTypes.StyleSheetAtRuleConstName));
        } else {
          this.saveContextsTo(allSubContexts, children);
        }
        if (this.char === ';') {
          break;
        }
      }
      // create and finish the current context
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheetAtRuleConst, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      context.related.push(...related);
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_const_at_rule_name_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { nextPart } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = /^[a-zA-Z]/i.test(nextPart);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      // retrieve the atrule name
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (/[^a-zA-Z0-9_]/i.test(this.char)) {
          break;
        }
      }
      // create and finish the current context
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheetAtRuleConstName, token, {
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
  stylesheet_const_at_rule_equal_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = char === '=' && next !== '=';
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children : OgoneLexerContext[] = [];
      const subs: ContextReader[] = [];
      // retrieve the atrule name
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(subs, children);
        if (this.semicolon_CTX() || this.next === ';') {
          break;
        }
      }
      // create and finish the current context
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheetAtRuleConstEqual, token, {
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
  stylesheet_default_at_rule_CTX(opts?: ContextReaderOptions): boolean {
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
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === '{'
          || this.char === ';'
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
        this.onError(Reason.StyleSheetAtRuleCurlyBracesAreMissing, this.cursor, context);
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
      const isValid = char === '<' && (prev === '@' || opts?.data?.force_type_assignment_context);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children: OgoneLexerContext[] = [];
      const allSubContexts: ContextReader[] = (opts?.contexts || [
        // TODO implement the context stylesheet_type_list
        // this.stylesheet_type_list_CTX,
      ]);
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected || [
          this.stylesheet_type_assignment_CTX,
          this.stylesheet_default_at_rule_CTX,
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
        this.onError(Reason.StyleSheetTypeAssignmentNotFinish, this.cursor, context);
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
  /**
   * The CSS selector list (,) selects all the matching nodes.
   */
  stylesheet_selector_list_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext, nextPart } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = ![',', '@'].includes(char) && nextPart.match(/^([^;\{]+?)(\{)/mi);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const supportedSelectors: ContextReader[] = [
        this.stylesheet_selector_element_CTX,
        this.stylesheet_selector_class_CTX,
      ];
      const children: OgoneLexerContext[] = [];
      const allSubContexts: ContextReader[] = (opts?.contexts || [
        this.multiple_spaces_CTX,
        this.space_CTX,
        ...supportedSelectors,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
        this.coma_CTX,
        this.line_break_CTX,
      ]);
      this.saveStrictContextsTo([
        ...supportedSelectors,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
        this.coma_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
      ], children);
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveStrictContextsTo(allSubContexts, children);
        if (this.char === '{' || this.isEndOfStylesheet()) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheetSelectorList, token, {
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
  stylesheet_selector_element_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = !['#', '.', '[', ' ', '@', '{'].includes(char);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (['#', '.', '[', ',', ' ', '{'].includes(this.char) || this.isEndOfStylesheet()) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheetSelectorHTMLElement, token, {
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
  stylesheet_selector_class_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = char === '.';
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (['#', '[', ',', ' ', '{'].includes(this.char) || this.isEndOfStylesheet()) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheetSelectorClass, token, {
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
  stylesheet_selector_id_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = char === '#' && !this.isEndOfStylesheet();
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: OgoneLexerContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (['.', '[', ',', ' ',].includes(this.char) || this.isEndOfStylesheet()) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new OgoneLexerContext(ContextTypes.StyleSheetSelectorId, token, {
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