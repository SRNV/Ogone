import o3 from "../../../mod.ts";

o3.run({
  entrypoint: "examples/tests/reflections/index.o3",
  port: 8095,
  modules: '/examples/modules',
});
