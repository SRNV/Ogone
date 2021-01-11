import type { Bundle, Component, StyleBundle } from '../../.d.ts';
import read from '../../../utils/agnostic-transformer.ts';
import { Utils } from '../Utils.ts';
import elements from "../../../utils/elements.ts";
import notParsed from "../../../utils/not-parsed.ts";
import styleElements from '../../../utils/elements.ts';

// TODO needs more explications on the process
/**
 * @name StyleParser
 * @code OOP1-OSB7-OC0
 * @description this class will help parsing tokens and apply regexp
 */
export default class StyleParser extends Utils {
  protected regularAtRules: RegExp = /^(\@(import|namespace|charset))/i;
  protected nestedAtRules: RegExp = /^(\@(media|keyframes|supports|document))\b/i;
  public readonly mapStyleBundle: Map<string, StyleBundle> = new Map();

  protected getContextRecursive(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: any): string {
    let result = opts && opts.imported ? `(() => {` : '';
    const { expressions } = styleBundle.tokens;
    const varEntries = Array.from(styleBundle.mapVars.entries());
    styleBundle.mapImports.forEach((item) => {
      const { name } = item;
      result += `\nconst $${name} = ${this.getContextRecursive(item.bundle, bundle, component, {
        imported: true,
      })};`;
    });
    varEntries.forEach(([key, item]) => {
      switch (true) {
        case item.eval:
          result += `\nconst $${key} = typeof ${item.value} === "string" ? ${item.value} :
            typeof ${item.value} === "function" ? ${item.value}() : eval(${item.value});`;
          break;
        case !item.eval && typeof item.value === "string":
          result += `\nconst $${key} = "${item.value}";\n`;
          break;
        case item.isSelector:
          result += `\nconst $${key} = $$target;\n`;
          break;
      }
    });
    if (opts && opts.imported) {
      let exported = '{';
      varEntries.filter(([, item]) => item.exportable)
        .map(([key]) => {
          exported += `${key}: $${key},`;
        })
      exported += '}';
      result += `\nreturn (${exported}); })()`;
    } else {
      result += `
        if ('{% context %}' === 'spread' && ($$target ? $$target : {% subject %})) {
          const _target = ($$target ? $$target : {% subject %});
          if (!_target.value || !_target.value[0] || !_target.value[0].children) {
            this.error(\`{% component.file %}\n\tError in style of Component: {% subject.trim() %} is not a rule.\n\tyou're getting this error cause you're trying to spread a non-rule value\n\tcant spread it inside another one\n\tinput: ...{% subject.trim() %}\`);
          }
          $$item.children = [
              ...$$item.children,
              ..._target.value[0].children,
            ];
          $$item.props = {
            ...$$item.props,
            ..._target.value[0].properties.props,
          };
        }
        if ('{% context %}' === 'value') {
          return {% subject %};
        }
      `;
    }
    return this.getDeepTranslation(result, expressions);
  }
  protected getValueOf(variable: { value: string, eval: boolean, isSelector: boolean, exportable: boolean }, styleBundle: StyleBundle, bundle: Bundle, component: Component, opts?: any) {
    const { value } = variable;
    const { expressions } = styleBundle.tokens;
    let result = this.getDeepTranslation(value, expressions);
    const imports = Object.fromEntries(
      styleBundle.mapImports.entries()
    );
    const names = Object.keys(imports);
    names.forEach((name) => {
      const componentsRegExp = new RegExp(`(\\$${name})(\.([\\w\\d\\_\\-]*)+)*`);
      const m = result.match(componentsRegExp);
      if (m) {
        const [match, nameOfComponent] = m;
        const functionBody = this.template(
          this.getContextRecursive(styleBundle, bundle, component),
          {
            context: 'value',
            subject: match,
            component,
          }
        );
        const renderContext = new Function('$$item', '$$target', functionBody).bind(this);
        const newValue = renderContext(result,
          styleBundle.mapImports.get(nameOfComponent.replace(/^\$/, ''))
        );
        result = result.replace(match, newValue);
      }
    })
    return result;
  }
  protected getProperties(css: string, styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: { selector: string }) {
    const result: { children: string[], props: { [k: string]: string } } = {
      children: [],
      props: {},
    };
    const { expressions } = styleBundle.tokens;
    const endExp = /(?:;\n*(?=(?:\s+(?:.+?)\s*\:)|(?=(?:.+?)\d+_block)))/;
    const parts = css.split(endExp)
    parts
      .filter(rule => rule && rule.trim().length)
      .forEach((rule) => {
        const isChild = rule.match(/(\d+_block)/);
        const isSpread = rule.match(/(\.{3})(.*)/);
        if (isChild) {
          const [block] = isChild;
          result.children.push(rule);
        } else if (isSpread) {
          // spread of rules
          let [, , variable] = isSpread;
          variable = this.getDeepTranslation(variable, expressions)
            .replace(/(\;)$/, '');
          const functionBody = this.template(
            this.getContextRecursive(styleBundle, bundle, component),
            {
              context: 'spread',
              subject: variable,
              component,
            }
          );
          const renderContext = new Function('$$item', '$$target', functionBody).bind(this);
          const target = this.getComponentContext(styleBundle, bundle, component, { variable })
          || styleBundle.mapVars.get(variable.replace(/^\$/, ''))
          renderContext(result, target);
        } else {
          const item = rule.split(/\:/);
          if (item) {
            let [prop, value] = item;
            if (value) {
              let realValue = this.getDeepTranslation(value.trim(), expressions);
              prop = this.getDeepTranslation(prop.trim(), expressions);
              result.props[prop] = realValue;
              const regReference = /@([\w\_\-]*)+/;
              const regVars = /(?<!\-{2})\$(\w*)+/;
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
        }
      });
    styleBundle.mapSelectors.get(opts.selector).properties = result;
    return result;
  }
  protected getComponentContext(styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: { variable: string } = { variable: '' }) {
    if (opts) {
      const text = opts.variable;
      const entries = Array.from(styleBundle.mapImports.entries());
      const usedComponent = entries.find(([name]) => text.startsWith(`$${name}.`));
      if (usedComponent && usedComponent[1].bundle) {
        const { mapVars } = usedComponent[1].bundle;
        const entriesMapVars = Array.from(mapVars.entries()) as [string, any][];
        const usedVar = entriesMapVars.find(([name]) => text.endsWith(`$${usedComponent[0]}.${name}`));
        return usedVar && usedVar[1];
      }
    }

  }
  static isNotSpecial(selector: string): boolean {
    const special = [
      "@media",
      "@keyframes",
      "@font-face",
      "@supports",
      "@font-feature-values",
      "@counter-style",
      "@page",
      "@document"
    ];
    let result = !special.find((r) => selector.trim().startsWith(r));
    return result;
  }
  protected getRules(css: string, styleBundle: StyleBundle, bundle: Bundle, component: Component, opts: any = {}): any {
    let result = css;
    if (typeof result !== "string") {
      return;
    }
    const rules: any[] = [];
    const regExp = /(\d+_block)/gi;
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
        const isKeyframes = rule.trim().startsWith("@keyframes");
        const isMedia = rule.trim().startsWith("@media");
        const isDocument = rule.trim().startsWith("@document");
        const isSupports = rule.trim().startsWith("@supports");
        const expressions = styleBundle.tokens.expressions;
        const typedExpressions = styleBundle.tokens.typedExpressions;
        let selector = this.getDeepTranslation(rule.replace(block, '').trim(), expressions);
        const keySelector = "k" + Math.random();
        if (isDocument && opts.parent) {
          this.error(`${component.file}\n\tcan't nest @document`);
        }
        const style = read({
          expressions,
          typedExpressions,
          value: expressions[block]
            .trim()
            .slice(1)
            .slice(0, -1),
          array: styleElements,
        });
        styleBundle.mapSelectors.set(keySelector, {
          id: keySelector,
          selector,
          rule,
          properties: null,
          parent: opts.parent ? opts.parent : null,
          children: [],
          isSpecial: !StyleParser.isNotSpecial(rule.trim()),
          omitOutputSelector: opts.omitOutputSelector,
          isMedia: opts.isMedia ? opts.isMedia : false,
          isDocument: isDocument ? selector : opts.isDocument ? opts.isDocument : false,
          isSupports: isSupports ? selector : opts.isSupports ? opts.isSupports : false,
          isNestedMedia: false,
          isKeyframes,
        });
        const { props: properties, children } = this.getProperties(style, styleBundle, bundle, component, {
          selector: keySelector,
        });
        // handle nested media queries
        if (opts.parent && isMedia) {
          if (children.length) {
            this.error(
              `${component.file}\nError in Style, can't assign nested rule inside a nested @media.\ninput: ${selector} {${this.getDeepTranslation(children[0], expressions)}}`
            );
          }
          const item = styleBundle.mapSelectors.get(keySelector);
          item.isNestedMedia = selector;
          item.isMedia = selector;
        }
        // handle nested keyframes
        if (opts.parent && isKeyframes) {
          if (children.length) {
            this.error(
              `${component.file}\nError in Style, can't assign nested rule inside a nested @keyframes.\n\tif you're trying to use classic @keyframes please use it at the style's top level\ninput: ${selector} {${this.getDeepTranslation(children[0], expressions)}}`
            );
          }
          const item = styleBundle.mapSelectors.get(keySelector);
          item.isNestedKeyframes = selector;
          item.isKeyframes = selector;
        }
        if (!isKeyframes) {
          children.forEach((child) => {
            this.getRules(child, styleBundle, bundle, component, {
              parent: styleBundle.mapSelectors.get(keySelector),
              isMedia: rule.trim().startsWith('@media') ? selector : !!opts.isMedia ? opts.isMedia : false,
              isDocument: rule.trim().startsWith('@document') ? selector : !!opts.isDocument ? opts.isDocument : false,
              isSupports: rule.trim().startsWith('@supports') ? selector : !!opts.isSupports ? opts.isSupports : false,
            });
          })
        }
        if (opts.parent) {
          opts.parent.children.push(
            styleBundle.mapSelectors.get(keySelector)
          );
        }
        result = result.replace(rule, '');
        rules.push(styleBundle.mapSelectors.get(keySelector));
      });
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
      array: notParsed.concat(elements).concat(styleElements),
    });
    styleBundle.value = result;
    return result;
  }
}
