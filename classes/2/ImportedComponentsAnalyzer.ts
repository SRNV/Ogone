import type { Bundle } from "../../.d.ts";
import ProtocolScriptParser from "../parsers/ts/index.ts";
import { Utils } from "../../classes/utils/index.ts";

export default class ImportedComponentsAnalyzer extends Utils {
  private ProtocolScriptParser: ProtocolScriptParser =
    new ProtocolScriptParser();
  public inspect(bundle: Bundle) {
    const entries = Array.from(bundle.components.entries());
    for (const [, component] of entries) {
      const firstNode = component.rootNode.childNodes.find((node) =>
        node.nodeType !== 3
      );
      if (firstNode) {
        const index = component.rootNode.childNodes.indexOf(firstNode);
        const textNodes = component.rootNode.childNodes.filter((node, id) =>
          node.nodeType === 3 && id < index
        );
        let declarations = ``;
        textNodes.forEach((node) => {
          declarations += node.rawText;
        });
        if (declarations.length) {
          const tokens = this.ProtocolScriptParser.parse(declarations, {
            onlyDeclarations: true,
          });
          // performance here
          const importBody = this.ProtocolScriptParser.parse(declarations, {
            esm: true,
          });
          if (importBody.body && importBody.body.imports) {
            const { imports } = importBody.body;
            component.esmExpressions = Object.entries(imports).map(
              ([key, imp]: [string, any]) => {
                // TODO fix examples/tests/modules/index.ts
                console.warn(imp)
                const hmrModule = {
                  registry: 'Ogone.mod',
                  variable: '',
                  path: imp.path,
                  isDefault: false,
                  isAllAs: false,
                  isMember: false,
                };
                if (imp.default) {
                  hmrModule.variable = imp.defaultName;
                  hmrModule.isDefault = true;
                  component.modules.push(imp.getHmrModuleSystem(hmrModule));
                }
                if (imp.allAs) {
                  hmrModule.variable = imp.allAsName;
                  hmrModule.isAllAs = true;
                  component.modules.push(imp.getHmrModuleSystem(hmrModule));
                }
                if (imp.object) {
                  hmrModule.isMember = true;
                  imp.members.forEach((element: any) => {
                    hmrModule.variable = element.alias || element.name;
                    component.modules.push(imp.getHmrModuleSystem(hmrModule));
                  });
                }
                return imp.dynamic();
              },
            ).join("\n");
            // @ts-ignore
            // save esm tokens for production
            component.esmExpressionsProd = Object.entries(imports).map(
              ([key, imp]: [string, any]) => {
                return imp.value;
              },
            ).join("\n");
          }
          if (tokens.body && tokens.body.use) {
            // @ts-ignore
            Object.values(tokens.body.use).forEach((item: any) => {
              const pathComponent =
                bundle.repository[component.uuid][item.path];
              const tagName = item.as.replace(/['"`]/gi, "");
              switch (true) {
                case tagName === "proto":
                  this.error(
                    `proto is a reserved tagname, don\'t use it as selector of your component.
                      input: use @/${item.path} as ${item.as}
                      component: ${component.file}
                    `,
                  );
                case !tagName.match(/^([a-z])(([\w]*)+(\-[\w]+)+)$/):
                  this.error(
                    `'${tagName}' is not a valid selector of component. Must be kebab-case. please use the following syntax:

                      use @/${item.path} as 'your-component-name'

                      input: use @/${item.path} as ${item.as}
                      regular expression: /^([a-z])(([\w]*)+(\-[\w]+)+)$/
                        - starts with lowercase
                        - can have multiple dash and letters and shouldn't contain anything else
                        - ends with dash and letters
                      component: ${component.file}

                      note: if the component is typed you must provide the name into the tagName
                    `,
                  );
                case !tagName.length:
                  this.error(
                    `empty component name. please use the following syntax:

                      use @/${item.path} as 'your-component-name'

                      input: use @/${item.path} as ${item.as}
                      component: ${component.file}
                    `,
                  );
                case !!component.imports[tagName]:
                  this.error(
                    `component name already in use. please use the following syntax:

                      use @/${item.path} as '${tagName}-c2'

                      input: use @/${item.path} as ${item.as}
                      component: ${component.file}
                    `,
                  );
                default:
                  component.imports[tagName] = pathComponent;
                  break;
              }
            });
          }
          textNodes.forEach((node) => {
            node.rawText = "";
          });
          component.requirements = tokens.body.properties;
        }
      }
    }
  }
}
