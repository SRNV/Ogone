
const files = {
  template: void 0,
  script: void 0,
  style: void 0,
  ressources: {},
};
async function handleRequest(request) {
  switch(true) {
    
        case request.url === '/static/animations.css':
          files['/static/animations.css'] = await (await (await fetch(new URL("./static/animations.css", import.meta.url))).blob()).text();
          return new Response(files['/static/animations.css'], {
            headers: {
              "content-type": "text/css; charset=UTF-8",
            },
          });
        ,
        case request.url === '/static/ogone-svg.svg':
          files['/static/ogone-svg.svg'] = await (await (await fetch(new URL("./static/ogone-svg.svg", import.meta.url))).blob()).text();
          return new Response(files['/static/ogone-svg.svg'], {
            headers: {
              "content-type": "image/svg+xml; charset=UTF-8",
            },
          });
        ,
        case request.url === '/static/ogone_small.svg':
          files['/static/ogone_small.svg'] = await (await (await fetch(new URL("./static/ogone_small.svg", import.meta.url))).blob()).text();
          return new Response(files['/static/ogone_small.svg'], {
            headers: {
              "content-type": "image/svg+xml; charset=UTF-8",
            },
          });
        ,
        case request.url === '/static/neum-ogone-2.png':
          files['/static/neum-ogone-2.png'] = await (await (await fetch(new URL("./static/neum-ogone-2.png", import.meta.url))).blob()).text();
          return new Response(files['/static/neum-ogone-2.png'], {
            headers: {
              "content-type": "image/png; charset=UTF-8",
            },
          });
        ,
        case request.url === '/static/style.css':
          files['/static/style.css'] = await (await (await fetch(new URL("./static/style.css", import.meta.url))).blob()).text();
          return new Response(files['/static/style.css'], {
            headers: {
              "content-type": "text/css; charset=UTF-8",
            },
          });
        ,
        case request.url === '/static/async-example.png':
          files['/static/async-example.png'] = await (await (await fetch(new URL("./static/async-example.png", import.meta.url))).blob()).text();
          return new Response(files['/static/async-example.png'], {
            headers: {
              "content-type": "image/png; charset=UTF-8",
            },
          });
        ,
        case request.url === '/static/store-example.png':
          files['/static/store-example.png'] = await (await (await fetch(new URL("./static/store-example.png", import.meta.url))).blob()).text();
          return new Response(files['/static/store-example.png'], {
            headers: {
              "content-type": "image/png; charset=UTF-8",
            },
          });
        ,
        case request.url === '/static/ogone.svg':
          files['/static/ogone.svg'] = await (await (await fetch(new URL("./static/ogone.svg", import.meta.url))).blob()).text();
          return new Response(files['/static/ogone.svg'], {
            headers: {
              "content-type": "image/svg+xml; charset=UTF-8",
            },
          });
        ,
        case request.url === '/static/neum-ogone-1.png':
          files['/static/neum-ogone-1.png'] = await (await (await fetch(new URL("./static/neum-ogone-1.png", import.meta.url))).blob()).text();
          return new Response(files['/static/neum-ogone-1.png'], {
            headers: {
              "content-type": "image/png; charset=UTF-8",
            },
          });
        ,
        case request.url === '/static/favicon.ico':
          files['/static/favicon.ico'] = await (await (await fetch(new URL("./static/favicon.ico", import.meta.url))).blob()).text();
          return new Response(files['/static/favicon.ico'], {
            headers: {
              "content-type": "text/plain; charset=UTF-8",
            },
          });
        ,
        case request.url === '/static/ogone-svg.png':
          files['/static/ogone-svg.png'] = await (await (await fetch(new URL("./static/ogone-svg.png", import.meta.url))).blob()).text();
          return new Response(files['/static/ogone-svg.png'], {
            headers: {
              "content-type": "image/png; charset=UTF-8",
            },
          });
        
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
