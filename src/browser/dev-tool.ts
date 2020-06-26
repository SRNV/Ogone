import {
    OnodeComponent,
    OnodeComponentRenderOptions,
    ComponentItem,
    ComponentDescription,
  } from "../../types/component.ts";
  import { OgoneBrowser } from "../../types/ogone.ts";

  let Ogone: OgoneBrowser;
  let _this: OnodeComponent;
  function _OGONE_BROWSER_CONTEXT() {
    let devTool_window_parameters = "menubar=no,scrollbars=no,status=no,dependent=yes";
    function createSVGComponent(opts: ComponentDescription) {
      const { href, position, className, style, label = 'Undefined' } = opts;
      const isNotNaN = !Number.isNaN(position.x) && Number.isNaN(position.y);
      // @ts-ignore
      const container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      // @ts-ignore
      const lineToParent = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      // @ts-ignore
      const figure = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      figure.setAttribute('href', href);
      if (isNotNaN) {
        figure.setAttribute('x', position.x);
        figure.setAttribute('y', position.y);
      }
      // @ts-ignore
      const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      shadow.setAttribute('href', href);
      if (isNotNaN) {
        shadow.setAttribute('x', position.x);
        shadow.setAttribute('y', position.y + 15);
      }
      function setPosition(coord: any) {
        if ((!coord || Number.isNaN(coord.x)) && isNotNaN) {
          shadow.setAttribute('x', position.x);
          shadow.setAttribute('y', position.y + 15);
          figure.setAttribute('x', position.x);
          figure.setAttribute('y', position.y);
        } else if (!Number.isNaN(coord.x) && !Number.isNaN(coord.y)) {
          shadow.setAttribute('x', coord.x);
          shadow.setAttribute('y', coord.y + 15);
          figure.setAttribute('x', coord.x);
          figure.setAttribute('y', coord.y);
        }
      }
      if (className) {
        figure.setAttribute('class', className);
        shadow.setAttribute('class', className+'-shadow');
      }
      if (style) {
        figure.setAttribute('style', style);
      }
      container.append(shadow);
      container.append(figure);
      container.append(lineToParent);
      return {
        figure,
        element: container,
        setPosition,
        lineToParent,
      };
    }
    function setChildNodeAroundParent(opts: any): { x: number, y: number} {
      const { PI, round, cos, sin } = Math;
      const { parent, minRadius = 0, maxRadius = 0, child, minRadian = 0, maxRadian = PI } = opts;
      let result = {
        x: 0,
        y: 0,
      };
      let radius = minRadius * parent.childs.length;
      if (radius > maxRadius) {
        radius = maxRadius;
      } else if (radius < minRadius) {
        radius = minRadius;
      }
      let percent = (parent.childs.indexOf(child) / (parent.childs.length ? parent.childs.length - 1 : 1));
      if (Number.isNaN(percent)) {
        percent = 1;
      }
      let radian = maxRadian * percent + minRadian;
      result.x = parent.position.x + round(radius  * cos(radian));
      result.y = parent.position.y + round(radius  * sin(radian));
      return result;
    }
    function getPointAroundElementFromOrigin(opts: any): { x: number, y: number} {
      const { destination, origin, radius, decay = 0 } = opts;
      const { cos, sin, atan2 } = Math;
      let result = {
        x: 0,
        y: 0,
      };
      const rad = atan2(
        destination.y - origin.y,
        destination.x - origin.x
      ) + decay;
      result.x = destination.x + (radius * cos(rad));
      result.y = destination.y + (radius * sin(rad));
      return result;
    }
    function openOgoneDevTool() {
      // @ts-ignore
      Ogone.DevTool = window.open('', 'Ogone Dev Tool', devTool_window_parameters);
      if (!Ogone.DevTool) {
        Ogone.error('Dev Tool is blocked', 'Ogone Dev Tool has been blocked by the browser. please allow pop-up to have access to Dev Tool', {
          message: 'allow pop-up',
        });
      }
      // @ts-ignore
      Ogone.DevTool.document.title = '[Ogone] Dev Tool';
      (function() {
        // @ts-ignore
        const diagnostics = document.createElement('div');
        diagnostics.classList.add('diagnostics');
        // @ts-ignore
        const informations = new Text('[Ogone] Dev Tool');
        // @ts-ignore
        const informationsContainer = this.createElement('div');
        informationsContainer.classList.add('dev-tool-informations');
        informationsContainer.append(informations);
        // @ts-ignore
        this.body.style.background = '#424242';
        // @ts-ignore
        //@ts-ignore
        this.head.innerHTML += `
        <style>
            body {
              background: #424242;
              color: rgb(60%, 60%, 60%);
              padding: 0px;
            }
            .ogone-logo {
              position: fixed;
              z-index: -200;
              bottom: -5px;
              left: -10px;
              opacity: .4;
            }
            .dev-tool-viewer {
              position: fixed;
              z-index: 1;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              overflow: visible;
            }
            svg {
              overflow: visible;
            }
            .dev-tool-informations {
              user-select: none;
              z-index: 2;
              font-family: sans-serif;
              background: #333333;
              color: #777777;
              width: 100vw;
              position: fixed;
              left: 0;
              bottom: 0;
              padding: 5px;
            }
            .diagnostics {
              background: #333333;
              color: white;
              width: 300px;
              position: fixed;
              right: 0;
              height: 100%;
              top: 0;
              z-index: 20;
              transform: translateX(100%);
              transition: 0.5s ease;
            }
            .diagnostics-open {
              transform: translateX(0%);
              transition: 0.5s ease;
            }
            <style>
        `;
        // @ts-ignore
        this.body.innerHTML = `
        <?xml version="1.0" encoding="UTF-8"?>
        <svg class="ogone-logo" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="93pt" height="103pt" viewBox="0 0 93 103" version="1.1">
            <g id="surface1">
            <path style=" stroke:none;fill-rule:nonzero;fill:rgb(60%,60%,60%);fill-opacity:1;" d="M 41.375 7.59375 L 78.195312 47.851562 C 78.726562 48.445312 78.957031 49.265625 78.792969 50.054688 L 75.078125 67.144531 C 74.746094 68.6875 75.941406 70.167969 77.53125 70.167969 C 78.460938 70.167969 79.324219 69.640625 79.753906 68.820312 L 90.304688 48.476562 C 90.734375 47.6875 90.667969 46.703125 90.171875 45.945312 L 68.210938 13.308594 C 67.914062 12.882812 67.515625 12.554688 67.015625 12.355469 L 44.128906 3.613281 C 41.671875 2.660156 39.617188 5.652344 41.375 7.59375 Z M 41.375 7.59375 "/>
            <path style=" stroke:none;fill-rule:nonzero;fill:rgb(60%,60%,60%);fill-opacity:1;" d="M 2.996094 80.847656 L 41.011719 41.707031 C 41.574219 41.113281 41.804688 40.324219 41.671875 39.535156 L 38.457031 22.347656 C 38.15625 20.804688 39.417969 19.359375 41.011719 19.421875 C 41.9375 19.457031 42.800781 19.980469 43.199219 20.835938 L 53.152344 41.476562 C 53.550781 42.296875 53.449219 43.25 52.917969 43.972656 L 29.996094 75.917969 C 29.699219 76.347656 29.265625 76.640625 28.769531 76.839844 L 5.648438 84.925781 C 3.160156 85.777344 1.171875 82.722656 2.996094 80.847656 Z M 2.996094 80.847656 "/>
            <path style=" stroke:none;fill-rule:nonzero;fill:rgb(60%,60%,60%);fill-opacity:1;" d="M 31.058594 96.855469 L 58.390625 49.757812 C 58.789062 49.066406 58.824219 48.214844 58.492188 47.492188 L 51.195312 31.550781 C 50.53125 30.105469 51.394531 28.429688 52.953125 28.101562 C 53.878906 27.902344 54.84375 28.230469 55.441406 28.953125 L 70.136719 46.636719 C 70.699219 47.324219 70.863281 48.277344 70.53125 49.132812 L 56.070312 85.613281 C 55.871094 86.105469 55.539062 86.5 55.109375 86.796875 L 34.609375 100.171875 C 32.417969 101.621094 29.730469 99.121094 31.058594 96.855469 Z M 31.058594 96.855469 "/>
            </g>
        </svg>`;
        // @ts-ignore
        const logo = this.querySelector('.ogone-logo');
        // @ts-ignore
        const viewer = this.createElementNS('http://www.w3.org/2000/svg', 'svg');
        viewer.classList.add('dev-tool-viewer');
        // @ts-ignore
        const container = this.createElementNS('http://www.w3.org/2000/svg', 'svg');
        container.classList.add('dev-tool-container');
        let containerx = 0;
        let containery = 0;
        let actualScale = 0.4;
        viewer.style.transform = `scale(${actualScale})`;
        // keyboard control
        Ogone.DevTool.addEventListener('keydown', (ev: any) => {
          switch(true) {
            case ev.key.endsWith('Left'):
              container.setAttribute('x', containerx+=-20);
              break;
              case ev.key.endsWith('Right'):
              container.setAttribute('x', containerx+=+20);
              break;
              case ev.key.endsWith('Up'):
              container.setAttribute('y', containery+=-20);
              break;
            case ev.key.endsWith('Down'):
              container.setAttribute('y', containery+=+20);
              break;
          }
          logo.style.transform = `scale(2.2) translateX(${-containerx/50}px) translateY(${-containery/50}px)`;
        });
        // wheel control
        Ogone.DevTool.addEventListener('wheel', (ev: any) => {
          if (!ev.ctrlKey) {
            container.setAttribute('x', containerx +=+ (ev.deltaX/ 5));
            container.setAttribute('y', containery +=+ (ev.deltaY/ 5));
          } else {
            let value = actualScale +=- (ev.deltaY + ev.deltaX)/60;
            if (value >= 3) {
              actualScale = 3;
              value = 3;
            }
            if (value <= 0.1) {
              actualScale = 0.1;
              value = 0.1;
            }
            viewer.style.transform = `scale(${value})`;
          }
          informations.data = `zoom: ${actualScale}, x: ${containerx}, y: ${containery}`;
          logo.style.transform = `scale(2.2) translateX(${-containerx/50}px) translateY(${-containery/50}px)`;
        })
        // @ts-ignore
        const componentDef = this.createElementNS('http://www.w3.org/2000/svg', 'g');
        componentDef.classList.add('dev-tool-component');
        componentDef.setAttribute('id', 'component');
        // @ts-ignore
        const dynamicNodeDef = this.createElementNS('http://www.w3.org/2000/svg', 'g');
        dynamicNodeDef.classList.add('dev-tool-node');
        dynamicNodeDef.setAttribute('id', 'element');
        // @ts-ignore
        const figure = this.createElementNS('http://www.w3.org/2000/svg', 'rect');
        figure.setAttribute('rx', '7');
        figure.setAttribute('width', '50');
        figure.setAttribute('height', '50');
        figure.setAttribute('x', '0');
        figure.setAttribute('y', '0');
        // @ts-ignore
        const circle = this.createElementNS('http://www.w3.org/2000/svg', 'rect');
        circle.setAttribute('rx', '200');
        circle.setAttribute('width', '50');
        circle.setAttribute('height', '50');
        circle.setAttribute('x', '0');
        circle.setAttribute('y', '0');
        // @ts-ignore
        const style = this.createElement('style');
        style.innerHTML = `
        svg * {
            transform-origin: center;
          }
          @keyframes dash-slide {
            from {
              stroke-dashoffset: 0%;
            }
            to {
              stroke-dashoffset: 50%;
            }
          }
          @keyframes reaction {
            from {
              fill: orange;
            }
            to {
              fill: #484848;
            }
          }
          line {
            animation: dash-slide;
            animation-iteration-count: infinite;
            animation-duration: 10s;
            animation-direction: alternate;
          }
          .reaction {
            animation: reaction;
            animation-iteration-count: infinite;
            animation-duration: 0.5s;
            animation-direction: alternate;
          }
          .component {
            stroke: #61c3aa;
            stroke-width: 5px;
            fill: #484848;
          }
          .async {
            stroke: #eee47f;
            stroke-width: 5px;
            fill: #484848;
          }
          .async-shadow {
            stroke: #33291a;
            stroke-width: 5px;
            fill: #33291a;
          }
          .store {
            stroke: #b5e4ff;
            stroke-width: 10px;
            fill: #484848;
          }
          .router {
            stroke: orange;
            stroke-width: 7px;
            fill: #484848;
          }
          .component-shadow, .store-shadow, .router-shadow {
            stroke: #25423a;
            stroke-width: 5px;
            fill: #25423a;
          }
          .root {
            stroke: #b5b0fa;
            stroke-width: 5px;
            fill: #484848;
          }
          .root-shadow {
            stroke: #302f46;
            stroke-width: 5px;
            fill: #302f46;
          }
          .element {
            stroke: #333333;
            stroke-width: 5px;
            fill: #484848;
          }
          .element-shadow {
            stroke:#232323;
            stroke-width: 5px;
            fill:#232323;
          }
          .root,
          .root-shadow,
          .component,
          .component-shadow,
          .router,
          .router-shadow,
          .store,
          .store-shadow,
          .async,
          .async-shadow,
          .element,
          .element-shadow {
            cursor: pointer;
            transform-origin: center;
            stroke-linejoin: round;
            stroke-linecap: round;
          }
          .root:hover,
          .component:hover,
          .async:hover,
          .router:hover,
          .store:hover,
          .element:hover {
            fill: #686868;
          }
          line.store, line.router {
            stroke-dashoffset: 837;
            stroke-dasharray: 34;
          }
          line.component {
            stroke-width: 5;
            stroke: #61c3aa;
          }
          line.async {
            stroke-width: 5;
            stroke: #808080;
            stroke-dashoffset: 837;
            stroke-dasharray: 11;
          }
          .async.resolved {
            stroke-width: 5;
            stroke: #eee47f;
            stroke-dashoffset: 837;
            stroke-dasharray: none;
          }
          line.element {
            stroke: #999999;
          }
          `;
          // @ts-ignore
        const defs = this.createElementNS('http://www.w3.org/2000/svg', 'defs');
        componentDef.append(figure);
        dynamicNodeDef.append(circle);
        defs.append(componentDef);
        defs.append(dynamicNodeDef);
        viewer.append(style);
        viewer.append(defs);
        viewer.append(container);
        // @ts-ignore
        this.body.append(informationsContainer);
        // @ts-ignore
        this.body.append(diagnostics);
        // @ts-ignore
        this.body.append(viewer);
        Ogone.ComponentCollectionManager.container = container;
        Ogone.ComponentCollectionManager.diagnostics = diagnostics;
        Ogone.ComponentCollectionManager.informations = informations;
      }).bind(Ogone.DevTool.document)();
    }
    Ogone.ComponentCollectionManager = new (class {
      public collection: Map<string, ComponentItem>;
      public container: any;
      public informations: any;
      public isReady: boolean = false;
      constructor() {
        this.collection = new Map();
        this.container = null;
        this.informations = null;
        this.isReady = false;
      }
      getItem(key: string): ComponentItem | undefined {
          return this.collection.get(key);
      }
      read(infos: ComponentItem) {
        if (!this.collection.has(infos.key)) {
          this.subscribe(infos);
          // @ts-ignore
          if (Ogone.router.devtoolIsOpen) {
            this.update(infos.key);
          }
        } else {
          this.update(infos.key);
        }
      }
      subscribe(infos: ComponentItem) {
        let node;
        infos.childs = [];
        let parent = this.getItem(infos.parentNodeKey);
        infos.position = {
          x: 0,
          y: 0,
          delta: 0,
        };
        if (infos.type === 'root') {
          infos.position = {
            x: (720/2),
            y: 50,
          };
          node = createSVGComponent({
            href: '#component',
            position: infos.position,
            className: infos.type,
            label: infos.name || 'Root-Component',
          });
        } else if (infos.type !== 'element') {
          node = createSVGComponent({
            href: '#component',
            position: infos.position,
            className: infos.type,
            label: infos.name || 'Root-Component',
          });
        } else {
          node = createSVGComponent({
            href: '#element',
            position: infos.position,
            className: infos.type,
            label: infos.name,
          });
        }
        const item: ComponentItem = {
            ...infos,
            parent,
            // @ts-ignore
            node,
        };
        this.collection.set(item.key, item);
        if (parent) {
          parent.childs.push(item);
        }
        this.saveReaction(item.key);
      }
      saveReaction(key: string): void {
        const item: ComponentItem | undefined = this.getItem(key);
        if (item && item.ctx && item.node) {
          let timeout: any;
          item.ctx.react.push(() => {
            if (item.node) {
              // @ts-ignore
              clearTimeout(timeout);
              // @ts-ignore
              item.node.figure.classList.add('reaction');
              timeout = setTimeout(() => {
                // @ts-ignore
                item.node.figure.classList.remove('reaction');
              }, 1000);
            }
            return item.node && this.collection.has(item.key);
          })

        }
      }
      update(key: string): void {
        const item: ComponentItem | undefined = this.getItem(key);
        if (item && item.node) {
          Ogone.ComponentCollectionManager.render();
        }
      }
      render() {
        const collection = Array.from(this.collection);
        const { PI, sin, cos, round, atan2 } = Math;
        collection.forEach(([,item]) => {
          let parent = item.parent;
          if (parent && parent.position && !parent.parent) {
            const { x, y } = setChildNodeAroundParent({
              parent,
              minRadius: 90,
              maxRadius: 1000,
              maxRadian: PI,
              child: item,
            });
            item.position.x = x;
            item.position.y = y;
            item.position.delta = parent.position.delta as number;
          }
          if (item.node) {
            if (this.container && !this.container.contains(item.node.element)) {
              this.container.append(item.node.element);
              // @ts-ignore
              item.node.element.addEventListener('mouseover', () => {
                this.informations.data = `${item.type}: ${item.name} - id: ${item.key} parent: ${item.parentNodeKey}`;
              });
              // @ts-ignore
              item.node.element.addEventListener('dblclick', () => {
                // @ts-ignore
                this.diagnostics.classList.toggle('diagnostics-open');
              });
            }
            item.node.setPosition(item.position);
          }
        });
        function orientItem(item: ComponentItem) {
          if (item.parent && item.parent.parent) {
            const parent = item.parent;
            const greatParent = item.parent.parent;
            const rad = atan2(
              parent.position.y - greatParent.position.y,
              parent.position.x - greatParent.position.x,
            );
            const radDecay = ((PI * 0.12) * (parent.childs.length));
            const { x, y } = setChildNodeAroundParent({
              parent,
              minRadius: 90 + (60 * item.childs.length),
              maxRadius: 1000 + (60 * item.childs.length),
              minRadian: rad * 2/3,
              maxRadian: PI - (PI - rad/2),
              child: item,
            });
            item.position.x = x;
            item.position.y = y;
            item.position.delta = parent.position.delta as number;
          }
          if (item.node) {
            item.node.setPosition(item.position);
          }
        }
        collection.forEach(([, item]) => {
          if (item.childs.length) {
            item.childs.forEach((c) => {
              orientItem(c)
            })
          }
          orientItem(item);
        });
        collection.forEach(([, item]) => {
          let parent = item.parent;
          if (item.node && parent) {
            const pointAroundParent = getPointAroundElementFromOrigin({
              destination: parent.position,
              origin: item.position,
              radius: 70,
              decay: PI,
            });
            const pointAroundChild = getPointAroundElementFromOrigin({
              origin: parent.position,
              destination: item.position,
              radius: 70,
              decay: PI,
            });
            if (!(Number.isNaN(pointAroundChild.x) && Number.isNaN(pointAroundChild.y))) {
              item.node.lineToParent.setAttribute('x1', pointAroundChild.x + 50/2);
              item.node.lineToParent.setAttribute('y1', pointAroundChild.y + 50/2);
            }
            if (!(Number.isNaN(pointAroundParent.x) && Number.isNaN(pointAroundParent.y))) {
              item.node.lineToParent.setAttribute('x2', pointAroundParent.x + 50/2);
              item.node.lineToParent.setAttribute('y2', pointAroundParent.y + 50/2);
            }
            item.node.lineToParent.classList.add(item.type);
          }
        })
        this.isReady = true;
      }
      destroy(key: string) {
        const item = this.getItem(key);

        if (item && item.node && item.node.element) {
          // @ts-ignore
          item.node.element.remove();
          // @ts-ignore
          item.node.figure.remove();
        }
        if (item && item.childs.length) {
          item.childs.forEach((c, i, arr) => {
            this.destroy(c.key)
          });
          item.childs.splice(0);
          let parent = this.getItem(item.parentNodeKey ? item.parentNodeKey : '');
          if (!parent && item.parentCTX) {
            parent = this.getItem(item.parentCTX.key as string);
          }
          if (parent) {
            parent.childs.splice(
              parent.childs.indexOf(item),
              1
            );
          }
        }

        this.collection.delete(key);
      }
  })()
  window.addEventListener('DOMContentLoaded',() => Ogone.ComponentCollectionManager.render());
  if (Ogone.router) {
    Ogone.router.openDevTool = () => {
      openOgoneDevTool();
      Ogone.ComponentCollectionManager.render();
      // @ts-ignore
      Ogone.router.devtoolIsOpen = true;
    };
  }
  }
  export default _OGONE_BROWSER_CONTEXT.toString()
    .replace(/_this/gi, "this")
    .replace("function _OGONE_BROWSER_CONTEXT() {", "")
    .slice(0, -1);
