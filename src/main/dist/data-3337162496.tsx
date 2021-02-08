
    export default {};
    
    
    class Protocol {
      public name: string = "SRNV";
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
      
    
    
    
    // @ts-ignore
  if (typeof _state === "string" && !['GET:/','GET:/2'].includes(_state)) {
    return;
  }
    switch(_state) { 
case 'GET:/': 
    return `Hello ${this.name}`;
case 'GET:/2': 
    return '<h1 > test </h1>';

default:
 }
    } catch(err) {
      // @ts-ignore
      displayError('Error in the component: \n\t examples/app/controllers/ControllerUser.o3' ,err.message, err);
      throw err;
    }
  }
    }
  