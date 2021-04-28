const url = new URL('../main/deno/OgoneDeno.ts', import.meta.url);

export default async () => ({
  ambient: `
  import OgoneDeno from '${url.pathname}';
  declare const Deno: OgoneDeno;
  `,
});