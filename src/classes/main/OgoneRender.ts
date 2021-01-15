import { HTMLOgoneElement } from '../../ogone.main.d.ts';
import OgoneBinder from './OgoneBinder.ts';
import {
  Location,
  HTMLElement,
  History,
  Document,
  Node,
  Text,
} from "../../ogone.dom.d.ts";

declare const location: Location;
declare const history: History;
declare const document: Document;

export default abstract class OgoneRender extends OgoneBinder {
  static renderSlots(Onode: HTMLOgoneElement) {
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
  static renderNode(Onode: HTMLOgoneElement) {
    const o = Onode.ogone, oc = o.component;
    if (!oc) return;
    if (o.isTemplate) {
      // update Props before replace the element
      oc.updateProps();
      if (Onode.childNodes.length) {
        OgoneRender.renderSlots(Onode);
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
        OgoneRender.renderSlots(Onode);
      }
      oc.renderTexts(true);
      Onode.replaceWith(...(o.nodes as Node[]));
    }
  }
  static renderStore(Onode: HTMLOgoneElement) {
    const o = Onode.ogone, oc = o.component;
    if (!oc) return;
    if (oc.namespace !== o.namespace) {
      const error =
        "the attribute namespace is not the same provided in the component store";
      const BadNamspaceException = new Error(`[Ogone] ${error}`);
      OgoneRender.displayError(error, "Store Module: Bad Namsepace Exception", new Error(`
      store namespace: ${o.namespace}
      attribute namespace: ${oc.namespace}
      `));
      throw BadNamspaceException;
    }
    oc.startLifecycle();
    OgoneRender.removeNodes(Onode)
    Onode.remove();
  }
  static renderRouter(Onode: HTMLOgoneElement) {
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
  static renderAsyncRouter(Onode: HTMLOgoneElement) {
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
  static renderAsyncStores(Onode: HTMLOgoneElement) {
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
      OgoneRender.removeNodes(t)
      t.remove();
    }
  }
  static renderAsyncComponent(Onode: HTMLOgoneElement) {
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
        // OgoneRender.forceAsyncRender(awaitingNode);

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
  static renderComponent(Onode: HTMLOgoneElement) {
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
        // OgoneRender.forceAsyncRender(onode);
        OgoneRender.renderingProcess(onode);
      }
    }
  }
  static renderAsync(Onode: HTMLOgoneElement, shouldReportToParentComponent?: boolean) {
    const o = Onode.ogone, oc = o.component;
    if (!oc) return;
    // first render child stores component
    OgoneRender.renderAsyncStores(Onode);

    // first render child router component
    OgoneRender.renderAsyncRouter(Onode);

    // render components
    OgoneRender.renderComponent(Onode);

    // then render child async components
    OgoneRender.renderAsyncComponent(Onode);

    const chs = Array.from(Onode.childNodes) as (HTMLElement | HTMLOgoneElement)[];
    const placeholder = Onode.context.placeholder;
    const txt = chs.find((n) => n.nodeType === 3) as unknown as Text;
    if (txt) {
      const UnwrappedTextnodeOnAsyncComponentException = new Error(
        `[Ogone] Top level textnode are not supported for Async component placeholder.
            Please wrap this text into an element.
            textnode data: "${txt.data}"`,
      );
      OgoneRender.displayError(
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
          OgoneRender.setAsyncContext(Onode);

          // replace childnodes by template
          if (chs.length) {
            const { isConnected } = chs[0];
            if (isConnected) {
              chs.slice(1).forEach((ch) => {
                if ((ch as HTMLOgoneElement).ogone) {
                  OgoneRender.removeNodes(ch as HTMLOgoneElement)
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
            OgoneRender.renderNode(Onode);
            if (oc.async.then && shouldReportToParentComponent && oc.parent) {
              // handle resolution with --then:...
              oc.parent.runtime(oc.async.then, { value: args, await: p });
            }
          }).catch((err) => {
            if (oc.async.catch && shouldReportToParentComponent && oc.parent) {
              // handle error with --catch:...
              oc.parent.runtime(oc.async.catch, err);
            }
            OgoneRender.displayError(
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
  static renderingProcess(Onode: HTMLOgoneElement) {
    const o = Onode.ogone;
    // use the jsx renderer only for templates
    OgoneRender.setNodes(Onode);
    // set Async context for Async nodes
    if (o.isAsyncNode) {
      OgoneRender.setNodeAsyncContext(Onode);
    }
    // use the previous jsx and push the result into ogone.nodes
    // set the dependencies of the node into the component
    if (o.originalNode) OgoneRender.setDeps(Onode);

    // set dynamic attributes through o.props
    if (!o.isTemplate && o.nodeProps) {
      OgoneRender.setNodeProps(Onode);
    }

    // set the events
    OgoneRender.setEvents(Onode);

    // bind classList
    OgoneRender.bindClass(Onode);

    // bind style
    OgoneRender.bindStyle(Onode);

    // bind value
    OgoneRender.bindValue(Onode);

    // bind HTML
    OgoneRender.bindHTML(Onode);

    // spread parent Property
    OgoneRender.useSpread(Onode);

    // set history state and trigger default code for router
    if (o.type === "router") {
      OgoneRender.triggerLoad(Onode);
    }
  }
  static renderContext(Onode: HTMLOgoneElement) {
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
  static saveUntilRender(Onode: HTMLOgoneElement, f: Function): void {
    if(Onode.ogone.methodsCandidate) {
      Onode.ogone.methodsCandidate.push(f);
    }
  }
}
