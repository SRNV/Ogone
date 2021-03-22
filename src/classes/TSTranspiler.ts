import { Utils } from "./Utils.ts";
import MapOutput from './MapOutput.ts';
import { Bundle } from "../ogone.main.d.ts";

export default class TSTranspiler extends Utils {
  static runtimeURL = new URL('../main/Ogone.ts', import.meta.url);
  static runtimeBaseURL = new URL('../main/OgoneBase.ts', import.meta.url);
  static subdistFolderUrl = './.ogone';
  static outputURL = './.ogone/out.ts';
  static transpileCompilerOptions = { sourceMap: false, };
  static cache: { [k: string]: string; } = {};
  static async transpile(text: string): Promise<string> {
    try {
      if (this.cache[text]) return this.cache[text];
      const result = (await Deno.emit('/transpiled.ts', {
        check: false,
        sources: {
          "/transpiled.ts": text,
        },
        compilerOptions: this.transpileCompilerOptions,
      })).files["file:///transpiled.ts.js"];
      if (!this.cache[text] || this.cache[text] !== result) {
        this.cache[text] = result;
      }
      return result;
    } catch {
      return text;
    }
  }
  static async bundle(url: URL | string): Promise<string> {
    let result = (await Deno.emit(url, {
      bundle: 'esm',
      check: false,
    }));
    const file = result.files['deno:///bundle.js'];
    return file;
  }
  /**
   * saves Ogone's runtime, which is bundled, into MapOutput.runtime
   */
  static async getRuntime(bundle: Bundle) {
    const file = `
      import { Ogone } from '${this.runtimeBaseURL}';
      import {
        setReactivity,
        _h,
        _ap,
        _at,
        _hns,
        _atns,
        imp,
        construct,
        setOgone,
        setNodeProps,
        setPosition,
        setProps,
        useSpread,
        setNodes,
        removeNodes,
        destroy,
        setEvents,
        routerSearch,
        setActualRouterTemplate,
        setNodeAsyncContext,
        setAsyncContext,
        OnodeRecycleWebComponent,
        saveUntilRender,
        bindValue,
        bindClass,
        bindHTML,
        bindStyle,
        setContext,
        setDevToolContext,
        displayError,
        showPanel,
        infosMessage,
        renderSlots,
        renderNode,
        renderStore,
        renderRouter,
        renderAsyncRouter,
        renderAsyncStores,
        renderAsyncComponent,
        renderComponent,
        renderAsync,
        renderingProcess,
        renderContext,
        triggerLoad,
        setDeps,
        setHMRContext,
        routerGo,
        OnodeTriggerDefault,
        OnodeUpdate,
        OnodeRenderTexts,
        OnodeReactions,
        initStore,
        OnodeUpdateStore,
        OnodeUpdateService,
        OnodeUpdateProps,
        OnodePlugWebComponent,
        OnodeDestroyPluggedWebcomponent,
        OnodeListRendering,
      } from '${this.runtimeURL}';
      // outputs
      ${bundle.output}
    `;
    Deno.writeTextFileSync(this.outputURL, file);
    MapOutput.runtime = (await this.bundle(this.outputURL)).replace(/\n/gi, ' ');
  }
}
