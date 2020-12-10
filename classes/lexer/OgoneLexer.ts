/**
 * wip
 * this file will be used into otone and ogone
 * it shouldn't import anything
 */
interface CodeOptions {
  code: string;
  position: number;
}
interface ContextInterface {
  name: string;
  scope?: string;
  capture: RegExp;
  exclude?: RegExp;
  parent?: Context;
  children?: ContextElement[];
  next?: ContextElement[];
  selectValue?: string;
  previous?: ContextElement;
  beforeEnter?(opts: CodeOptions): boolean;
}
interface ContextEvaluationResult {
  context?: ContextElement;
  shiftLength: number;
}
type ContextElement = Context | string;
export class Context implements ContextInterface {
  name: string;
  scope?: string;
  capture: RegExp;
  exclude?: RegExp;
  parent?: Context;
  children: ContextElement[];
  next?: ContextElement[];
  selectValue?: string;
  previous?: ContextElement;
  beforeEnter?(opts: CodeOptions): boolean;
  options: ContextInterface;
  constructor(opts: ContextInterface) {
    this.options = opts;
    this.name = opts.name;
    this.scope = opts.scope;
    this.capture = opts.capture;
    this.exclude = opts.exclude;
    this.parent = opts.parent;
    this.children = opts.children || [];
    this.next = opts.next;
    this.selectValue = opts.selectValue;
    this.previous = opts.previous;
    this.beforeEnter = opts.beforeEnter;
    this.children.forEach((child) => {
      if (typeof child !== 'string') child.parent = this;
    })
  }
  get ancestors(): string {
    let ancestors = '';
    let parent = this.parent;
    while (parent) {
      if (typeof parent !== 'string') {
        ancestors += `${parent.name}.`
        parent = parent.parent;
      }
    }
    return ancestors;
  }
  eval(code: string, opts: CodeOptions): ContextEvaluationResult {
    let shiftLength = 0;
    let result: ContextEvaluationResult = {
      context: this,
      get shiftLength() {
        return shiftLength;
      },
    };
    let newCode = code.substr(opts.position);
    if (this.capture.test(newCode)) {
      const [input] = this.capture.exec(newCode)!;
      shiftLength = input.length;
      console.warn(shiftLength);
      /**
       * ask to child context
       * if they can capture something into the captured part
       */
      this.children.forEach((context: ContextElement) => {

      });
      /**
       * if the code is not validated
       * we return to the parent for evaluation
       */
      if (this.beforeEnter && !this.beforeEnter(opts)) {
        const evaluated = this.parent && this.parent.eval(code, opts)
        result.context = evaluated && evaluated.context;
        shiftLength = evaluated?.shiftLength || 0;
        return result;
      }
      return result;
    }
    return result;
  }
  clone(): Context {
    return new Context(this.options)
  }
}
interface OgoneLexerOptions {
  /**
   * language to parse
   */
  lang: string;
  /**
   * should expose the logs, default is false
   */
  debugg?: boolean;
  contexts: Context[];
  /**
   * top level context
   */
  topLevel?: Context;
}
export class OgoneLexer {
  private options: OgoneLexerOptions = {
    lang: '',
    debugg: false,
    contexts: [],
  };
  public allContexts: Map<string, Context> = new Map();
  constructor(options: OgoneLexerOptions) {
    this.options = options;
    this.startSavingContexts();
  }
  startSavingContexts() {
    this.options.contexts.forEach((context) => {
      this.recursive(context);
    })
  }
  private log(...data: unknown[]) {
    if (this.options.debugg) console.log(...data);
  }
  // recursive function to get all the contexts
  recursive(context: ContextElement, opts?: {
    /** the parent context */
    isChild?: Context;
    /** the previous context */
    isNext?: Context;
  }) {
    if(typeof context !== 'string') {
      let { name } = context;
      if (opts) {
        const { isNext, isChild } = opts;
        if (isChild) {
          name = `${isChild.ancestors}${isChild.name}.${name}`;
        }
        if (isNext) {
          name = `${isNext.ancestors}next.${name}`;
        }
      }
      this.log(`saving context ${name}`);
      this.allContexts.set(name, context);
    }
    if(typeof context !== 'string' && context.children) {
      context.children.forEach((child) => {
        this.recursive(child, {
          isChild: context,
        });
      });
    }
    if(typeof context !== 'string' && context.next) {
      context.next.forEach((next) => {
        this.recursive(next, {
          isNext: context,
        });
      });
    }
  }

  read(code: string) {
    let cursor = 0;
    let newCursor = cursor;
    while (cursor <= code.length) {
      const actualChar = code[cursor];
      if (!actualChar) break;
      const codeOptions = { code, position: cursor };
      if (typeof actualContext !== 'string' && actualContext) {
        const result: ContextEvaluationResult = actualContext.eval(code, codeOptions);
        if (result) {
          actualContext = result.context;
          cursor += result.shiftLength;
          this.log(1, cursor);
        }
      }
      if (typeof actualContext === 'string') {
        const candidate: Context | undefined = this.allContexts.get(actualContext);
        if (candidate) {
          const result: ContextEvaluationResult = candidate.clone().eval(code, codeOptions)
          if (result) {
            actualContext = result.context;
            cursor += result.shiftLength;
            this.log(1, cursor);
          }
        }
      }
      // @ts-ignore
      if (cursor === newCursor) {
        throw new Error(`
          Unexpected Token: '${actualChar}'
          position: ${cursor}
        `);
      }
      newCursor = cursor;
    }
  }
}
const space = new Context({
  name: 'Space',
  capture: /\s/,
});
const atRule = new Context({
  name: 'At-Rule',
  capture: /^\@(.+?)(?=\{)/,
  exclude: /\@/,
  selectValue: 'next.At-Rule-Value',
  children: [
    'At-Rule-Value'
  ],
});
const atRuleValue = new Context({
  name: 'At-Rule.Value',
  capture: /[^\@\{]/,
  children: [
    'Selector-Parent-Reference',
  ]
});
const selector = new Context({
  name: 'Selector',
  capture: /^[^\@\{\}\s](?=\{)/i,
  children: [
    'Selector-Class',
    'Selector-Id',
    'Selector-Parent-Reference',
  ],
});
const selectorClass = new Context({
  name: 'Selector-Class',
  capture: /^\.(.+?)(?=(\.|\#|\s))/,
});
const selectorId = new Context({
  name: 'Selector-Id',
  capture: /^\#(.+?)(?=(\.|\#|\s))/,
});
const selectorParentReference = new Context({
  name: 'Selector-Parent-Reference',
  capture: /^\&/,
});
const rulePropertySeparator = new Context({
  name: 'Rule-Property-Separator',
  capture: /\:/,
})
const ruleValue = new Context({
  name: 'Rule-Value',
  capture: /[^\:\;]/,
});
const ruleEndValue = new Context({
  name: 'Rule-EndValue',
  capture: /\;/,
});
const ruleKey = new Context({
  name: 'Rule-Key',
  capture: /[^\:\s]/,
  exclude: /[\!\'\"\`]/,
  selectValue: 'next.Rule-Value',
  next: [
    space,
  ]
});
const rule = new Context({
  name: 'Rule',
  capture: /\{/,
  children: [
    space,
    'Selector',
    'At-Rule',
  ]
});
const ruleSpread = new Context({
  name: 'Rule-Spread',
  capture: /\.{3}/,
});
const ruleSpreadTokens = new Context({
  name: 'Rule-Spread-Tokens',
  capture: /\w/,
})
const ruleKeyCopy = new Context({
  name: 'Rule-Key-Copy',
  capture: /\&/,
});
const topLevel = new Context({
  name: 'TopLevel',
  capture: /^[\s\n]+/,
});
export const cssParser = new OgoneLexer({
  lang: 'css',
  debugg: true,
  topLevel,
  contexts: [
    selector,
  ]
});
cssParser.read(`
  .class {
    width: 10px;
  }
`);
export default OgoneLexer;