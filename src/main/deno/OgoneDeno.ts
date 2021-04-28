/**
 * End User should have access to Deno
 */
import { displayError } from '../Ogone.ts';
import { HTMLOgoneElement } from '../../ogone.main.d.ts';
import OgoneDenoEnv from './OgoneDenoEnv.ts';
import OgoneDenoPermissions from './OgoneDenoPermissions.ts';

export default class OgoneDeno {
  private _env: OgoneDenoEnv | null = null;
  get env(): typeof Deno.env | never {
    if (!this.permissions.querySync({ name: 'env' })) {
      const err = new Error(`No env access granted to component: ${this.component.name}`);
      displayError(`The component ${this.component.name} isn't allowed to use Deno.env`, 'Permission Denied', err);
      throw err;
    }
    return this._env || (this._env = new OgoneDenoEnv());
  }
  constructor(public permissions: OgoneDenoPermissions, private component: HTMLOgoneElement) { }
}