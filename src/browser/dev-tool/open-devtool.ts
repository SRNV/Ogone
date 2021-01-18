// @ts-nocheck
// TODO fix all types here
export default function openOgoneDevTool() {
  Ogone.DevTool = window.open('', 'Ogone Dev Tool', devTool_window_parameters);
  if (!Ogone.DevTool) {
    Ogone.displayError('Dev Tool is blocked', 'Ogone Dev Tool has been blocked by the browser. please allow pop-up to have access to Dev Tool', {
      message: 'allow pop-up',
    });
  }
  Ogone.DevTool.document.title = '[Ogone] Dev Tool';
  const diagnostics = document.createElement('div');
  diagnostics.classList.add('diagnostics');
  const informations = new Text('[Ogone] Dev Tool');
  const informationsContainer = Ogone.DevTool.document.createElement('div');

  Ogone.DevTool.document.head.innerHTML += `
  <style>
    {% devToolCSS %}
  <style>
  `;
  Ogone.DevTool.document.body.innerHTML = `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg class="ogone-logo" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="93pt" height="103pt" viewBox="0 0 93 103" version="1.1">
      <g id="surface1">
      <path style=" stroke:none;fill-rule:nonzero;fill:rgb(60%,60%,60%);fill-opacity:1;" d="M 41.375 7.59375 L 78.195312 47.851562 C 78.726562 48.445312 78.957031 49.265625 78.792969 50.054688 L 75.078125 67.144531 C 74.746094 68.6875 75.941406 70.167969 77.53125 70.167969 C 78.460938 70.167969 79.324219 69.640625 79.753906 68.820312 L 90.304688 48.476562 C 90.734375 47.6875 90.667969 46.703125 90.171875 45.945312 L 68.210938 13.308594 C 67.914062 12.882812 67.515625 12.554688 67.015625 12.355469 L 44.128906 3.613281 C 41.671875 2.660156 39.617188 5.652344 41.375 7.59375 Z M 41.375 7.59375 "/>
      <path style=" stroke:none;fill-rule:nonzero;fill:rgb(60%,60%,60%);fill-opacity:1;" d="M 2.996094 80.847656 L 41.011719 41.707031 C 41.574219 41.113281 41.804688 40.324219 41.671875 39.535156 L 38.457031 22.347656 C 38.15625 20.804688 39.417969 19.359375 41.011719 19.421875 C 41.9375 19.457031 42.800781 19.980469 43.199219 20.835938 L 53.152344 41.476562 C 53.550781 42.296875 53.449219 43.25 52.917969 43.972656 L 29.996094 75.917969 C 29.699219 76.347656 29.265625 76.640625 28.769531 76.839844 L 5.648438 84.925781 C 3.160156 85.777344 1.171875 82.722656 2.996094 80.847656 Z M 2.996094 80.847656 "/>
      <path style=" stroke:none;fill-rule:nonzero;fill:rgb(60%,60%,60%);fill-opacity:1;" d="M 31.058594 96.855469 L 58.390625 49.757812 C 58.789062 49.066406 58.824219 48.214844 58.492188 47.492188 L 51.195312 31.550781 C 50.53125 30.105469 51.394531 28.429688 52.953125 28.101562 C 53.878906 27.902344 54.84375 28.230469 55.441406 28.953125 L 70.136719 46.636719 C 70.699219 47.324219 70.863281 48.277344 70.53125 49.132812 L 56.070312 85.613281 C 55.871094 86.105469 55.539062 86.5 55.109375 86.796875 L 34.609375 100.171875 C 32.417969 101.621094 29.730469 99.121094 31.058594 96.855469 Z M 31.058594 96.855469 "/>
      </g>
  </svg>`;
  const logo = Ogone.DevTool.document.querySelector('.ogone-logo');
  const viewer = Ogone.DevTool.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  let actualScale = 0.4;
  viewer.style.transform = `scale(${actualScale})`;
  // keyboard control
  Ogone.DevTool.addEventListener('keydown', (ev) => {
    switch(true) {
      case ev.key.endsWith('Left'):
        container.setAttribute('x', containerx+=-20);
        break;
        case ev.key.endsWith('Right'):
        container.setAttribute('x', containerx+=+20);
        break;
        case ev.key.endsWith('Up'):
        container.setAttribute('y', containery+=-20);
        break;
      case ev.key.endsWith('Down'):
        container.setAttribute('y', containery+=+20);
        break;
    }
    logo.style.transform = `scale(2.2) translateX(${-containerx/50}px) translateY(${-containery/50}px)`;
    Ogone.ComponentCollectionManager.updateDevToolView(ev);
  });
  // wheel control
  Ogone.DevTool.addEventListener('wheel', (ev) => {
    if (!ev.ctrlKey) {
      container.setAttribute('x', containerx +=+ (ev.deltaX/ 5));
      container.setAttribute('y', containery +=+ (ev.deltaY/ 5));
    } else {
      let value = actualScale +=- (ev.deltaY + ev.deltaX)/60;
      if (value >= 3) {
        actualScale = 3;
        value = 3;
      }
      if (value <= 0.1) {
        actualScale = 0.1;
        value = 0.1;
      }
      viewer.style.transform = `scale(${value})`;
    }
    informations.data = `zoom: ${actualScale}, x: ${containerx}, y: ${containery}`;
    logo.style.transform = `scale(2.2) translateX(${-containerx/50}px) translateY(${-containery/50}px)`;
    Ogone.ComponentCollectionManager.updateDevToolView(ev);
  })
  Ogone.DevTool.addEventListener('mousemove', (ev) => {
    Ogone.ComponentCollectionManager.updateDevToolView(ev);
  });
  const componentDef = Ogone.DevTool.document.createElementNS('http://www.w3.org/2000/svg', 'g');
  figure.setAttribute('rx', '7');
  figure.setAttribute('width', '50');
  figure.setAttribute('height', '50');
  figure.setAttribute('x', '0');
  figure.setAttribute('y', '0');
  const circle = Ogone.DevTool.document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  circle.setAttribute('rx', '200');
  circle.setAttribute('width', '50');
  circle.setAttribute('height', '50');
  circle.setAttribute('x', '0');
  circle.setAttribute('y', '0');

  const defs = Ogone.DevTool.document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  componentDef.append(figure);
  dynamicNodeDef.append(circle);
  defs.append(componentDef);
  defs.append(dynamicNodeDef);
  viewer.append(defs);
  viewer.append(container);
  Ogone.DevTool.document.body.append(informationsContainer);
  Ogone.DevTool.document.body.append(diagnostics);
  Ogone.DevTool.document.body.append(viewer);
  Ogone.ComponentCollectionManager.container = container;
  Ogone.DiagnosticsPanelManager.diagnostics = diagnostics;
  Ogone.ComponentCollectionManager.informations = informations;
  Ogone.ComponentCollectionManager.setModifiers();
}