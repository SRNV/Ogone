export default (opts: any) =>
  `
function createSVGComponent(opts) {
    const { href, position, className, style } = opts;
    const isNotNaN = !Number.isNaN(position.x) && Number.isNaN(position.y);
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const lineToParent = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const figure = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    figure.setAttribute('href', href);
    if (isNotNaN) {
      figure.setAttribute('x', position.x);
      figure.setAttribute('y', position.y);
    }
    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    shadow.setAttribute('href', href);
    if (isNotNaN) {
      shadow.setAttribute('x', position.x);
      shadow.setAttribute('y', position.y + 15);
    }
    function setPosition(coord) {
      if ((!coord || Number.isNaN(coord.x)) && isNotNaN) {
        shadow.setAttribute('x', position.x);
        shadow.setAttribute('y', position.y + 15);
        figure.setAttribute('x', position.x);
        figure.setAttribute('y', position.y);
      } else if (!Number.isNaN(coord.x) && !Number.isNaN(coord.y)) {
        shadow.setAttribute('x', coord.x);
        shadow.setAttribute('y', coord.y + 15);
        figure.setAttribute('x', coord.x);
        figure.setAttribute('y', coord.y);
      }
    }
    if (className) {
      figure.setAttribute('class', className);
      shadow.setAttribute('class', className+'-shadow');
    }
    if (style) {
      figure.setAttribute('style', style);
    }
    container.append(shadow);
    container.append(figure);
    container.append(lineToParent);
    return {
      figure,
      element: container,
      setPosition,
      lineToParent,
    };
  }
`;
