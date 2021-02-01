
    
    
declare namespace Async {export function resolve(): void;}
declare type _state = string | number;
declare type ctx = {[k: string]: any};
declare type event = Event;
declare type _once = number;
    class Protocol {
      item?: { label: string; route: string; children: any[]; };
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
    
    declare function AsyncRecursiveComponent (props: OgoneASYNCComponent<{
      
item:  { label: string; route: string; children: any[]; };
    }>): h.JSX.IntrinsicElements;
    class Component extends Protocol {
      render() {
        return (
<template >

<li   
class="fade-in-bottom" >


    ${this.item?.label}
  

</li>
<ul >
{
              this.item?.children
            .map((
              item,
              i: number
            ) =>
              
<AsyncRecursiveComponent   
item={item}  >

</AsyncRecursiveComponent>
            )}
</ul>
</template>);
      }
      async runtime (_state: string | number, ctx: any, event: any, _once: number = 0) {
    try {
      
    
    
    
    // @ts-ignore
  if (typeof _state === "string" && ![].includes(_state)) {
    return;
  }
    switch(_state) { 

default:

    Async.resolve();
 }
    } catch(err) {
      // @ts-ignore
      displayError('Error in the component: \n\t examples/boilerplate/components/atoms/li-menu.o3' ,err.message, err);
      throw err;
    }
  }
    }
  