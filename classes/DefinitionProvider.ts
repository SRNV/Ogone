import type { Component, ModifierContext } from '../.d.ts';
import { join, absolute, existsSync, fetchRemoteRessource, YAML } from '../deps.ts';
import { Utils } from './Utils.ts';

export default class DefinitionProvider extends Utils {
  public mapData: Map<string, { [key: string]: any }> = new Map();
  public saveDataOfComponent(component: Component, ctx: ModifierContext): void {
    const { value } = ctx;
    const data = YAML.parse(value);
    this.mapData.set(component.uuid, { data });
  }
  public async setDataToComponentFromFile(component: Component) {
    const proto = component.elements.proto[0];
    let defData: any;
    const item = this.mapData.get(component.uuid);
    if (proto && "def" in proto.attributes) {
      // allowing <proto def="..."
      // absolute <proto def="http://..."
      // absolute <proto def="path/to/folder"
      // relative <proto def="../"
      // relative <proto def="./"
      const defPath = (proto.attributes.def as string).trim();
      const relativePath = join(component.file, defPath);
      const remoteRelativePath = absolute(component.file, defPath);
      const isAbsoluteRemote = ["http", "ws", "https", "ftp"].includes(
        defPath.split("://")[0],
      );
      if (!defPath.endsWith(".yml") && !defPath.endsWith(".yaml")) {
        this.error(
          `definition files require YAML extensions.\ncomponent: ${component.file}\ninput: ${defPath}`,
        );
      }
      if (isAbsoluteRemote) {
        this.warn(`Def: ${defPath}`);
        const def = await fetchRemoteRessource(defPath);
        if (!def) {
          this.error(
            `definition file ${defPath} is not reachable. \ncomponent: ${component.file}\ninput: ${defPath}`,
          );
        } else {
          defData = YAML.parse(def, {});
        }
      } else if (!!component.remote) {
        this.warn(`Def: ${remoteRelativePath}`);
        const def = await fetchRemoteRessource(remoteRelativePath);
        if (!def) {
          this.error(
            `definition file ${remoteRelativePath} is not reachable. \ncomponent: ${component.file}\ninput: ${defPath}`,
          );
        } else {
          defData = YAML.parse(def, {});
        }
      } else if (existsSync(defPath)) {
        this.warn(`Def: ${defPath}`);
        const def = Deno.readTextFileSync(defPath);
        defData = YAML.parse(def, {});
      } else if (!component.remote && existsSync(relativePath)) {
        const def = Deno.readTextFileSync(relativePath);
        defData = YAML.parse(def, {});
      } else {
        this.error(`can't find the definition file of proto: ${defPath}`);
      }
    }
    // save data into the component
    if (defData) {
      switch (true) {
        case item && Array.isArray(defData) && !Array.isArray(item.data):
          this.error(`${proto.attributes} doesn't match def type of ${component.file}`);
          break;
        case item && !Array.isArray(defData) && Array.isArray(item.data):
          this.error(`${proto.attributes} doesn't match def type of ${component.file}`);
          break;
        case item && Array.isArray(defData) && Array.isArray(item.data):
          if (item) {
            component.data = [
              ...item.data,
              ...defData,
            ];
          }
          break;
        case item && defData:
          if (item && defData) {
            component.data = {
              ...item.data,
              ...defData,
            };
          }
          break;
        default:
          component.data = defData;
      }
    }
    if (item) {
      component.data = item.data;
    }
    this.saveContextToComponent(component);
  }
  saveContextToComponent(component: Component): void {
    component.context.data = component.data instanceof Object
      && !Array.isArray(component.data) ? Object.keys(component.data).map((key) => {
        return `const ${key} = this.${key};`;
      }).join('\n') : '';
  }
}
