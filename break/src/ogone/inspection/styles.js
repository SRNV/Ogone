import Ogone from '../index.ts';
import scopeCSS from '../../../lib/html-this/scopeCSS.js';

let i = 0;
export default function oRenderStyles() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([pathToComponent, component]) => {
    const styles = component.rootNode.childNodes.filter(node => node.tagName === 'style');
    styles.forEach((element) => {
      i++;
      const id = `data-${i}`;
      const css = scopeCSS(element.childNodes[0].rawText, id);
      component.uuid = id;
      component.style.push(css);
    });
  })
}