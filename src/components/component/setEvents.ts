export default function setEventsMethod(
  component: any,
  node: any,
  opts: any,
): string {
  const { hasDevtool } = opts;
  return `
    setEvents(){
      if (!this.ogone.flags) return;
      const o = this.ogone, oc = o.component;
      const position = this.isComponent ? oc.positionInParentComponent : o.position;
      const c = this.isComponent ? oc.parent : oc;
      for (let node of o.nodes) {
        for (let flag of o.flags.events) {
          if (flag.type === 'wheel') /* for wheel events */ {
            node.hasWheel = true;
            node.addEventListener(flag.type, (ev) => {
              const foundWheel = ev.path.find(n => n && n.hasWheel);
              if (foundWheel && !foundWheel.isSameNode(node)) return;
              const filter = o.getContext({
                getText: \`$\{flag.filter}\`,
                position,
              });
              const ctx = o.getContext({
                position,
              });
              switch (true) {
                case filter === 'right' && ev.wheelDeltaX < 0:
                  c.runtime(flag.case, ctx, ev);
                  break;
                case filter === 'left' && ev.wheelDeltaX > 0:
                  c.runtime(flag.case, ctx, ev);
                  break;
                case filter === 'up' && ev.wheelDeltaY > 0:
                  c.runtime(flag.case, ctx, ev);
                  break;
                case filter === 'down' && ev.wheelDeltaY < 0:
                  c.runtime(flag.case, ctx, ev);
                  break;
                case filter === null:
                  c.runtime(flag.case, ctx, ev);
                  break;
              }
            });
          } else if (flag.type.startsWith("key")) /* all keyboard event */ {
            document.addEventListener(flag.type, (ev) => {
              const filter = o.getContext({
                getText: \`$\{flag.filter}\`,
                position,
              });
              const ctx = o.getContext({
                position,
              });
              switch(true) {
                case ev.charCode === filter:
                    c.runtime(flag.case, ctx, ev);
                  break;
                case ev.key === filter:
                  c.runtime(flag.case, ctx, ev);
                break;
                case ev.keyCode === filter:
                  c.runtime(flag.case, ctx, ev);
                break;
                case ev.code.toLowerCase() === filter:
                  c.runtime(flag.case, ctx, ev);
                break;
                case !filter:
                  c.runtime(flag.case, ctx, ev);
                break;
              }
            });
          } else if (flag.name === 'router-go' && flag.eval) /* special for router-go flag */{
            node.addEventListener("click", (ev) => {
              Ogone.router.go(
                o.getContext({
                  getText: \`$\{flag.eval}\`,
                  position,
                }), history.state);
            });
          ${
    hasDevtool
      ? `
          } else if (flag.name === 'router-dev-tool' && flag.eval) /* special for router-dev-tool flag */{
            node.addEventListener("click", (ev) => {
              Ogone.router.openDevTool();
            });
          `
      : ""
  }
          } else /* DOM L3 */ {
            node.addEventListener(flag.type, (ev) => {
              const ctx = o.getContext({
                position,
              });
              c.runtime(flag.case, ctx, ev);
            });
          }
        }
      }
    }`;
}
