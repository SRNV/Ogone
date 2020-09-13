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
type ImportDescriber = {
  members: ({ name: string, alias: string })[],
  hasDefault: boolean,
  hasMembers: boolean,
  hasAllAs: boolean,
  default: {
    alias?: string,
    name: string,
  },
  allAs?: string,
}
export function getMembers(tokens: string): ImportDescriber {
  let result: ImportDescriber = {
    members: [],
    hasDefault: false,
    hasMembers: false,
    hasAllAs: false,
    default: {
      alias: void 0,
      name: '',
    },
    allAs: void 0,
  };
  const membersRegExpGI = /\b(.*?)(?:\s+(?:as)\s+(.*?)){0,1}(?:[\}\,])/gi;
  const membersRegExp = /\b(.*?)(?:\s+(?:as)\s+(.*?)){0,1}(?:[\}\,])/i;
  const allAsRegExp = /(\*)\s+(?:as)\s+(.+?)(?:(\,|\s))/i;
  const defaultRegExp = /(.+?)(?=\b)/i;
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
            if (p) {
              // @ts-ignore
              const [, variable, alias] = p;
              if (variable) {
                result.hasMembers = true;
                result.members.push({
                  name: variable.trim(),
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
  let allAsTokenMatch = `${text} `.match(allAsRegExp);
  console.warn(text, allAsTokenMatch);
  // now get '* as exportName' expression
  while (allAsTokenMatch) {
    const [input, asterix, name] = allAsTokenMatch;
    result.allAs = name;
    text = text.replace(input.trim(), '');
    allAsTokenMatch = `${text} `.match(allAsRegExp);
    result.hasAllAs = true;
  }
  // time to fetch the default import
  // now text is free from "* as export1" and "{ exportMembers, [...]}"
  // so the only thing that still is the words
  const defaultTokenMatch = text.match(defaultRegExp);
  if (defaultTokenMatch) {
    const [input, name] = defaultTokenMatch;
    result.default.name = name;
    text = text.replace(input, '');
    result.hasDefault = true;
  }
  return result;
}