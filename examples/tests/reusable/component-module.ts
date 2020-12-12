export default class extends HTMLElement {
  count: number = 10;
  text: Text;
  constructor(opts: any) {
    super();
    this.text = new Text(`Count: ${this.count}`);
    this.append(this.text);
  }
  attributeChangedCallback(prop: string, value: any) {
    this.text.data = `Count: ${this.count}`;
  }
}