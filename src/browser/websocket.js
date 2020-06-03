Ogone.mod = {
  "*": [], // for reactions
};
Ogone.imp = async function (url) {
  if (Ogone.mod[url]) return;
  try {
    const mod = await import(url);
    Ogone.mod[url] = mod;
    return mod;
  } catch (err) {
    Ogone.error(err.message, "Error in Dynamic Import", {
      message: `
      module's url: ${url}
      `,
    });
  }
};
Ogone.hmr = async function (url) {
  try {
    const mod = await import(`${url}?p=${performance.now()}`);
    const keys = Object.keys(Ogone.mod);
    keys.filter((key) => key === url).forEach((key) => {
      Ogone.mod[key] = mod;
    });
    Ogone.mod["*"]
      .forEach(([key, f], i, arr) => {
        key === url && f && !f(mod) ? delete arr[i] : 0;
      });
    return mod;
  } catch (err) {
    Ogone.error(err.message, "HMR-Error", {
      message: `
      module's url: ${url}
      `,
    });
    throw err;
  }
};
Ogone.hmrTemplate = async function (uuid, pragma) {
  try {
    const templates = Ogone.mod[uuid];
    if (templates) {
      templates.forEach((f, i, arr) => {
        f && !f(pragma) ? delete arr[i] : 0;
      });
    }
    return templates;
  } catch (err) {
    Ogone.error(err.message, "HMR-Error", err);
    throw err;
  }
};
const ws = new WebSocket(`ws://localhost:4000/`);
ws.onopen = () => {
  ws.send("test");
};
ws.onmessage = (msg) => {
  const { url, type, uuid, pragma, ctx, style } = JSON.parse(msg.data);
  if (type === "javascript") {
    Ogone.hmr(url).then(() => {
      console.warn("[Ogone] hmr:", url);
    });
  }
  if (type === "template" && pragma && uuid) {
    eval(ctx);
    Ogone.hmrTemplate(uuid, pragma);
  }
  if (type === "reload") {
    console.warn("[Ogone] hmr: reloading the application");
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
  if (type === "style") {
    document.querySelector(`style[id="${uuid}"]`).innerHTML = style;
  }
};

ws.onclose = () => {
  setTimeout(() => {
    console.warn("[Ogone] ws closed: reloading");
    location.reload();
  }, 1000);
};
