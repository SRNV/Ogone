import o3 from "../../../../mod.ts";

o3.run({
  entrypoint: "examples/tests/async/reloading/root.o3",
  port: 8095,
  modules: "/examples/modules",
  devtool:true,
});
