/**
 * this class holds all the patterns used into Ogone
 */
export default abstract class Patterns {
  /**
   * this pattern allows the duplication of the custom element definition
   * with some differencies
   */
  static componentDeclaration = Deno.readTextFileSync(new URL('../patterns/component_declaration.ts', import.meta.url).pathname);
  /**
   * this pattern allows the duplication of the for directive for each elements
   * the rendered nodes are wrapped into one element
   */
  static forDirectivePattern = Deno.readTextFileSync(new URL('../patterns/for_directive.ts', import.meta.url).pathname);
}