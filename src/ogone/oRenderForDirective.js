const uuid = require('uuid-node');

module.exports = function oRenderForDirective(directiveValue) {
  if (directiveValue.indexOf(':') === -1) {
    const OgoneForDirectiveSyntaxException = new Error(`[Ogone] Syntax Error: ${directiveValue}, no (:) found \n\tPlease follow this o-for syntax. arrayName:(item, i) `);
    throw OgoneForDirectiveSyntaxException;
  }
  const oForRegExp = /([\S]*)+:\(([^,\s\n\t]*)+,{0,1}\s{0,1}(([^,\s\n\t]*)+){0,1}\)/gi.exec(directiveValue);
  if (!oForRegExp) {
    const OgoneForDirectiveSyntaxException = new Error(`[Ogone] Syntax Error: ${directiveValue} \n\tPlease follow this o-for syntax. arrayName:(item, i) `);
    throw OgoneForDirectiveSyntaxException;
  }
  const [context, arrayName, item, index] = oForRegExp;
  return {
    index,
    item,
    array: arrayName,
    evaluated: `${arrayName}[${index}]`,
    content: context,
    limit: `l${uuid.generateUUID().split('-')[0]}`,
    exitVariable: `ex${uuid.generateUUID().split('-')[0]}`,
  };
}