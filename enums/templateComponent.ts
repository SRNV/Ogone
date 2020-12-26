export enum BoilerPlate {
  ROOT_COMPONENT_PREVENT_ERROR = `
    import component Subject from "{% filePath %}";
    <template>
        <Subject />
    </template>
    `,
}