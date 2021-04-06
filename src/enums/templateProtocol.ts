enum Protocol {
  PROTOCOL_TEMPLATE = `
    class Protocol {
      {% data %}
    }
  `,
  BUILD = `
    {% modules %}
    export default {};
    {% namespaces %}
    {% protocol %}
    declare const Deno: any;
    type OgoneCOMPONENTComponent<T> = { children?: any; } & T;
    type OgoneASYNCComponent<T> = OgoneCOMPONENTComponent<T>;
    type OgoneSTOREComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;
    type OgoneROUTERComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;
    type OgoneCONTROLLERComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;

    declare function h(...args: unknown[]): unknown;
    declare function hf(...args: unknown[]): unknown;
    declare namespace h.JSX {
      export interface IntrinsicElements {
        [k: string]: any;
      }
    }
    {% allUsedComponents %}
    class Component extends Protocol {
      render() {
        return {% tsx.length ? \`(\${tsx})\` : '' %};
      }
      {% runtime %}
    }
  `,
  USED_COMPONENT_TEMPLATE = `
    declare function {% tagName %} (props: {% genericType %}<{
      {% propsTypes || '' %}
    }>): h.JSX.IntrinsicElements;`,
}
export default Protocol;