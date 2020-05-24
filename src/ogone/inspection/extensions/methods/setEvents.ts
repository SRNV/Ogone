export default function setEventsMethod(
  component: any,
  node: any,
  opts: any,
): string {
  const { isTemplate } = opts;
  if (!node.directives) return `setEvents(){}`;
  const position = isTemplate ? "oc.positionInParentComponent" : "o.position";
  return `
    setEvents() {
        const o = this.ogone;
        const oc = o.component;
        let v;
        for (let node of o.nodes) {
          ${
    node.directives.events
      .map((dir: any) => {
        switch (true) {
          case dir.type === "wheel" && !!dir.filter:
            return `
                      node.hasWheel = true;
                      ${dir.target ||
              "node"}.addEventListener("${dir.type}", (ev) => {
                        const foundWheel = ev.path.find(n => n && n.hasWheel);
                        if (foundWheel && !foundWheel.isSameNode(node)) return;
                        const filter = o.getContext({
                          getText: "${dir.filter.replace(/\n/gi, " ")}",
                          position: ${position},
                        });
                        const ctx = o.getContext({
                          position: ${position},
                        });
                        switch (true) {
                          case filter === 'right' && ev.wheelDeltaX < 0:
                            oc${
              isTemplate ? ".parent" : ""
            }.runtime("${dir.case}", ctx, ev);
                            break;
                          case filter === 'left' && ev.wheelDeltaX > 0:
                            oc${
              isTemplate ? ".parent" : ""
            }.runtime("${dir.case}", ctx, ev);
                            break;
                          case filter === 'up' && ev.wheelDeltaY > 0:
                            oc${
              isTemplate ? ".parent" : ""
            }.runtime("${dir.case}", ctx, ev);
                            break;
                          case filter === 'down' && ev.wheelDeltaY < 0:
                            oc${
              isTemplate ? ".parent" : ""
            }.runtime("${dir.case}", ctx, ev);
                            break;
                        }
                      });`;
          case dir.type === "wheel" && !dir.filter:
            return `
                      node.hasWheel = true;
                      ${dir.target ||
              "node"}.addEventListener("${dir.type}", (ev) => {
                        const foundWheel = ev.path.find(n => n && n.hasWheel);
                        if (foundWheel && !foundWheel.isSameNode(node)) return;
                        const ctx = o.getContext({
                          position: ${position},
                        });
                        oc${
              isTemplate ? ".parent" : ""
            }.runtime("${dir.case}", ctx, ev);
                      });`;
          case dir.type.startsWith("key") && !!dir.case && !!dir.filter:
            return `
                      ${dir.target ||
              "node"}.addEventListener("${dir.type}", (ev) => {
                        const filter = o.getContext({
                          getText: \"${dir.filter}\",
                          position: ${position},
                        });
                        let ctx;
                        switch(true) {
                          case ev.charCode === filter:
                              ctx = o.getContext({
                                position: ${position},
                              });
                              oc${
              isTemplate ? ".parent" : ""
            }.runtime("${dir.case}", ctx, ev);
                            break;
                          case ev.key === filter:
                            ctx = o.getContext({
                              position: ${position},
                            });
                            oc${
              isTemplate ? ".parent" : ""
            }.runtime("${dir.case}", ctx, ev);
                          break;
                          case ev.keyCode === filter:
                            ctx = o.getContext({
                              position: ${position},
                            });
                            oc${
              isTemplate ? ".parent" : ""
            }.runtime("${dir.case}", ctx, ev);
                          break;
                          case ev.code.toLowerCase() === filter:
                            ctx = o.getContext({
                              position: ${position},
                            });
                            oc${
              isTemplate ? ".parent" : ""
            }.runtime("${dir.case}", ctx, ev);
                          break;
                        }
                      });`;
          case dir.case && dir.name !== "router-go":
            return `
                      ${dir.target ||
              "node"}.addEventListener("${dir.type}", (ev) => {
                        const ctx = o.getContext({
                          position: ${position},
                        });
                        oc${
              isTemplate ? ".parent" : ""
            }.runtime("${dir.case}", ctx, ev);
                      });`;
          case dir.eval && dir.name === "router-go":
            return `
                      node.addEventListener("click", (ev) => {
                        Ogone.router.go(
                          o.getContext({
                            getText: \"${dir.eval}\",
                            position: ${position},
                          }), history.state);
                      });`;
        }
      }).join("\n")
  }
        }
    }`;
}
