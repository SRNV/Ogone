import o3 from "../../../mod.ts";

o3.run({
  entrypoint: "examples/tests/modules/index.o3",
  port: 8086,
  modules: "/modules",
});
