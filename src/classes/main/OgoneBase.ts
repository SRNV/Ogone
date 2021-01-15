import {
  HTMLDivElement,
  HTMLElement
} from '../../ogone.dom.d.ts';
import type {
  Route,
  HTMLOgoneElement,
  OgoneParameters,
  RouterBrowser,
  OgoneStores,
  OgoneStoreClient,
  OgoneRenderRegistry,
  OgoneContexts,
  OgoneComponentsRegistry,
  OgoneClassesRegistry,
  OgoneModules,
  OgoneRecycleOptions
} from "../../ogone.main.d.ts";
import EnvServer from "../EnvServer.ts";
export default class OgoneBase extends EnvServer {
  // usable on browser side
  static root: boolean;
  static stores: OgoneStores = {};
  static clients: OgoneStoreClient[] = [];
  static render: OgoneRenderRegistry = {};
  static contexts: OgoneContexts = {};
  static components: OgoneComponentsRegistry = {};
  static classes: OgoneClassesRegistry = {};
  static errorPanel: HTMLDivElement | null = null;
  static warnPanel: HTMLDivElement | null = null;
  static successPanel: HTMLDivElement | null = null;
  static infosPanel: HTMLDivElement | null = null;
  static errors: number = 0;
  static firstErrorPerf: number | null = null;
  static router: RouterBrowser;
  static mod: OgoneModules = {
    '*': []
  };
  static ComponentCollectionManager: any;
  static instances: { [componentUuid: string]: any[] } = {};
  static setReactivity: (target: Object, updateFunction: Function, parentKey?: string) => Object;
  static displayError: (message: string, errorType: string, errorObject: Error) => void;
  /**
   * for the flag --bind
   */
  static bindValue: (Onode: HTMLOgoneElement) => void;
  /**
   * for the flag --class
   */
  static bindClass: (Onode: HTMLOgoneElement) => void;
  /**
   * for the flag --html
   */
  static bindHTML: (Onode: HTMLOgoneElement) => void;
  /**
   * for the flag --style
   */
  static bindStyle: (Onode: HTMLOgoneElement) => void;
  /**
   * for the flag --spread
   */
  static useSpread: (Onode: HTMLOgoneElement) => void;
  static imp: (id: string, url: string) => void;
  /**
   * set the props into the component from the OgoneParameters.props
   * OgoneParameters.props is passed during the creation of the node
   */
  static setProps: (Onode: HTMLOgoneElement) => void;
  /**
   * for dynamic attributes of any elements
   */
  static setNodeProps: (Onode: HTMLOgoneElement) => void;
  /**
   * will set the position of the node
   * using the level, assigned during the creation of the template, depending on how many ancestors has the element
   * and an index which will increase if needed into a loop
   * each element in the rendered loop has it's own index
   */
  static setPosition: (Onode: HTMLOgoneElement) => void;
  /**
   * use the dedicated render function inside Ogone.render
   * which returns all the template of the component or the dynamic node
   */
  static setNodes: (Onode: HTMLOgoneElement) => void;
  /**
   * adds a reaction to the parent component or the component
   * to keep up to data the nodes
   * renderContext is used for the updates
   */
  static setDeps: (Onode: HTMLOgoneElement) => void;
  /**
   * adds Listeners on nodes
   */
  static setEvents: (Onode: HTMLOgoneElement) => void;
  static setContext: (Onode: HTMLOgoneElement) => void;
  static setHMRContext: (Onode: HTMLOgoneElement) => void;
  static setDevToolContext: (Onode: HTMLOgoneElement) => void;
  /**
   * set the context when the user uses the flags: then, catch, finally
   * the context is saved into OComponent.async
   */
  static setAsyncContext: (Onode: HTMLOgoneElement) => void;
  /**
   * to any element that has the flag --await
   */
  static setNodeAsyncContext: (Onode: HTMLOgoneElement) => void;
  /**
   * returns the new webcomponent, the instance of OComponent will save this webcomponent and synchronize itself with the webcomponent.
   */
  static recycleWebComponent: (Onode: HTMLOgoneElement, opts: OgoneRecycleOptions) => HTMLElement;
  /**
   * used inside a reaction, this will create a new component each time the route is updated, via Ogone.router.go(...)
   */
  static setActualRouterTemplate: (Onode: HTMLOgoneElement) => void;
  /**
   * this function is used inside an array.find this is why it returns a boolean.
   * true if the route matches
   */
  static routerSearch: (Onode: HTMLOgoneElement, route: Route, locationPath: string) => boolean;
  /**
   * for all RouterComponents, this function will force the use of the default modifier.
   * and save a reaction in the component. this reaction will use the functions Ogone.setActualRouterTemplate && Ogone.renderRouter
   */
  static triggerLoad: (Onode: HTMLOgoneElement) => void;
  /**
   * function called right after Ogone.setOgone
   * Ogone.setOgone is called when the customElement is created by document.createElement
   */
  static construct: (Onode: HTMLOgoneElement) => void;
  /**
   * function that will add the ogone parameters into the customElement
   * those parameters are passed right after the creation of the customElement
   * in Ogone.render
   */
  static setOgone: (Onode: HTMLOgoneElement, def: OgoneParameters) => void;
  /**
   * this function saves another function into OgoneParameters of the HTMLOgoneElement
   * ```typescript
   * Onode.ogone.methodsCandidate.push(f);
   * ```
   * the saved function will trigger when everything is ready in the HTMLOgoneElement
   */
  static saveUntilRender: (Onode: HTMLOgoneElement, f: Function) => void;
  /**
   * fake slot replacement inside the component
   * // TODO use native slot implementation
   */
  static renderSlots: (Onode: HTMLOgoneElement) => void;
  /**
   * this function call the render function of the component if it's only a basic node
   * or of the parent component if it's already a component
   * the component render function will duplicate the element using the user's --for flag
   */
  static renderContext: (Onode: HTMLOgoneElement) => boolean;
  /**
   * all the instructions involved in the rendering of the components or dynamic nodes
   */
  static renderingProcess: (Onode: HTMLOgoneElement) => void;
  /**
   * all the instructions involved in the implementation of the router.
   * this will use a HTMLSectionElement and alays replace it's innerHTML
   */
  static renderRouter: (Onode: HTMLOgoneElement) => void;
  /**
   * start the store component's lifeCycle and remove all nodes of the store component
   * ends by removing the HTMLOgoneElement
   * throws if the namespace doesn't match with the namespace inside the store component
   */
  static renderStore: (Onode: HTMLOgoneElement) => void;
  /**
   * instructions for the async components
   */
  static renderAsync: (Onode: HTMLOgoneElement, shouldReportToParent: boolean) => void;
  /**
   * rendering instructions for the basic components inside an async component context
   */
  static renderComponent: (Onode: HTMLOgoneElement) => void;
  /**
   * rendering instructions for the router components inside an async component context
   */
  static renderAsyncRouter: (Onode: HTMLOgoneElement) => void;
  /**
   * rendering instructions for the store components inside an async component context
   */
  static renderAsyncStores: (Onode: HTMLOgoneElement) => void;
  /**
   * rendering instructions for async components inside an async component context
   */
  static renderAsyncComponent: (Onode: HTMLOgoneElement) => void;
  /**
   * global instructions for the rendering of the HTMLOgoneElement
   * will render all the dynamic textnodes and replace all the slots elements
   */
  static renderNode: (Onode: HTMLOgoneElement) => void;
  /**
   * recursive insertion, this function is involved into the loops rendering
   */
  static insertElement: (Onode: HTMLOgoneElement, position: "beforebegin" | "afterbegin" | "beforeend" | "afterend", el: HTMLElement) => void;
  /**
   * will remove all nodes of the component
   */
  static removeNodes: (Onode: HTMLOgoneElement) => void;
  /**
   * will destroy the component and use the case 'destroy'
   */
  static destroy: (Onode: HTMLOgoneElement) => void;

  // usable on Deno side
  static files: string[] = [];
  static directories: string[] = [];
  static controllers: { [key: string]: any } = {};
  static main: string = "";
  static readonly allowedTypes = [
    // first component (root component)
    "app",
    // controls the location of the web page
    "router",
    // controls data of the application
    "store",
    // controls the request to the gateway
    "controller",
    // to use promise to rule the component
    "async",
    "component",
  ];
}
