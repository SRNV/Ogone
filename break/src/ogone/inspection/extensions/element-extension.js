import Ogone from '../../index.ts';
import allConstructors from './templating/extensions.js';
export default function getElementExtension(component, node) {
    const isExtension = node.tagName in allConstructors;
    const componentPragma = node.pragma(component.uuid, true, Object.keys(component.imports), (tagName) => {
        if (component.imports[tagName]) {
            const newcomponent = Ogone.components.get(component.imports[tagName])
            return newcomponent.uuid;
        }
        return null;
    });
    let extensionId = node.tagName;
    if (component.imports[extensionId]) {
        return '';
    }
    return `
      Ogone.classes['${component.uuid}-${node.id}'] = (class extends ${isExtension ? allConstructors[node.tagName] : 'HTMLDivElement'} {
        constructor() {
          super();
          this.dependencies = (${JSON.stringify(node.dependencies)});
          /* render function */
          const r = ${componentPragma.replace(/\n/gi, '').replace(/([\s])+/gi, ' ')}
          this.ogone = {
            position: this.position,
            level: this.level,
            component: null,
            render: r,
            nodes: [],
            directives: this.directives,
            getContext: null,
            key: null,
            replacer: null,
            originalNode: true, /* set as false by component */
          };
        }
        connectedCallback() {
          this.setPosition();
          this.setContext();
          this.ogone.nodes.push(
            this.ogone.render(this.component, this.position, this.index, this.level));
          this.setDeps();
          this.setEventsDirectives();
          this.setIfDir();
          this.render();
        }
        setPosition() {
          this.position = [...this.position];
          this.position[this.level] = this.index;
        }
        setContext() {
          // create a random key
          this.ogone.key = '${node.id}'+\`\${Math.random()}\`;
          this.ogone.component = this.component;
          this.ogone.directives = this.directives;
          this.ogone.position = this.position;
          this.ogone.getContext = Ogone.contexts['${component.uuid}-${node.id}'].bind(this.component.data);
        }
        render() {
          const oc = this.ogone.component;
          if (oc.renderTexts instanceof Function) {
            oc.renderTexts(true);
          }
          this.replaceWith(...this.ogone.nodes);
          this.directiveIf();
        }
        setDeps() {
          if (this.ogone.originalNode) {
            /* directives: for */
            if (this.ogone.getContext) {
              // required for array.length evaluation
              this.ogone.component.react.push(() => this.directiveFor());
              this.directiveFor();
            }
          }
        }
        directiveFor() {
          const key = this.ogone.key;
          const length = this.ogone.getContext({ getLength: true });
          this.ogone.component.render(this, {
            callingNewComponent: false,
            key,
            length,
          });
          return true;
        }
        removeNodes() {
          /* use it before removing template node */
          this.ogone.nodes.forEach((n) => n.remove());
          return this;
        }
        setEventsDirectives() {
          if (!this.ogone || !this.ogone.directives) return;
          this.ogone.directives.filter((dir) => dir.case && dir.type).forEach((dir) => {
            for (let node of this.ogone.nodes) {
              node.addEventListener(dir.type, (ev) => {
                const c = this.ogone.getContext({
                  position: this.ogone.position,
                });
                this.ogone.component.runtime(dir.case, c, ev);
              })
            }
          });
        }
        setIfDir() {
          this.ogone.replacer = [new Comment()];
          if (this.directives.if) {
            this.directives.replacers = this.ogone.nodes;
            this.directives.dfrag = document.createDocumentFragment();
            this.getAllElseDir();
          }
          this.ogone.component.react.push(() => this.directiveIf());
        }
        getAllElseDir() {
          let nxt = this.nextElementSibling;
          this.directives.ifelseBlock = nxt ? [] : null;
          while(nxt && (nxt.directives.elseIf || nxt.directives.else)) {
            this.directives.ifelseBlock.push(nxt);
            const elseDir = !!nxt.directives.else;
            nxt = nxt.nextElementSibling;
            if (elseDir && nxt && nxt.directives && (!!nxt.directives.else || !!nxt.directives.elseIf)) {
              throw new Error('[Ogone] else directive has to be the last in if-else-if blocks, no duplicate of --else are allowed.');
            }
          }
          if (this.directives.ifelseBlock) {
              for (let ond of this.directives.ifelseBlock) {
                  this.directives.dfrag.append(ond);
              }
          }
        }
        directiveIf() {
          const evl = this.ogone.directives.if;
          if (!evl) return;
          const c = this.ogone.replacer;
          const nd = this.ogone.nodes;
          const oc = this.ogone.component;
          const v = this.ogone.getContext({
            position: this.position,
            getText: evl,
          });
          let nb = null; // Onode that should replace
          const replacers = this.directives.replacers;
          if (!v && this.directives.ifelseBlock) {
            this.directives.ifelseBlock.filter((n) => !n.ogone).forEach((n) => document.body.append(n));
            for (let ond of this.directives.ifelseBlock) {
                this.directives.dfrag.append(ond);
            }
            nb = this.directives.ifelseBlock.find((n) => n.ogone && n.ogone.getContext({
                position: n.position,
                getText: n.directives.elseIf || n.directives.else || false,
            }) || (n.firstNode && n.firstNode.isConnected));
          }
          // nb && !nb.firstNode ? document.body.append(nb) : null;
          const replacer = v ? this.ogone.nodes : nb ? nb.ogone.nodes : c;
          if (replacers !== replacer) {
            let replaced = replacers.find((n) => n.isConnected);
            while(replaced) {
                replaced.replaceWith(...replacer);
                replaced = replacers.find((n) => n.isConnected);
            }
            this.directives.replacers = replacer;
          }
          return oc.activated;
        }
        get firstNode() {
          return this.ogone.nodes[0];
        }
        get lastNode() {
          const o = this.ogone.nodes;
          return o[o.length - 1];
        }
        get name() {
          return this.tagName.toLowerCase();
        }
        get extends() {
          return '${component.uuid}-${node.id}';
        }
      })
      customElements.define('${component.uuid}-${node.id}', Ogone.classes['${component.uuid}-${node.id}'], { extends: '${extensionId}' });`;
}