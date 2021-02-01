
    
    
declare namespace Async {export function resolve(): void;}
declare type _state = string | number;
declare type ctx = {[k: string]: any};
declare type event = Event;
declare type _once = number;
    class Protocol {
      public readonly links: ({label: string; route: string; children: any[] })[] = [
      { label: 'Ogone', route: '/ogone', children: [
        { label: 'Examples', route: '/ogone/examples'},
      ]},
    ];
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
    
    declare function AsyncLiMenu (props: OgoneASYNCComponent<{
      
item:  { label: string; route: string; children: any[]; };
    }>): h.JSX.IntrinsicElements;
    class Component extends Protocol {
      render() {
        return (
<template >

<div 
class="container fade-in-slide-in-left" >

<div 
class="header"  >

<img  
class="logo" 
src="https://raw.githubusercontent.com/SRNV/Ogone/feat/use-deno-bundle/fix-types/one-ogone-browser-and-deno/src/public/ogone.svg"  
nodeAwait >

</img>
</div>
<hr >

</hr>
<ul >
{
              this.links
            .map((
              item,
              i: number
            ) =>
              
<AsyncLiMenu   
item={item}  >

</AsyncLiMenu>
            )}
</ul>
</div>
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
      displayError('Error in the component: \n\t examples/boilerplate/components/organism/left-menu.o3' ,err.message, err);
      throw err;
    }
  }
    }
  