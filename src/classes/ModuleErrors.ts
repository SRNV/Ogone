import { colors } from "../../deps.ts";
import Utils from "./Utils.ts";
/**
 * a class to display the errors inside the module
 */
interface ModuleErrorsDiagnostic {
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
  static checkDiagnostics(diagnostics: unknown[]) {
    const { blue, red,  gray, } = colors;
    function renderChainedDiags(chainedDiags: typeof diagnostics): string{
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
      for (const d of diagnostics.filter(d => (d as ModuleErrorsDiagnostic).start)) {
        const diag = d as (ModuleErrorsDiagnostic);
        const start = diag.start && diag.start.character || 0;
        const end = diag.end && diag.end.character || 0;
        const underline = red(`${' '.repeat(start)}^${'~'.repeat(end - start - 1)}`)
        let sourceline = diag && diag.sourceLine || '';
        sourceline = gray(sourceline.substring(0, start)) + red(sourceline.substring(start, end)) + gray(sourceline.substring(end));
        // add the error
        errors += `
        ${red(`TS${diag && diag.code} [ERROR]`)} ${blue(diag && diag.messageChain && diag.messageChain.messageText || diag && diag.messageText || '')}
        ${blue(renderChainedDiags(diag && diag.messageChain && diag.messageChain.next || []))}
          ${sourceline}
          ${underline}
        at ${blue(diag && diag.fileName || '')}:${diag.start && diag.start.line + 1 || ''}:${diag.start && diag.start.character || ''}`;
      }
      this.error(
        errors,
      );
      Deno.exit(1);
    } else {
      return;
    }
  }
  static error(message: string, opts?: { [k: string]: unknown }): void {
    const { bgRed, red, bold, yellow } = colors;
    const m: string = this.message(
      `${bgRed("  ERROR  ")} ${red(message)}`,
      { returns: true },
    ) as string;
    console.error(m);
  }
}
