export default class A extends HTMLElement {
  count: number = 10;
  text: Text;
  constructor(opts: any) {
    super();
    this.text = new Text(`Count: ${this.count}`);
    this.append(this.text);
  }
  static ret(arr: string) {}
  attributeChangedCallback(prop: string, value: any) {
    this.text.data = `Count: ${this.count}`;
  }
}