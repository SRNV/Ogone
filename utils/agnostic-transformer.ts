import type { ProtocolScriptRegExpList } from '../src/ogone.main.d.ts';
import getDeepTranslation from './template-recursive.ts';
import { MapPosition } from '../src/classes/MapPosition.ts';
function savePosition (id: string, start: number, end: number) {
  return MapPosition.mapTokens.set(id, {
    start,
    end,
  });
}
export default function (
  opts: {
    typedExpressions: any;
    expressions: any;
    value: string;
    name?: string;
    array: ProtocolScriptRegExpList;
    before?: (str: string) => string;
  },
) {
  try {
  const {
    typedExpressions,
    expressions,
    value,
    name,
    array,
    before,
  } = opts;
  let result: string = before ? before(value) : value;
  array.forEach((item) => {
    if (name && !item.name) return;
    if (name && item.name && name !== item.name) return;
    if (Deno.args.includes('--ogone-trace-transformations')) console.warn(item)
    if (item.open && item.close && item.id && item.pair) {
      if (Deno.args.includes('--ogone-trace-transformations')) console.warn(1);
      while (
        // we need to parse if the character is alone or not
        // no need to change it if it's not
        !((result.split(item.open as string).length - 1) % 2) &&
        result.indexOf(item.open as string) > -1 &&
        result.indexOf(item.close as string) > -1 &&
        result.match(item.reg as RegExp)
      ) {
        const matches = result.match(item.reg as RegExp);
        const value = matches ? matches[0] : null;
        if (matches && value) {
          const newId = item.id(value, matches, typedExpressions, expressions);
          result = result.replace(
            item.reg as RegExp,
            newId,
          );
          const start = getDeepTranslation(
            result.slice(0, result.indexOf(newId))
            , expressions).length;
          const end = getDeepTranslation(value, expressions).length + start;
          savePosition(newId, start, end);
        }
      }
      return;
    }
    if (item.open && item.close && item.id && !item.pair) {
      if (Deno.args.includes('--ogone-trace-transformations')) console.warn(2);
      while (
        result &&
        result.indexOf(item.open as string) > -1 &&
        result.indexOf(item.close as string) > -1 &&
        result.match(item.reg as RegExp)
      ) {
        const matches = result.match(item.reg as RegExp);
        const value = matches ? matches[0] : null;
        if (matches && value) {
          const newId = item.id(value, matches, typedExpressions, expressions);
          result = result.replace(
            item.reg as RegExp,
            newId,
          );
          const start = getDeepTranslation(
            result.slice(0, result.indexOf(newId))
            , expressions).length;
          const end = getDeepTranslation(value, expressions).length + start;
          savePosition(newId, start, end);
        }
      }
      return;
    }
    if (item.open === false && item.close === false && item.id) {
      if (Deno.args.includes('--ogone-trace-transformations')) console.warn(3);
      while (result && result.match(item.reg as RegExp)) {
        if (Deno.args.includes('--ogone-trace-transformations')) console.warn(result.length, result.match(item.reg as RegExp)!.index, item);
        const matches = result.match(item.reg as RegExp);
        const value = matches ? matches[0] : null;
        if (matches && value) {
        if (Deno.args.includes('--ogone-trace-transformations')) console.warn(value);
          const newId = item.id(value, matches, typedExpressions, expressions);
          result = result.replace(
            item.reg as RegExp,
            newId,
          );
          const start = getDeepTranslation(
            result.slice(0, result.indexOf(newId))
            , expressions).length;
          const end = getDeepTranslation(value, expressions).length + start;
          savePosition(newId, start, end);
        }
      }
    }
    if (item.split && item.splittedId) {
      while (result && result.indexOf(item.split[0]) > -1
        && result.indexOf(item.split[1]) > -1
        && result.indexOf(item.split[0]) < result.indexOf(item.split[1])) {
        const part1 = result.substring(
          result.indexOf(item.split[0]),
          result.indexOf(item.split[1]) + 2,
        );
        result = result.replace(part1, item.splittedId(result, expressions));
      }
    }
  });
  return result;
  } catch (err) {
    throw err;
  }
}