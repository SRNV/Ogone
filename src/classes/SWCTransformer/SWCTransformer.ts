import Utils from '../Utils.ts';
import { parse, print } from '../../../deps.ts';

/**
 * class to transform the code using the deno_swc
 */
export default class SWCTransformer extends Utils {
  static swcOptions: Parameters<typeof parse>[1] = {
    syntax: "typescript"
  };
  static makeJSXArgumentsReactive(file: any): string {
    if (!file) return file;
    let result = file;
    const ast = parse(result, SWCTransformer.swcOptions);
    const inputs: Object[] = [];
    function recursiveWalk(obj: any) {
      if (!inputs.includes(obj)) inputs.push(obj);
      Object.values(obj)
        .forEach((item) => {
          if (Array.isArray(item)) {
            item.forEach((item2) => {
              recursiveWalk(item2);
            })
          } else if (item instanceof Object) {
            recursiveWalk(item);
          }
        })
    }
    recursiveWalk(ast);
    // @ts-ignore
    const jsxFactoryCalls = inputs.filter((inp) => inp.type === "CallExpression" && inp.callee.value === "h");
    // @ts-ignore
    const jsxFactoryCallsArguments = jsxFactoryCalls.map((jsxFactory) => jsxFactory.arguments.filter((inp, index) => index > 0
      && (inp.expression?.callee?.value !== "h")
      && (!["NullLiteral", "BooleanLiteral"].includes(inp.expression?.type))
    )).flat();
    // @ts-ignore
    const keyValueProps = inputs.filter((inp) => inp.type === "KeyValueProperty");
    // @ts-ignore
    const labels = inputs.filter((inp) => inp.type === "LabeledStatement");
    // @ts-ignore
    console.warn(labels);
    // console.warn(jsxFactoryCalls);
    // console.warn(keyValueProps);
    // console.warn('arguments JSXFactory', jsxFactoryCallsArguments);
    return result;
  }
}