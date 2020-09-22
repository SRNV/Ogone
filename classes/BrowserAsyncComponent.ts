// @ts-nocheck
const getClassAsync = (
  klass,
) => (class extends (Ogone.classes.component(klass)) {
  constructor() {
    super();
    this.type = "async";
  }
  setNodeAsyncContext() {
    const o = this.ogone, oc = o.component;
    if (o.flags && o.flags.await) {
      const promise = new Promise((resolve, reject) => {
        if (typeof o.flags.await === "boolean") {
          this.firstNode.addEventListener("load", (ev) => {
            resolve(false);
          });
        } else {
          const type = o.getContext({
            getText: o.flags.await,
            position: o.position,
          });
          this.firstNode.addEventListener(type, (ev) => {
            resolve(false);
          });
        }
      });
      oc.promises.push(promise);
    }
  }
  renderAsyncRouter() {
    const o = this.ogone, oc = o.component;
    const filter = (t) => t.component && t.component.type === "router";
    const s = o.nodes.filter(filter);
    for (let n of o.nodes.filter((n) => n.nodeType === 1)) {
      const arrayOfTemplates = Array.from(n.querySelectorAll("template"))
        .filter(filter);
      for (let template of arrayOfTemplates) {
        s.push(template);
      }
    }
    for (let t of s) {
      t.connectedCallback();
    }
  }
  renderAsyncStores() {
    const o = this.ogone, oc = o.component;
    const filter = (t) => t.component && t.component.type === "store";
    const asyncStores = o.nodes.filter(filter);
    for (let n of o.nodes.filter((n) => n.nodeType === 1)) {
      const arrayOfTemplates = Array.from(n.querySelectorAll("template"))
        .filter(filter);
      for (let template of arrayOfTemplates) {
        asyncStores.push(template);
      }
    }
    for (let t of asyncStores) {
      t.connectedCallback();
      t.removeNodes().remove();
    }
  }
  renderAsyncComponent() {
    const o = this.ogone, oc = o.component;
    const filter = (t) => t.component && t.component.type === "async";
    for (let node of o.nodes.filter((n) => n.nodeType === 1)) {
      const awaitingNodes = Array.from(node.querySelectorAll("template"))
        .filter(filter);
      if (
        node.isComponent && node.ogone && node.ogone.component.type === "async"
      ) {
        awaitingNodes.push(node);
      }
      for (let onode of awaitingNodes) {
        // create a custom Event for parent component
        // parent component will wait the event to be dispatched
        const ev = new CustomEvent(`${o.key}:${onode.ogone.key}:resolve`);
        onode.component.dispatchAwait = () => {
          onode.dispatchEvent(ev);
        };

        // force rendering of awaiting node
        onode.forceAsyncRender();

        const promise = new Promise((resolve) => {
          if (onode.component.promiseResolved) {
            // if the async child component resolve directly the promise
            resolve();
          } else {
            onode.addEventListener(
              `${o.key}:${onode.ogone.key}:resolve`,
              () => {
                resolve();
              },
            );
          }
        });
        oc.promises.push(promise);
      }
    }
  }
  renderComponent() {
    const o = this.ogone;
    const filter = (t) => t.component && t.component.type === "component";
    for (let node of o.nodes.filter((n) => n.nodeType === 1)) {
      const components = Array.from(node.querySelectorAll("template"))
        .filter(filter);
      if (
        node.isComponent && node.ogone && node.ogone.component.type === "component"
      ) {
        components.push(node);
      }
      for (let onode of components) {
        // force rendering of awaiting node
        onode.forceAsyncRender();
      }
    }
  }
  renderAsync(shouldReportToParentComponent) {
    const o = this.ogone, oc = o.component;
    // first render child stores component
    this.renderAsyncStores();

    // first render child router component
    this.renderAsyncRouter();

    // render components
    this.renderComponent();

    // then render child async components
    this.renderAsyncComponent();

    const chs = Array.from(this.childNodes);
    const placeholder = this.context.placeholder;
    const txt = chs.find((n) => n.nodeType === 3);
    if (txt) {
      const UnwrappedTextnodeOnAsyncComponentException = new Error(
        `[Ogone] Top level textnode are not supported for Async component placeholder.
          Please wrap this text into an element.
          textnode data: "${txt.data}"`,
      );
      Ogone.error(
        UnwrappedTextnodeOnAsyncComponentException.message,
        "Async Component placeholder TypeError",
        UnwrappedTextnodeOnAsyncComponentException,
      );
      throw UnwrappedTextnodeOnAsyncComponentException;
    }
    // async placeholder feature
    if (chs.length) {
      this.replaceWith(...chs);
    } else {
      this.replaceWith(placeholder);
    }
    oc.resolve = (...args) => {
      return new Promise((resolve) => {
        // we need to delay the execution
        // for --defer flag
        setTimeout(() => {
          // set Async context for Async Components
          this.setAsyncContext();

          // replace childnodes by template
          if (chs.length) {
            const { isConnected } = chs[0];
            if (isConnected) {
              chs.slice(1).forEach((ch) => {
                if (ch.ogone) {
                  ch.removeNodes().remove();
                  return;
                }
                ch.remove();
              });
              chs[0].replaceWith(placeholder);
            }
          }
          resolve();
        }, 0);
      }).then(() => {
        Promise.all(oc.promises)
          .then((p) => {
            // render the element;
            this.render();
            if (oc.async.then && shouldReportToParentComponent) {
              // handle resolution with --then:...
              oc.parent.runtime(oc.async.then, { value: args, await: p });
            }
          }).catch((err) => {
            if (oc.async.catch && shouldReportToParentComponent) {
              // handle error with --catch:...
              oc.parent.runtime(oc.async.catch, err);
            }
            Ogone.error(
              err.message,
              `Error in Async component. component: ${o.name}`,
              err,
            );
          }).finally((p) => {
            if (oc.async.finally && shouldReportToParentComponent) {
              // handle finally with --finally:...
              oc.parent.runtime(oc.async.finally, p);
            }
          });
      });
    };
    oc.startLifecycle(o.params, o.historyState);
  }
  setAsyncContext() {
    const o = this.ogone, oc = o.component;
    if (o.flags && o.flags.then) {
      oc.async.then = o.flags.then;
    }
    if (o.flags && o.flags.catch) {
      oc.async.catch = o.flags.catch;
    }
    if (o.flags && o.flags.finally) {
      oc.async.finally = o.flags.finally;
    }
    if (o.flags && o.flags.defer) {
      const promise = oc.parentContext({
        getText: o.flags.defer,
        position: o.positionInParentComponent,
      });
      oc.promises.push(promise);
    }
  }
});
export default getClassAsync.toString();
