import getDeepTranslation from "../../../utils/template-recursive.ts";
import { Utils } from '../Utils.ts';

let id;
function getId(type: string): string {
  id = crypto.getRandomValues(new Uint8Array(8)).join('');
  return `${type}${id}`;
}
/**
 * @name CSSScoper
 * @code OCS-OSB7-OC0
 * @description scopes the rules of component's style
 * ```ts
 *   CSSScoper.transform(cssStr: string, scopeId: string): string
 * ```
 * it returns a string with rules edited like ```div[data-xu1dg2] a[data-xu1dg2] {}```
 * this class shouldn't scope the at-rules like keyframes, media, import, etc...
 */
export default class CSSScoper extends Utils {
  private preserveRegexp(
    str: string,
    expressions: any,
    regexp: RegExp,
  ): string {
    const reg = /\{([^\{\}])*\}/;
    const kReg = regexp;
    let result = str;
    // preserve all blocks
    while (result.match(reg)) {
      this.trace('first while in preserveRegExp')
      // @ts-ignore
      const [input] = result.match(reg);
      const key = getId("block");
      const content = input;
      expressions[key] = content;
      result = result.replace(content, key);
      this.trace('end first while in preserveRegExp')

    }
    const regExp = /(block\d+)/gi;
    const matches = result.match(regExp);
    if (matches) {
      this.trace('start getting matches in preserveRegExp')

      matches.forEach((block, i, arr) => {
        this.trace('start using matches in preserveRegExp')

        const endIndex = result.indexOf(block) + block.length;
        const previousBlock = arr[i - 1];
        let startIndex = previousBlock ? result.indexOf(
          previousBlock
        ) + previousBlock.length : 0;
        if (startIndex === endIndex || startIndex === -1) {
          startIndex = 0;
        }
        let rule = result.slice(startIndex, endIndex);
        let m = rule.match(kReg);
        this.trace('before while in using matches in preserveRegExp');
        // preserve keyframe
        while (m) {
          this.trace('second while in preserveRegExp')
          const [input] = m;
          const key = getId("reserved");
          expressions[key] = input;
          result = result.replace(input, key);
          rule = rule.replace(input, key);
          m = rule.match(kReg);
        }
        this.trace('end using matches in preserveRegExp')
      });
    }
    // replace only blocks
    while (
      Object.keys(expressions).filter((k) => k.startsWith("block")).find((
        k,
      ) => result.indexOf(k) > -1)
    ) {
      this.trace('third while in preserveRegExp')

      const key = Object.keys(expressions).filter((k) =>
        k.startsWith("block")
      )
        .find((k) => result.indexOf(k) > -1);
      if (key) {
        const expression = expressions[key];
        result = result.replace(key, expression);
      }
      this.trace('end of third whie preserveRegExp')
    }
    this.trace('end of preserveRegExp')
    return result;
  }
  private preserve(str: string, expressions: any, template: string[]): string {
    let result = str;
    const splitted = result.split(template[0]).filter((s) =>
      s.indexOf(template[1]) > -1
    );
    splitted.forEach((s) => {
      let c = s.split(template[1])[0];
      const key = getId("__");
      const content = `${template[0]}${c}${template[1]}`;
      expressions[key] = content;
      result = result.replace(content, key);
    });
    return result;
  }
  public transform(cssStr: string, scopeId: string): string {
    let result: string = cssStr;
    let expressions = {};
    // preserve all attributes
    this.trace('preserving brackets');
    result = this.preserve(result, expressions, ["(", ")"]);
    result = this.preserve(result, expressions, ["[", "]"]);
    // preserve all keyframe statement
    this.trace('preserving @keyframes');

    result = this.preserveRegexp(
      result,
      expressions,
      /(\@keyframes)([\s\w\d\-]*)+(block\d+)/,
    );
    // preserve all font-feature-values statement
    this.trace('preserving @font-feature-values');

    result = this.preserveRegexp(
      result,
      expressions,
      /(\@font-feature-values)([\s\w\d\-]*)+(block\d+)/,
    );
    // preserve all font-face statement
    this.trace('preserving @font-face');

    result = this.preserveRegexp(
      result,
      expressions,
      /(\@font-face)([\s\w\d\-]*)+(block\d+)/,
    );
    // preserve all counter-style statement
    this.trace('preserving @counter-style');

    result = this.preserveRegexp(
      result,
      expressions,
      /(\@counter-style)([\s\w\d\-]*)+(block\d+)/,
    );
    // preserve all page statement
    this.trace('preserving @page');

    result = this.preserveRegexp(
      result,
      expressions,
      /(\@page)([\s\w\d\-]*)+(block\d+)/,
    );
    // preserve pseudo elements
    this.trace('preserving pseudo elements');

    result = this.preserveRegexp(
      result,
      expressions,
      /(?=(:{2}))([^\s]*)+/,
    );

    this.trace('getting selector list');
    const match = result.match(/([^\{\}])+(?=\{)/gi);
    const matches = match
      ? match.filter((s) => !s.trim().startsWith("@"))
      : null;
    if (matches) {
      matches.forEach((select) => {
        // if there is a reserved/block token erase it
        let selector = select.replace(/((reserved|block)\d+)/gi, '');
        let s = selector;
        const inputs = selector.split(/([\s,\>\<\(\)\+\:])+/gi).filter((s) =>
          s.trim().length && !s.match(/^([^a-zA-Z])$/gi)
        ).map((inp) => {
          const key = getId("k");
          s = s.replace(inp, key);
          return {
            key,
            value: inp,
          };
        });
        inputs.forEach((inp, i, arr) => {
          let { value } = inp;
          if (value.indexOf(":") > -1) {
            value = value.split(":")[0];
          }
          // for pseudo elements
          // like #id::selection
          // save ::selection which is already preserved
          const savedPseudoElement = value.match(/(reserved\d+)+$/);
          value = value.replace(/(reserved\d+)+$/, "");
          value = value.replace(
            value,
            `${value}[${scopeId}]${
            savedPseudoElement ? savedPseudoElement[0] : ""
            }`,
          );
          arr[i].value = value;
        });

        while (
          inputs.find((inp) =>
            s.indexOf(inp.key) > -1 && (s = s.replace(inp.key, inp.value))
          )
        ) {
        }
        result = result.replace(selector, s);
      });
    }
    result = getDeepTranslation(result, expressions);
    return result;
  }
}
