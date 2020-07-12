import iterator from "../../../../lib/iterator.ts";
import { Utils } from '../../../../classes/utils/index.ts';
interface ForCtxDescription<T> {
  index: string;
  item: string;
  array: string;
  content: T;
}
export default function oRenderForFlag(
  flagValue: string,
): ForCtxDescription<string> {
  if (flagValue.indexOf("as") === -1) {
    throw Utils.error(
      `[Ogone] Syntax Error: ${flagValue}, no (as) found \n\tPlease follow this --for syntax. arrayName as (item [, i]) `,
    );
  }
  const oForRegExp =
    /([\s\S]*)+\sas\s\(([^,\s\n\t]*)+,{0,1}\s{0,1}(([^,\s\n\t]*)+){0,1}\)/gi
      .exec(
        flagValue,
      );
  if (!oForRegExp) {
    throw Utils.error(
      `[Ogone] Syntax Error: ${flagValue} \n\tPlease follow this --for syntax. arrayName as (item [, i]) `,
    );
  }
  let [, arrayName, item, index] = oForRegExp;
  arrayName = flagValue.split("as")[0].trim();
  return {
    index: index ? index : `i${iterator.next().value}`,
    item,
    array: arrayName,
    content: flagValue,
  };
}
