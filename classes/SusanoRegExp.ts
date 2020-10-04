export default class SusanoRegularExpressions {
    protected readonly exportsRegExpGI =
      /(§{2}keywordExport\d+§{2})(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/gi;
    protected readonly exportsRegExp =
      /(§{2}keywordExport\d+§{2})(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/i;

    protected readonly importsRegExpGI =
      /(§{2}keywordImport\d+§{2})(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/gi;
    protected readonly importsRegExp =
      /(§{2}keywordImport\d+§{2})(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/i;

    protected readonly blockFunctionRegExp =
      /(\bfunction\b)(.*?)(\<(.*?)\>){0,1}(§{2}parenthese\d+§{2})((?:§{2}optionDiviser\d+§{2})(.*?)){0,1}(.*?)(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/i;
    protected readonly blockFunctionRegExpGI =
      /(\bfunction\b)(.*?)(\<(.*?)\>){0,1}(§{2}parenthese\d+§{2})((?:§{2}optionDiviser\d+§{2})(.*?)){0,1}(.*?)(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/gi;

    protected readonly classRegExp =
      /(§{2}keywordClass\d+§{2})(.*?)\s*(?:§{2}keywordExtends\d+§{2}(.*?)){0,1}(§{2}block\w*\d+§{2})\s*(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/i;
    protected readonly classRegExpGI =
      /(§{2}keywordClass\d+§{2})(.*?)\s*(?:§{2}keywordExtends\d+§{2}(.*?)){0,1}(§{2}block\w*\d+§{2})\s*(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/gi;

    protected readonly constLetVarRegExp =
      /(const|§{2}(keywordLet|keywordVar)\d+§{2})(.*?)((?:§{2}optionDiviser\d+§{2})(.*?)){0,1}(?:§{2}operatorsetter\d+§{2})(.*?)(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/i;
    protected readonly constLetVarRegExpGI =
      /(const|§{2}(keywordLet|keywordVar)\d+§{2})(.*?)((?:§{2}optionDiviser\d+§{2})(.*?)){0,1}(?:§{2}operatorsetter\d+§{2})(.*?)(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/gi;

    protected readonly ifStatementRegExp =
      /(\bif\b)([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
    protected readonly ifStatementRegExpGI =
      /(\bif\b)([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;

    protected readonly elseifStatementRegExp =
      /(\belse\s+if\b)(.*?)(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
    protected readonly elseifStatementRegExpGI =
      /(\belse\s+if\b)(.*?)(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;

    protected readonly elseStatementRegExp =
      /(\belse\b)(.*?)(§{2}block\d+§{2})/i;
    protected readonly elseStatementRegExpGI =
      /(\belse\b)(.*?)(§{2}block\d+§{2})/gi;

    protected readonly labelRegExp =
      /([\w\d]*)+\s+(§{2}optionDiviser\d+§{2})\s*(§{2}block\d+§{2})/i;
    protected readonly labelRegExpGI =
      /([\w\d]*)+\s+(§{2}optionDiviser\d+§{2})\s*(§{2}block\d+§{2})/gi;

    protected readonly forStatementRegExp =
      /(\bfor\b)(.*?)(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
    protected readonly forStatementRegExpGI =
      /(\bfor\b)(.*?)(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;

    protected readonly whileStatementRegExp =
      /(\bwhile\b)([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
    protected readonly whileStatementRegExpGI =
      /(\bwhile\b)([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;

    protected readonly withStatementRegExp =
      /(\bwith\b)([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
    protected readonly withStatementRegExpGI =
      /(\bwith\b)([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;

    protected readonly doWhileStatementRegExp =
      /(\bdo\b)([\s\n\r\t]*)*(§{2}block\d+§{2})([\s\n\r\t]*)*(\bwhile\b)([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
    protected readonly doWhileStatementRegExpGI =
      /(\bdo\b)([\s\n\r\t]*)*(§{2}block\d+§{2})([\s\n\r\t]*)*(\bwhile\b)([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;

    protected readonly swhitchStatementRegExp =
      /(\bswitch\b)([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/i;
    protected readonly switchStatementRegExpGI =
      /(\bswitch\b)([\s\n\r\t]*)*(§{2}parenthese\d+§{2})([\s\n\r\t]*)*(§{2}block\d+§{2})/gi;
  }
