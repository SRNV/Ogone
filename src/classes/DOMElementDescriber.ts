import Utils from './Utils.ts';
import { parse, print } from '../../deps.ts';
/**
 * result of `DOMElementDescriber.getArrowFunctionDescription`
 * the function is recognized as an arrow function with three parameters
 * and the last one has a default value
 */
export interface DOMElementDescription {
  /**
   * the index used for the iteration
   */
  index: string;
  /**
   * the iteration's currentValue name
   */
  currentValue: string;
  /**
   * the name of the array
   */
  array: string;
  /**
   * the value assigned to the array by the end user
   */
  arrayValue: string;
  /**
  * tagname of the wrapper
  */
  wrapperName?: string;
}
/**
 * a class to parse special directives
 * this class uses deno_swc parse function
 *
 */
export default class DOMElementDescriber extends Utils {
  static swcOptions: Parameters<typeof parse>[1] = {
    syntax: "typescript"
  };
  /**
   * only uses arrow functions,
   * need to know if the function is an iteration,
   * typically this happens when the function has three parameters,
   * first is the currentValue,
   * second is the index,
   * third is an array with an assignment,
   * example: `(number, i, array = [0, 1]) => <div>{number}</div>`
   * @param value {() => JSX.Element}
   */
  static getArrowFunctionDescription(value: (currentValue: unknown, index: number, array: unknown[], ...rest: any[]) => unknown): DOMElementDescription | null {
    if (!value) return null;
    const func = value.toString().trim();
    // only accept arrow functions
    if (!func.trim().startsWith('(')) return null;
    const ast = parse(func, DOMElementDescriber.swcOptions);
    if (ast
      && ast.body
      && ast.body.length
      && ast.body[0]
      // @ts-ignore
      && ast.body[0].expression
      // @ts-ignore
      && ast.body[0].expression.type === "ArrowFunctionExpression") {
      // @ts-ignore
      const { params } = ast.body[0].expression
      // @ts-ignore
      const [currentValueInfos, indexInfos, arrayInfos] = params;
      if (currentValueInfos
        && indexInfos
        && arrayInfos
        && indexInfos.type === "Identifier"
        && arrayInfos.type === "AssignmentPattern") {
          let elementName = func.slice(
            currentValueInfos.span.start - ast.span.start,
            currentValueInfos.span.end - ast.span.start,
          )
          return {
            index: indexInfos.value,
            currentValue: elementName,
            array: arrayInfos.left.value,
            arrayValue: func.slice(
              arrayInfos.right.span.start - ast.span.start,
              arrayInfos.right.span.end - ast.span.start,
            ),
          };
      }
    }
    return null;
  }
}