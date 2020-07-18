// @ts-nocheck
import { parseFlags, OptionType, InputCLI, Confirm, Select } from './deps.ts';

class OgoneCLI {
  private templateSTR: string = `
    {{ templateImports }}
    {{ templateProto }}
    {{ templateStore }}
    {{ templateStyle }}
  `;
  private templateProto: string = `
    <proto{{ componentType }}>
      {{ def }}
      {{ declarations }}
      {{ beforeEach }}
      {{ default }}
    </proto>`;
  private templateStyle: string = `
    <style{{ styleLang }}>

    </style>`;
  private templateStore: string = `
    <store-component {{ storeNamespace }} />
  `;
  private templateImports: string = `// {{ path }}/{{ componentName }}.o3`;
  public static async init() {
    parseFlags(Deno.args, {
      flags: [
        {
          name: 'create',
          aliases: ['c', "create"],
          type: OptionType.STRING,
        }
      ],
      parse: (type, option, argument, value) => {
        switch (option.name) {
          case 'create':
            OgoneCLI.promptCreation(value);
            break;
        }
        return value;
      }
    });
  }
  private static async promptCreation(value: string) {
    switch (true) {
      case value && ['comp', 'component', 'c'].includes(value):
        /*
        const cssLang: string = await Select.prompt({
          messsage: 'CSS pre-processor ?',
          options: [
            { name: 'Sass', value: 'sass' },
            { name: 'Denolus', value: 'denolus' },
          ]
        });
        */
        const pathToFolder: string = await InputCLI.prompt(`path to the component's folder`);
        const componentName: string = await InputCLI.prompt(`component's name ?`);
        const hasProto: boolean = await Confirm.prompt(`insert a proto element ?`);
        let usingDef: boolean = false,
          usingDefault: boolean = false,
          usingDeclare: boolean = false,
          typeofComponent: string = 'component',
          usingBeforeEach: boolean = false;
        if (hasProto) {
          typeofComponent = await InputCLI.prompt(`type of the component (component, async, store, router, controller) ?`);
          usingDef = await Confirm.prompt(`insert definitions (def:) ?`);
          usingDefault = await Confirm.prompt(`insert default statement (default:) ?`);
          usingDeclare = await Confirm.prompt(`insert declarations (declare:) ?`);
          usingBeforeEach = await Confirm.prompt(`insert before-each (before-each:) ?`);
        }
        const hasStyle: boolean = await Confirm.prompt(`insert a style element ?`);
        let cssLang: boolean = false;
        if (hasStyle) {
          /*
          cssLang = await Select.prompt({
            messsage: 'style language: please choose a CSS pre-processor ?',
            options: [
              { name: 'Sass', value: 'sass' },
              { name: 'Denolus', value: 'denolus' },
            ]
          });
          */
        }
        console.warn(pathToFolder, hasProto, hasStyle);
        break;
    }
  }
}
if (import.meta.main) {
  OgoneCLI.init();
}