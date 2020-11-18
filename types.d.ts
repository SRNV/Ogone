/** bind this part of the graph */
declare type BoundValue = (() => string)
  | (() => h.JSX.IntrinsicElements[])
  | (() => h.JSX.Element[])
  | ((currentValue: any, index: any, array?: any[]) => h.JSX.Element)
  | string
  | number
  | boolean
  | unknown[]
  | null;

// deno-lint-ignore no-namespace
declare namespace h.JSX {
  export interface IntrinsicElements {
    style: h.JSX.StyleElement;
    template: h.JSX.TemplateElement;
    [k: string]: h.JSX.Element;
  }
  interface ElementChildrenAttribute {
    children: unknown;
  }
  export interface Element extends DOMEventsLVL2 {
    children?: Element | BoundValue;
    [k: string]: unknown;
  }
  /** style elements should only accept strings as chlidren  */
  export interface StyleElement extends h.JSX.Element {
    children: string | (() => string);
  }
  export interface ElementAttributesProperty {
    props: Object; // specify the property name to use
  }
  export interface TemplateElement extends h.JSX.Element {
    useVMC?: {}
    meta?: ImportMeta;
    name?: string;
  }
}
type Attributes = { [k: string]: unknown } | DOMEventsLVL2;
declare function h(tagName: string, attributes: Attributes | null, ...children: unknown[]): h.JSX.Element;
declare function hf(...children: unknown[]): h.JSX.Element;
type JSXFactory = Parameters<typeof h>;
type JSXFragmentFactory = Parameters<typeof hf>;
interface DOMEventsLVL2 {
  onabort?: (...args: unknown[]) => unknown;
  onanimationcancel?: (...args: unknown[]) => unknown;
  onanimationend?: (...args: unknown[]) => unknown;
  onanimationiteration?: (...args: unknown[]) => unknown;
  onauxclick?: (...args: unknown[]) => unknown;
  onblur?: (...args: unknown[]) => unknown;
  oncancel?: (...args: unknown[]) => unknown;
  oncanplay?: (...args: unknown[]) => unknown;
  oncanplaythrough?: (...args: unknown[]) => unknown;
  onchange?: (...args: unknown[]) => unknown;
  onclick?: (...args: unknown[]) => unknown;
  onclose?: (...args: unknown[]) => unknown;
  oncontextmenu?: (...args: unknown[]) => unknown;
  oncuechange?: (...args: unknown[]) => unknown;
  ondblclick?: (...args: unknown[]) => unknown;
  ondurationchange?: (...args: unknown[]) => unknown;
  onended?: (...args: unknown[]) => unknown;
  onerror?: (...args: unknown[]) => unknown;
  onfocus?: (...args: unknown[]) => unknown;
  onformdata?: (...args: unknown[]) => unknown;
  ongotpointercapture?: (...args: unknown[]) => unknown;
  oninput?: (...args: unknown[]) => unknown;
  oninvalid?: (...args: unknown[]) => unknown;
  onkeydown?: (...args: unknown[]) => unknown;
  onkeypress?: (...args: unknown[]) => unknown;
  onkeyup?: (...args: unknown[]) => unknown;
  onload?: (...args: unknown[]) => unknown;
  onloadeddata?: (...args: unknown[]) => unknown;
  onloadedmetadata?: (...args: unknown[]) => unknown;
  onloadend?: (...args: unknown[]) => unknown;
  onloadstart?: (...args: unknown[]) => unknown;
  onlostpointercapture?: (...args: unknown[]) => unknown;
  onmousedown?: (...args: unknown[]) => unknown;
  onmouseenter?: (...args: unknown[]) => unknown;
  onmouseleave?: (...args: unknown[]) => unknown;
  onmousemove?: (...args: unknown[]) => unknown;
  onmouseout?: (...args: unknown[]) => unknown;
  onmouseover?: (...args: unknown[]) => unknown;
  onmouseup?: (...args: unknown[]) => unknown;
  onpause?: (...args: unknown[]) => unknown;
  onplay?: (...args: unknown[]) => unknown;
  onplaying?: (...args: unknown[]) => unknown;
  onpointercancel?: (...args: unknown[]) => unknown;
  onpointerdown?: (...args: unknown[]) => unknown;
  onpointerenter?: (...args: unknown[]) => unknown;
  onpointerleave?: (...args: unknown[]) => unknown;
  onpointermove?: (...args: unknown[]) => unknown;
  onpointerout?: (...args: unknown[]) => unknown;
  onpointerover?: (...args: unknown[]) => unknown;
  onpointerup?: (...args: unknown[]) => unknown;
  onreset?: (...args: unknown[]) => unknown;
  onresize?: (...args: unknown[]) => unknown;
  onscroll?: (...args: unknown[]) => unknown;
  onselect?: (...args: unknown[]) => unknown;
  onselectionchange?: (...args: unknown[]) => unknown;
  onselectstart?: (...args: unknown[]) => unknown;
  onsubmit?: (...args: unknown[]) => unknown;
  ontouchcancel?: (...args: unknown[]) => unknown;
  ontouchstart?: (...args: unknown[]) => unknown;
  ontransitioncancel?: (...args: unknown[]) => unknown;
  ontransitionend?: (...args: unknown[]) => unknown;
  onwheel?: (...args: unknown[]) => unknown;
}
/**
 * Utils Types from Ogone
 */
/**
 * both reactive and passive props are allowed
 */
declare type OgoneProps<T> = { children?: any } & {
  [P in keyof T]: ((handler: (value: T[P]) => void) => T[P]) | T[P];
}
/**
 * no reactions are allowed for those props
 */
declare type OgonePassiveProps<T> = { children?: any } & {
  [P in keyof T]: T[P];
}
declare type Ogone<T> = { $props: unknown, readonly $parent: unknown, } & T;