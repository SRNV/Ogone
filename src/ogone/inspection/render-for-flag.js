import iterator from "../../lib/iterator.js";

export default function oRenderForFlag(flagValue) {
  if (flagValue.indexOf("as") === -1) {
    const OgoneForFlagSyntaxException = new Error(
      `[Ogone] Syntax Error: ${flagValue}, no (as) found \n\tPlease follow this --for syntax. arrayName as (item [, i]) `,
    );
    throw OgoneForFlagSyntaxException;
  }
  const oForRegExp =
    /([\s\S]*)+\sas\s\(([^,\s\n\t]*)+,{0,1}\s{0,1}(([^,\s\n\t]*)+){0,1}\)/gi
      .exec(
        flagValue,
      );
  if (!oForRegExp) {
    const OgoneForFlagSyntaxException = new Error(
      `[Ogone] Syntax Error: ${flagValue} \n\tPlease follow this --for syntax. arrayName as (item [, i]) `,
    );
    throw OgoneForFlagSyntaxException;
  }
  let [context, arrayName, item, index] = oForRegExp;
  arrayName = flagValue.split("as")[0].trim();
  return {
    index: index ? index : `i${iterator.next().value}`,
    item,
    array: arrayName,
    content: flagValue,
  };
}
