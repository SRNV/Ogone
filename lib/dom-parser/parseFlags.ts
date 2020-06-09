import { XMLNodeDescription, XMLNodeDescriberDescription, ParseFlagsOutput } from './../../.d.ts';
const SyntaxEventException = (event: string) =>
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
export default function parseFlags(node: XMLNodeDescription, opts: XMLNodeDescriberDescription): null | string {
  let result: ParseFlagsOutput = {
    if: '',
    then: '',
    defer: '',
    await: '',
    style: '',
    class: '',
    catch: '',
    events: [],
    elseIf: '',
    finally: '',
    else: false,
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
            throw SyntaxEventException(event);
          case key.startsWith(event):
            const m = key.match(
              /(\-){2}(\w+\:)([^\s]*)+/,
            );
            if (m) {
              const [input, t, ev, caseName] = m
              const infos: any = {
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
            }
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
          node.hasFlag = true;
          break;
        case key === "--style":
          result.style = `${attributes[key]}`;
          node.hasFlag = true;
          break;
        case key === "--if":
          result.if = `${attributes[key]}`;
          node.hasFlag = true;
          break;
        case key === "--else":
          result.else = true;
          node.hasFlag = true;
          break;
        case key === "--else-if":
          result.elseIf = `${attributes[key]}`;
          node.hasFlag = true;
          break;
        case key === "--await":
          result.await = attributes[key] === true ? '' : `${attributes[key]}`;
          if (isImported) {
            node.attributes.await = true;
          }
          node.hasFlag = true;
          break;
        case key === "--defer":
          result.defer = `${attributes[key]}`;
          node.hasFlag = true;
          break;
        case key.startsWith("--then"):
          result.then = key.slice(2);
          node.hasFlag = true;
          break;
        case key.startsWith("--catch"):
          result.catch = key.slice(2);
          node.hasFlag = true;
          break;
        case key.startsWith("--finally"):
          result.finally = key.slice(2);
          node.hasFlag = true;
          break;
      }
    }
    // flags that starts with --
    node.hasFlag = true;
    node.flags = result;
    return JSON.stringify(result);
  }
  return null;
}
