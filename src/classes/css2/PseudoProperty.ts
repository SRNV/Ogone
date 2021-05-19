import Rules from './Rules.ts';

export default class PseudoProperty {
  constructor(
    /**
     * the rule that is used
     */
    public parent: Rules,
    /**
     * the property to transform
     */
    public readonly property: string,
    /**
     * the name of the pseudo property
     */
    public readonly name: string,
    public readonly opts: { values: string[][] }) {
  }
}