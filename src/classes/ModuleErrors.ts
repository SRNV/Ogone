import { colors } from "../../deps/deps.ts";
import { Utils } from "./Utils.ts";
import { Bundle } from '../ogone.main.d.ts';
import { Configuration } from "./Configuration.ts";
import Workers from "../enums/workers.ts";
import { MapPosition } from './MapPosition.ts';
import HMR from "./HMR.ts";
/**
 * a class to display the errors inside the module
 */
export interface ModuleErrorsDiagnostic {
  start?: {
    character: number;
    line: number;
  };
  end?: {
    character: number;
    line: number;
  };
  sourceLine?: string;
  messageText?: string;
  messageChain?: {
    messageText: string;
    category: number;
    code: number;
    next: Pick<ModuleErrorsDiagnostic, 'messageText' | 'category' | 'code'>[];
  }
  fileName?: string;
  category: number;
  code: number;
}
export abstract class ModuleErrors extends Utils {
  static checkDiagnostics(bundle: Bundle, diagnostics: unknown[], onError?: Function) {
    try {
      const { blue, red, gray, } = colors;
      function renderChainedDiags(chainedDiags: typeof diagnostics): string {
        let result = ``;
        const { red } = colors;
        if (chainedDiags && chainedDiags.length) {
          for (const d of chainedDiags) {
            const diag = d as (ModuleErrorsDiagnostic);
            result += red(`TS${diag.code} [ERROR] `);
            result += `${diag && diag.messageText}\n`
          }
        }
        return result;
      }
      if (diagnostics && diagnostics.length) {
        let errors = '';
        if (onError) {
          onError();
        }
        let errorUuid: string | undefined;
        for (const d of diagnostics.filter(d => !!(d as ModuleErrorsDiagnostic).start)) {
          const diag = d as (ModuleErrorsDiagnostic);
          if (diag) {
            errorUuid = diag.fileName && diag.fileName.match(/(?<=\/)(?<uuid>[\w\d\-]+?)\.tsx$/)?.groups?.uuid || undefined;
          }
          const start = diag.start && diag.start.character || 0;
          const end = diag.end && diag.end.character || 0;
          const repeatNumber = end - start - 1
          const underline = red(`${' '.repeat(start)}^${'~'.repeat(repeatNumber > 0 ? repeatNumber : 0)}`)
          let sourceline = diag && diag.sourceLine || '';
          sourceline = repeatNumber >= 0 ?
            gray(sourceline.substring(0, start))
            + red(sourceline.substring(start, end))
            + gray(sourceline.substring(end)) :
            red(sourceline);
          // add the error
          errors += `
        ${red(`TS${diag && diag.code} [ERROR]`)} ${blue(diag && diag.messageChain && diag.messageChain.messageText || diag && diag.messageText || '')}
        ${blue(renderChainedDiags(diag && diag.messageChain && diag.messageChain.next || []))}
          ${sourceline}
          ${underline}`;
          // TODO add errors, send them to the webview
          // retrieve the position of the error
          // by using the nodes
          if (errorUuid) {
            const component = Array.from(bundle.components.values()).find((component) => component.uuid === errorUuid);
            if (component) {
              let node = component.rootNode.nodeList.slice().reverse().find((node) => {
                const tsx = node!.getOuterTSX!(component).trim();
                const truth = tsx.startsWith(diag.sourceLine!.trim()) || tsx.includes(diag.sourceLine!.trim());
                return truth;
              });
              if (!node) {
                const proto = component.elements.proto[0];
                if (proto) {
                  const innerHTML = proto.getInnerHTML!();
                  const truth = innerHTML.startsWith(diag.sourceLine!.trim()) || innerHTML.includes(diag.sourceLine!.trim());
                  if (truth) {
                    node = proto;
                  }
                }
              }
              const position = MapPosition.mapNodes.get(node);
              if (position) {
                errors += `
                at ${blue(component && component.file || '')}:${position.line}:${diag.start && diag.start.character || position.column}
                `;
              } else {
                errors += `
                at ${blue(component && component.file || '')}:${diag.start && diag.start.line + 1 || ''}:${diag.start && diag.start.character || ''}
                `;
              }
            }
          }
        }
        this.ShowErrors(
          `\n${errors}`,
          diagnostics as ModuleErrorsDiagnostic[]
        );
      } else {
        HMR.removeErrors();
        return;
      }
    } catch (err) {
      this.error(`ModuleErrors: ${err.message}
${err.stack}`);
    }
  }
  static ShowErrors(message: string, diagnostics: ModuleErrorsDiagnostic[]): void {
    try {
      const { bgRed, red, bold, yellow } = colors;
      const m: string = ModuleErrors.message(
        `${bgRed("  ERROR  ")} ${red(message)}`,
        { returns: true },
      ) as string;
      console.error(m);
      HMR.error = m;
      HMR.diagnostics = diagnostics;
      HMR.sendError(m, diagnostics);
      setTimeout(() => {
        if (!Configuration.OgoneDesignerOpened) {
          // if the webview isn't opened
          // this means the end user is not using the Ogone Designer
          // so we can exit
          Deno.exit(1);
        }
      }, 500);
    } catch (err) {
      this.error(`ModuleErrors: ${err.message}
${err.stack}`);
    }
  }
}
