import type { Bundle, Component, ProtocolScriptParserReturnType } from '../ogone.main.d.ts';
import useSyntaxElements from '../../utils/assets/use-syntax-elements.ts';
import linkSyntaxElements from '../../utils/assets/link-cases-syntax-elements.ts';
import requireSyntaxElements from '../../utils/assets/require-syntax-elements.ts';
import importsElements from '../../utils/esm-imports.ts';
import notParsedElements from '../../utils/not-parsed.ts';
import elements from '../../utils/elements.ts';
import read from '../../utils/agnostic-transformer.ts';
import getTypedExpressions from '../../utils/typedExpressions.ts';
import getDeepTranslation from '../../utils/template-recursive.ts';
import { Utils } from "./Utils.ts";


/**
 * @name ImportTransformer
 * @code OAP-OSB7-OC0
 * @description
 * this class should transform any reference of any imported code to a unique id
 */
export default class ImportTransformer extends Utils {
  transformCode(bundle: Bundle, component: Component, code: string): string {
    try {
      const typedExpressions = getTypedExpressions();
      const expressions = {};
      let result = read({
        typedExpressions,
        expressions,
        array: notParsedElements,
        value: code,
      });
      return result;
    } catch (err) {
      this.error(`ImportTransformer: ${err.message}`);
    }
  }
}

