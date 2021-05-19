export enum BoilerPlate {
  ROOT_COMPONENT_PREVENT_COMPONENT_TYPE_ERROR = `
    import component Subject from "{% filePath %}";
    <template>
      <Subject />
    </template>
    <proto type="app" engine="no-strict-tagname">
    </proto>
    `,
}