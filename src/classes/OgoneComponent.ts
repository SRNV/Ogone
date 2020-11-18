import DOMElement from './DOMElement/DOMElement.ts';
import type { OgoneModule } from './OgoneModule.ts';
import OgoneComponentRegistry from './OgoneComponentRegistry.ts';
import ModuleResolver from "./ModuleResolver.ts";

export interface OgoneComponentInterface {
  /** uuid */
  uuid?: string;
  /** name */
  name?: string;
  /** path to the sandbox file of the component */
  file?: string;
  /** path to the sandbox file of the component */
  sandBoxPath?: string;
  /** path to the end user's component */
  sourcePath?: string;
  /** the DOM tree of the component */
  template?: DOMElement;
  /** returns the DOM tree of the component */
  templateFactory: OgoneModule['default'];
  /** if the component is the first component */
  isRootComponent?: boolean;
  /** if the component is imported into the application */
  isImported?: boolean;
  /**
   * all used components inside the current component
   */
  imports?: OgoneComponent[];
}
export default class OgoneComponent implements OgoneComponentInterface {
  uuid: OgoneComponentInterface['uuid'];
  name: OgoneComponentInterface['name'];
  file: OgoneComponentInterface['file'];
  sourcePath: OgoneComponentInterface['sourcePath'];
  sandBoxPath: OgoneComponentInterface['sandBoxPath'];
  template: OgoneComponentInterface['template'];
  isRootComponent: OgoneComponentInterface['isRootComponent'] = false;
  isImported: OgoneComponentInterface['isImported'] = false;
  templateFactory: OgoneComponentInterface['templateFactory'];
  imports: OgoneComponentInterface['imports'];
  constructor(opts: OgoneComponentInterface) {
    const {
      file,
      uuid,
      template,
      templateFactory,
      name,
      imports,
    } = opts;
    this.file = file;
    this.uuid = uuid;
    this.template = template;
    this.name = name;
    this.templateFactory = templateFactory;
    if (this.uuid) {
      OgoneComponentRegistry.subscribe(this.uuid, this);
    }
    this.imports =  imports || [];
    if (ModuleResolver.currentComponent && ModuleResolver.currentComponent.imports) {
      ModuleResolver.currentComponent.imports.push(this);
    }
  }
  /**
   * instead of using the name as component identifier (ex: component-name)
   * we will use a pseudo uuid (ex: data-a32dsfpi1)
   */
  get dataUuidForSPA(): string {
    if (this.uuid) {
      return `data-${this.uuid.split('-')[0]}`.toLowerCase();
    } else {
      return 'no-uuid';
    }
  }
}