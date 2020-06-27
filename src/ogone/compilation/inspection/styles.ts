import scopeCSS from "../../../../lib/html-this/scopeCSS.ts";
import { sassCompiler } from "../../../../deps.ts";
import { Bundle } from "../../../../.d.ts";

export default function oRenderStyles(bundle: Bundle) {
  const entries = Array.from(bundle.components.entries());
  entries.forEach(([, component]) => {
    const styles = component.rootNode.childNodes.filter((node) =>
      node.tagName === "style"
    );
    styles.forEach((element) => {
      if (element.childNodes[0].rawText) {
        let compiledCss = element.childNodes[0].rawText;
        if(element.attributes.lang == "scss") {
          compiledCss = sassCompiler(element.childNodes[0].rawText, {
            output_style: "compressed",
            precision: 5,
            indented_syntax: false,
            include_paths: []
          }).result;
        }
        const css = scopeCSS(compiledCss, component.uuid);
        component.style.push(css);
      }
    });
  });
}
