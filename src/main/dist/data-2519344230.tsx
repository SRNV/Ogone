
    export default {};
    
    
    declare const Controllers: { [k: string]: Controller; };
    declare interface Controller {
      get(rte: string): Promise<any>;
      post(rte: string, data: { [k: string]: any }, op: { [k: string]: any }): Promise<any>;
      put(rte: string, data: { [k: string]: any }, op: { [k: string]: any }): Promise<any>;
      patch(rte: string, data: { [k: string]: any }, op: { [k: string]: any }): Promise<any>;
      delete(rte: string, data: { [k: string]: any }, op: { [k: string]: any }): Promise<any>;
    };
    
    class Protocol {
      public isOpen: boolean = false;
    }
    declare const Deno: any;
    type OgoneCOMPONENTComponent<T> = { children?: any; } & T;
    type OgoneASYNCComponent<T> = OgoneCOMPONENTComponent<T>;
    type OgoneSTOREComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;
    type OgoneROUTERComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;
    type OgoneCONTROLLERComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;

    declare function h(...args: unknown[]): unknown;
    declare function hf(...args: unknown[]): unknown;
    declare namespace h.JSX {
      export interface IntrinsicElements {
        [k: string]: any;
      }
    }
    
    class Component extends Protocol {
      render() {
        return ;
      }
      async runtime (_state: string | number, ctx: any, event: any, _once: number = 0) {
    try {
      
    
    const { UserController } = Controllers;
    
    
    // @ts-ignore
  if (typeof _state === "string" && !['action:toggle','action:checkController'].includes(_state)) {
    return;
  }
    switch(_state) { 
case 'action:toggle': 
    this.isOpen = !this.isOpen;
    break;
case 'action:checkController': 
    const res = await UserController.get('/');
    return res;

default:
 }
    } catch(err) {
      // @ts-ignore
      displayError('Error in the component: \n\t examples/app/stores/StoreMenu.o3' ,err.message, err);
      throw err;
    }
  }
    }
  