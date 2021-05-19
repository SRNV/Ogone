// @ts-nocheck
// TODO fix all types here
export default function setChildNodeAroundParent(opts) {
  const { PI, round, cos, sin } = Math;
  const { parent, minRadius = 0, maxRadius = 0, child, minRadian = 0, maxRadian = PI } = opts;
  let result = {
    x: 0,
    y: 0,
  };
  let radius = minRadius * parent.childs.length;
  if (radius > maxRadius) {
    radius = maxRadius;
  } else if (radius < minRadius) {
    radius = minRadius;
  }
  let percent = (parent.childs.indexOf(child) / (parent.childs.length ? parent.childs.length - 1 : 1));
  if (Number.isNaN(percent)) {
    percent = 1;
  }
  let radian = maxRadian * percent + minRadian;
  result.x = parent.position.x + round(radius * cos(radian));
  result.y = parent.position.y + round(radius * sin(radian));
  return result;
}
