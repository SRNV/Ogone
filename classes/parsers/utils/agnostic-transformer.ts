import { TypedExpressions, ProtocolScriptRegExpList } from '../../../.d.ts';
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
    if (item.open && item.close && item.id && item.pair) {
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
          result = result.replace(
            item.reg as RegExp,
            item.id(value, matches, typedExpressions, expressions),
          );
        }
      }
      return;
    }
    if (item.open && item.close && item.id && !item.pair) {
      while (
        result.indexOf(item.open as string) > -1 &&
        result.indexOf(item.close as string) > -1 &&
        result.match(item.reg as RegExp)
      ) {
        const matches = result.match(item.reg as RegExp);
        const value = matches ? matches[0] : null;
        if (matches && value) {
          result = result.replace(
            item.reg as RegExp,
            item.id(value, matches, typedExpressions, expressions),
          );
        }
      }
      return;
    }
    if (item.open === false && item.close === false && item.id) {
      while (result.match(item.reg as RegExp)) {
        const matches = result.match(item.reg as RegExp);
        const value = matches ? matches[0] : null;
        if (matches && value) {
          result = result.replace(
            item.reg as RegExp,
            item.id(value, matches, typedExpressions, expressions),
          );

        }
      }
    }
    if (item.split && item.splittedId) {
      while (result.indexOf(item.split[0]) > -1
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
}