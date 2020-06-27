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
        let compiledCss: string = "";
        switch (element.attributes.lang) {
          case "scss":
          case "sass":
            compiledCss = sassCompiler(element.childNodes[0].rawText, {
              output_style: "compressed",
              precision: 5,
              indented_syntax: false,
              include_paths: []
            }).result;
            break;
          default:
            compiledCss = element.childNodes[0].rawText;
            break;
        }
        const css = scopeCSS(compiledCss, component.uuid);
        component.style.push(css);
      }
    });
  });
}
