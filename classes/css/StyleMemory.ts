import type { Bundle, Component, StyleBundle } from '../../.d.ts';
import StyleOutput from './StyleOutput.ts';
// TODO needs more explications on the process
/**
 * @name StyleMemory
 * @code OOM1-OSB7-OC0
 * @description saves vars, use statements, imported components and styleBundle
 * you can add a new var syntax by editing the getVars method, the method getVars will at the end save the variable
 * inside the styleBundle's mapVars (Map)
 * the use statement is parsed by the method setUse, this method will save the dependency inside styleBundle's mapImport
 * after this the async method getImports will bundle all dependencies asynchronously
 * @dependency StyleOutput
 * @dependency StyleParser
 */
export default class StyleMemory extends StyleOutput {
  protected getVars(styleBundle: StyleBundle, bundle: Bundle, component: Component): string {
    let result = styleBundle.value;
    const parts = result.split(/(?:(;|\n+))/);
    const regExpVarsExported = /(@export)\s+(const\*{0,1})\s+(\w+)+\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+)(.*)/;
    const regExpVars = /(@const\*{0,1})\s+(\w+)+\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+)(.*)/;
    result = parts
      .map((statement) => {
        if (statement.trim().match(this.regularAtRules)) {
          styleBundle.mapPreservedRules.set(statement, statement);
          return;
        }
        if (statement.trim().length
          && statement.trim().match(/(\@(const|export))/)) {
          const isConstant = statement.match(regExpVars);
          const isExportable = statement.match(regExpVarsExported);
          if (isExportable) {
            let [match, exportable, kConst, name, equal, value] = isExportable;
            const evaluated = kConst.trim().endsWith('*');
            if (styleBundle.mapVars.get(name)) {
              this.error(`${name} already defined.`);
            }
            const isSelector = !evaluated && !!value.match(/(\d+_block)$/);
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
            const isSelector = !evaluated && !!value.match(/(\d+_block)$/);
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
        if (statement.match(/(;|\n+)/)) {
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
    this.trace(`Style bundle created for component: ${component.file}`);

    this.getTokens(styleBundle, bundle, component);
    this.trace('All tokens analyze done');

    await this.getImports(styleBundle, bundle, component);
    this.trace(`All imports saved for component: ${component.file}`);

    this.getVars(styleBundle, bundle, component);
    this.trace(`Style variables saved`);

    styleBundle.value = this.getRules(styleBundle.value, styleBundle, bundle, component).value;
    // read rules
    this.getOutput(styleBundle, bundle, component);
    return styleBundle;
  }
  protected async getImports(styleBundle: StyleBundle, bundle: Bundle, component: Component) {
    const entries = Object.entries(component.imports);
    for await (const [tag, filePath] of entries) {
      // for recursive component
      if (filePath !== component.file) {
        const subcomp = bundle.components.get(filePath);
        if (!subcomp) {
          this.error(`${component.file}\n\tStyle Use Error while fetching component: component not found.\n\tinput: ${tag}`);
        } else {
          styleBundle.mapImports.set(tag, {
            name: tag,
            tag,
          });
          const item = styleBundle.mapImports.get(tag)
          if (item) {
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
    }
  }
}