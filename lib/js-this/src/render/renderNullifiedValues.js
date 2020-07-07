import gen from "../generator.js";

const nullish = [
  // strings
  {
    open: '"',
    reg: /\"([^"])*\"/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§string${gen.next().value}§§`;
      expressions[id] = value;
      return id;
    },
    close: '"',
  },
  {
    open: '\"',
    reg: /\\\"([^"]*)+\\\"/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§escapedstring${gen.next().value}§§`;
      expressions[id] = value;
      return id;
    },
    close: '\"',
  },
  {
    open: "'",
    reg: /\'([^']*)+\'/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§string${gen.next().value}§§`;
      expressions[id] = value;
      return id;
    },
    close: "'",
  },
  {
    open: "\'",
    reg: /\\\'([^']*)+\\\'/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§escapedstring${gen.next().value}§§`;
      expressions[id] = value;
      return id;
    },
    close: "\'",
  },
  {
    open: "`",
    reg: /\`([^`]*)+\`/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§string${gen.next().value}§§`;
      expressions[id] = value;
      return id;
    },
    close: "`",
  },
  {
    open: "\`",
    reg: /\\\`([^`]*)+\\\`/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§escapedstring${gen.next().value}§§`;
      expressions[id] = value;
      return id;
    },
    close: "\`",
  },
  // end annulations
  {
    split: ["/*", "*/"],
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§comment${gen.next().value}§§`;
      expressions[id] = value;
      return "";
    },
  },
  {
    open: "//",
    reg: /(?<!\:)\/\/([^\n])+\n/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `§§commentLine${gen.next().value}§§`;
      expressions[id] = value;
      return "";
    },
    close: "/",
  },
];
export default function (typedExpressions, expressions, str, name) {
  let result = str;
  nullish.forEach((item) => {
    if (name && !item.name) return;
    if (name && item.name && name !== item.name) return;
    if (item.open && item.close) {
      while (
        // we need to parse if the character is alone or not
        // no need to change it if it's not
        !((result.split(item.open).length - 1) % 2) &&
        result.indexOf(item.open) > -1 && result.indexOf(item.close) > -1 &&
        result.match(item.reg)
      ) {
        const matches = result.match(item.reg);
        const value = matches[0];
        result = result.replace(
          item.reg,
          item.id(value, matches, typedExpressions, expressions),
        );
      }
      return;
    }
    if (item.open === false && item.close === false) {
      while (result.match(item.reg)) {
        const matches = result.match(item.reg);
        const value = matches[0];
        result = result.replace(
          item.reg,
          item.id(value, matches, typedExpressions, expressions),
        );
      }
    }
    if (item.split) {
      while (
        result.indexOf(item.split[0]) > -1 &&
        result.indexOf(item.split[1]) > -1
      ) {
        const exp = result.split(item.split[0])[1];
        const result = `${item.split[0]}${exp.split(item.split[1])[0]}${
          item.split[1]
        }`;
        result = result.replace(
          result,
          item.id(result, exp, typedExpressions, expressions),
        );
      }
    }
  });
  return result;
}
