export default function (template: string, id?: string): string {
  return id ? template.replace(/%%id%%/, id) : template;
}
