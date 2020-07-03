export default (opts: any) =>
  `
function getPointAroundElementFromOrigin(opts) {
    const { destination, origin, radius, decay = 0 } = opts;
    const { cos, sin, atan2 } = Math;
    let result = {
      x: 0,
      y: 0,
    };
    const rad = atan2(
      destination.y - origin.y,
      destination.x - origin.x
    ) + decay;
    result.x = destination.x + (radius * cos(rad));
    result.y = destination.y + (radius * sin(rad));
    return result;
  }
`;
