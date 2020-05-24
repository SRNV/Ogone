const SyntaxEventError = (event) =>
  new SyntaxError(
    `[Ogone]  wrong syntax of ${event} event. it should be: ${event}:case`,
  );
const events = [
  "--click",
  "--mouseenter",
  "--mouseover",
  "--mousemove",
  "--mousedown",
  "--mouseup",
  "--mouseleave",
  "--mouseout",
  "--dblclick",
  "--resize",
  "--drag",
  "--dragend",
  "--dragstart",
  "--input",
  "--change",
  "--blur",
  "--focus",
  "--focusin",
  "--focusout",
  "--select",
  "--keydown",
  "--keyup",
  "--keypress",
  "--submit",
  "--reset",
  "--touchcancel",
  "--touchmove",
  "--touchend",
  "--touchenter",
  "--touchstart",
  "--wheel",
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
      for (let event of events) {
        switch (true) {
          case key.startsWith(event) &&
            !key.match(/(\-){2}(\w+\:)([^\s]*)+/):
            throw SyntaxEventError(event);
          case key.startsWith(event):
            const [input, t, ev, caseName] = key.match(
              /(\-){2}(\w+\:)([^\s]*)+/,
            );
            const infos = {
              type: event.slice(2),
              case: `${ev}${caseName}`,
              filter: null,
              target: null,
            };
            if (event.startsWith("--key")) {
              infos.target = "document";
            }
            if (node.attributes[key] !== true) {
              infos.filter = node.attributes[key];
            }
            result.events.push(infos);
            break;
        }
      }
    }
    for (let key of keys) {
      switch (true) {
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
