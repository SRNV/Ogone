import gen from "./src/generator.ts";
import { YAML } from "../../../deps.ts";
import getTypedExpression from "./src/typedExpressions.ts";
import elements from "./src/elements.ts";
import computedExp from "./src/computed.ts";
import esmElements from "./src/esm.ts";
import cjsElements from "./src/cjsElements.ts";
import notParsedElements from "./src/not-parsed.ts";
import O3Elements from "./src/o3-elements.ts";
import before from "./src/render/before-case.ts";
import templateReplacer from "../../../utils/template-recursive.ts";
import { Utils } from "../../utils/index.ts";
import { TypedExpressions, CustomScriptRegExpProtocol } from "../../../.d.ts";

interface CustomScriptParserReturnType {
  value: any;
  body: any;
}
interface CustomScriptParserOptions {
  data?: boolean;
  parseCases?: boolean;
  befores?: boolean;
  cjs?: boolean;
  esm?: boolean;
  reactivity?: boolean;
  onlyDeclarations?: boolean;
  casesAreLinkables?: boolean;
} /**
 * class to parse custom script for Ogone
 * this class will parse the setters statements
 * and add some features like: reflections, execute default, before-each statement, def's Area
 */

export default class CustomScriptParser extends Utils {
  private parseCases(opts: {
    typedExpressions: TypedExpressions;
    expressions: any;
    value: string;
  }): string {
    const { value, typedExpressions, expressions } = opts;
    let str2: string = value;
    let result: string[] | null;
    const reg: RegExp = /(?<=(case\s*))(([^\:]*)+)(?=:)/gi;
    // preserve truth
    // is required because (0 ? 0 : 1)
    const regT: RegExp = /\?([^\:]*)+:/;

    while (str2.match(regT)) {
      const match = str2.match(regT);
      if (match) {
        const [input, point, value] = match;
        const key = `§§leftMemberTern${gen.next().value}§§`;
        expressions[key] = input;
        str2 = str2.replace(input, key);
      }
    }
    // get the matching cases
    result = str2.match(reg);
    if (result) {
      result = result.map((s) => {
        let sr = s;
        sr = templateReplacer(sr, expressions).trim();
        return sr;
      });
      typedExpressions.switch.cases.push(...result);
    }
    typedExpressions.switch.default = !!str2.match(/default([\s\n])*\:/);
    return str2;
  }
  private getDefinitionsArea(opts: {
    typedExpressions: TypedExpressions;
    expressions: any;
    value: string;
  }) {
    const { value, typedExpressions, expressions } = opts;
    let result = value;
    const matches = value
      .replace(/([\'\"\`])([^\1]*)+(\1)/gi, "")
      .match(/([^\n\r]+){0,1}(def\s*:)/gi);
    let previousDeclaration: string[] = [];
    if (matches) {
      matches.forEach((dec) => {
        if (previousDeclaration.includes(dec.replace(/\s/gi, "").trim())) {
          this.error(
            'double declaration of "def:" in component',
          );
        }
        previousDeclaration.push(dec.replace(/\s/gi, "").trim());
        return;
      });
    }
    /**
     * TODO
     * parse when def: is inside a quote ['`"]
     */
    const p = value.split(/(def|case[^:]+|default|before\s*[^:]+)\s*\:/gi);
    let data = p.find((el: string, i: number, arr: string[]) =>
      arr[i - 1] && arr[i - 1] === "def"
    );
    if (!data) return result;
    let def = p.find((el: string, i: number, arr: string[]) =>
      arr[i + 1] && arr[i + 1] === data
    );
    let previous = data;
    data = templateReplacer(data, expressions);
    const declaration = `${def}:${previous}`;
    const yaml = YAML.parse(data, {});
    result = result.replace(declaration, "");
    typedExpressions.data = yaml;
    return result;
  }
  private transformSetStatements(opts: {
    typedExpressions: TypedExpressions;
    expressions: any;
    value: string;
  }) {
    const {
      typedExpressions,
      expressions,
      value,
    } = opts;
    let result = value;
    const reg = /(§§keywordThis\d+§§)\s*(§§(identifier||array)\d+§§)/gi;
    const matches = result.match(reg);
    if (!matches) return result;
    matches.forEach((input) => {
      const match = input.match(
        /(§§keywordThis\d+§§)\s*(§§(identifier||array)\d+§§)/,
      );
      if (match) {
        const key = match[2];
        const value = expressions[key];
        typedExpressions.setters[key] = value;
      }
    });
    return result;
  }
  private setInvalidations(opts: {
    typedExpressions: TypedExpressions;
    expressions: any;
    value: string;
  }) {
    const { value, typedExpressions, expressions } = opts;
    let result = value.replace(
      /(chainedLine\d*§{2})\s*(§{2}keyword)/gi,
      "$1§§endExpression0§§$2",
    )
      .replace(/(§{2})(\})/gi, "$1§§endExpression0§§$2");
    result.split(/(§{2}(endLine|endPonctuation|endExpression)\d+§{2})/gi)
      .filter((exp) => {
        return exp.length && exp.indexOf("endLine") < 0 && (
          exp.indexOf("operatorsetter") > -1 ||
          exp.indexOf("operatorDoubleIncrease") > -1 ||
          exp.indexOf("operatorDoubleDecrease") > -1 ||
          exp.match(
            /(§{2}keywordThis\d*§{2})\s*(§{2}identifier\d*§{2})\s*(§{2}chainedLine\d*§{2})+/,
          ) ||
          exp.match(
            /(§{2}keywordThis\d*§{2})\s*(§{2}identifier\d*§{2})\s*(§{2}arrayModifier\d*§{2})+/,
          ) ||
          (exp.indexOf("arrayModifier") > -1 && exp.indexOf("keywordThis") > -1)
        );
      })
      .map((exp) => {
        const key = Object.keys(typedExpressions.setters).find((key) =>
          exp.indexOf(key) > -1
        );
        if (!key) return;
        const name = key && key.startsWith("§§array")
          ? key
          : `'${expressions[key].replace(/(§{2}ponctuation\d*§{2})/, "")}'` ||
          "";
        result = result.replace(
          exp,
          `${exp.replace(/(§§endPonctuation\d+§§)$/, "")}; ____(${name}, this)`,
        );
      });
    return result;
  }
  public read(
    opts: {
      typedExpressions: TypedExpressions;
      expressions: any;
      value: string;
      name?: string;
      array: CustomScriptRegExpProtocol;
      before?: (str: string) => string;
    },
  ) {
    const {
      typedExpressions,
      expressions,
      value,
      name,
      array,
      before,
    } = opts;
    let result: string = before ? before(value) : value;
    array.forEach((item) => {
      if (name && !item.name) return;
      if (name && item.name && name !== item.name) return;
      if (item.open && item.close && item.id) {
        while (
          // we need to parse if the character is alone or not
          // no need to change it if it's not
          !((result.split(item.open as string).length - 1) % 2) &&
          result.indexOf(item.open as string) > -1 &&
          result.indexOf(item.close as string) > -1 &&
          result.match(item.reg as RegExp)
        ) {
          const matches = result.match(item.reg as RegExp);
          const value = matches ? matches[0] : null;
          if (matches && value) {
            result = result.replace(
              item.reg as RegExp,
              item.id(value, matches, typedExpressions, expressions),
            );
          }
        }
        return;
      }
      if (item.open === false && item.close === false && item.id) {
        while (result.match(item.reg as RegExp)) {
          const matches = result.match(item.reg as RegExp);
          const value = matches ? matches[0] : null;
          if (matches && value) {
            result = result.replace(
              item.reg as RegExp,
              item.id(value, matches, typedExpressions, expressions),
            );
          }
        }
      }
      if (item.split && item.splittedId) {
        while (
          result.indexOf(item.split[0]) > -1 &&
          result.indexOf(item.split[1]) > -1
        ) {
          const exp: string = result.split(item.split[0])[1];
          const all = `${item.split[0]}${exp.split(item.split[1])[0]}${
            item.split[1]
            }`;
          result = result.replace(
            all,
            item.splittedId(result, expressions),
          );
        }
      }
    });
    return result;
  }
  public parse(
    str: string,
    opts: CustomScriptParserOptions,
  ): CustomScriptParserReturnType {
    let typedExpressions = getTypedExpression();
    let expressions = {
      "§§endExpression0§§": "\n",
    };
    let prog = `\n${str}`;
    prog = this.read({
      array: notParsedElements,
      expressions,
      value: prog,
      typedExpressions,
    });
    if (prog.indexOf("def:") > -1 && opts && opts.data === true) {
      prog = this.getDefinitionsArea({ typedExpressions, expressions, value: prog });
    }
    if (opts && opts.parseCases) {
      prog = this.read({
        array: elements,
        name: "block",
        value: prog,
        typedExpressions,
        expressions,
        before: (str) =>
          str.replace(/\}/gi, "\n}").replace(/(\{)(\w)/, "$1\n$2"),
      });
      prog = this.read({
        array: elements,
        name: "parentheses",
        value: prog,
        typedExpressions,
        expressions,
        before: (str) =>
          str.replace(/\}/gi, "\n}").replace(/(\{)(\w)/, "$1\n$2"),
      });
      prog = this.parseCases({ typedExpressions, expressions, value: prog });
      // we return directly cause parseCases impact the other parsing algos
      return {
        value: prog,
        body: typedExpressions,
      };
    }
    if (opts && opts.befores) {
      prog = before(typedExpressions, expressions, prog);
    }
    prog = this.read({
      array: elements,
      value: prog,
      typedExpressions,
      expressions,
      before: (str) => str.replace(/\}/gi, "\n}").replace(/(\{)(\w)/, "$1\n$2"),
    });
    if (opts && opts.cjs) {
      prog = this.read({
        array: cjsElements,
        value: prog,
        typedExpressions,
        expressions,
        before: (str) =>
          str.replace(/\}/gi, "\n}").replace(/(\{)(\w)/, "$1\n$2"),
      });
    }

    if (opts && opts.esm) {
      prog = this.read({
        array: esmElements,
        value: prog,
        typedExpressions,
        expressions,
      });
    }
    if (opts && opts.onlyDeclarations) {
      prog = this.read(
        {
          typedExpressions,
          expressions,
          array: O3Elements,
          value: prog,
          name: "declarations",
        },
      );
      return {
        value: prog,
        body: typedExpressions,
      };
    }
    if (opts && opts.reactivity) {
      prog = this.read({
        array: esmElements,
        value: prog,
        typedExpressions,
        expressions,
      });
      prog = this.transformSetStatements(
        { typedExpressions, expressions, value: prog },
      );
      prog = this.setInvalidations(
        { typedExpressions, expressions, value: prog },
      );
      if (opts.casesAreLinkables) {
        // let the developper use 'run case' feature
        prog = this.read(
          {
            array: O3Elements,
            typedExpressions,
            expressions,
            value: prog,
            name: "linkCases",
          },
        );
      }
    }

    // update blocks and parentheses

    Object.entries(typedExpressions.parentheses).forEach(([key, value]) => {
      typedExpressions.parentheses[key] = this.read({
        array: elements,
        name: "block",
        value,
        typedExpressions,
        expressions,
        before: (str) =>
          str.replace(/\}/gi, "\n}").replace(/(\{)(\w)/, "$1\n$2"),
      });
      if (opts && opts.cjs) {
        typedExpressions.parentheses[key] = this.read({
          array: cjsElements,
          value: typedExpressions.parentheses[key],
          typedExpressions,
          expressions,
          before: (str) =>
            str.replace(/\}/gi, "\n}").replace(/(\{)(\w)/, "$1\n$2"),
        });
      }

      if (opts && opts.esm) {
        typedExpressions.parentheses[key] = this.read({
          array: esmElements,
          value: typedExpressions.parentheses[key],
          typedExpressions,
          expressions,
        });
      }
      if (opts.reactivity) {
        typedExpressions.parentheses[key] = this.read({
          array: computedExp,
          value: typedExpressions.parentheses[key],
          typedExpressions,
          expressions,
        });
        typedExpressions.parentheses[key] = this.transformSetStatements({
          typedExpressions,
          expressions,
          value: typedExpressions.parentheses[key],
        });
        typedExpressions.parentheses[key] = this.setInvalidations(
          {
            typedExpressions,
            expressions,
            value: typedExpressions.parentheses[key],
          },
        );
        if (opts.casesAreLinkables) {
          // let the developper use 'run case' feature
          typedExpressions.parentheses[key] = this.read(
            {
              typedExpressions,
              expressions,
              array: O3Elements,
              value: typedExpressions.parentheses[key],
              name: "linkCases",
            },
          );
        }
      }
    });
    Object.entries(typedExpressions.blocks).forEach(([key, value]) => {
      typedExpressions.blocks[key] = this.read(
        {
          typedExpressions,
          expressions,
          array: elements,
          value,
          name: "endLine",
        },
      );
      if (opts && opts.cjs) {
        typedExpressions.blocks[key] = this.read(
          {
            typedExpressions,
            expressions,
            array: cjsElements,
            value: typedExpressions.blocks[key],
          },
        );
      }

      if (opts && opts.esm) {
        typedExpressions.blocks[key] = this.read({
          array: esmElements,
          value: typedExpressions.blocks[key],
          typedExpressions,
          expressions,
        });
      }
      if (opts.reactivity) {
        typedExpressions.blocks[key] = this.read({
          array: computedExp,
          value: typedExpressions.blocks[key],
          typedExpressions,
          expressions,
        });
        typedExpressions.blocks[key] = this.transformSetStatements({
          typedExpressions,
          expressions,
          value: typedExpressions.blocks[key],
        });
        typedExpressions.blocks[key] = this.setInvalidations(
          {
            typedExpressions,
            expressions,
            value: typedExpressions.blocks[key],
          },
        );
        if (opts.casesAreLinkables) {
          // let the developper use 'run case' feature
          typedExpressions.blocks[key] = this.read(
            {
              typedExpressions,
              expressions,
              array: O3Elements,
              value: typedExpressions.blocks[key],
              name: "linkCases",
            },
          );
        }
      }
    });

    Object.entries(typedExpressions).forEach(([key, value]) => {
      // @ts-ignore
      Object.entries(typedExpressions[key]).forEach(([key2, value2]) => {
        if (
          ![
            "properties",
            "use",
            "data",
            "imports",
            "exports",
            "require",
            "switch",
            "reflections",
          ]
            .includes(key)
        ) {
          // dont set expressions for Ogone tools
          // @ts-ignore

          expressions[key2] = value2;
        }
      });
    });
    // finally replace all keys
    prog = templateReplacer(prog, expressions);
    return {
      value: prog,
      body: typedExpressions,
    };
  }
}
