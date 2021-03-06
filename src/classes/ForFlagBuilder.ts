import { Utils } from "./Utils.ts";
import type {
  Bundle,
  XMLNodeDescription,
  LegacyDescription,
  ForCtxDescription,
  TypedExpressions,
} from "../ogone.main.d.ts";
import notParsedElements from '../../utils/not-parsed.ts';
import elements from '../../utils/elements.ts';
import read from '../../utils/agnostic-transformer.ts';
import getTypedExpressions from '../../utils/typedExpressions.ts';
import getDeepTranslation from '../../utils/template-recursive.ts';
// create a function to get all the properties from a destructuration
// this means that { a } should expose a "a" var
// also a { a: { b } } should expose a "b" var
// also a  { a: { b: c } } should expose a "c" var
// and a { a: { b, c = 'c' } } should expose "b" and "c"
function readDestructuration(destructured: string, opts: {
  typedExpressions: TypedExpressions;
  readonly registry: string[];
}) {
  try {
    // we will use the saved blocks tokens into typedExpressions
    // and save the properties into the registry
    const {
      typedExpressions,
      registry,
    } = opts;
    if (!typedExpressions.blocks[destructured]) return null;
    const content = typedExpressions.blocks[destructured];
    const blocks = content.match(/(?<=([\:\=]\s*))\d+_block/gi);
    const propertiesRegExp = /(([\w\d]+)+(?=\s*\}$)|(([\w\d]+)+(?=\s*,))|((?<=([\w\d]+)+\s*\:)([\w\d]+)+)|(([\w\d]+)+(?=\s*\=)))/gi;
    const properties = content.match(propertiesRegExp);
    if (properties) {
      registry.push(...properties as string[]);
    }
    if (blocks) {
      blocks.forEach((block: string) => {
        readDestructuration(block, opts);
      });
    }
    return true;
  } catch (err) {
    throw err;
  }
}
let i = 0;
function reinit() {
  i = 0;
}
function* gen(): Generator {
  while (true) {
    yield i++;
  }
}
const iterator: Generator = gen();
const arrayAliasIterator: Generator = gen();
iterator.next().value
arrayAliasIterator.next().value
/**
 * @name ForFlagBuilder
 * @code OFFB1-ORC8-OC0
 * @description traverse all nodes, if the `--for` flag is set this will start getting all the tokens through a regular expression
 * this will send to the SwitchContextBuilder, all the variable declarations
 * (variables for any component's property: const item = this.item)
 * SwitchContextBuilder class will wrap it into a tiny function and register it into `Ogone.context`
 * this is only a build made through a string composition
 */
export default class ForFlagBuilder extends Utils {
  public startAnalyze(bundle: Bundle) {
    try {
      reinit();
      const entries = bundle.components.entries();
      for (let [path, component] of entries) {
        this.read(bundle, path, component.rootNode);
      }
    } catch (err) {
      this.error(`ForFlagBuiler: ${err.message}
${err.stack}`);
    }
  }
  private async read(
    bundle: Bundle,
    keyComponent: string,
    node: XMLNodeDescription,
    legacy: LegacyDescription = {
      limit: 0,
      ctx: {},
      script: [],
      getLengthDeclarationAfterArrayEvaluation: "",
      declarationScript: [],
      callbackDeclaration: "",
    },
  ): Promise<void> {
    try {
      const component = bundle.components.get(keyComponent);
      let contextLegacy: LegacyDescription = {};
      if (component && node.attributes) {
        const attrs = Object.keys(node.attributes);
        const keyData = Object.keys(component.data);
        attrs.forEach((key) => {
          if (!key.startsWith("--")) return;
          node.hasFlag = true;
          keyData.forEach((key2) => {
            if (
              // @ts-ignore
              node.attributes[key].indexOf &&
              // @ts-ignore
              node.attributes[key].indexOf(key2) > -1 &&
              !node.dependencies.includes(key2)
            ) {
              node.dependencies.push(key2);
            }
          });
        });
      }
      if (node.tagName) {
        if (!node.attributes) {
          node.attributes = {};
        }
        if (component && node.attributes) {
          node.attributes[component.uuid] = true;
        }
      }
      if (legacy) {
        contextLegacy = Object.assign(legacy, {});
      }
      if (node.attributes["--for"]) {
        const v = node.attributes["--for"];
        // get the flags
        const oForFlag = this.getForFlagDescription(v as string);
        const { item, index, array, destructured } = oForFlag;
        const arrayAlias = `_____a_${arrayAliasIterator.next().value}`;
        if (legacy.ctx) {
          if (legacy.ctx[item]) {
            this.error(
              `'${item}' is already defined in the template, as item`,
            );
          }
          if (legacy.ctx[index]) {
            this.error(
              `'${index}' is already defined in the template, as index`,
            );
          }
          legacy.ctx[index] = true;
          legacy.ctx[item] = oForFlag;
          node.hasFlag = true;
          const getLengthScript = (opts: any) => {
            if (!opts.filter) {
              return `
                  if (GET_LENGTH) {
                    if (!${arrayAlias}) {
                      return 0;
                    }
                    return ${arrayAlias}.length;
                  }`;
            }
            return this.template(
              `
                let {% arrayAlias %}2 = ({% arrayAlias %} || []).filter(({%item%}, {%index%}) => {%filter%});
                {%item%} = ({% arrayAlias %}2)[{%index%}];
                if (GET_LENGTH) {
                  return ({% arrayAlias %}2).length;
                }`,
              {
                item,
                index,
                arrayAlias,
                filter: opts.filter,
              },
            );
          };
          legacy.arrayName = array;
          legacy.getLength = getLengthScript;
          // @ts-ignore
          legacy.item = item;
          let aliasItem;
          if (!item.match(/^\w/)) {
            aliasItem = `alias_${node.id}`;
            // @ts-ignore
            legacy.aliasItem = aliasItem;
          }
          // @ts-ignore
          legacy.destructured = destructured;
          if (contextLegacy) {
            const reg = /^((this\.){0,1}[\w\d]+?)(\b)(.*?)$/i;
            const arrayMatch = reg.test(array);
            const parentItem = array.replace(reg, '$1')
            const ogoneRefsForArrays = `Ogone.arrays[${component!.uuid.replace(/\-/, '_')}_${node.id}]`;
            const preventError = `!!${parentItem}
            && ${array} || []`;
            const declarationScript = [`const ${arrayAlias} = ${!component?.isRecursive ? ogoneRefsForArrays + ' ||': ''} ${arrayMatch ? preventError : `${array}`};`, `
                          let ${index} = POSITION[${contextLegacy.limit}],
                          ${item} = (${arrayAlias})[${index}];`,
                          !component?.isRecursive ? `if (${ogoneRefsForArrays} !== ${arrayAlias}) ${ogoneRefsForArrays} = ${arrayAlias};` : '',
            aliasItem ? `const ${aliasItem} = (${arrayAlias})[${index}];` : '',
            ];
            if (contextLegacy && contextLegacy.declarationScript) {
              contextLegacy.declarationScript = contextLegacy.declarationScript
                .concat(declarationScript);
            }
          }
        }
      }
      if (node.childNodes?.length) {
        for (let el of node.childNodes) {
          if (component && component.data && el.nodeType === 3) {
            const data = el.rawText;
            Object.keys(component.data).forEach((key) => {
              const result = data;
              // need to be more precise here
              if (
                result &&
                result.indexOf("\${") > -1 && result.indexOf(`${key}`) > -1
              ) {
                if (!node.dependencies.includes(key)) {
                  node.dependencies.push(key);
                }
              }
            });
          }
          if (contextLegacy) {
            this.read(bundle, keyComponent, el, {
              ...contextLegacy,
              ctx: { ...contextLegacy.ctx },
              declarationScript: [
                ...(contextLegacy && contextLegacy.declarationScript
                  ? contextLegacy.declarationScript
                  : []),
              ],
              callbackDeclaration: "",
              // @ts-ignore
              limit: contextLegacy.limit + 1,
            });
          }
        }
      }
      if (contextLegacy) {
        const value = `${contextLegacy.declarationScript
          ? contextLegacy.declarationScript.join("")
          : ""
          } `;
        contextLegacy.script = {
          value,
          node,
          // @ts-ignore
          item: legacy.item,
          // @ts-ignore
          aliasItem: legacy.aliasItem,
          // @ts-ignore
          destructured: legacy.destructured,
          ctx: legacy.ctx,
          level: contextLegacy.limit,
          getLength: legacy.getLength,
          array: legacy.arrayName,
        };
        if (component && node.id) {
          component.for[node.id] = contextLegacy;
        }
      }
    } catch (oRenderDOMException) {
      this.error(oRenderDOMException);
    }
  }
  getForFlagDescription(
    value: string,
  ): ForCtxDescription<string> {
    try {
      const expressions = {};
      const typedExpressions = getTypedExpressions();
      const flagValue = read({
        expressions,
        value,
        typedExpressions,
        array: [
          ...notParsedElements,
          ...elements.filter((el) => el.name === 'block'),
        ],
      });
      const itemAndIndexRegExp = /^\((.+?),\s*(\w+?)\)\s+of\s+(.+?)$/gi;
      const itemRegExp = /^(.+?)\s+of\s+(.+?)$/gi;
      let oForRegExp = itemAndIndexRegExp.exec(flagValue.trim())
      const registry: string[] = [];
      // if the end user uses: (item, index) of array syntax
      if (oForRegExp) {
        itemAndIndexRegExp.exec(flagValue.trim());
        let [input, item, index, arrayName] = oForRegExp;
        readDestructuration(item, {
          typedExpressions,
          registry,
        });
        arrayName = flagValue.split("of")[1].trim();
        return {
          index: index ? index : `i${iterator.next().value}`,
          item: getDeepTranslation(item, expressions),
          array: getDeepTranslation(arrayName, expressions),
          content: getDeepTranslation(flagValue, expressions),
          destructured: registry,
        };
      }
      oForRegExp = itemRegExp.exec(flagValue.trim());
      // if the end user uses: item of array syntax
      if (!oForRegExp) {
        throw this.error(
          `Syntax Error: ${flagValue} \n\tPlease follow this --for syntax. (item [, i]) of array `,
        );
      }
      itemAndIndexRegExp.exec(flagValue.trim());
      let [input, item, arrayName] = oForRegExp;
      readDestructuration(item, {
        typedExpressions,
        registry,
      });
      arrayName = flagValue.split("of")[1].trim();
      return {
        index: `i${iterator.next().value}`,
        item: getDeepTranslation(item, expressions),
        array: getDeepTranslation(arrayName, expressions),
        content: getDeepTranslation(flagValue, expressions),
        destructured: registry,
      };
    } catch (err) {
      this.error(`ForFlagBuiler: ${err.message}
${err.stack}`);
    }
  }
}
