type DenoEnvType = typeof Deno.env;
export default class OgoneDenoEnv implements DenoEnvType {
  private value: { [k: string]: string } = (/* {% OGONE_DENO_ENV_OBJECT %} */{});
  get(key: string) {
    return this.value[key];
  }
  set(key: string, value: string) {
    this.value[key] = value;
  }
  delete(key: string) {
    delete this.value[key];
  }
  toObject() {
    return this.value;
  }
}