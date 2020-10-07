export default class SusanoRegularExpressions {
    protected readonly exportsRegExpGI =
      /(\bexport\b)(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/gi;
    protected readonly exportsRegExp =
      /(\bexport\b)(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/i;

    protected readonly importsRegExpGI =
      /(\bimport\b)(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/gi;
    protected readonly importsRegExp =
      /(\bimport\b)(.*?)(?:§{2}(endPonctuation|endLine|endExpression)\d+§{2})/i;

    protected readonly blockFunctionRegExp =
      /(\bfunction\b)(.*?)(\<(.*?)\>){0,1}(§{2}parenthese\d+§{2})((?:\:)(.*?)){0,1}(.*?)(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/i;
    protected readonly blockFunctionRegExpGI =
      /(\bfunction\b)(.*?)(\<(.*?)\>){0,1}(§{2}parenthese\d+§{2})((?:\:)(.*?)){0,1}(.*?)(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/gi;

    protected readonly classRegExp =
      /(\bclass)(.*?)\s*(?:extends\b(.*?)){0,1}(§{2}block\w*\d+§{2})\s*(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/i;
    protected readonly classRegExpGI =
      /(\bclass)(.*?)\s*(?:extends\b(.*?)){0,1}(§{2}block\w*\d+§{2})\s*(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/gi;

    protected readonly constLetVarRegExp =
      /(const|let|var)(.*?)((?:\:)(.*?)){0,1}(?:\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+))(.*?)(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/i;
    protected readonly constLetVarRegExpGI =
      /(const|let|var)(.*?)((?:\:)(.*?)){0,1}(?:\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+))(.*?)(§{2}(?:endLine|endPonctuation|endExpression)\d+§{2})/gi;

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
      /([\w\d]*)+\s+(\:)\s*(§{2}block\d+§{2})/i;
    protected readonly labelRegExpGI =
      /([\w\d]*)+\s+(\:)\s*(§{2}block\d+§{2})/gi;

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
