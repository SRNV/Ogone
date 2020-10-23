import type { Bundle, Component, ProtocolScriptParserReturnType } from '../.d.ts';
import notParsedElements from '../utils/not-parsed.ts';
import elements from '../utils/elements.ts';
import useSyntaxElements from '../utils/assets/use-syntax-elements.ts';
import linkSyntaxElements from '../utils/assets/link-cases-syntax-elements.ts';
import requireSyntaxElements from '../utils/assets/require-syntax-elements.ts';
import importsElements from '../utils/esm-imports.ts';
import read from '../utils/agnostic-transformer.ts';
import getTypedExpressions from '../utils/typedExpressions.ts';
import getDeepTranslation from '../utils/template-recursive.ts';

/**
 * @name AssetsParser
 * @code OAP-OSB7-OC0
 * @description
 * better class to parse assets of the component
 * it should parse
 * - use syntax
 * - import syntax
 * - require statement
 * - execute statement
 */
export default class AssetsParser {
  public parseUseStatement(value: string): ProtocolScriptParserReturnType {
    const result = {
      value: null,
      body: getTypedExpressions(),
    };
    const expressions = {};
    read({
      expressions,
      value,
      typedExpressions: result.body,
      array: [
        ...notParsedElements,
        ...elements,
        ...useSyntaxElements
      ],
    });
    return result;
  }
  /** should return the code with the **execute statement** transpiled */
  public transformLinkStatement(value: string): string {
    const result = {
      value: null,
      body: getTypedExpressions(),
    };
    const expressions = {};
    const newValue = read({
      expressions,
      value,
      typedExpressions: result.body,
      array: [
        ...notParsedElements,
        ...elements,
        ...linkSyntaxElements
      ],
    });
    return getDeepTranslation(newValue, expressions);
  }
  public parseImportStatement(value: string): ProtocolScriptParserReturnType {
    const result = {
      value: null,
      body: getTypedExpressions(),
    };
    const expressions = {};
    read({
      expressions,
      value,
      typedExpressions: result.body,
      array:  [
        ...notParsedElements,
        ...elements,
        ...importsElements
      ],
    });
    return result;
  }
  public parseRequireStatement(value: string): ProtocolScriptParserReturnType {
    const result = {
      value: null,
      body: getTypedExpressions(),
    };
    const expressions = {};
    read({
      expressions,
      value,
      typedExpressions: result.body,
      array:  [
        ...notParsedElements,
        ...elements,
        ...requireSyntaxElements
      ],
    });
    return result;
  }
}
