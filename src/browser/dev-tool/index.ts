import ComponentCollectionManager from './component-collection-manager.ts';
import openDevTool from './open-dev-tool.ts';
import createSVGComponent from './function-create-svg-component.ts';
import setChildNodeAroundParent from './function-set-child-node-around-parent.ts';
import getPointAroundElementFromOrigin from './function-get-point-around-element-from-origin.ts';

export default (opts: any) => `
let devTool_window_parameters = "menubar=no,scrollbars=no,status=no,dependent=yes";

// get the figure and the container node for the representation of the component/node
${createSVGComponent(opts)}

// place a point around an other one
${getPointAroundElementFromOrigin(opts)}

// creating the arc representation of chlinodes
${setChildNodeAroundParent(opts)}

${openDevTool(opts)}
${ComponentCollectionManager(opts)}
window.addEventListener('DOMContentLoaded',() => Ogone.ComponentCollectionManager.render());
window.addEventListener('unload',() => Ogone.DevTool.close());
if (Ogone.router) {
  Ogone.router.openDevTool = () => {
    openOgoneDevTool();
    Ogone.ComponentCollectionManager.render();
    Ogone.router.devtoolIsOpen = true;
  };
}
`;