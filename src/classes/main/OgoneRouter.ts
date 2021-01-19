import { History } from '../../ogone.dom.d.ts';
import OgoneRender from './OgoneRender.ts';
declare const history: History;

export default class OgoneRouter extends OgoneRender {}
export function routerGo(url: string, state: any) {
  if (!this) return;
  if (this.actualRoute === url) return;
  // protect from infinite loop
  this.actualRoute = url;
  this.routerReactions.forEach((r, i, arr) => {
    if (r && !r(url, state)) delete arr[i];
  });
  history.pushState(state || {}, "", url || "/");
}
