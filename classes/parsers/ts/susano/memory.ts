import type { FileBundle, ScopeBundle } from "../../../../.d.ts";
import SusanoImportInspector from "./imports.ts";
import getDeepTranslation from "../../../../utils/template-recursive.ts";
import {
  existsSync,
} from "../../../../deps.ts";

declare type ScopeType =
  | "function"
  | "object"
  | "label"
  | "class"
  | "namespace"
  | "interface";
export default class SusanoScopeInspector extends SusanoImportInspector {
  protected getAllScopes(fileBundle: FileBundle): void {
    const { root } = fileBundle;
    fileBundle.mapScopes.set("root", root);
    this.getDeepScopes(fileBundle, root);
  }
  protected getDeepScopes(
    fileBundle: FileBundle,
    parentScope: ScopeBundle,
  ): void {
    const { tokens } = fileBundle;
    const { expressions } = tokens;
    const keys = Object.keys(expressions);
    const presentInScope = keys.filter((key) =>
      parentScope.value.indexOf(key) > -1 && key.match(/^(§{2}(block)\d+§{2})/)
    );
    presentInScope.forEach((key) => {
      const value = expressions[key];
      // TODO define and use scope type
      this.getScopeType(fileBundle, parentScope, key);
      const scope = this.getScopeBundle({
        value,
        key,
        index: parentScope.value.indexOf(key),
        parent: parentScope,
      });
      parentScope.children.push(scope);
      fileBundle.mapScopes.set(key, scope);
      this.getDeepScopes(fileBundle, scope);
    });
  }
  /**
   *
   * @param parent
   * @param key
   * @note return the scope's stype by reading tokens of the parent scope
   */
  protected getScopeType(
    fileBundle: FileBundle,
    parent: ScopeBundle,
    key: string,
  ): ScopeType {
    let result: ScopeType = "object";
    /*
    const isFunctionMatch = parent.value.match(this.blockFunctionRegExpGI);
    const isFunction = !!isFunctionMatch?.find((a) => a.indexOf(key) > -1);

    const isVariableMatch = parent.value.match(this.constLetVarRegExpGI);
    const isVariable = !!isVariableMatch?.find((a) => a.indexOf(key) > -1);

    const isExportMatch = parent.value.match(this.exportsRegExpGI);
    const isExport = !!isExportMatch?.find((a) => a.indexOf(key) > -1);

    const isImportMatch = parent.value.match(this.importsRegExpGI);
    const isImport = !!isImportMatch?.find((a) => a.indexOf(key) > -1);

    const isElseIfMatch = parent.value.match(this.elseifStatementRegExpGI);
    const isElseIf = !!isElseIfMatch?.find((a) => a.indexOf(key) > -1);

    const isElseMatch = parent.value.match(this.elseStatementRegExpGI);
    const isElse = !!isElseMatch?.find((a) => a.indexOf(key) > -1);

    const isIfMatch = parent.value.match(this.ifStatementRegExpGI);
    const isIf = !!isIfMatch?.find((a) => a.indexOf(key) > -1);

    const isLabelMatch = parent.value.match(this.labelRegExpGI);
    const isLabel = !!isLabelMatch?.find((a) => a.indexOf(key) > -1);

    const isDoMatch = parent.value.match(this.doWhileStatementRegExp);
    const isDo = !!isDoMatch?.find((a) => a.indexOf(key) > -1);

    const isWithMatch = parent.value.match(this.withStatementRegExp);
    const isWith = !!isWithMatch?.find((a) => a.indexOf(key) > -1);

    const isForMatch = parent.value.match(this.forStatementRegExp);
    const isFor = !!isForMatch?.find((a) => a.indexOf(key) > -1);

    const isSwitchMatch = parent.value.match(this.switchStatementRegExpGI);
    const isSwitch = !!isSwitchMatch?.find((a) => a.indexOf(key) > -1);
    */
    return result;
  }
  protected getScopeBundle(opts: Partial<ScopeBundle>): ScopeBundle {
    const scope: ScopeBundle = {
      children: [],
      dependencies: [],
      type: "",
      variablesMembers: [],
      id: "k" + Math.random(),
      key: opts && opts.key ? opts.key : "",
      file: opts && opts.file ? opts.file : null,
      value: opts && opts.value ? opts.value : "",
      parent: opts && opts.parent ? opts.parent : null,
      index: opts && opts.index !== undefined ? opts.index : 0,
    };
    return scope;
  }
  protected async mkSusanoDir(): Promise<void> {
    console.warn(
      "%c[Susano] %cstart cache process, allowed to create .susano/ drectory...",
      "color: orchid",
      "color: grey",
    );
    // create a folder in cwd /.susano
    if (!existsSync("./.susano")) {
      console.warn(
        "%c[Susano] %ccreate .susano/ for caching",
        "color: orchid",
        "color: grey",
      );
      Deno.mkdir("./.susano");
    }
    if (!existsSync("./.gitignore")) {
      console.warn(
        "%c[Susano] %cadd .gitignore with .susano/",
        "color: orchid",
        "color: grey",
      );
      Deno.writeTextFile("./.gitignore", ".susano/");
    }
    // now it's created, add /.susano to gitignore
    if (existsSync("./.gitignore")) {
      let content = await Deno.readTextFile("./.gitignore");
      if (content) {
        const regexp = /(\n|\s|^)\.susano\/(?=\n|\s|$)/i;
        if (!content.match(regexp)) {
          console.warn(
            "%c[Susano] %cadd .susano/ to .gitignore",
            "color: orchid",
            "color: grey",
          );
          Deno.writeTextFile("./.gitignore", `${content}\n.susano/`);
        }
      }
    }
  }
  protected async isInSusanoDir(path: string): Promise<boolean> {
    return existsSync(await this.getSusanoModPath(path));
  }
  protected async getSusanoModPath(path: string): Promise<string> {
    return `.susano/${btoa(path)}.json`;
  }
  protected async saveInSusanoDir(fileBundle: FileBundle): Promise<boolean> {
    const saved = await this.isInSusanoDir(fileBundle.path);
    if (!saved) {
      // TODO save file bundle in susano dir
      const modPath = await this.getSusanoModPath(fileBundle.path);
      await Deno.writeTextFile(
        modPath,
        JSON.stringify({
          value: fileBundle.value,
          code: fileBundle.code,
          dependencies: fileBundle.dependencies,
          tokens: fileBundle.tokens,
          type: fileBundle.type,
          id: fileBundle.id,
          baseUrl: fileBundle.baseUrl,
        }),
      );
      return true;
    }
    return false;
  }
  protected async getModFromSusanoDir(
    path: string,
    opts: Partial<FileBundle>,
  ): Promise<any | null> {
    const modPath = await this.getSusanoModPath(path);
    if (existsSync(modPath)) {
      const file = await Deno.readTextFile(modPath);
      const mod = JSON.parse(file);
      if (mod.code !== opts.code) {
        return null;
      }
      return mod;
    } else {
      return null;
    }
  }
}
