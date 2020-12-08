import o3 from "../../../mod.ts";

o3.run({
  entrypoint: "examples/tests/reusable/index.o3",
  port: 8033,
  modules: "/examples/modules",
});
