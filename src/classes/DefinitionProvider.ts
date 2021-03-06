import type { Component, ModifierContext } from '../ogone.main.d.ts';
import { join, absolute, existsSync, fetchRemoteRessource } from '../../deps/deps.ts';
import { YAML } from '../../deps/yaml.ts';
import { MapPosition } from "./MapPosition.ts";
import { Utils } from './Utils.ts';

export default class DefinitionProvider extends Utils {
  public mapData: Map<string, { [key: string]: any }> = new Map();
  public saveDataOfComponent(component: Component, ctx: ModifierContext): void {
    try {
      const { value } = ctx;
      const data = YAML.parse(value);
      this.mapData.set(component.uuid, { data });
    } catch (err) {
      this.error(`DefinitionProvider: ${err.message}
${err.stack}`);
    }
  }
  public async setDataToComponentFromFile(component: Component): Promise<void> {
    try {
      const proto = component.elements.proto[0];
      let defData: any;
      const item = this.mapData.get(component.uuid);
      if (proto && "def" in proto.attributes) {
        if (component.isTyped) {
          const position = MapPosition.mapNodes.get(proto)!;
          this.error(`${component.file}:${position.line}:${position.column} \n\tcan't use def attribute with a component using declare modifier.`);
        }
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
          const def = await fetchRemoteRessource(defPath);
          if (!def) {
            this.error(
              `definition file ${defPath} is not reachable. \ncomponent: ${component.file}\ninput: ${defPath}`,
            );
          } else {
            defData = YAML.parse(def, {});
          }
        } else if (!!component.remote) {
          const def = await fetchRemoteRessource(remoteRelativePath);
          if (!def) {
            this.error(
              `definition file ${remoteRelativePath} is not reachable. \ncomponent: ${component.file}\ninput: ${defPath}`,
            );
          } else {
            defData = YAML.parse(def, {});
          }
        } else if (existsSync(defPath)) {
          if (Deno.build.os !== "windows") {
            Deno.chmodSync(defPath, 0o777);
          }
          const def = Deno.readTextFileSync(defPath);
          defData = YAML.parse(def, {});
        } else if (!component.remote && existsSync(relativePath)) {
          if (Deno.build.os !== "windows") {
            Deno.chmodSync(relativePath, 0o777);
          }
          const def = Deno.readTextFileSync(relativePath);
          defData = YAML.parse(def, {});
        } else {
          const position = MapPosition.mapNodes.get(proto)!;
          this.error(`${component.file}:${position.line}:${position.column}\n\tcan't find the definition file: ${defPath}`);
        }
      }
      // save data into the component
      if (defData) {
        const position = MapPosition.mapNodes.get(proto)!;
        switch (true) {
          case item && Array.isArray(defData) && !Array.isArray(item.data):
            this.error(`${component.file}:${position.line}:${position.column}\n\t${proto.attributes.def} doesn't match def type of ${component.file}`);
            break;
          case item && !Array.isArray(defData) && Array.isArray(item.data):
            this.error(`${component.file}:${position.line}:${position.column}\n\t${proto.attributes.def} doesn't match def type of ${component.file}`);
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
      } else if (item) {
        component.data = item.data;
      }
      this.saveContextToComponent(component);
    } catch (err) {
      this.error(`DefinitionProvider: ${err.message}
${err.stack}`);
    }
  }
  saveContextToComponent(component: Component): void {
    try {
      component.context.data = component.data instanceof Object
        && !Array.isArray(component.data) ? Object.keys(component.data).map((key) => {
          return `const ${key} = this.${key};`;
        }).join('\n') : '';
    } catch (err) {
      this.error(`DefinitionProvider: ${err.message}
${err.stack}`);
    }
  }
  public transformInheritedProperties(component: Component): void {
    try {
      this.trace('Inherit statements on def modifier.');
      // if (component.isTyped || !component.data) return
      const keys = Object.keys(component.data);
      const inheritRegExp = /^(inherit\s+)([^\s]+)+$/
      keys.filter((key) => {
        return inheritRegExp.test(key)
      })
        .forEach((key) => {
          const property = key.replace(inheritRegExp, '$2');
          component.data[property] = component.data[key];
          component.requirements = component.requirements || [];
          component.requirements.push([property, 'unknown']);
          this.trace(`${property} inherited. transformation of ${key}`);
          delete component.data[key];
        });
      this.trace('Inherit statements on def modifier done.');
    } catch (err) {
      this.error(`DefinitionProvider: ${err.message}
${err.stack}`);
    }
  }
}
