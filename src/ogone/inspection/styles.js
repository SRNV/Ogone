import scopeCSS from "../../lib/html-this/scopeCSS.js";

export default function oRenderStyles(bundle) {
  const entries = Array.from(bundle.components.entries());
  entries.forEach(([pathToComponent, component], i) => {
    const styles = component.rootNode.childNodes.filter((node) =>
      node.tagName === "style"
    );
    styles.forEach((element) => {
      const css = scopeCSS(element.childNodes[0].rawText, component.uuid);
      component.style.push(css);
    });
  });
}
