
    export default {};
    
    
    class Protocol {
      buttonOpts: {
      name: string;
      route: string;
      status: 'ok' | 'todo' | 'in-progress';
    } = {
      name: 'Test',
      route: '',
      status: 'todo'
    };
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
        return (
<template >

<div 
class="container"  >


    ${this.buttonOpts.name}
    

<span 
class="ok"  >

</span>
<span 
class="todo"  >

</span>
<span 
class="in-progress"  >

</span>
</div>
</template>);
      }
       runtime (_state: string | number, ctx: any, event: any, _once: number = 0) {
    try {
      
    
    
    
    switch(_state) { 

default:
 }
    } catch(err) {
      // @ts-ignore
      displayError('Error in the component: \n\t examples/app/components/menu/MenuButton.o3' ,err.message, err);
      throw err;
    }
  }
    }
  