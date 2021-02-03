
    
    
declare type _state = string | number;
declare type ctx = {[k: string]: any};
declare type event = Event;
declare type _once = number;
    class Protocol {
      readonly title: string = 'Ogone';
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
    
    declare function RouterMain (props: OgoneROUTERComponent<{
      
    }>): h.JSX.IntrinsicElements;
    class Component extends Protocol {
      render() {
        return (
<template 
private >

<RouterMain 
namespace="main" >

</RouterMain>
</template>);
      }
       runtime (_state: string | number, ctx: any, event: any, _once: number = 0) {
    try {
      
    
    
    
    // @ts-ignore
  if (typeof _state === "string" && ![].includes(_state)) {
    return;
  }
    switch(_state) { 

default:

        break;
 }
    } catch(err) {
      // @ts-ignore
      displayError('Error in the component: \n\t examples/website/App.o3' ,err.message, err);
      throw err;
    }
  }
    }
  