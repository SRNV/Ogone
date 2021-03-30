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
      files.script = files.script || await (
        await (
          await fetch(new URL(request.url, import.meta.url).pathname)
        ).blob()
      ).text();
      return new Response(files.script, {
        headers: {
          "content-type": "application/javascript; charset=UTF-8",
        },
      });
    case request.url === '/style.css':
      files.style = files.style || await (
        await (
          await fetch(new URL(request.url, import.meta.url).pathname)
        ).blob()
      ).text();
      return new Response(files.style, {
        headers: {
          "content-type": "text/css; charset=UTF-8",
        },
      });
    default:
      files.template = files.template || await (
        await (
          await fetch(new URL('./index.html', import.meta.url).pathname)
        ).blob()
      ).text();
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