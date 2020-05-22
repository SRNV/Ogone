export default function asyncMethods(component: any, node: any, opts: any): string {
  const { isAsync, isAsyncNode } = opts;
  if (!isAsync && !isAsyncNode) return '';
  if (isAsyncNode) {
    return `
    setNodeAsyncContext() {
        const o = this.ogone;
        const oc = o.component;
        if (o.directives && o.directives.await) {
        const promise = new Promise((resolve, reject) => {
            if (typeof o.directives.await === 'boolean') {
            this.addEventListener('load', (ev) => {
                resolve(false);
            });
            } else {
            const type = o.getContext({
                getText: o.directives.await,
                position: o.position,
            })
            this.addEventListener(type, (ev) => {
                resolve(false);
            });
            }
        });
        oc.promises.push(promise);
        }
    }
  `;
  }
  // async component
  return `
  renderAsync() {
    const o = this.ogone;
    const oc = o.component;
    // WIP
    for (let node of o.nodes) {
      if (node.nodeType === 1) {
        const awaitingNodes = Array.from(node.querySelectorAll('[await]'));
          for (let onode of awaitingNodes) {
            // create a custom Event for parent component
            // parent component will wait the event to be dispatched
            const ev = new Event(\`$\{o.key}:resolve\`);
            onode.component.dispatchAwait = () => {
              onode.dispatchEvent(ev);
            };

            // force rendering of awaiting node
            onode.connectedCallback();

            oc.promises.push(new Promise((resolve) => {
              if (onode.component.promiseResolved) {
                // if the async child component resolve directly the promise
                resolve();
              } else {
                onode.addEventListener(\`$\{o.key}:resolve\`, () => {
                  resolve();
                });
              }
            }));
          }
      }
    }
    const childs = Array.from(this.childNodes);
    const placeholder = this.context.placeholder;
    if (childs.length) {
      this.replaceWith(...childs);
    } else {
      this.replaceWith(placeholder);
    }
    oc.resolve = (...args) => {
      return new Promise((resolve) => {
        // we need to delay the execution
        // for --defer directive
        setTimeout(() => {
          // set Async context for Async Components
          this.setAsyncContext();

          // replace childnodes by template
          if (childs.length) {
            const { isConnected } = childs[0];
            if (isConnected) {
              childs.slice(1).forEach((child) => {
                if (child.ogone) {
                  child.removeNodes().remove();
                  return;
                }
                child.remove();
              })
              childs[0].replaceWith(placeholder);
            }
          }
          resolve();
        }, 0);
      }).then(() => {
        const promise = Promise.all(oc.promises);
        promise.then((p) => {
          // render the element;
          this.render();
          if (oc.async.then) {
            // handle resolution with --then:...
            oc.parent.runtime(oc.async.then, { value: args, awaits: p, });
          }
        }).catch((err) => {
          if (oc.async.catch) {
            // handle error with --catch:...
            oc.parent.runtime(oc.async.catch, err);
          }
          Ogone.error(err.message, 'Error in Async component. component: ${component.file}', err);
        });
        if (oc.async.finally) {
          promise.finally((p) => {
            // handle finally with --finally:...
            oc.parent.runtime(oc.async.finally, p);
          });
        }
      });
    };
    oc.startLifecycle(o.params, o.historyState);
  }
  setAsyncContext() {
    const o = this.ogone;
    const oc = o.component;
    if (o.directives && o.directives.then) {
      oc.async.then = o.directives.then;
    }
    if (o.directives && o.directives.catch) {
      oc.async.catch = o.directives.catch;
    }
    if (o.directives && o.directives.finally) {
      oc.async.finally = o.directives.finally;
    }
    if (o.directives && o.directives.defer) {
      const promise = o.getContext({
        getText: o.directives.defer,
        position: o.position,
      })
      oc.promises.push(promise);
    }
  }
  `;
}