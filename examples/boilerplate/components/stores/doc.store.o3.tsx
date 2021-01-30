
    
    
declare type _state = string | number;
declare type ctx = {[k: string]: any};
declare type event = Event;
declare type _once = number;
    class Protocol {
      public page = 'loading...';
    }

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
      
    
    
    
    // @ts-ignore
  if (typeof _state === "string" && !['action:getPage'].includes(_state)) {
    return;
  }
    switch(_state) { 
case 'action:getPage': 
    try {
      this.page = `/${ctx.route}.html`;
    } catch (error) {
      this.page = `${error.message}`;
      return '';
    }
  break;

default:
 }
    } catch(err) {
      // @ts-ignore
      displayError('Error in the component: \n\t examples/boilerplate/components/stores/doc.store.o3' ,err.message, err);
      throw err;
    }
  }
    }
  