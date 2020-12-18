import o3 from "../../../mod.ts";

// ogone use the root component
o3.run({
  entrypoint: "examples/tests/modules/index.o3",
  static: "./public",
  port: 8086,
  build: "dist",
  head: `
  <link href="/style.css" rel="stylesheet"/>
  <link href="/animations.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.2/styles/night-owl.min.css">
  <link href="https://fonts.googleapis.com/css?family=Roboto|Varela+Round" rel="stylesheet"></link>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js"></script>
  `,
  serve: true,
  minifyCSS: true,
});
