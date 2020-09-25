import type { Bundle, Component, StyleBundle } from '../.d.ts';
import ObviousOutput from './ObviousOutput.ts';
// TODO needs more explications on the process
/**
 * @name ObviousMemory
 * @code OOM1-OSB7-OC0
 * @description saves vars, use statements, imported components and styleBundle
 * you can add a new var syntax by editing the getVars method, the method getVars will at the end save the variable
 * inside the styleBundle's mapVars (Map)
 * the use statement is parsed by the method setUse, this method will save the dependency inside styleBundle's mapImport
 * after this the async method getImports will bundle all dependencies asynchronously
 * @dependency ObviousOutput
 * @dependency ObviousParser
 */
export default class ObviousMemory extends ObviousOutput {
  protected getVars(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = styleBundle.value;
    const parts = result.split(/(?:§{2}(?:endPonctuation|endLine)\d+§{2})/);
    const regExpVarsExported = /(@§{2}keywordExport\d+§{2})\s+(§{2}keywordConst\d+§{2}\*{0,1})\s+(\w+)+\s*(§{2}operatorsetter\d+§{2})(.*)/;
    const regExpVars = /(@§{2}keywordConst\d+§{2}\*{0,1})\s+(\w+)+\s*(§{2}operatorsetter\d+§{2})(.*)/;
    result = parts
      .map((statement) => {
        if (statement.trim().match(this.regularAtRules)) {
          styleBundle.mapPreservedRules.set(statement, statement);
          return;
        }
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
            const isSelector = !evaluated && !!value.match(/(§§block\d+§§)$/);
            styleBundle.mapVars.set(name, {
              value: isSelector ? this.getRules(value, styleBundle, bundle, component, {
                omitOutputSelector: true,
              }).rules : value,
              eval: evaluated,
              isSelector,
              exportable: true,
            });
          } else if (isConstant) {
            let [match, kConst, name, equal, value] = isConstant;
            const evaluated = kConst.trim().endsWith('*');
            if (styleBundle.mapVars.get(name)) {
              this.error(`${name} already defined.`);
            }
            const isSelector = !evaluated && !!value.match(/(§§block\d+§§)$/);
            styleBundle.mapVars.set(name, {
              value: isSelector ? this.getRules(value, styleBundle, bundle, component, {
                omitOutputSelector: true,
              }).rules : value,
              eval: evaluated,
              isSelector,
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
  protected async getNewStyleBundle(css: string, bundle: Bundle, component: Component): Promise<StyleBundle> {
    const styleBundle: StyleBundle = {
      input: css,
      value: css,
      mapImports: new Map(),
      mapVars: new Map(),
      mapMedia: new Map(),
      mapDocument: new Map(),
      mapSupports: new Map(),
      mapKeyframes: new Map(),
      mapSelectors: new Map(),
      mapPreservedRules: new Map(),
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
    await this.getImports(styleBundle, bundle, component);
    this.getVars(styleBundle, bundle, component);
    styleBundle.value = this.getRules(styleBundle.value, styleBundle, bundle, component).value;
    // read rules
    this.getOutput(styleBundle, bundle, component);
    return styleBundle;
  }
  protected async getImports(styleBundle: StyleBundle, bundle: Bundle, component: Component) {
    const entries = styleBundle.mapImports.entries();
    for await (const [, item] of entries) {
      const { tag, name } = item;
      const filePath = component.imports[tag];
      const subcomp = bundle.components.get(filePath);
      if (!subcomp) {
        this.error(`${component.file}\n\tStyle Use Error while fetching component: component not found.\n\tinput: @use ${tag} as ${name}`);
      } else {
        item.bundle = await this.getNewStyleBundle(
          subcomp.elements.styles.map((style) => {
            if (style.getInnerHTML) {
              return style.getInnerHTML();
            }
          }).join('\n'),
          bundle,
          subcomp,
        );
      }
    }
  }
  protected setUse(styleBundle: StyleBundle, bundle: Bundle, component: Component) {
    let result = styleBundle.value;
    const regexp = /(\@§{2}keywordUse\d+§{2})\s+(§{2}string\d+§{2})\s+(§{2}keywordAs\d+§{2})\s+(\w*)+\s*(§{2}(endPonctuation|endLine)\d+§{2})/;
    while (result.match(regexp)) {
      const m = result.match(regexp);
      if (m) {
        let [input, kUse, tag, kAs, name] = m;
        tag = this.getDeepTranslation(tag, styleBundle.tokens.expressions)
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
}