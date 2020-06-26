import { Bundle } from "../../../../.d.ts";
import jsThis from "../../../../lib/js-this/switch.ts";

export default function oRenderImports(bundle: Bundle) {
  const entries = Array.from(bundle.components.entries());
  for (const [pathToComponent, component] of entries) {
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
        const tokens = jsThis(declarations, {
          onlyDeclarations: true,
        });
        const importBody = jsThis(declarations, {
          esm: true,
        });
        if (importBody.body && importBody.body.imports) {
          const { imports } = importBody.body;
          component.esmExpressions = Object.entries(imports).map(
            ([key, imp]: [string, any]) => {
              component.modules.push(imp.constantDeclaration);
              return imp.expression;
            },
          ).join("\n");
          // @ts-ignore
          component.esmExpressionsProd = Object.entries(imports).map(
            ([key, imp]: [string, any]) => {
              return imp.value;
            },
          ).join("\n");
        }
        if (tokens.body && tokens.body.use) {
          // @ts-ignore
          Object.values(tokens.body.use).forEach((item: any) => {
              const pathComponent = item.path;
              const tagName = item.as.replace(/['"`]/gi, "");
              switch (true) {
                case tagName === "proto":
                  const ReservedTagNameException = new Error(
                    `[Ogone] proto is a reserved tagname, don\'t use it as selector of your component.
                input: use @/${item.path} as ${item.as}
                component: ${component.file}
              `,
                  );
                  throw ReservedTagNameException;
                case !tagName.match(/^([a-z])(([\w]*)+(\-[\w]+)+)$/):
                  const InvalidTagNameForComponentException = new Error(
                    `[Ogone] '${tagName}' is not a valid selector of component. Must be kebab-case. please use the following syntax:

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
                  throw InvalidTagNameForComponentException;
                case !tagName.length:
                  const EmptyTagNameForComponentException = new Error(
                    `[Ogone] empty component name. please use the following syntax:

                use @/${item.path} as 'your-component-name'

                input: use @/${item.path} as ${item.as}
                component: ${component.file}
              `,
                  );
                  throw EmptyTagNameForComponentException;
                case !!component.imports[tagName]:
                  const ComponentNameAlreadyInUseException = new Error(
                    `[Ogone] component name already in use. please use the following syntax:

                use @/${item.path} as '${tagName}-c2'

                input: use @/${item.path} as ${item.as}
                component: ${component.file}
              `,
                  );
                  throw ComponentNameAlreadyInUseException;
                default:
                  component.imports[tagName] = pathComponent;
                  break;
              }
            },
          );
        }
        textNodes.forEach((node) => {
          node.rawText = "";
        });
        component.requirements = tokens.body.properties;
      }
    }
  }
}
