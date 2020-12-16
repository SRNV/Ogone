
    

import ComponentModule from './component-module.ts'
    
declare namespace Ogone {    export function error(
          title: string,
          description: string,
          error: Error | TypeError | SyntaxError | { message: string },
        ): void;}
declare type _state = string | number;
declare type ctx = {[k: string]: any};
declare type event = Event;
declare type _once = number;
    class Protocol {
      
      prop = {
      name: 'test',
      count: 0,
    };
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
    
    declare function Reuse (props: OgoneCOMPONENTComponent<{
      
count: number;
name: string;
    }>): h.JSX.IntrinsicElements;

    declare function DefTest (props: OgoneCOMPONENTComponent<{
      
    }>): h.JSX.IntrinsicElements;
    class Component extends Protocol {
      render() {
        return (
<template >


  a re-used webcomponent: 

<Reuse 
{ ...this.prop} 
data-yz3bn >

</Reuse>
<br 
data-yz3bn >

</br>
<DefTest 
data-yz3bn >

</DefTest>
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

    setInterval(() => this.prop.count++, 100);
    customElements.define('other-component', ComponentModule);
    break;
 }
    } catch(err) {
      // @ts-ignore
      Ogone.error('Error in the component: \n\t examples/tests/reusable/index.o3' ,err.message, err);
      throw err;
    }
  }
    }
  