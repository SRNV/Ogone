import { Utils } from '../../utils/index.ts';

let i = 0;
function getId(type: string): string {
  i++;
  return `${type}${i}`;
}
export default class TransformCSS extends Utils {
  private mapSelectors: Map<string, any> = new Map();
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
  public read(css: string) {
    let result = this.transformSelectors(css);
    const regexp = /(Selector\d+)(\{)([^\{\}]*)(Selector\d+)((\{)([^\{\}]*)(\}))/;
    let m = result.match(regexp);
      while(m) {
        m = result.match(regexp);
        if (m) {
          const [, parent, open, nestedStyle, child, childStyle] = m;
          result = result.replace(`${child}${childStyle}`, '');
          const item = this.mapSelectors.get(child);
          const parentItem = this.mapSelectors.get(parent);
          item.parent = parentItem;
          parentItem.childs.push(item);
        }
      }
    console.warn('ennnnnndd')
  }
}
const test = new TransformCSS();
test.read(`
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
      a more nested {
        for good { }
      }
    }
    another, one
    with, newline {
 aaaa
    }
  }
`);