import { Bundle, Component, StyleBundle } from '../../../../../.d.ts';
import read from '../../../utils/agnostic-transformer.ts';
import { Utils } from '../../../../utils/index.ts';
import elements from "../../../utils/elements.ts";
import notParsed from "../../../utils/not-parsed.ts";
import obviousElements from '../../src/elements.ts';


export default class ObviousParser extends Utils {
  protected getValueOf(variable: { value: string, eval: boolean, isSelector: boolean, exportable: boolean }, styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: any) {
    const { value, eval: evaluated } = variable;
    let result = this.templateReplacer(value, styleBundle.tokens.expressions);
    const imports = Object.fromEntries(
      styleBundle.mapImports.entries()
    );
    if (evaluated) {
      const keys = Object.keys(imports);
      const proxies = Object.values(imports);
      console.warn(keys, imports.Component.bundle.mapVars.get('rule'))
    }
    return result;
  }
  protected getProperties(css: string, styleBundle: StyleBundle, bundle: Bundle, component: Component) {
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
        const isSpread = rule.match(/(§{2}spread\d+§{2})/);
        if (isChild) {
          const [block] = isChild;
          result.children.push(rule);
        } else if (isSpread) {
          console.warn('spread');
        } else {
          const item = rule.split(/§{2}optionDiviser\d+§{2}/);
          if (item) {
            let [prop, value] = item;
            let realValue = this.templateReplacer(value.trim(), expressions);
            prop = this.templateReplacer(prop.trim(), expressions);
            result.props[prop] = realValue;
            const regReference = /@([^\s]*)+/;
            const regVars = /(?<!\-{2})\$([^\s]*)+/;
            const vars = Object.fromEntries(
              styleBundle.mapVars.entries()
            );
            while (result.props[prop].match(regReference)) {
              const m = result.props[prop].match(regReference)
              if (m) {
                const [, ref] = m;
                if (!result.props[ref]) {
                  this.error(`${component.file}\n\tStyle error:\n\tcan't find value of property ${ref}.\n\tif it's defined, please place it before the property ${prop}.\n\tinput: ${prop}: ${realValue}`)
                }
                result.props[prop] = result.props[prop].replace(`@${ref}`, result.props[ref]);
              }
            }
            while (result.props[prop].match(regVars)) {
              const m = result.props[prop].match(regVars)
              if (m) {
                const [, ref] = m;
                const variableValue = this.getValueOf(vars[ref], styleBundle, bundle, component, {
                  context: 'value',
                });
                if (!variableValue) {
                  this.error(`${component.file}\n\tStyle error:\n\t${ref} is undefined.\n\tinput: ${prop}: ${realValue}`)
                }
                result.props[prop] = result.props[prop].replace(`$${ref}`, variableValue);
              }
            }
          }
        }
      });
    return result;
  }
  protected getRules(css: string, styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: any = {}): any {
    let result = css;
    const rules: any[] = [];
    const regExp = /(§{2}block\d+§{2})/gi;
    const matches = result.match(regExp);
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
        let selector = this.templateReplacer(rule.replace(block, '').trim(), expressions);
        if (opts.parent) {
          selector = `${opts.parent.selector} ${selector}`;
          selector = selector.replace(/&/gi, opts.parent.selector);
        }
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
          selector,
          properties,
          parent: opts.parent ? opts.parent : null,
          children: [],
        });
        children.forEach((child) => {
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
        rules.push(styleBundle.mapSelectors.get(selector))
      })
    }
    return {
      rules,
      value: result,
    };
  }
  protected getTokens(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
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