
    export default {};
    
    
declare abstract class Store {public static dispatch(ns: string, ctx?: any): any}
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
    
    declare function StoreMenu (props: OgoneSTOREComponent<{
      
    }>): h.JSX.IntrinsicElements;
    class Component extends Protocol {
      render() {
        return (
<template >

<StoreMenu 
namespace="menu"  />

<div 
class="container"  >

<div 
class="line" >

</div>
<div 
class="line" >

</div>
<div 
class="line" >

</div>
</div>
</template>);
      }
       runtime (_state: string | number, ctx: any, event: any, _once: number = 0) {
    try {
      
    
    
    
    // @ts-ignore
  if (typeof _state === "string" && !['click:openMenu'].includes(_state)) {
    return;
  }
    switch(_state) { 
case 'click:openMenu': 
                Store.dispatch('menu/toggle')
    Store.dispatch('menu/checkController')
      .then((res: any) => {
        console.warn(res);
      });
    break;

default:
 }
    } catch(err) {
      // @ts-ignore
      displayError('Error in the component: \n\t examples/app/components/Burger.o3' ,err.message, err);
      throw err;
    }
  }
    }
  