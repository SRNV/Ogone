import gen from "./generator.ts";
import type {
  ProtocolScriptRegExpList,
} from "../src/.d.ts";
import getDeepTranslation from "./template-recursive.ts";
import { getMembers } from './get-members.ts';

const AllExports: ProtocolScriptRegExpList = [
  {
    name: "export default",
    open: false,
    reg:
      /(\bexport\b)\s*(\b(default)\b)(.*?)(§{2}endExpression\d+§{2}|;|\n+)/,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const [exp, def1, def2, token] = matches;
      const id = `§§export${gen.next().value}§§`;
      expressions[id] = value;
      if (typedExpressions) {
        typedExpressions.exports['default'] = {
          key: id,
          default: true,
          defaultName: null,
          members: [],
          path: "",
          member: false,
          value: getDeepTranslation(token, expressions),
          type: "default",
        };
      }
      return '';
    },
    close: false,
  },
  {
    name: "export vars",
    open: false,
    reg:
      /(\bexport\b)\s*(const|let|var)(.*?)((?:\:)(.*?)){0,1}(?:\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+))(.*?)(§{2}endExpression\d+§{2}|;|\n+)/i,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§export${gen.next().value}§§`;
      // @ts-ignore
      const [input, exp, constorLet, key, optional, types, val] = matches;
      expressions[id] = value;
      if (typedExpressions) {
        typedExpressions.exports[key] = {
          key: id,
          default: false,
          defaultName: null,
          // @ts-ignore
          name: key.trim(),
          members: [],
          path: "",
          member: true,
          type: "member",
          value: val,
        };
      }
      return '';
    },
    close: false,
  },
  {
    name: "export function",
    open: false,
    reg:
      /(\bexport\b)\s*(\bfunction\b)(.*?)(\<(?:.*?)\>){0,1}(\d+_parenthese)((?:\:)(.*?)){0,1}(.*?)(§{2}endExpression\d+§{2}|;|\n+)/i,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§export${gen.next().value}§§`;
      // @ts-ignore
      const [input, exp, func, key] = matches;
      const [input2, exp2, ...f2] = matches;
      expressions[id] = value;
      if (typedExpressions) {
        typedExpressions.exports[key] = {
          key: id,
          default: false,
          defaultName: null,
          members: [],
          // @ts-ignore
          name: key.trim(),
          path: "",
          member: true,
          type: "function",
          value: getDeepTranslation(f2.join(''), expressions),
        };
      }
      return '';
    },
    close: false,
  },
  {
    name: "export class",
    open: false,
    reg:
      /(\bexport\b)\s+(\bclass\b)(.*?)(\bextends\b(.*?)){0,1}(§{2}block\w*\d+§{2})\s*(?:§{2}endExpression\d+§{2}|;|\n+)/i,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§export${gen.next().value}§§`;
      // @ts-ignore
      const [input, exp, cl, key] = matches;
      const [input2, exp2, ...klass] = matches
      expressions[id] = value;
      if (typedExpressions) {
        typedExpressions.exports[key] = {
          key: id,
          default: false,
          defaultName: null,
          members: [],
          // @ts-ignore
          name: key.trim(),
          path: "",
          member: true,
          type: "class",
          value: getDeepTranslation(klass.join(''), expressions),
        };
      }
      return '';
    },
    close: false,
  },
  {
    name: "export * from",
    open: false,
    reg:
      /\s*(\bexport\b)(.*?)(\bfrom\b)\s*(\d+_string)\s*(?:§{2}endExpression\d+§{2}|;|\n+)/i,
    id: (value, matches, typedExpressions, expressions) => {
      if (!expressions || !matches) {
        throw new Error("expressions or matches are missing");
      }
      const id = `§§export${gen.next().value}§§`;
      const [input, imp, key, f, id2] = matches;
      expressions[id] = value;
      if (typedExpressions) {
        const tokens = getDeepTranslation(key, expressions);
        const exportDescription = getMembers(
          getDeepTranslation(tokens, expressions)
        );
        typedExpressions.exports[key] = {
          key: id,
          default: false,
          member: true,
          members: exportDescription.members,
          defaultName: exportDescription.default.alias || exportDescription.default.name || null,
          path: getDeepTranslation(id2, expressions).replace(/["'`]/gi, ''),
          type: "all",
          value: getDeepTranslation(key, expressions).trim(),
        };
      }
      return '';
    },
    close: false,
  },
];

export default AllExports;
