import o3 from "../../mod.ts";

// ogone use the root component
o3.run({
  entrypoint: "examples/app/index.o3",
  devtool: true,
  static: "./public",
  port: 8013,
  modules: "/examples/modules",
  head: `
  <link href="/public/style.css" rel="stylesheet"/>
  <link href="/public/animations.css" rel="stylesheet"/>
  <link rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.2/styles/night-owl.min.css">
  <link href="https://fonts.googleapis.com/css?family=Roboto|Varela+Round" rel="stylesheet"></link>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js"></script>
  `,
  controllers: [
    '/examples/app/controllers/controller.user.o3',
  ],
});
