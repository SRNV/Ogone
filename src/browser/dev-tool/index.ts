// @ts-nocheck
// TODO fix all types here
import ComponentCollectionManager from "./component-collection-manager.ts";
import DiagnosticsPanelManager from "./diagnostics-panel-manager.ts";

let devTool_window_parameters = "menubar=no,scrollbars=no,status=no,dependent=yes";

// get the figure and the container node for the representation of the component/node
function createSVGComponent(opts) {
  const { href, position, className, style } = opts;
  const isNotNaN = !Number.isNaN(position.x) && Number.isNaN(position.y);
  const container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const lineToParent = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  const figure = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  figure.setAttribute('href', href);
  if (isNotNaN) {
    figure.setAttribute('x', position.x);
    figure.setAttribute('y', position.y);
  }
  const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  shadow.setAttribute('href', href);
  if (isNotNaN) {
    shadow.setAttribute('x', position.x);
    shadow.setAttribute('y', position.y + 15);
  }
  function setPosition(coord) {
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

// creating the arc representation of chlinodes
function setChildNodeAroundParent(opts) {
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

// TODO replace ${DiagnosticsPanelManager(opts)}
// TODO replace ${ComponentCollectionManager(opts)}
window.addEventListener('DOMContentLoaded',() => Ogone.ComponentCollectionManager.render());
window.addEventListener('unload',() => Ogone.DevTool.close());
if (Ogone.router) {
  Ogone.router.openDevTool = () => {
    openOgoneDevTool();
    Ogone.ComponentCollectionManager.render();
    Ogone.router.devtoolIsOpen = true;
  };
}