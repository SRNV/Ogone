import o3 from "../../../mod.ts";

o3.run({
  entrypoint: "examples/tests/bind/bind.o3",
  port: 8085,
  modules: "/examples/modules",
});
