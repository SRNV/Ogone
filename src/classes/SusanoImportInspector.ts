import type { FileBundle, ScopeBundle } from "../ogone.main.d.ts";
import esmElements from "../../utils/esm-imports.ts";
import read from "../../utils/agnostic-transformer.ts";
import SusanoRegularExpressions from "./SusanoRegExp.ts";
import { absolute } from "../../deps/deps.ts";

export default class SusanoImportInspector extends SusanoRegularExpressions {
  protected readonly mapFileBundle: Map<string, FileBundle> = new Map();
  getAllImportsExports(fileBundle: FileBundle) {
    const { root } = fileBundle;
    const exports = root.value.match(this.exportsRegExpGI);
    const imports = root.value.match(this.importsRegExpGI);
    if (imports) {
      imports.forEach((imp) => {
        read({
          value: imp,
          array: esmElements,
          typedExpressions: fileBundle.tokens.typedExpressions,
          expressions: fileBundle.tokens.expressions,
        });
      });
      const savedImportsAfterRead = Object.entries(
        fileBundle.tokens.typedExpressions.imports,
      );
      savedImportsAfterRead.forEach(([name, details]) => {
        const a = absolute(fileBundle.path, details.path);
        // TODO work on members of import
        fileBundle.mapImports.set(`${a}${Math.random()}`, details as any);
      });
    }
    if (exports) {
      exports.forEach((exp) => {
        read({
          value: exp,
          array: esmElements,
          typedExpressions: fileBundle.tokens.typedExpressions,
          expressions: fileBundle.tokens.expressions,
        });
      });
      const savedExportsAfterRead = Object.entries(
        fileBundle.tokens.typedExpressions.exports,
      );
      savedExportsAfterRead.forEach(([name, details]) => {
        const a = absolute(fileBundle.path, details.path);
        // TODO work on members of export
        fileBundle.mapExports.set(`${a}${Math.random()}`, details as any);
      });
    }
    // console.warn(fileBundle.tokens.typedExpressions.imports);
    // console.warn(fileBundle.tokens.typedExpressions.exports);
    // console.warn(1, fileBundle);
    // console.warn(fileBundle.mapImports);
    // console.warn(fileBundle.mapExports);
  }
}
