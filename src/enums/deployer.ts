enum Deployer {
    App = `
const files = {
  template: void 0,
  script: void 0,
  style: void 0,
  ressources: {},
};
async function handleRequest(request) {
  switch(true) {
    {% requests %}
    case request.url === '/app.js':
      files.script = files.script || await (await (await fetch(request.url, import.meta.url)).blob()).text();
      return new Response(app.script, {
        headers: {
          "content-type": "application/javascript; charset=UTF-8",
        },
      });
    case request.url === '/style.css':
      files.style = files.style || await (await (await fetch(request.url, import.meta.url)).blob()).text();
      return new Response(app.style, {
        headers: {
          "content-type": "text/css; charset=UTF-8",
        },
      });
    default:
      files.template = files.template || await (await (await fetch('./index.html', import.meta.url)).blob()).text();
      return new Response(files.template, {
        headers: {
          "content-type": "text/html; charset=UTF-8",
        },
      });
      break;
  }
}
addEventListener("fetch", async (event) => {
  event.respondWith(await handleRequest(event.request));
});
`
}
export default Deployer;