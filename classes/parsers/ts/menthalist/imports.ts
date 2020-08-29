import { FileBundle, ScopeBundle, } from '../../../../.d.ts';
import esmElements from "../../utils/esm/index.ts";
import read from '../../utils/agnostic-transformer.ts';

export default class MenthalistImportInspector {
  getAllImportsExports(fileBundle: FileBundle) {
    const { root } = fileBundle;
    console.warn(`[Menthalist] inpsecting imports/exports of ${fileBundle.path}`);
    const exportRegExp = /(§{2}keywordExport\d+§{2})(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/gi;
    const importRegExp = /(§{2}keywordImport\d+§{2})(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/gi;
    const exports = root.value.match(exportRegExp);
    const imports = root.value.match(importRegExp);
    if (exports) {
      console.warn(exports);
      exports.forEach((exp) => {
        read({
          value: exp,
          array: esmElements,
          typedExpressions: fileBundle.tokens.typedExpressions,
          expressions: fileBundle.tokens.expressions,
        });
      })
    }
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
    // console.warn(fileBundle.tokens.typedExpressions.imports);
    // console.warn(fileBundle.tokens.typedExpressions.exports);
  }
}