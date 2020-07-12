// doc: https://eemeli.org/yaml/#custom-data-types
// @ts-nocheck
// import { YAML } from './deps.ts';
function Declarations(str) {
  this.value = str;
}
export const tags = [
  {
    identify: value => value instanceof RegExp,
    tag: '!RegExp',
    resolve(doc, cst) {
      const match = cst.strValue.match(/^\/([\s\S]+)\/([gimuy]*)$/)
      return new RegExp(match[1], match[2]);
    }
  },
  {
    identify: (value) => value.trim().startsWith('(') && value.trim().endsWith(')'),
    tag: '!construct',
    resolve(doc, cst) {
      const v = cst.strValue;
      return new Declarations(v);
    }
  },
];
