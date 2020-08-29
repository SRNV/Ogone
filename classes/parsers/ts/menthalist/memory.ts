import { FileBundle, ScopeBundle, } from '../../../../.d.ts';
import MenthalistImportInspector from './imports.ts';

export default class MenthalistScopeInspector extends MenthalistImportInspector {
  protected getAllScopes(fileBundle: FileBundle): void {
    const { root } = fileBundle;
    fileBundle.mapScopes.set('root', root);
    this.getDeepScopes(fileBundle, root);
  }
  protected getDeepScopes(fileBundle: FileBundle, parentScope: ScopeBundle): void {
    const { tokens } = fileBundle;
    const { expressions } = tokens;
    const keys = Object.keys(expressions);
    const presentInScope = keys.filter((key) => parentScope.value.indexOf(key) > -1 && key.match(/^(§{2}(block|parenthese|array)\d+§{2})/));
    presentInScope.forEach((key) => {
      const value = expressions[key];
      console.warn(parentScope.value);
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
  protected getScopeBundle(opts: Partial<ScopeBundle>): ScopeBundle {
    const scope: ScopeBundle = {
      children: [],
      dependencies: [],
      type: "top-level",
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
}