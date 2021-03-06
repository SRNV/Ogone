import type { Bundle, ImportDescription } from "../ogone.main.d.ts";
import { Utils } from "./Utils.ts";
import AssetsParser from './AssetsParser.ts';
import Dependency from "./Dependency.ts";
/**
 * @name ImportsAnalyzer
 * @code OIA3
 * @description step to parse all the import statements
 * and to require the correct pattern for all the components name
 * ```ts
 *   ImportsAnalyzer.inspect(bundle as Bundle);
 * ```
 * @dependency AssetsParser
 */
export default class ImportsAnalyzer extends Utils {
  private AssetsParser: AssetsParser =
    new AssetsParser();
  public inspect(bundle: Bundle) {
    try {
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
            // performance here
            const importBody = this.AssetsParser.parseImportStatement(declarations);
            if (importBody.body && importBody.body.imports) {
              const { imports } = importBody.body;
              component.deps = (Object.values(imports) as ImportDescription[])
                .filter((imp: ImportDescription) => !imp.isComponent)
                .map((imp: ImportDescription): Dependency => new Dependency(component, imp));
            }
            if (importBody.body && importBody.body.imports) {
              // @ts-ignore
              Object.values(importBody.body.imports)
              .forEach((item: any) => {
                if (!item.isComponent && item.path.endsWith('.o3')) {
                  this.error(`${component.file}
                    Wrong Syntax for Component importation
                    please follow this pattern

                    pattern: import component ComponentName from '${item.path}';
                    component: ${component.file}
                  `)
                }
                if (!item.isComponent || !item.path.endsWith('.o3')) return;
                const pathComponent =
                  bundle.repository[component.uuid][item.path];
                const tagName = item.defaultName;
                switch (true) {
                  case !tagName:
                    this.error(
                      `this Ogone version only supports default exports.
                      input: import component ... from ${item.path}
                      component: ${component.file}
                    `,
                    );
                  case tagName === "proto":
                    this.error(
                      `proto is a reserved tagname, don\'t use it as selector of your component.
                      input: import component ${item.defaultName} from ${item.path}
                      component: ${component.file}
                    `,
                    );
                  case tagName === "Self":
                    this.error(
                      `Self is a reserved tagname, don\'t use it as selector of your component.
                      input: import component ${item.defaultName} from ${item.path}
                      component: ${component.file}
                    `,
                    );
                  case !tagName.match(/^([A-Z])((\w+))+$/):
                    this.error(
                      `'${tagName}' is not a valid component name. Must be PascalCase. please use the following syntax:

                      import component YourComponentName from '${item.path}'

                      input: import component ${item.defaultName} from ${item.path}
                      component: ${component.file}

                      note: if the component is typed you must provide the name into the tagName
                    `,
                    );
                  case !!component.imports[tagName]:
                    this.error(
                      `component name already in use. please use the following syntax:

                      import component ${tagName}2 from '${item.path}'
import { ImportDescription } from '../';

                      input: import component ${item.defaultName} from ${item.path}
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
            component.requirements = this.AssetsParser.parseRequireStatement(declarations).body.properties;
          }
        }
      }
    } catch (err) {
      this.error(`ImportsAnalyzer: ${err.message}
${err.stack}`);
    }
  }
}
