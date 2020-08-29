export default class MenthalistRegularExpressions {
  protected readonly exportsRegExpGI = /(§{2}keywordExport\d+§{2})(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/gi;
  protected readonly exportsRegExp = /(§{2}keywordExport\d+§{2})(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/i;

  protected readonly importsRegExpGI = /(§{2}keywordImport\d+§{2})(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/gi;
  protected readonly importsRegExp = /(§{2}keywordImport\d+§{2})(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/i;

  protected readonly blockFunctionRegExp = /(§{2}keywordFunction\d+§{2})(.*?)(\<(.*?)\>){0,1}(§{2}parenthese\d+§{2})((?:§{2}optionDiviser\d+§{2})(.*?)){0,1}(.*?)(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/i;
  protected readonly blockFunctionRegExpGI = /(§{2}keywordFunction\d+§{2})(.*?)(\<(.*?)\>){0,1}(§{2}parenthese\d+§{2})((?:§{2}optionDiviser\d+§{2})(.*?)){0,1}(.*?)(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/gi;

  protected readonly classRegExp = /(§{2}keywordClass\d+§{2})(.*?)\s*(?:§{2}keywordExtends\d+§{2}(.*?)){0,1}(§{2}block\w*\d+§{2})\s*(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/i;
  protected readonly classRegExpGI = /(§{2}keywordClass\d+§{2})(.*?)\s*(?:§{2}keywordExtends\d+§{2}(.*?)){0,1}(§{2}block\w*\d+§{2})\s*(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/gi;

  protected readonly constLetVarRegExp = /(§{2}(keywordConst|keywordLet|keywordVar)\d+§{2})(.*?)((?:§{2}optionDiviser\d+§{2})(.*?)){0,1}(?:§{2}operatorsetter\d+§{2})(.*?)(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/i;
  protected readonly constLetVarRegExpGI = /(§{2}(keywordConst|keywordLet|keywordVar)\d+§{2})(.*?)((?:§{2}optionDiviser\d+§{2})(.*?)){0,1}(?:§{2}operatorsetter\d+§{2})(.*?)(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/gi;
}
