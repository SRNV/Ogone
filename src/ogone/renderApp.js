module.exports = function renderApp(template, id) {
  return template
    .replace(/%%id%%/gi, id);
};
