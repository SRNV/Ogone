import type { Bundle } from "../../.d.ts";
import { Utils } from "../utils/index.ts";
import getClassController from "./controller/index.ts";
import getClassRouter from "./router/index.ts";
import getClassAsync from "./async/index.ts";
import getClassComponent from "./component/index.ts";
import getClassStore from "./store/index.ts";
import getClassExtends from "./extends/index.ts";
import { Configuration } from "../config/index.ts";
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
