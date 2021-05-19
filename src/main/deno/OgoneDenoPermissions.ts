 import {
   Document,
   DocumentFragment,
 } from '../../ogone.dom.d.ts';

 declare const document: Document;
 type OgoneDenoPermissionsName = "run" | "read" | "write" | "net" | "env" | "plugin" | "hrtime";
 type OgoneDenoPermissionsDescriptor = Parameters<Deno.Permissions['query']>[0];
 type OgoneDenoPermissionsStatus = DocumentFragment & { state: any, onchange: () => void, };

 export class OgonePermissionStatus {
   constructor(private ogonePermissions: OgoneDenoPermissions) {}
   state: string = '';
   onchange() {}
   getStatus(desc: OgoneDenoPermissionsDescriptor): OgoneDenoPermissionsStatus {
     this.state = this.ogonePermissions._allowed[desc.name] ? 'granted' : 'denied';
     return Object.assign(this, document.createDocumentFragment())
   }
   revokeStatus(desc: OgoneDenoPermissionsDescriptor): OgoneDenoPermissionsStatus {
     this.ogonePermissions._allowed[desc.name] = false;
     this.state = this.ogonePermissions._allowed[desc.name] ? 'granted' : 'denied';
     return Object.assign(this, document.createDocumentFragment())
   }
 }
 export default class OgoneDenoPermissions implements Deno.Permissions {
   _allowed: Record<OgoneDenoPermissionsName, boolean> = (/* {% OGONE_DENO_PERMISSIONS %} */{
     run: false,
     read: false,
     write: false,
     net: false,
     env: false,
     plugin: false,
     hrtime: false,
   });
   private _status: OgonePermissionStatus = new OgonePermissionStatus(this);
   async query(desc: OgoneDenoPermissionsDescriptor): ReturnType<Deno.Permissions['query']> {
     return this._status.getStatus(desc);
   }
   querySync(desc: OgoneDenoPermissionsDescriptor): OgoneDenoPermissionsStatus {
     return this._status.getStatus(desc);
   }
   async revoke(desc: OgoneDenoPermissionsDescriptor): ReturnType<Deno.Permissions['revoke']> {
     return this._status.revokeStatus(desc);
   }
   async request(desc: OgoneDenoPermissionsDescriptor): ReturnType<Deno.Permissions['request']> {
     return this._status.getStatus(desc);
   }
 }