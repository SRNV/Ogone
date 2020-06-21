import scopeCSS from "../../../../lib/html-this/scopeCSS.ts";
import { Bundle } from "../../../../.d.ts";

export default function oRenderStyles(bundle: Bundle) {
  const entries = Array.from(bundle.components.entries());
  entries.forEach(([, component]) => {
    const styles = component.rootNode.childNodes.filter((node) =>
      node.tagName === "style"
    );
    styles.forEach((element) => {
      if (element.childNodes[0].rawText) {
        const css = scopeCSS(element.childNodes[0].rawText, component.uuid);
        component.style.push(css);
      }
    });
  });
}
