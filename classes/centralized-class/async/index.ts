// @ts-nocheck
const getClassAsync = (klass) => (class extends (Ogone.classes.component(klass)) {
    constructor() {
      super();
      this.type = "async";
    }
    setNodeAsyncContext() {
      const o = this.ogone, oc = o.component;
      if (o.flags && o.flags.await) {
        const promise = new Promise((resolve, reject) => {
        if (typeof o.flags.await === 'boolean') {
          this.firstNode.addEventListener('load', (ev) => {
            resolve(false);
          });
        } else {
          const type = o.getContext({
            getText: o.flags.await,
            position: o.position,
          })
          this.firstNode.addEventListener(type, (ev) => {
            resolve(false);
          });
        }
        });
        oc.promises.push(promise);
      }
    };
    renderAsyncRouter() {
      const o = this.ogone, oc = o.component;
      const filter = t => t.component && t.component.type === 'router';
      const s = o.nodes.filter(filter);
      for (let n of o.nodes.filter(n => n.nodeType === 1)) {
        const arrayOfTemplates = Array.from(n.querySelectorAll('template')).filter(filter);
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
      const filter = t => t.component && t.component.type === 'store';
      const asyncStores = o.nodes.filter(filter);
      for (let n of o.nodes.filter(n => n.nodeType === 1)) {
        const arrayOfTemplates = Array.from(n.querySelectorAll('template')).filter(filter);
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
      const filter = t => t.component && t.component.type === 'async';
      for (let node of o.nodes.filter(n => n.nodeType === 1)) {
        const awaitingNodes = Array.from(node.querySelectorAll('template')).filter(filter);
        if (node.isComponent && node.ogone && node.ogone.component.type === 'async') {
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
              onode.addEventListener(`${o.key}:${onode.ogone.key}:resolve`, (event) => {
                resolve();
              });
            }
          });
          oc.promises.push(promise);
        }
      }
    }
    renderAsync(shouldReportToParentComponent) {
      const o = this.ogone, oc = o.component;
      // first render child stores component
      this.renderAsyncStores();

      // first render child router component
      this.renderAsyncRouter();

      // then render child async components
      this.renderAsyncComponent();

      const chs = Array.from(this.childNodes);
      const placeholder = this.context.placeholder;
      const txt = chs.find(n => n.nodeType === 3);
      if (txt) {
        const UnwrappedTextnodeOnAsyncComponentException = new Error(`[Ogone] Top level textnode are not supported for Async component placeholder.
          Please wrap this text into an element.
          textnode data: "$\{txt.data}"`);
        Ogone.error(UnwrappedTextnodeOnAsyncComponentException.message, 'Async Component placeholder TypeError', UnwrappedTextnodeOnAsyncComponentException);
        throw UnwrappedTextnodeOnAsyncComponentException;
      }
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
                })
                chs[0].replaceWith(placeholder);
              }
            }
            resolve();
          }, 0);
        }).then(() => {
          const promise = Promise.all(oc.promises)
            .then((p) => {
              // render the element;
              this.render();
              if (oc.async.then && shouldReportToParentComponent) {
                // handle resolution with --then:...
                oc.parent.runtime(oc.async.then, { value: args, await: p, });
              }
            }).catch((err) => {
              if (oc.async.catch && shouldReportToParentComponent) {
                // handle error with --catch:...
                oc.parent.runtime(oc.async.catch, err);
              }
              Ogone.error(err.message, 'Error in Async component. component: \${o.file}', err);
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
        const promise = o.getContext({
          getText: o.flags.defer,
          position: o.position,
        })
        oc.promises.push(promise);
      }
    }
    forceAsyncRender() {
      this.setPosition();
      this.setContext();
      // this.setHMRContext();
      this.setProps();
      this.setNodes();
      if (this.ogone.originalNode) this.setDeps();
      this.setEvents();
      this.bindStyle();
      this.bindClass();
      this.renderAsync(true);
    }
  });
  export default getClassAsync.toString();