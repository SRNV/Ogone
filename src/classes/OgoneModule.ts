import DOMElement from './DOMElement/DOMElement.ts';
export interface OgoneModule {
  /**
   * when the end user provide
   * `export const name = ...`
   */
  name: string;
  /**
   * the export default is used to get the DOM of a component,
   * all component should have a template element that provide the ImportMeta of the module
   */
  default: FunctionConstructor;
  /**
   * parameters of the default function
   */
  params: string[];
  [k: string]: unknown;
}