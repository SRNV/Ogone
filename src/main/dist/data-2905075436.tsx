
    export default {};
    




    
    declare const Refs: {
      [k: string]: HTMLElement[];
    };
    class Protocol {
      public scrollY: number = 0;
    public setScrollY(n: number) {
      this.scrollY = n;
    }
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
    
    declare function RightSection (props: OgoneCOMPONENTComponent<{
      
scrollY: unknown;
    }>): h.JSX.IntrinsicElements;

    declare function AsyncLogoEl (props: OgoneASYNCComponent<{
      
    }>): h.JSX.IntrinsicElements;

    declare function MenuContent (props: OgoneCOMPONENTComponent<{
      
    }>): h.JSX.IntrinsicElements;

    declare function MenuMain (props: OgoneCOMPONENTComponent<{
      
    }>): h.JSX.IntrinsicElements;

    declare function RouterComponent (props: OgoneROUTERComponent<{
      
    }>): h.JSX.IntrinsicElements;
    class Component extends Protocol {
      render() {
        return (
<template >

<div 
ref="head" 
class="header" >

<div 
class="logo" >

<AsyncLogoEl  >

</AsyncLogoEl>
</div>
<div  
class="open-dev-tool" >

 Dev 

</div>
<MenuContent  />

</div>
<RouterComponent 
namespace="new"  />

<MenuMain  />

<RightSection 
{...this}  />

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

    const [header] = Refs.head;
    window.addEventListener('scroll', (ev) => {
      if (header) {
        if (window.scrollY > this.scrollY) {
          header.style.top = '-100px';
        } else {
          header.style.top = '0px';
        }
      }
      this.setScrollY(window.scrollY);
    });
    break;
 }
    } catch(err) {
      // @ts-ignore
      displayError('Error in the component: \n\t examples/app/Application.o3' ,err.message, err);
      throw err;
    }
  }
    }
  