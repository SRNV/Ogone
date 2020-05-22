export default function slotsMethods(component: any, node: any, opts: any): string {
  return `
    renderSlots() {
      const o = this.ogone;
      const slots = this.querySelectorAll('[slot]');
      for (let node of o.nodes) {
        // d for default slots
        const d = node.querySelector('slot:not([name])');
        if (d) {
          d.replaceWith(...this.childNodes);
        }
      }
      for (let slotted of slots) {
        // sn for slotName
        const sn = slotted.getAttribute('slot');
        for (let n of o.nodes) {
          const s = n.querySelector(\`slot[name="\${sn}"]\`);
          if (s) {
            slotted.removeAttribute('slot');
            s.replaceWith(slotted);
          }
        }
      }
    }
  `;
}