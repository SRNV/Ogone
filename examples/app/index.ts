
import o3 from "../../mod.ts";

// ogone use the root component
o3.run({
  entrypoint: "examples/app/Application.o3",
  devtool: false,
  static: '/public',
  head: `
  <link href="/style.css" rel="stylesheet"/>
  <link href="/animations.css" rel="stylesheet"/>
  <link rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.2/styles/night-owl.min.css">
  <link href="https://fonts.googleapis.com/css?family=Roboto|Varela+Round" rel="stylesheet"></link>
  `,
  controllers: [
    "/examples/app/controllers/ControllerUser.o3",
  ],
});
