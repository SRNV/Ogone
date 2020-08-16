export type ReadResult = {
  decorator: string;
  isDefault: boolean;
  isAbstract: boolean;
  className: string;
};
export default function readDecoratorsExportedClass(
  input: string,
): ReadResult | null {
  let result = input;
  const removeAll = [
    [/(")(.*)(?<!\\)("){1}/i],
    [/(')(.*)(?<!\\)('){1}/i],
    [/(`)([\s\S]*)+(?<!\\)(`){1}/i],
    [/\(([^\(\)])*\)/, undefined, "()"],
    [/\[([^\[\]])*\]/],
    ["/*", "*/"],
    [/\/\/(.*)(\n){0,1}/],
  ];
  removeAll.forEach(([opening, closing]: any[]) => {
    const isPair = closing instanceof Boolean;
    const isRegExp = opening instanceof RegExp && closing === undefined;
    const isTemplateLitteral = opening === "${" && closing instanceof RegExp;
    const isSymetric = typeof opening === "string" &&
      typeof closing === "string";
    switch (true) {
      case isRegExp:
        while (result.match(opening)) {
          result = result.replace(opening, "");
        }
        break;
      case isSymetric:
        const open = result.split(opening);
        open.forEach((part1) => {
          // part1 should start by the beiginning of the pair
          const content = part1.split(closing)[0];
          const all = `${opening}${content}${closing}`;
          result = result.replace(all, `${opening}${closing}`);
        });
        break;
    }
  });
  console.warn(result);
  const regExp =
    /(?:\@(?<decorator>[\w]+?))\s*(?:export\s+)(default\s+){0,1}(abstract\s+){0,1}(?:class\s+){0,1}(?<function>[\w]+?)\s+{/;
  const match = result.match(regExp);
  if (match) {
    const [, decorator, isDefault, isAbstract, className] = match;
    return {
      decorator,
      isDefault: !!isDefault,
      isAbstract: !!isAbstract,
      className,
    };
  }
  return null;
}
