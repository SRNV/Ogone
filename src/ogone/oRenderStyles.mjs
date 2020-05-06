import uuid from 'uuid-node';
import pse from 'postcss-scopeify-everything';
import Ogone from './index.mjs';

export default function oRenderStyles() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([pathToComponent, component]) => {
    const styles = component.rootNode.childNodes.filter(node => node.tagName === 'style');
    styles.forEach((element) => {
      const id = `data-${uuid.generateUUID().split('-')[0]}`;
      const scopeify = pse.api({ elements: false, scopeifyFn: () => name => `${name}[${id}]`, });
      const getCss = pse.getCss;
      const scopeified = scopeify(element.text).sync();
      const css = getCss(scopeified);
      component.uuid = id;
      component.style.push(css);
    });
  })
}