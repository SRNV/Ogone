import { HTMLOgoneElement } from '../../ogone.main.d.ts';
import OgoneBinder, { bindClass, bindHTML, bindStyle, bindValue } from './OgoneBinder.ts';
import {
  Location,
  HTMLElement,
  History,
  Document,
  Node,
  Text,
} from "../../ogone.dom.d.ts";
import {
  destroy,
  removeNodes,
  setActualRouterTemplate,
  setAsyncContext,
  setEvents,
  setNodeAsyncContext,
  setNodeProps,
  setNodes,
  useSpread
} from "./OgoneExtends.ts";
import { displayError } from "./OgoneError.ts";

declare const location: Location;
declare const history: History;
declare const document: Document;

export default class OgoneRender extends OgoneBinder { }
/**
 * fake slot replacement inside the component
 * // TODO use native slot implementation
 */
export function renderSlots(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  if (!o.nodes) return;
  const slots = Array.from(Onode.querySelectorAll("[slot]"));
  for (
    let node of o.nodes.filter((n) => (n as HTMLElement).nodeType === 1)
  ) {
    // d for default slots
    const d = (node as HTMLElement).querySelector("slot:not([name])");
    if (d) {
      d.replaceWith(...Array.from(Onode.childNodes));
    }
  }
  for (let slotted of slots) {
    // sn for slotName
    const sn = slotted.getAttribute("slot");
    for (let n of o.nodes) {
      const s = (n as HTMLElement).querySelector(`slot[name="${sn}"]`);
      if (s) {
        slotted.removeAttribute("slot");
        s.replaceWith(slotted);
      }
    }
  }
}
/**
 * global instructions for the rendering of the HTMLOgoneElement
 * will render all the dynamic textnodes and replace all the slots elements
 */
export function renderNode(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  if (o.isTemplate) {
    // update Props before replace the element
    oc.updateProps();
    if (Onode.childNodes.length) {
      renderSlots(Onode);
    }
    // replace the element
    if (o.type === "async") {
      Onode.context.placeholder.replaceWith(...(o.nodes as Node[]));
    } else {
      Onode.replaceWith(...(o.nodes as Node[]));
    }
    // template/node is already connected
    // ask the component to evaluate the value of the textnodes
    oc.renderTexts(true);

    // trigger the init case of the component
    // we can pass the parameters of the router into the ctx
    if (o.type !== "async") {
      oc.startLifecycle({
        router: {
          params: o.params,
          state: history.state,
          path: location.pathname,
        },
      });
    }
  } else if (oc) {
    if (Onode.childNodes.length) {
      renderSlots(Onode);
    }
    oc.renderTexts(true);
    Onode.replaceWith(...(o.nodes as Node[]));
  }
}
/**
 * start the store component's lifeCycle and remove all nodes of the store component
 * ends by removing the HTMLOgoneElement
 * throws if the namespace doesn't match with the namespace inside the store component
 */
export function renderStore(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  if (oc.namespace !== o.namespace) {
    const error =
      "the attribute namespace is not the same provided in the component store";
    const BadNamspaceException = new Error(`[Ogone] ${error}`);
    displayError(error, "Store Module: Bad Namsepace Exception", new Error(`
      store namespace: ${o.namespace}
      attribute namespace: ${oc.namespace}
      `));
    throw BadNamspaceException;
  }
  oc.startLifecycle();
  removeNodes(Onode)
  Onode.remove();
}
/**
 * all the instructions involved in the implementation of the router.
 * this will use a HTMLSectionElement and alays replace it's innerHTML
 */
export function renderRouter(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  // update Props before replacement of the element
  oc.updateProps();
  if (!o.replacer) {
    o.replacer = document.createElement('section');
  }
  if (Onode.parentNode) {
    Onode.replaceWith(o.replacer);
  }
  if (o.routeChanged) {
    o.replacer.innerHTML = "";
    o.replacer.append(o.actualTemplate as unknown as Node);
  }
  // run case router:xxx on the router component
  oc.runtime(`router:${o.actualRouteName || o.locationPath}`, history.state);
}
/**
 * rendering instructions for the router components inside an async component context
 */
export function renderAsyncRouter(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  if (!o.nodes) return;
  const filter = (t: any) => t.component && t.component.type === "router";
  const s = o.nodes.filter(filter) as HTMLOgoneElement[];
  for (let n of o.nodes.filter((n) => n.nodeType === 1)) {
    const arrayOfTemplates = Array.from(n.querySelectorAll("template"))
      .filter(filter) as typeof s;
    for (let template of arrayOfTemplates) {
      s.push(template);
    }
  }
  for (let t of s) {
    t.connectedCallback();
  }
}
/**
 * rendering instructions for the store components inside an async component context
 */
export function renderAsyncStores(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  if (!o.nodes) return;
  const filter = (t: any) => t.component && t.component.type === "store";
  const asyncStores = o.nodes.filter(filter) as HTMLOgoneElement[];
  for (let n of o.nodes.filter((n) => n.nodeType === 1)) {
    const arrayOfTemplates = Array.from(n.querySelectorAll("template"))
      .filter(filter) as typeof asyncStores;
    for (let template of arrayOfTemplates) {
      asyncStores.push(template);
    }
  }
  for (let t of asyncStores) {
    t.connectedCallback();
    removeNodes(t)
    t.remove();
  }
}
/**
 * rendering instructions for async components inside an async component context
 */
export function renderAsyncComponent(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc || !o || !o.nodes) return;
  const filter = (t: any) => t.component && t.component.type === "async";
  for (let node of o.nodes.filter((n) => n.nodeType === 1)) {
    const awaitingNodes = Array.from(node.querySelectorAll("template"))
      .filter(filter) as HTMLOgoneElement[];
    if (
      node.isComponent && node.ogone && node.ogone.component && node.ogone.component.type === "async"
    ) {
      awaitingNodes.push(node);
    }
    for (let awaitingNode of awaitingNodes) {
      // create a custom Event for parent component
      // parent component will wait the event to be dispatched
      const ev = new CustomEvent(`${o.key}:${awaitingNode.ogone.key}:resolve`);
      awaitingNode.component.dispatchAwait = () => {
        awaitingNode.dispatchEvent(ev);
      };

      // force rendering of awaiting node
      // TODO revert force async render
      // forceAsyncRender(awaitingNode);

      const promise = new Promise((resolve) => {
        if (awaitingNode.component.promiseResolved) {
          // if the async child component resolve directly the promise
          resolve(true);
        } else {
          awaitingNode.addEventListener(
            `${o.key}:${awaitingNode.ogone.key}:resolve`,
            () => {
              resolve(true);
            },
          );
        }
      });
      oc.promises.push(promise);
    }
  }
}
/**
 * rendering instructions for the basic components inside an async component context
 */
export function renderComponent(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  if (!o.nodes) return;
  const filter = (t: any) => t.component && t.component.type === "component";
  for (let node of o.nodes.filter((n) => n.nodeType === 1)) {
    const components = Array.from(node.querySelectorAll("template"))
      .filter(filter) as HTMLOgoneElement[];
    let n = (node as HTMLOgoneElement);
    if (
      n.isComponent && n.ogone && n.ogone.component && n.ogone.component.type === "component"
    ) {
      components.push(n as HTMLOgoneElement);
    }
    for (let onode of components) {
      // force rendering of awaiting node
      // TODO revert froce Async render
      // forceAsyncRender(onode);
      renderingProcess(onode);
    }
  }
}
/**
 * instructions for the async components
 */
export function renderAsync(Onode: HTMLOgoneElement, shouldReportToParentComponent?: boolean) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  // first render child stores component
  renderAsyncStores(Onode);

  // first render child router component
  renderAsyncRouter(Onode);

  // render components
  renderComponent(Onode);

  // then render child async components
  renderAsyncComponent(Onode);

  const chs = Array.from(Onode.childNodes) as (HTMLElement | HTMLOgoneElement)[];
  const placeholder = Onode.context.placeholder;
  const txt = chs.find((n) => n.nodeType === 3) as unknown as Text;
  if (txt) {
    const UnwrappedTextnodeOnAsyncComponentException = new Error(
      `[Ogone] Top level textnode are not supported for Async component placeholder.
            Please wrap this text into an element.
            textnode data: "${txt.data}"`,
    );
    displayError(
      UnwrappedTextnodeOnAsyncComponentException.message,
      "Async Component placeholder TypeError",
      UnwrappedTextnodeOnAsyncComponentException,
    );
    throw UnwrappedTextnodeOnAsyncComponentException;
  }
  // async placeholder feature
  if (chs.length) {
    Onode.replaceWith(...chs);
  } else {
    Onode.replaceWith(placeholder);
  }
  oc.resolve = (...args: unknown[]) => {
    return new Promise((resolve) => {
      // we need to delay the execution
      // for --defer flag
      setTimeout(() => {
        // set Async context for Async Components
        setAsyncContext(Onode);

        // replace childnodes by template
        if (chs.length) {
          const { isConnected } = chs[0];
          if (isConnected) {
            chs.slice(1).forEach((ch) => {
              if ((ch as HTMLOgoneElement).ogone) {
                removeNodes(ch as HTMLOgoneElement)
                ch.remove();
                return;
              }
              ch.remove();
            });
            chs[0].replaceWith(placeholder);
          }
        }
        resolve(true);
      }, 0);
    }).then(() => {
      Promise.all(oc.promises)
        .then((p) => {
          // render the element;
          renderNode(Onode);
          if (oc.async.then && shouldReportToParentComponent && oc.parent) {
            // handle resolution with --then:...
            oc.parent.runtime(oc.async.then, { value: args, await: p });
          }
        }).catch((err) => {
          if (oc.async.catch && shouldReportToParentComponent && oc.parent) {
            // handle error with --catch:...
            oc.parent.runtime(oc.async.catch, err);
          }
          displayError(
            err.message,
            `Error in Async component. component: ${o.name}`,
            err,
          );
        }).finally(() => {
          if (oc.async.finally && shouldReportToParentComponent && oc.parent) {
            // handle finally with --finally:...
            oc.parent.runtime(oc.async.finally);
          }
        });
    });
  };
  oc.startLifecycle(o.params, o.historyState);
}
/**
 * all the instructions involved in the rendering of the components or dynamic nodes
 */
export function renderingProcess(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  // use the jsx renderer only for templates
  setNodes(Onode);
  // set Async context for Async nodes
  if (o.isAsyncNode) {
    setNodeAsyncContext(Onode);
  }
  // use the previous jsx and push the result into ogone.nodes
  // set the dependencies of the node into the component
  if (o.originalNode) setDeps(Onode);

  // set dynamic attributes through o.props
  if (!o.isTemplate && o.nodeProps) {
    setNodeProps(Onode);
  }

  // set the events
  setEvents(Onode);

  // bind classList
  bindClass(Onode);

  // bind style
  bindStyle(Onode);

  // bind value
  bindValue(Onode);

  // bind HTML
  bindHTML(Onode);

  // spread parent Property
  useSpread(Onode);

  // set history state and trigger default code for router
  if (o.type === "router") {
    triggerLoad(Onode);
  }
}
/**
 * this function call the render function of the component if it's only a basic node
 * or of the parent component if it's already a component
 * the component render function will duplicate the element using the user's --for flag
 */
export function renderContext(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc || !o.getContext) return false;
  const length = o.getContext(
    { getLength: true, position: o.position },
  ) as number;
  (o.isTemplate && oc.parent ? oc.parent : oc).render(Onode, {
    callingNewComponent: o.isTemplate,
    length,
  });
  return true;
}
/**
 * for all RouterComponents, this function will force the use of the default modifier.
 * and save a reaction in the component. this reaction will use the functions Ogone.setActualRouterTemplate && Ogone.renderRouter
 */
export function triggerLoad(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  const rr = this.routerReactions;
  oc.runtime(0, o.historyState);
  rr.push((path: string) => {
    o.locationPath = path;
    setActualRouterTemplate(Onode);
    renderRouter(Onode);
    return oc.activated;
  });
}
/**
* adds a reaction to the parent component or the component
* to keep up to data the nodes
* renderContext is used for the updates
*/
export function setDeps(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  if (o.originalNode && o.getContext) {
    (Onode.isComponent && oc.parent ? oc.parent : oc).react.push(() =>
      renderContext(Onode)
    );
    renderContext(Onode);
  }
}
export function setHMRContext(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  // register to hmr
  if (o.isTemplate && oc && o.uuid) {
    this.instances[o.uuid].push(oc);
  }
  this.mod[Onode.extends].push((pragma: string) => {
    this.render[Onode.extends] = eval(pragma);
    if (!o.nodes) return;
    if (o.isTemplate) {
      return true;
    } else if (oc) {
      const invalidatedNodes = o.nodes.slice();
      const ns = Array.from(o.nodes);
      o.render = this.render[Onode.extends];
      renderingProcess(Onode);
      invalidatedNodes.forEach((n, i) => {
        if (n.ogone) {
          if (i === 0) n.firstNode.replaceWith(...ns);
          destroy(n);
        } else {
          if (i === 0) n.replaceWith(...ns);
          (n as HTMLElement).remove();
        }
      });
      oc.renderTexts(true);
      return true;
    }
  });
}