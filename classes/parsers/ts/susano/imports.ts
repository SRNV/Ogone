import { FileBundle, ScopeBundle, } from '../../../../.d.ts';
import esmElements from "../../utils/esm/index.ts";
import read from '../../utils/agnostic-transformer.ts';
import SusanoRegularExpressions from './regexps.ts';

export default class SusanoImportInspector extends SusanoRegularExpressions {
  getAllImportsExports(fileBundle: FileBundle) {
    const { root } = fileBundle;
    console.warn(`[Susano] inpsecting imports/exports of ${fileBundle.path}`);
    const exports = root.value.match(this.exportsRegExpGI);
    const imports = root.value.match(this.importsRegExpGI);
    if (imports) {
      // console.warn(imports);
      imports.forEach((imp) => {
        read({
          value: imp,
          array: esmElements,
          typedExpressions: fileBundle.tokens.typedExpressions,
          expressions: fileBundle.tokens.expressions,
        });
      })
    }
    if (exports) {
      // console.warn(exports);
      exports.forEach((exp) => {
        read({
          value: exp,
          array: esmElements,
          typedExpressions: fileBundle.tokens.typedExpressions,
          expressions: fileBundle.tokens.expressions,
        });
      })
    }
    // console.warn(fileBundle.tokens.typedExpressions.imports);
    // console.warn(fileBundle.tokens.typedExpressions.exports);
    // console.warn(fileBundle);
  }
}