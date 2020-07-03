import scopeCSS from "../../../../lib/html-this/scopeCSS.ts";
import { sassCompiler, denolusCompiler } from "../../../../deps.ts";
import { Bundle } from "../../../../.d.ts";

export default function oRenderStyles(bundle: Bundle) {
  const entries = Array.from(bundle.components.entries());
  entries.forEach(([, component]) => {
    const styles = component.rootNode.childNodes.filter((node) =>
      node.tagName === "style"
    );
    styles.forEach((element) => {
      const styleContent = element.getInnerHTML ? element.getInnerHTML() : null;
      if (styleContent) {
        let compiledCss: string = "";
        switch (element.attributes.lang) {
          case "scss":
          case "sass":
            compiledCss = sassCompiler(styleContent, {
              output_style: "compressed",
              precision: 5,
              indented_syntax: false,
              include_paths: [],
            }).result;
            break;
          case "denolus":
            compiledCss = denolusCompiler(styleContent);
            break;
          default:
            compiledCss = styleContent;
            break;
        }
        const css = scopeCSS(compiledCss, component.uuid);
        component.style.push(css);
      }
    });
  });
}
