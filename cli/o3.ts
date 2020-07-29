// @ts-nocheck
import { parseFlags, OptionType, InputCLI, Confirm, Select, existsSync } from './deps.ts';

class OgoneCLI {
  private static templateSTR: string = `
{{ templateImports }}
{{ templateStore }}
{{ templateProto }}
{{ elements }}
{{ templateStyle }}`;
  private static templateProto: string = `
<proto{{ componentType }}>
  {{ def }}
  {{ declarations }}
  {{ beforeEach }}
  {{ defaultSTR }}
</proto>`;
  private static templateStyle: string = `
<style{{ styleLang }}>

</style>`;
  private static templateStore: string = `<store-component {{ storeNamespace }} />`;
  private static templateImports: string = `// {{ path }}/{{ componentName }}.o3`;
  private static template(tmpl: string, data: any): string {
    let result = tmpl;
    const fn = new Function(
      "__value",
      ...Object.keys(data),
      `try { return eval('('+ __value + ')'); } catch(err) { throw err; }`,
    );
    const values = Object.values(data);
    while (
      result.indexOf("{{") > -1 && result.indexOf("}}") > -1
    ) {
      if (result.indexOf("{{") > result.indexOf("}}")) {
        result = result.replace("}}", "} }");
      }
      const start = result.indexOf("{{");
      const end = result.indexOf("}}") + 2;
      const substrContent = result.substring(start + 2, end - 2).trim();
      const partStart = result.substring(0, start);
      const partEnd = result.substring(end);
      result = partStart + fn(substrContent, ...values) + partEnd;
    }
    return result;
  }
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
      case value && ['app', 'application', 'a'].includes(value):
        await this.createApp();
        break;
      case value && ['comp', 'component', 'c'].includes(value):
        await this.createComp();
      break;
    }
  }
  private static async createApp() {
    let pathToApplication: string = await InputCLI.prompt(`name a directory to place your application`);
    while(existsSync(pathToApplication)) {
      console.warn('folder already exists.')
      pathToApplication = await InputCLI.prompt(`name a directory to place your application`);
    }
    let indexPath = `${pathToApplication}/index.ts`;
    let depsPath = `${pathToApplication}/deps.ts`;
    let componentsPath = `${pathToApplication}/components`;
    let entrypoint = `${pathToApplication}/components/index.o3`;
    let distPath = `${pathToApplication}/dist`;
    let publicPath = `${pathToApplication}/public`;
    let modules = `${pathToApplication}/modules`;
    const dirs = [
      pathToApplication,
      componentsPath,
      publicPath,
      distPath,
      modules
    ];
    for await (let dir of dirs) {
      console.warn(dir)
      await Deno.mkdir(dir);
    }
    console.warn(`[Ogone] ${pathToApplication} rendered.`);
    await Deno.writeTextFile(depsPath, `
export { default as o3 } from 'https://x.nest.land/Ogone@0.18.0-rc.5/mod.ts';
    `);
    await Deno.writeTextFile(indexPath, `
import { o3 } from './deps.ts';

o3.run({
  entrypoint: '${entrypoint}',
  port: 3333,
  modules: '/modules',
  build: Deno.args.includes('--production') ? 'dist' : undefined,
});`);
  await Deno.writeTextFile(entrypoint, `
<proto>
  declare:
    public message: string = 'Welcome to your first Ogone application.';
</proto>

<div class="brand">
  <img class="logo" src="https://x.nest.land/Ogone@0.18.0-rc.5/public/neum-ogone-1.png"/>
</div>
<div>
  \${message}
</div>

<style global>
  body {
    color: grey;
    font-family: sans-serif;
    background: white;
  }
</style>
<style>
  .brand {
    width: fit-content;
    margin: auto;
  }
  .logo {
    width: 970px;
    height: auto;
  }
</style>
`);
  }
  private static async createComp() {
    let pathToFolder: string = await InputCLI.prompt(`path to the component's folder`);
        while(!existsSync(pathToFolder)) {
          console.warn('Invalid path.')
          pathToFolder = await InputCLI.prompt(`path to the component's folder`);
        }
        if (pathToFolder.endsWith('/')) {
          pathToFolder = pathToFolder.slice(0, -1);
        }
        let componentName: string = await InputCLI.prompt(`component's name ?`);
        while(existsSync(`${pathToFolder}/${componentName}.o3`)) {
          console.warn('component already exists.', `${pathToFolder}/${componentName}.o3`)
          componentName = await InputCLI.prompt(`component's name ?`);
        }
        if (componentName.endsWith('.o3')) {
          componentName = componentName.slice(0, -3);
        }
        const fullPath = `${pathToFolder}/${componentName}.o3`;
        let usingDef: boolean = false,
        usingDefault: boolean = false,
        usingDeclare: boolean = false,
        typeofComponent: string = 'component',
        usingBeforeEach: boolean = false;
        typeofComponent = await Select.prompt({
          message: 'type of the component ?',
          options: [
            { name: 'async', value: 'async' },
            { name: 'store', value: 'store' },
            { name: 'router', value: 'router' },
            { name: 'component', value: 'component' },
            { name: 'controller', value: 'controller' },
          ]
        });
        const hasStore: boolean = !['router', 'controller', 'store'].includes(typeofComponent) ?  await Confirm.prompt(`insert a store module ?`) : false;
        const hasProto: boolean = ['router', 'controller', 'store'].includes(typeofComponent) ? true : await Confirm.prompt(`insert a proto element ?`);
        if (hasProto) {
          usingDef = ['router'].includes(typeofComponent) ? true : await Confirm.prompt(`insert definitions (def:) ?`);

          usingDeclare = !['router'].includes(typeofComponent) ? await Confirm.prompt(`insert declarations (declare:) ?`) : false;

          usingBeforeEach = !['router'].includes(typeofComponent) ? await Confirm.prompt(`insert before-each (before-each:) ?`) : false;

          usingDefault = !['router', 'controller', 'store'].includes(typeofComponent) ? (['async',].includes(typeofComponent) || await Confirm.prompt(`insert default statement (default:) ?`) ) : false;
        }

        const hasStyle: boolean = !['router', 'controller', 'store'].includes(typeofComponent) ?  await Confirm.prompt(`insert a style element ?`) : false;
        let cssLang: any | null;
        if (hasStyle) {
          cssLang = await Select.prompt({
            message: 'now choose a CSS pre-processor ?',
            options: [
              { name: 'Css', value: null },
              { name: 'Sass', value: 'sass' },
              { name: 'Denolus', value: 'denolus' },
            ]
          });
        }
        let result = this.template(this.templateSTR, {
          componentName,
          path: pathToFolder,

          templateImports: this.templateImports,
          templateProto: hasProto ? this.templateProto : '',
          templateStyle: hasStyle ? this.templateStyle : '',
          templateStore: hasStore ? this.templateStore : '',

          styleLang: hasStyle && cssLang ? ` lang="${cssLang}"` : '',
          componentType: ` type="${typeofComponent}"`,
          storeNamespace: 'namespace="test"',
          defaultSTR: usingDefault ? `default: // Typescript: onmount, mounted, didMount...\n    {{ onmount }}` : '',
          onmount: ['async'].includes(typeofComponent) ? `Async.resolve(this.message);` : '',
          def: usingDef ? `def: # YAML` : '',
          declarations: usingDeclare ? `declare: // Typscript\n    public readonly message: string = 'Hello World';` : '',
          beforeEach: usingBeforeEach ? `before-each: // Typescript` : '',
          elements: ['async', 'component'].includes(typeofComponent) && usingDeclare? `\n<!--\n<p>\${message}</p>\n-->` : '',
        });
        Deno.writeTextFileSync(fullPath, result);
        console.warn(result);
  }
}
if (import.meta.main) {
  OgoneCLI.init();
}