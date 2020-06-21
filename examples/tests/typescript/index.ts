import o3 from "../../../mod.ts";

o3.run({
  entrypoint: "examples/tests/typescript/index.o3",
  port: 8086,
  modules: "/examples/modules",
});
