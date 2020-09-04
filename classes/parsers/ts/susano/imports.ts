import { FileBundle, ScopeBundle, } from '../../../../.d.ts';
import esmElements from "../../utils/esm/index.ts";
import read from '../../utils/agnostic-transformer.ts';
import SusanoRegularExpressions from './regexps.ts';
import { absolute } from '../../../../deps.ts';

export default class SusanoImportInspector extends SusanoRegularExpressions {
  getAllImportsExports(fileBundle: FileBundle) {
    const { root } = fileBundle;
    console.warn(`[Susano] inpsecting imports/exports of ${fileBundle.path}`);
    const exports = root.value.match(this.exportsRegExpGI);
    const imports = root.value.match(this.importsRegExpGI);
    if (imports) {
      // console.warn(imports);
      imports.forEach((imp) => {
        console.warn(imp)
        read({
          value: imp,
          array: esmElements,
          typedExpressions: fileBundle.tokens.typedExpressions,
          expressions: fileBundle.tokens.expressions,
        });
      });
      const savedImportsAfterRead = Object.entries(fileBundle.tokens.typedExpressions.imports);
      savedImportsAfterRead.forEach(([name, details]) => {
        const a = absolute(fileBundle.baseUrl, details.path);
        // TODO work on members of import
        fileBundle.mapImports.set(a, details as any);
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
      const savedExportsAfterRead = Object.entries(fileBundle.tokens.typedExpressions.exports);
      savedExportsAfterRead.forEach(([name, details]) => {
        const a = absolute(fileBundle.baseUrl, details.path);
        // TODO work on members of export
        fileBundle.mapExports.set(a, details as any);
      });
    }
    // console.warn(fileBundle.tokens.typedExpressions.imports);
    // console.warn(fileBundle.tokens.typedExpressions.exports);
    // console.warn(1, fileBundle);
    console.warn(fileBundle.mapImports);
    console.warn(fileBundle.mapExports);
  }
}