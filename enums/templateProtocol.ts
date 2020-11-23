// TODO use TSX transformation
enum Protocol {
  PROTOCOL_TEMPLATE = `
    class Protocol {
      {{ props }}
      {{ data }}
    }
  `,
  BUILD = `
    {{ namespaces }}
    {{ protocol }}
    declare function h(...args: unknown[]): unknown;
    declare function hf(...args: unknown[]): unknown;
    declare namespace h.JSX {
      export interface IntrinsicElements {
        {{ allUsedComponents }}
        [k: string]: any;
      }
    }
    class Component extends Protocol {
      render() {
        return ({{ tsx }});
      }
      {{ runtime }}
    }
  `,
  USED_COMPONENT_TEMPLATE = `
    ['{{ tagName }}']: {
      children?: any;
      {{ propsTypes || '' }}
    };`,
}
export default Protocol;