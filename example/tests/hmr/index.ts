import o3 from "../../../mod.ts";

o3.run({
  entrypoint: "example/tests/hmr/index.o3",
  port: 8083,
  modules: '/modules',
});
