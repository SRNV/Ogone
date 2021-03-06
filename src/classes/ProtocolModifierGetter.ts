import getTypedExpression from "../../utils/typedExpressions.ts";
import elements from "../../utils/elements.ts";
import notParsedElements from "../../utils/not-parsed.ts";
import getDeepTranslation from "../../utils/template-recursive.ts";
import read from '../../utils/agnostic-transformer.ts';
import { Utils } from "./Utils.ts";
import type {
  TypedExpressions,
  ModifierContext
} from "../ogone.main.d.ts";

export interface ModifierProvider {
  /** token used to split the protocol */
  token: string;
  /** the modifier should be the unique one */
  unique: boolean;
  /** set the argument's type following the modifier: case <string>, default <null> */
  argumentType?: null | string;
  /** when the modifier is parsed, first argument is the context of the modifier */
  onParse(ctx: ModifierContext): void;
  /** whenever a modifier should consider its indentation */
  indentStyle?: boolean;
  /** fs the code should get reactive */
  isReactive?: boolean;
  /** the modifier is excluding other modifier */
  exclude?: string[];
}
export interface ModifierProviderOptions {
  modifiers: ModifierProvider[];
  onError(error: Error): void;
}
/**
 * @name ProtocolModifierGetter
 * @code OPLG
 * @code OPLG-OCS1-OC0
 * @code OPLG-OIA3
 * @code OPLG-OSB4
 * @description
 * a better class to only provide the content of the modifiers like: def, default, declare, before-each, cases etc
 */
export default class ProtocolModifierGetter extends Utils {
  private expressions: { [k: string]: string } = {};
  private typedExpressions?: TypedExpressions;
  private modifiers?: ModifierProvider[];
  private onError?: ModifierProviderOptions['onError'];
  registerModifierProviders(text: string, { modifiers, onError }: ModifierProviderOptions): void {
    try {
      this.typedExpressions = getTypedExpression();
      this.expressions = {};
      this.modifiers = modifiers;
      this.onError = onError;
      const allTokens = this.getUncatchableModifiers();
      const globalRegExp: RegExp = new RegExp(`(${allTokens.join('|')})`, 'gi');
      const transformedText = read({
        typedExpressions: this.typedExpressions,
        expressions: this.expressions,
        value: text,
        array: notParsedElements.concat(elements, [{
          open: false,
          reg: /\n\s*\n/,
          id: (value, matches) => '\n',
          close: false,
        }]),
      });
      // split modifiers
      // now we got all the content following the token
      const contents = transformedText.split(globalRegExp).filter((s: string) => s && s.length);
      const result = this.getModifierContents(contents);
      this.hasBadArgument(result);
      this.hasDuplicateModifierImplementation(transformedText, result);
      this.triggerParsedModifiers(result, modifiers)
    } catch (err) {
      this.error(`ProtocolModifierGetter: ${err.message}
${err.stack}`);
    }
  }
  triggerExclusion(modifier: ModifierProvider, savedModifiers: { [k: string]: string[] }) {
    try {
      const keys = Object.keys(savedModifiers);
      if (modifier.exclude) {
        modifier.exclude.forEach((token2) => {
          const reg = new RegExp(`${token2}\\b`, 'i')
          const modifierRegExp = new RegExp(modifier.token, 'i')
          const excludedModifier = keys.find((token3) => reg.test(token3));
          const hasModifier = keys.find((token3) => modifierRegExp.test(token3));
          if (excludedModifier && this.onError && hasModifier) {
            const token3 = excludedModifier.trim().split(' ')[0].replace(/\:$/, '');
            this.onError(new Error(`can't use ${modifier.token} and ${token3} inside the same component.`));
          }
        });
      }
    } catch (err) {
      this.error(`ProtocolModifierGetter: ${err.message}
${err.stack}`);
    }
  }
  triggerParsedModifiers(savedModifiers: { [k: string]: string[] }, modifiers: ModifierProvider[]): void {
    try {
      modifiers.forEach((modifier) => {
        if (modifier.onParse && typeof modifier.onParse === 'function') {
          const entries = Object.entries(savedModifiers);
          entries.reverse().forEach(([key, values]) => {
            const token = key.trim().split(' ')[0].replace(/\:$/, '');
            const value = values.reverse().join('');
            if (modifier.token === token) {
              this.triggerExclusion(modifier, savedModifiers);
              const newValue = getDeepTranslation(value, this.expressions);
              modifier.onParse({
                argument: getDeepTranslation(key.trim().split(' ')[1], this.expressions).replace(/\:$/, ''),
                token,
                value: newValue,
                endsWithBreak: !!value.trim().match(/\bbreak[\n\s]*;{0,1}$/)
              });
            }
          });
        }
      });
    } catch (err) {
      this.error(`ProtocolModifierGetter: ${err.message}
${err.stack}`);
    }
  }
  /** helps for handling separated string that isn't starting with a \n */
  cleanContents(contents: string[]): void {
    try {
      contents.forEach((content, i, arr) => {
        if (content.startsWith('\n')) return true;
        else if (arr[i - 1]) {
          arr[i - 1] = `${arr[i - 1]}${content}`;
          delete arr[i];
        }
      });
    } catch (err) {
      this.error(`ProtocolModifierGetter: ${err.message}
${err.stack}`);
    }
  }
  /** should throw an error if one modifier's argument is not using a good type */
  hasBadArgument(savedModifiers: { [k: string]: string[] }): void {
    try {
      if (this.modifiers) {
        this.modifiers.map((modifierProvider) => {
          if (modifierProvider.argumentType && modifierProvider.argumentType === 'string') {
            const regExp = new RegExp(`(?:(?:\\s*)${modifierProvider.token}\\s+(\\<string\\d+\\>)\\s*\\:)`, 'i')
            const entries = Object.entries(savedModifiers);
            entries.forEach(([key, value]) => {
              const match = regExp.test(key.trim());
              if (key.startsWith(`${modifierProvider.token} `) && !match && this.onError) {
                this.onError(new Error(`modifier ${modifierProvider.token} is only waiting for a ${modifierProvider.argumentType} as argument. concatenations are not supported, please use template litteral`));
              }
            });
          }
        });
      }
    } catch (err) {
      this.error(`ProtocolModifierGetter: ${err.message}
${err.stack}`);
    }
  }
  /** should throw an error if one modifier is used multiple time */
  hasDuplicateModifierImplementation(text: string, savedModifiers: { [k: string]: string[] }): void {
    try {
      if (!this.onError) return;
      const allTokens = this.getCatchableModifiers();
      const globalRegExp: RegExp = new RegExp(`(${allTokens.join('|')})`, 'gi');
      const match = text.match(globalRegExp);
      const store: string[] = [];
      match?.forEach((m) => {
        if (this.modifiers) {
          const token = m.trim();
          const name = token.split(/(?:\s|\:$)/)[0];
          const modifierProvider = this.modifiers.find((modifier: ModifierProvider) => modifier.token === name && modifier.unique);
          if (store.includes(m) && savedModifiers[m] && this.onError && modifierProvider) {
            this.onError(new Error(`[Protocol] - Duplicate modifier implementation: ${modifierProvider.token}`));
          } else {
            store.push(m);
          }
        }
      });
    } catch (err) {
      this.error(`ProtocolModifierGetter: ${err.message}
${err.stack}`);
    }
  }
  /** returns strings with regexp that should just be used for testing regexp of modifiers */
  getUncatchableModifiers(): string[] {
    try {
      if (!this.modifiers) return [];
      return this.modifiers.map((modifierProvider) => {
        // we add the space for indentations
        if (modifierProvider.argumentType && modifierProvider.argumentType === 'string') return `(?:(?:\\s*)${modifierProvider.token}\\s*(?:.+?)\\s*\\:)`;
        return `(?:\\s*)${modifierProvider.token}\\s*\\:`;
      });
    } catch (err) {
      this.error(`ProtocolModifierGetter: ${err.message}
${err.stack}`);
    }
  }
  /** returns strings with regexp, you can capture all groups */
  getCatchableModifiers(): string[] {
    try {
      if (!this.modifiers) return [];
      return this.modifiers.map((modifierProvider) => {
        // we add the space for indentations
        if (modifierProvider.argumentType && modifierProvider.argumentType === 'string') return `\\n((?:\\s*)${modifierProvider.token}\\s*(.+?)\\s*\\:)`;
        return `\\n(\\s*)${modifierProvider.token}\\s*\\:`;
      });
    } catch (err) {
      this.error(`ProtocolModifierGetter: ${err.message}
${err.stack}`);
    }
  }
  getModifierContents(contents: string[]): { [k: string]: string[] } {
    try {
      if (!this.modifiers) return {};
      this.cleanContents(contents)
      const tokens = this.getCatchableModifiers();
      const indentRegExp = /\n\s*/;
      const result: { [k: string]: string[] } = {};
      const reversedContents = contents.slice().reverse();
      reversedContents.forEach((content, i, arr) => {
        const match = content.match(indentRegExp)
        const matchingToken = tokens.find((token) => new RegExp(token, 'g').exec(content));
        if (match) {
          const [indent] = match;
          if (!indent || !content.length) return;
          const parent = reversedContents.find((content2: string, id) => {
            const m = content2?.match(indentRegExp);
            if (m) {
              const matchingTokenForCandidate = tokens.find((token) => new RegExp(token, 'g').exec(content2));
              const [indent2] = m;
              return indent2
                && indent2.length < indent.length
                && id > i
                && matchingTokenForCandidate
                || matchingTokenForCandidate
                && !matchingToken
                && id > i;
            }
          })
          if (parent) {
            const name = parent;
            result[name] = result[name] || [];
            result[name].push(content);
          }
          if (!parent && matchingToken) {
            const match = new RegExp(matchingToken).exec(content);
            if (match) {
              const [input] = match;
              const value = content.replace(input, '');
              if (value.length) {
                const name = input;
                result[name] = result[name] || [];
                result[name].push(value);
              }
            }
          }
        }
      })
      return result;
    } catch (err) {
      this.error(`ProtocolModifierGetter: ${err.message}
${err.stack}`);
    }
  }
}
