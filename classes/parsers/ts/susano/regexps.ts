export default class SusanoRegularExpressions {
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

  protected readonly ifStatementRegExp = /(§{2}keywordIf\d+§{2})([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
  protected readonly ifStatementRegExpGI = /(§{2}keywordIf\d+§{2})([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;

  protected readonly elseifStatementRegExp = /(§{2}keywordElseIf\d+§{2})(.*?)(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
  protected readonly elseifStatementRegExpGI = /(§{2}keywordElseIf\d+§{2})(.*?)(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;

  protected readonly elseStatementRegExp = /(§{2}keywordElse\d+§{2})(.*?)(§{2}block\d+§{2})/i;
  protected readonly elseStatementRegExpGI = /(§{2}keywordElse\d+§{2})(.*?)(§{2}block\d+§{2})/gi;

  protected readonly labelRegExp = /([\w\d]*)+\s+(§{2}optionDiviser\d+§{2})\s*(§{2}block\d+§{2})/i;
  protected readonly labelRegExpGI = /([\w\d]*)+\s+(§{2}optionDiviser\d+§{2})\s*(§{2}block\d+§{2})/gi;

  protected readonly forStatementRegExp = /(§{2}keywordFor\d+§{2})(.*?)(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
  protected readonly forStatementRegExpGI = /(§{2}keywordFor\d+§{2})(.*?)(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;

  protected readonly whileStatementRegExp = /(§{2}keywordWhile\d+§{2})([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
  protected readonly whileStatementRegExpGI = /(§{2}keywordWhile\d+§{2})([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;

  protected readonly withStatementRegExp = /(§{2}keywordWith\d+§{2})([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
  protected readonly withStatementRegExpGI = /(§{2}keywordWith\d+§{2})([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;

  protected readonly doWhileStatementRegExp = /(§{2}keywordDo\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})([\s\n\r\t]*)*(§{2}keywordWhile\d+§{2})([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
  protected readonly doWhileStatementRegExpGI = /(§{2}keywordDo\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})([\s\n\r\t]*)*(§{2}keywordWhile\d+§{2})([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;

  protected readonly swhitchStatementRegExp = /(§{2}keywordSwitch\d+§{2})([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
  protected readonly switchStatementRegExpGI = /(§{2}keywordSwitch\d+§{2})([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;
}
