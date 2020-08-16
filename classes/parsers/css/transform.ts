import { Utils } from '../../utils/index.ts';

let i = 0;
function getId(type: string): string {
  i++;
  return `${type}${i}`;
}
export default class TransformCSS extends Utils {
  private mapSelectors: Map<string, any> = new Map();
  private mapVars: Map<string, any> = new Map();
  private expressions: { [k: string]: string } = {};
  private transformSelectors(css: string): string {
    let result = css;
    const regExp = /(?<=[\{\;\}])([^\;\{\}])+(?=\{)/gi;
    const matches = result.match(regExp);
    if (matches) {
      matches.forEach((match) => {
        const id = this.getUniqueId((`Selector`+Math.random()).replace(/[^\d\w]/, ''));
        this.mapSelectors.set(
          id, {
            value: match,
            parent: null,
            childs: [],
            properties: null,
            rawStyle: '',
          }
        );
        result = result.replace(match, id);
      });
    }
    return result;
  }
  private getUniqueId(type: string): string {
    const id = getId(type);
    return id;
  }
  private getVars(css: string): string {
    let result = css;
    const regExpVars = /(\@export\s+)?(\$\w+)(\s*\=\s*){1}([^\;\:]+)+(\;){1}/;
    const regExpVarsError = /(\$\w+)(\s*\=\s*){1}([^\;]+)+(\;){0}/;
    // get vars
    while (result.match(regExpVars)) {
      let m = result.match(regExpVars);
      if (m) {
        let [match, exportable, name, b, value, b2] = m;
        result = result.replace(match, '');
        this.mapVars.set(name, {
          value,
          exportable: !!exportable,
        });
      }
    }
    return result;
  }
  private readRules(css: string): string {
    let result = css;
    const regexp = /(Selector\d+)(\{)([^\{\}]*)(Selector\d+)((\{)([^\{\}]*)(\}))/;
    while(result.match(regexp)) {
      let m = result.match(regexp);
      if (m) {
        const [, parent, open, nestedStyle, child, childStyle] = m;
        result = result.replace(`${child}${childStyle}`, '');
        const item = this.mapSelectors.get(child);
        const parentItem = this.mapSelectors.get(parent);
        item.parent = parentItem;
        parentItem.childs.push(item);
        item.rawStyle = childStyle;
      }
    }
    this.mapSelectors.forEach((item) => {
      item.value = item.value.trim();
    });
    return result;
  }
  private revertVars(css: string) {
    let result = css;
    const entries = Array.from(this.mapVars.entries()).map(([k]) => k);
    let previousKeyId = 0;
    this.mapSelectors.forEach((item) => {
      while (entries.find((k) => item.rawStyle.indexOf(k) > -1)) {
        let key = entries.find((k) => item.rawStyle.indexOf(k) > -1);
        if (key) {
          let regexp = new RegExp(`\\${key}`,'gi');
          const variable = this.mapVars.get(key as string);
          item.rawStyle = item.rawStyle.replace(regexp, variable.value);
          let undefinedVar = entries.find((k, i , arr) => {
            return variable.value.indexOf(k) > -1 && i > arr.indexOf(key as string);
          });
          if (undefinedVar) {
            this.error(`Style Error: ${undefinedVar} is not defined.\ninput: ${key} = ${variable.value}`);
          }
        }
      }
    });
    return result;
  }
  public read(css: string) {
    let result = this.getVars(css);
    result = this.transformSelectors(result);
    // read rules
    result = this.readRules(result);
    // revert vars
    result = this.revertVars(result);
    console.warn('ennnnnndd')
    console.warn(this.mapSelectors);
    console.warn(this.mapVars);
  }
}
const test = new TransformCSS();
test.read(`
  @import '../style.o3s';
  @export $dark = true;
  $b = a + $dark;
  $var = red + $dark + $b;
  $var2 = 'g g'
  'g g'
  'g g'
  'g g';
  @type container {
    background: red;
  };
  @container<div> {
    background: blue;
    color: red;
    grid-template: "fdsqf dsqfds"
    "fdsqf dsqfds"
    "fdsqf dsqfds"
    "fdsqf dsqfds";
    &.parent {
      background: url(qsfdsqfdsqfdsqf);
      color: $var;
      a more nested {
        for good { }
        b: $var;
      }
    }
    another, one
    with, newline {
 aaaa
    }
  }
`);