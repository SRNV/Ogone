import type { Bundle } from "../.d.ts";
import { Utils } from "./Utils.ts";
import getClassController from "./BrowserController.ts";
import getClassRouter from "./BrowserRouterComponent.ts";
import getClassAsync from "./BrowserAsyncComponent.ts";
import getClassComponent from "./BrowserComponent.ts";
import getClassStore from "./BrowserStoreComponent.ts";
import getClassExtends from "./BrowserExtendsComponent.ts";
import { Configuration } from "./Configuration.ts";
const oce = `Ogone.classes.extends = {{ getClassExtends }}`;
const occ = `Ogone.classes.component = {{ getClassComponent }}`;
const ocs = `Ogone.classes.store = {{ getClassStore }}`;
const oca = `Ogone.classes.async = {{ getClassAsync }}`;
const ocr = `Ogone.classes.router = {{ getClassRouter }}`;
const occo = `Ogone.classes.controller = {{ getClassController }}`;
export default class WebComponentExtends extends Utils {
  public getExtensions(bundle: Bundle) {
    const result: string[] = [];
    result.push(oce, occ);
    if (bundle.types.store) {
      result.push(ocs);
    }
    if (bundle.types.controller) {
      result.push(occo);
    }
    if (bundle.types.router) {
      result.push(ocr);
    }
    if (bundle.types.async) {
      result.push(oca);
    }
    return this.template(result.join("\n"), {
      getClassExtends,
      getClassController,
      getClassRouter,
      getClassAsync,
      getClassComponent,
      getClassStore,
      root: bundle.components.get(Configuration.entrypoint),
    });
  }
}
