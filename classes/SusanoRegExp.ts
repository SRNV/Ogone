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
      /(\bfunction\b)(.*?)(\<(.*?)\>){0,1}(\d+_parenthese)((?:\:)(.*?)){0,1}(.*?)(§{2}endExpression\d+§{2}|(;|\n+))/i;
    protected readonly blockFunctionRegExpGI =
      /(\bfunction\b)(.*?)(\<(.*?)\>){0,1}(\d+_parenthese)((?:\:)(.*?)){0,1}(.*?)(§{2}endExpression\d+§{2}|(;|\n+))/gi;

    protected readonly classRegExp =
      /(\bclass)(.*?)\s*(?:extends\b(.*?)){0,1}(<block\w*\d+>)\s*(§{2}endExpression\d+§{2}|(;|\n+))/i;
    protected readonly classRegExpGI =
      /(\bclass)(.*?)\s*(?:extends\b(.*?)){0,1}(<block\w*\d+>)\s*(§{2}endExpression\d+§{2}|(;|\n+))/gi;

    protected readonly constLetVarRegExp =
      /(const|let|var)(.*?)((?:\:)(.*?)){0,1}(?:\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+))(.*?)(§{2}endExpression\d+§{2}|(;|\n+))/i;
    protected readonly constLetVarRegExpGI =
      /(const|let|var)(.*?)((?:\:)(.*?)){0,1}(?:\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+))(.*?)(§{2}endExpression\d+§{2}|(;|\n+))/gi;

    protected readonly ifStatementRegExp =
      /(\bif\b)([\s\n\r\t]*)*(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/i;
    protected readonly ifStatementRegExpGI =
      /(\bif\b)([\s\n\r\t]*)*(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/gi;

    protected readonly elseifStatementRegExp =
      /(\belse\s+if\b)(.*?)(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/i;
    protected readonly elseifStatementRegExpGI =
      /(\belse\s+if\b)(.*?)(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/gi;

    protected readonly elseStatementRegExp =
      /(\belse\b)(.*?)(\d+_block)/i;
    protected readonly elseStatementRegExpGI =
      /(\belse\b)(.*?)(\d+_block)/gi;

    protected readonly modifierRegExp =
      /([\w\d]*)+\s+(\:)\s*(\d+_block)/i;
    protected readonly modifierRegExpGI =
      /([\w\d]*)+\s+(\:)\s*(\d+_block)/gi;

    protected readonly forStatementRegExp =
      /(\bfor\b)(.*?)(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/i;
    protected readonly forStatementRegExpGI =
      /(\bfor\b)(.*?)(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/gi;

    protected readonly whileStatementRegExp =
      /(\bwhile\b)([\s\n\r\t]*)*(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/i;
    protected readonly whileStatementRegExpGI =
      /(\bwhile\b)([\s\n\r\t]*)*(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/gi;

    protected readonly withStatementRegExp =
      /(\bwith\b)([\s\n\r\t]*)*(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/i;
    protected readonly withStatementRegExpGI =
      /(\bwith\b)([\s\n\r\t]*)*(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/gi;

    protected readonly doWhileStatementRegExp =
      /(\bdo\b)([\s\n\r\t]*)*(\d+_block)([\s\n\r\t]*)*(\bwhile\b)([\s\n\r\t]*)*(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/i;
    protected readonly doWhileStatementRegExpGI =
      /(\bdo\b)([\s\n\r\t]*)*(\d+_block)([\s\n\r\t]*)*(\bwhile\b)([\s\n\r\t]*)*(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/gi;

    protected readonly swhitchStatementRegExp =
      /(\bswitch\b)([\s\n\r\t]*)*(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/i;
    protected readonly switchStatementRegExpGI =
      /(\bswitch\b)([\s\n\r\t]*)*(\d+_parenthese)([\s\n\r\t]*)*(\d+_block)/gi;
  }
