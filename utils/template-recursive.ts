export default function templateReplacer(
  str: string = "",
  template: { [key: string]: string },
  callback?: (key: string) => string,
): string {
  let result: string = str;
  if (!template) return result;
  while (Object.keys(template).find((key) => result.indexOf(key) > -1)) {
    const key: any = Object.keys(template).find((key) =>
      result.indexOf(key) > -1
    );
    if (key) {
      const index = result.indexOf(key);
      const firstPart = result.substring(0, index);
      const secondPart = result.substring(index + key.length, result.length);
      result = `${firstPart}${
        callback ? callback(key) : template[key]
      }${secondPart}`;
    }
  }
  return result;
}
