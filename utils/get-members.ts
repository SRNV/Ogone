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
export function getMembers(tokens: string): { [key: string]: string } {
  let result: any = {
    members: [],
    default: {
      alias: '',
      name: '',
    },
  };
  const regexpGI = /\b(.*?)(?:\s+(?:as)\s+(.*?)){0,1}(?:(\,|\}))/gi;
  const regexp = /\b(.*?)(?:\s+(?:as)\s+(.*?)){0,1}(?:(\,|\}))/i;
  const realKey = tokens
    .replace(/\n,/gi, ",")
    .replace(/,\}/gi, "}")
    .trim();
  const m = realKey.match(regexpGI);
  if (m) {
    m.forEach((match) => {
      const p = match.match(regexp);
      if (p) {
        // @ts-ignore
        const [, variable, alias] = p;
        if (variable) {
          console.warn(1, variable, alias);
          result.members.push({
            variable,
            alias,
          });
        }
      }
    });
  }
  return result;
}