module.exports = function renderApp(template, styles, id) {
  return template.replace(/%%styles%%/, styles).replace(/%%id%%/gi, id);
};
