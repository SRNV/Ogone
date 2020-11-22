// TODO use TSX transformation
enum Protocol {
  PROTOCOL_TEMPLATE = `
    class Protocol {
      {{ props }}
      {{ data }}
    }
  `,
  BUILD = `
    {{ protocol }}
    class Template extends Protocol {
      {{ allUsedComponents }}
      {{ runtime }}
    }
  `,
  USED_COMPONENT_TEMPLATE = `
    private ['{{ tagName }}'](): {{ propsTypes.length ? propsTypes : 'Object' }} {
      {{ position }}
      {{ data }}
      {{ modules }}
      {{ value }}
      return {
        {{ props }}
      };
    }`,
}
export default Protocol;