const SyntaxClickError = new SyntaxError(
  "[Ogone]  wrong syntax of --click directive. it should be: --click:case",
);
const events = [
  "--click",
  "--mousemove",
  "--mousedown",
  "--mouseup",
  "--mouseleave",
  "--dblclick",
  "--drag",
  "--dragend",
  "--dragstart",
  "--input",
];
export default function parseDirectives(node, opts) {
  let result = {
    events: [],
  };
  const { nodeIsDynamic, isImported } = opts;
  if (nodeIsDynamic || isImported) {
    const { attributes } = node;
    const keys = Object.keys(attributes);
    for (let key of keys) {
      switch (true) {
        // WIP
        case key.startsWith("--click") &&
          !key.match(/(\-){2}(click\:)([^\s]*)+/):
          throw SyntaxClickError;
        case key.startsWith("--click"):
          const [input, t, click, caseName] = key.match(
            /(\-){2}(click\:)([^\s]*)+/,
          );
          result.events.push({
            type: "click",
            case: `${click}${caseName}`,
          });
          break;
        case key === "--router-go":
          result.events.push({
            type: "click",
            name: "router-go",
            eval: attributes[key],
          });
          break;
        case key === "--class":
          result.class = `${attributes[key]}`;
          node.hasDirective = true;
          break;
        case key === "--style":
          result.style = `${attributes[key]}`;
          node.hasDirective = true;
          break;
        case key === "--if":
          result.if = `${attributes[key]}`;
          node.hasDirective = true;
          break;
        case key === "--else":
          result.else = true;
          node.hasDirective = true;
          break;
        case key === "--else-if":
          result.elseIf = `${attributes[key]}`;
          node.hasDirective = true;
          break;
        case key === "--await":
          result.await = attributes[key] === true ? true : `${attributes[key]}`;
          if (isImported) {
            node.attributes.await = true;
          }
          node.hasDirective = true;
          break;
        case key === "--defer":
          result.defer = `${attributes[key]}`;
          node.hasDirective = true;
          break;
        case key.startsWith("--then"):
          result.then = key.slice(2);
          node.hasDirective = true;
          break;
        case key.startsWith("--catch"):
          result.catch = key.slice(2);
          node.hasDirective = true;
          break;
        case key.startsWith("--finally"):
          result.finally = key.slice(2);
          node.hasDirective = true;
          break;
      }
    }
    // directives that starts with --
    node.hasDirective = true;
    node.directives = result;
    return JSON.stringify(result);
  }
  return null;
}
