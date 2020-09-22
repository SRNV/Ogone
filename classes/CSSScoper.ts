import getDeepTranslation from "../utils/template-recursive.ts";

let i = 0;
function getId(type: string): string {
  i++;
  return `§§${type}${i}§§`;
}
export default class CSSScoper {
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
      // @ts-ignore
      const [input] = result.match(reg);
      const key = getId("block");
      const content = input;
      expressions[key] = content;
      result = result.replace(content, key);
    }
    const regExp = /(§{2}block\d+§{2})/gi;
    const matches = result.match(regExp);
    if (matches) {
      matches.forEach((block, i, arr) => {
        const endIndex = result.indexOf(block) + block.length;
        const previousBlock = arr[i - 1];
        let startIndex = previousBlock ? result.indexOf(
          previousBlock
        ) + previousBlock.length : 0;
        if (startIndex === endIndex || startIndex === -1) {
          startIndex = 0;
        }
        let rule = result.slice(startIndex, endIndex);
        // preserve keyframe
        while (rule.match(kReg)) {
          const [input] = rule.match(kReg);
          const key = getId("reserved");
          expressions[key] = input;
          result = result.replace(input, key);
          rule = rule.replace(input, key);
        }
      });
    }
    /*
        */
    // replace only blocks
    while (
      Object.keys(expressions).filter((k) => k.startsWith("§§block")).find((
        k,
      ) => result.indexOf(k) > -1)
    ) {
      const key = Object.keys(expressions).filter((k) =>
        k.startsWith("§§block")
      )
        .find((k) => result.indexOf(k) > -1);
      if (key) {
        const expression = expressions[key];
        result = result.replace(key, expression);
      }
    }
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
    result = this.preserve(result, expressions, ["(", ")"]);
    result = this.preserve(result, expressions, ["[", "]"]);
    // preserve all keyframe statement
    result = this.preserveRegexp(
      result,
      expressions,
      /(\@keyframes)([\s\w\d\-]*)+(§§block\d+§§)/,
    );
    // preserve all font-feature-values statement
    result = this.preserveRegexp(
      result,
      expressions,
      /(\@font-feature-values)([\s\w\d\-]*)+(§§block\d+§§)/,
    );
    // preserve all font-face statement
    result = this.preserveRegexp(
      result,
      expressions,
      /(\@font-face)([\s\w\d\-]*)+(§§block\d+§§)/,
    );
    // preserve all counter-style statement
    result = this.preserveRegexp(
      result,
      expressions,
      /(\@counter-style)([\s\w\d\-]*)+(§§block\d+§§)/,
    );
    // preserve all page statement
    result = this.preserveRegexp(
      result,
      expressions,
      /(\@page)([\s\w\d\-]*)+(§§block\d+§§)/,
    );
    // preserve pseudo elements
    result = this.preserveRegexp(
      result,
      expressions,
      /(?=(:{2}))([^\s]*)+/,
    );

    const match = result.match(/([^\{\}])+(?=\{)/gi);
    const matches = match
      ? match.filter((s) => !s.trim().startsWith("@"))
      : null;
    if (matches) {
      matches.forEach((select) => {
        // if there is a reserved/block token erase it
        let selector = select.replace(/(§{2}(reserved|block)\d+§{2})/gi, '');
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
          const savedPseudoElement = value.match(/(§§reserved\d+§§)+$/);
          value = value.replace(/(§§reserved\d+§§)+$/, "");
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
