Ogone.mod = {};
Ogone.imp = async function (url) {
  if (Ogone.mod[url]) return;
  try {
    const mod = await import(url);
    Ogone.mod[url] = mod;
    return mod;
  } catch (err) {
    Ogone.error(err.message, "Error in Dynamic Import", {
      message: `
      module url: ${url}
      `,
    });
  }
};
Ogone.hmr = async function (url) {
  try {
    const mod = await import(url);
    const keys = Object.keys(Ogone.mod);
    keys.filter((key) => key === url).forEach((key) => {
      Ogone.mod[key] = {
        ...Ogone.mod[url],
        ...mod,
      };
    });
    return mod;
  } catch (err) {
    Ogone.error(err.message, "HMR-Error", {
      message: `
      module url: ${url}
      `,
    });
  }
};
const ws = new WebSocket(`ws://localhost:4000/`);
ws.onopen = () => {
  ws.send("test");
};
ws.onmessage = (msg) => {
  const { url, type } = JSON.parse(msg.data);
  if (type === "javascript") {
    Ogone.hmr(url).then(() => {
      console.warn("[Ogone] hmr:", url);
    });
  }
};
