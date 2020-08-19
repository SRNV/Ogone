import { Bundle, Component } from '../../../.d.ts';
import read from '../utils/agnostic-transformer.ts';
import elements from "../utils/elements.ts";
import notParsed from "../utils/not-parsed.ts";
import { Utils } from '../../utils/index.ts';
import obviousElements from './src/elements.ts';

let i = 0;
function getId(type: string): string {
  i++;
  return `${type}${i}`;
}
type StyleBundle = {
  value: string;
  input: string;
  mapImports: Map<string, any>;
  mapSelectors: Map<string, any>;
  mapVars: Map<string, any>;
  tokens: any;
  component: Component;
}
export default class ObviousParser extends Utils {
  private expressions: { [k: string]: string } = {};
  private mapStyleBundle: Map<string, StyleBundle> = new Map();
  private getProperties(css: string, styleBundle: StyleBundle, bundle: Bundle, component: Component) {
    const result: { children: string[], props: { [k: string]: string } } = {
      children: [],
      props: {},
    };
    const { expressions } = styleBundle.tokens;
    const endExp = /(?:(§{2}(endPonctuation|endLine)\d+§{2}))/;
    const parts = css.split(endExp)
    parts
      .filter(rule => !["endPonctuation", "endLine"].includes(rule)
        && !endExp.test(rule) && rule.trim().length)
      .forEach((rule) => {
        const isChild = rule.match(/(§{2}block\d+§{2})/);
        if (isChild) {
          const [block] = isChild;
          result.children.push(rule);
        } else {
          const item = rule.split(/§{2}optionDiviser\d+§{2}/);
          if (item) {
            let [prop, value] = item;
            prop = this.templateReplacer(prop.trim(), expressions);
            result.props[prop] = this.templateReplacer(value.trim(), expressions);
          }
        }
      });
    return result;
  }
  private getRules(css: string, styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: any = {}): string {
    let result = css;
    const regExp = /(§{2}block\d+§{2})/gi;
    const matches = result.match(regExp);
    console.warn(1, css, matches);
    if (matches) {
      matches.forEach((block, i, arr) => {
        const endIndex = css.indexOf(block) + block.length;
        const previousBlock = arr[i - 1];
        let startIndex = previousBlock ? css.indexOf(
          previousBlock
        ) + previousBlock.length : 0;
        if (startIndex === endIndex || startIndex === -1) {
          startIndex = 0;
        }
        const rule = css.slice(startIndex, endIndex);
        const expressions = styleBundle.tokens.expressions;
        const typedExpressions = styleBundle.tokens.typedExpressions;
        const selector = this.templateReplacer(rule.replace(block, '').trim(), expressions);
        const style = read({
          expressions,
          typedExpressions,
          value: expressions[block]
            .trim()
            .slice(1)
            .slice(0, -1),
          array: obviousElements,
        });
        const { props: properties, children } = this.getProperties(style, styleBundle, bundle, component);
        styleBundle.mapSelectors.set(selector, {
          selector: selector,
          properties,
          parent: opts.parent ? opts.parent : null,
          children: [],
        });
        console.warn(children)
        children.forEach((child) => {
          console.warn(child)
          this.getRules(child, styleBundle, bundle, component, {
            parent: styleBundle.mapSelectors.get(selector)
          });
        })
        if (opts.parent) {
          opts.parent.children.push(
            styleBundle.mapSelectors.get(selector)
          );
        }
        result = result.replace(rule, '');
      })
    }
    console.warn(1, styleBundle.mapSelectors)
    return result;
  }
  private getUniqueId(type: string): string {
    const id = getId(type);
    return id;
  }
  private getVars(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = styleBundle.value;
    const parts = result.split(/(?:§{2}(endPonctuation|endLine)\d+§{2})/);
    const regExpVarsExported = /(@§{2}keywordExport\d+§{2})\s+(§{2}keywordConst\d+§{2}\*{0,1})\s+(\w+)+\s*(§{2}operatorsetter\d+§{2})(.*)/;
    const regExpVars = /(@§{2}keywordConst\d+§{2}\*{0,1})\s+(\w+)+\s*(§{2}operatorsetter\d+§{2})(.*)/;
    result = parts
      .map((statement) => {
        if (statement.trim().length
          && statement.trim().match('@§§keyword')) {
          const isConstant = statement.match(regExpVars);
          const isExportable = statement.match(regExpVarsExported);
          if (isExportable) {
            let [match, exportable, kConst, name, equal, value] = isExportable;
            const evaluated = kConst.trim().endsWith('*');
            if (styleBundle.mapVars.get(name)) {
              this.error(`${name} already defined.`);
            }
            styleBundle.mapVars.set(name, {
              value,
              eval: evaluated,
              isSelector: !evaluated && !!value.match(/(§§block\d+§§)$/),
              exportable: true,
            });
          } else if (isConstant) {
            let [match, kConst, name, equal, value] = isConstant;
            const evaluated = kConst.trim().endsWith('*');
            if (styleBundle.mapVars.get(name)) {
              this.error(`${name} already defined.`);
            }
            styleBundle.mapVars.set(name, {
              value,
              eval: evaluated,
              isSelector: !evaluated && !!value.match(/(§§block\d+§§)$/),
              exportable: false,
            });
          }
          return '';
        }
        if (statement === "endPonctuation" || statement === "endLine") {
          return '';
        }
        return statement;
      }).join('');
    styleBundle.value = result;
    return result;
  }
  private readRules(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = styleBundle.value;
    const regexp = /(Selector\d+)(\{)([^\{\}]*)(Selector\d+)((\{)([^\{\}]*)(\}))/;
    while (result.match(regexp)) {
      let m = result.match(regexp);
      if (m) {
        const [, parent, open, nestedStyle, child, childStyle] = m;
        result = result.replace(`${child}${childStyle}`, '');
        const item = styleBundle.mapSelectors.get(child);
        const parentItem = styleBundle.mapSelectors.get(parent);
        item.parent = parentItem;
        parentItem.childs.push(item);
        item.rawStyle = childStyle;
      }
    }
    styleBundle.value = result;
    return result;
  }
  private revertVars(styleBundle: StyleBundle, bundle: Bundle, component: Component) {
    let result = styleBundle.value;
    const entries = Array.from(styleBundle.mapVars.entries()).map(([k]) => k);
    let previousKeyId = 0;
    styleBundle.mapSelectors.forEach((item) => {
      while (entries.find((k) => item.rawStyle.indexOf(k) > -1)) {
        let key = entries.find((k) => item.rawStyle.indexOf(k) > -1);
        if (key) {
          let regexp = new RegExp(`\\${key}`, 'gi');
          const variable = styleBundle.mapVars.get(key as string);
          item.rawStyle = item.rawStyle.replace(regexp, variable.value);
          let undefinedVar = entries.find((k, i, arr) => {
            return variable.value.indexOf(k) > -1 && i > arr.indexOf(key as string);
          });
          if (undefinedVar) {
            this.error(`Style Error: ${undefinedVar} is not defined.\ninput: ${key} = ${variable.value}`);
          }
        }
      }
    });
    styleBundle.value = result;
    return result;
  }
  private setUse(styleBundle: StyleBundle, bundle: Bundle, component: Component) {
    let result = styleBundle.value;
    const regexp = /(\@§{2}keywordUse\d+§{2})\s+(§{2}string\d+§{2})\s+(§{2}keywordAs\d+§{2})\s+(\w*)+\s*(§{2}(endPonctuation|endLine)\d+§{2})/;
    while (result.match(regexp)) {
      const m = result.match(regexp);
      if (m) {
        let [input, kUse, tag, kAs, name] = m;
        tag = this.templateReplacer(tag, styleBundle.tokens.expressions)
          .replace(/["'`]/gi, '');
        styleBundle.mapImports.set(name, {
          tag,
          name,
        });
        result = result.replace(input, '');
      }
    }
    styleBundle.value = result;
    return result;
  }
  private getImports(styleBundle: StyleBundle, bundle: Bundle, component: Component) {
    styleBundle.mapImports.forEach((item) => {
      const { tag, name } = item;
      const filePath = component.imports[tag];
      const subcomp = bundle.components.get(filePath);
      if (!subcomp) {
        this.error(`${component.file}\n\tStyle Use Error while fetching component.\n\tinput: @use ${tag} as ${name}`);
      } else {
        item.bundle = this.getNewStyleBundle(
          subcomp.elements.styles.map((style) => {
            if (style.getInnerHTML) {
              return style.getInnerHTML();
            }
          }).join('\n'),
          bundle,
          subcomp,
        );
      }
    })
  }
  private async getNewStyleBundle(css: string, bundle: Bundle, component: Component): Promise<StyleBundle> {
    const styleBundle: StyleBundle = {
      input: css,
      value: css,
      mapImports: new Map(),
      mapVars: new Map(),
      mapSelectors: new Map(),
      component,
      tokens: {
        expressions: {},
        typedExpressions: {
          blocks: {},
          parentheses: {},
        }
      },
    };
    this.getTokens(styleBundle, bundle, component);
    this.setUse(styleBundle, bundle, component);
    this.getImports(styleBundle, bundle, component);
    this.getVars(styleBundle, bundle, component);
    styleBundle.value = this.getRules(styleBundle.value, styleBundle, bundle, component);
    // read rules
    this.readRules(styleBundle, bundle, component);
    // revert vars
    this.revertVars(styleBundle, bundle, component);
    return styleBundle;
  }
  public async read(css: string, bundle: Bundle, component: Component): Promise<string> {
    const styleBundle: StyleBundle = await this.getNewStyleBundle(css, bundle, component);
    console.warn(styleBundle.value)
    Deno.exit(1);
    return styleBundle.value;
  }
  private getTokens(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = styleBundle.value;
    const expressions = styleBundle.tokens.expressions;
    const typedExpressions = styleBundle.tokens.typedExpressions;
    result = read({
      expressions,
      typedExpressions,
      value: result,
      array: notParsed.concat(elements).concat(obviousElements),
    });
    styleBundle.value = result;
    return result;
  }
}
