export default class SusanoRegularExpressions {
    protected readonly exportsRegExpGI =
      /(\bexport\b)(.*?)(?:(§{2}endExpression\d+§{2}|(;|\n+)))/gi;
    protected readonly exportsRegExp =
      /(\bexport\b)(.*?)(?:(§{2}endExpression\d+§{2}|(;|\n+)))/i;

    protected readonly importsRegExpGI =
      /(\bimport\b)(.*?)(?:(§{2}endExpression\d+§{2}|(;|\n+)))/gi;
    protected readonly importsRegExp =
      /(\bimport\b)(.*?)(?:(§{2}endExpression\d+§{2}|(;|\n+)))/i;

    protected readonly blockFunctionRegExp =
      /(\bfunction\b)(.*?)(\<(.*?)\>){0,1}(<parenthese\d+>)((?:\:)(.*?)){0,1}(.*?)(§{2}endExpression\d+§{2}|(;|\n+))/i;
    protected readonly blockFunctionRegExpGI =
      /(\bfunction\b)(.*?)(\<(.*?)\>){0,1}(<parenthese\d+>)((?:\:)(.*?)){0,1}(.*?)(§{2}endExpression\d+§{2}|(;|\n+))/gi;

    protected readonly classRegExp =
      /(\bclass)(.*?)\s*(?:extends\b(.*?)){0,1}(<block\w*\d+>)\s*(§{2}endExpression\d+§{2}|(;|\n+))/i;
    protected readonly classRegExpGI =
      /(\bclass)(.*?)\s*(?:extends\b(.*?)){0,1}(<block\w*\d+>)\s*(§{2}endExpression\d+§{2}|(;|\n+))/gi;

    protected readonly constLetVarRegExp =
      /(const|let|var)(.*?)((?:\:)(.*?)){0,1}(?:\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+))(.*?)(§{2}endExpression\d+§{2}|(;|\n+))/i;
    protected readonly constLetVarRegExpGI =
      /(const|let|var)(.*?)((?:\:)(.*?)){0,1}(?:\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+))(.*?)(§{2}endExpression\d+§{2}|(;|\n+))/gi;

    protected readonly ifStatementRegExp =
      /(\bif\b)([\s\n\r\t]*)*(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/i;
    protected readonly ifStatementRegExpGI =
      /(\bif\b)([\s\n\r\t]*)*(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/gi;

    protected readonly elseifStatementRegExp =
      /(\belse\s+if\b)(.*?)(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/i;
    protected readonly elseifStatementRegExpGI =
      /(\belse\s+if\b)(.*?)(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/gi;

    protected readonly elseStatementRegExp =
      /(\belse\b)(.*?)(<block\d+>)/i;
    protected readonly elseStatementRegExpGI =
      /(\belse\b)(.*?)(<block\d+>)/gi;

    protected readonly modifierRegExp =
      /([\w\d]*)+\s+(\:)\s*(<block\d+>)/i;
    protected readonly modifierRegExpGI =
      /([\w\d]*)+\s+(\:)\s*(<block\d+>)/gi;

    protected readonly forStatementRegExp =
      /(\bfor\b)(.*?)(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/i;
    protected readonly forStatementRegExpGI =
      /(\bfor\b)(.*?)(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/gi;

    protected readonly whileStatementRegExp =
      /(\bwhile\b)([\s\n\r\t]*)*(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/i;
    protected readonly whileStatementRegExpGI =
      /(\bwhile\b)([\s\n\r\t]*)*(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/gi;

    protected readonly withStatementRegExp =
      /(\bwith\b)([\s\n\r\t]*)*(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/i;
    protected readonly withStatementRegExpGI =
      /(\bwith\b)([\s\n\r\t]*)*(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/gi;

    protected readonly doWhileStatementRegExp =
      /(\bdo\b)([\s\n\r\t]*)*(<block\d+>)([\s\n\r\t]*)*(\bwhile\b)([\s\n\r\t]*)*(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/i;
    protected readonly doWhileStatementRegExpGI =
      /(\bdo\b)([\s\n\r\t]*)*(<block\d+>)([\s\n\r\t]*)*(\bwhile\b)([\s\n\r\t]*)*(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/gi;

    protected readonly swhitchStatementRegExp =
      /(\bswitch\b)([\s\n\r\t]*)*(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/i;
    protected readonly switchStatementRegExpGI =
      /(\bswitch\b)([\s\n\r\t]*)*(<parenthese\d+>)([\s\n\r\t]*)*(<block\d+>)/gi;
  }
