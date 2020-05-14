import Ogone from "../index.ts";

export default function (component) {
  if (component.data instanceof Object) {
    const { runtime } = component.scripts;
    const keysOfData = Object.keys(component.data);
    let result = `
    Ogone.components['${component.uuid}'] = function () {
      OComponent.call(this);
      const ____ = (prop, candidate) => {
        this.update(prop);
      };
      const ____r = (name, use, once) => {
        this.runtime(name, use[0], use[1], once);
      };
      this.data = ${JSON.stringify(component.data)};
      this.refs = {
        ${
      component.refs
        ? Object.entries(component.refs).map(([key, value]) =>
          `'${key}': '${value}',`
        )
        : ""
    }
      }
      const run = ${runtime}
      this.runtime = (run || function(){}).bind(this.data);
    };
    `;
    Ogone.datas.push(result);
  }
}
