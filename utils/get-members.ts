export function getMembersKeys(tokens: string): string[] {
  let result = tokens;
  const realKey = result
    .replace(/\n,/gi, ",")
    .replace(/,\}/gi, "}")
    .trim();
  const arr = realKey
    .replace(/^(\{)/, "[")
    .replace(/(\})$/, "]")
    .replace(/([\w]+)+/gi, "'$1'");
  const arrayOfKey = arr;
  return arrayOfKey.split('')
}

// TODO finish getMembers
// start by fetching all members: { export1, export2 as member }
// then fetch aliased imports: * as defaultExport
// then fetch default
export function getMembers(tokens: string): { [key: string]: string } {
  let result: any = {
    members: [],
    default: {
      alias: void 0,
      name: '',
    },
    allAs: void 0,
  };
  const membersRegExpGI = /\b(.*?)(?:\s+(?:as)\s+(.*?)){0,1}(?:[\}\,])/gi;
  const membersRegExp = /\b(.*?)(?:\s+(?:as)\s+(.*?)){0,1}(?:[\}\,])/i;
  const allAsRegExp = /(\*)\s+(?:as)\s+(.*?)(?:(\,))/i;
  let text = tokens
    .replace(/\n,/gi, ",")
    .trim();
  // first get all "{ export1, export2 as any }"
  text.split(/(?=\{)/gi)
    .filter(p => p.indexOf('}') > -1 && p.indexOf('{') > -1)
    .forEach((substring: string) => {
      substring.split(/(?:\{)/gi).forEach((part1: string) => {
        const content = part1.split('}')[0];
        // add a coma at the end of the content to help the regExp
        const m = `${content.trim()},`.match(membersRegExpGI);
        if (m) {
          m.forEach((match) => {
            const p = match.match(membersRegExp);
            console.warn(match, p)
            if (p) {
              // @ts-ignore
              const [, variable, alias] = p;
              if (variable) {
                result.members.push({
                  variable: variable.trim(),
                  alias: alias?.trim(),
                });
              }
            }
          });
          // replace all "{ export1, export2 as any }"
          text = text.replace(`{${content}}`, '');
        }
      });
    });
  const allAsTokenMatch = text.match(allAsRegExp);
  // now get '* as exportName' expression
  if (allAsTokenMatch) {
    const [, asterix, name] = allAsTokenMatch;
    result.allAs = name;
  }
  return result;
}