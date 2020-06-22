export default function contextMethods(
  component: any,
  node: any,
  opts: any,
): string {
  const { isTemplate, isStore, isProduction } = opts;
  const templateContext = `
    oc.key = o.key;
    oc.dependencies = o.dependencies;
    if (o.parentComponent) {
      oc.parent = o.parentComponent;
      oc.parent.childs.push(oc);
    }
    if (Ogone.contexts[o.parentCTXId]) {
      const gct = Ogone.contexts[o.parentCTXId].bind(o.parentComponent.data);
      oc.parentContext = gct;
      o.getContext = gct;
    }
    `;
  const nodeContext = `
        o.getContext = Ogone.contexts['${component.uuid}-${node.id}'].bind(o.component.data);
    `;
  const hmrContext = `
    setHMRContext() {
        const o = this.ogone;
        const oc = o.component;
        // register to hmr
          ${isTemplate ? "Ogone.run['${component.uuid}'].push(oc);" : ""}
          Ogone.mod[this.extends].push((pragma) => {
            Ogone.render[this.extends] = eval(pragma);
            ${
    !isTemplate ? "return true;" : `
              o.render = Ogone.render[this.extends];
              const invalidatedNodes = o.nodes.slice();
              this.renderingProcess();
              invalidatedNodes.forEach((n, i) => {
                if (n.ogone) {
                  if (i === 0) n.firstNode.replaceWith(...o.nodes);
                  n.destroy();
                } else {
                  if (i === 0) n.replaceWith(...o.nodes);
                  n.remove();
                }
              });
              oc.renderTexts(true);
              return true;

              `
    }
          });
      }
    `;
  return `
    setContext() {
        const o = this.ogone;
        const oc = o.component;
        ${isTemplate ? templateContext : nodeContext}
        ${
    isStore
      ? `
          oc.namespace = this.getAttribute('namespace') || null;
          oc.parent.store[oc.namespace] = oc;
        `
      : ""
    }
      }
      ${isProduction ? '' : hmrContext}
    `;
}
