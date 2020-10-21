enum Protocol {
  BUILD = `
    {{ types }}
    {{ protocol }}
    {{ allUsedComponents }}
  `,
  PROTOCOL_TEMPLATE = `
    class Protocol {
      {{ data }}
    }
  `,
  TYPES_TEMPLATE = `
    class Props {
        {{ props }}
    }
  `,
  USED_COMPONENT_TEMPLATE = `
  /** component: {{ tagName }} */
  declare interface $_component_{{ tagNameFormatted }} {
    /** values of {{ tagName }} */
    {{ interfaceConstructors }}
  };
  function {{ tagNameFormatted }}Component (this: $_component_{{ tagNameFormatted }} & Protocol & Props) {
    {{ position }}
    {{ data }}
    {{ modules }}
    {{ value }}
    const {{ tagNameFormatted }} {{ propsTypes }} = {
    {{ props }}
    };
  }`,
}
export default Protocol;