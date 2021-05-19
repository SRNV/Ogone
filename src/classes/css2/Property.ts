import Rules from './Rules.ts';

export default class Property {
  constructor(
    /**
     * the entire string
     */
    private source: string,
    /**
     * the name of the property
     */
    public name: string,
    /**
     * the value that the user typed for this property
     */
    public input: string,
    /**
     * the rule that is using the property
     */
    public readonly parent: Rules,
  ) { }
  /**
   * the inline property can have multiple result
   * this should output all the necessary properties for cross platform support
   */
  render(): string {
    this.renderVariables();
    return 'test: test';
  }
  renderVariables() {
    console.warn(this.input);
  }
}