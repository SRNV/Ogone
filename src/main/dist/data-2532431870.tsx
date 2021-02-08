
    export default {};
    

    
    class Protocol {
      public openTree: boolean = false;
    public  item: {
      route: string;
      status?: string;
      name?: string;
      children: ({
        status?: string;
        name: string;
        route: string;
        children: any[]
      })[];
    } = { name: 'no name', route: '', status: 'todo', children: []};
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
    
    declare function ScrollComponent (props: OgoneCOMPONENTComponent<{
      
    }>): h.JSX.IntrinsicElements;

    declare function TreeRecursive (props: OgoneCOMPONENTComponent<{
      
item:  {
      route: string;
      status?: string;
      name?: string;
      children: ({
        status?: string;
        name: string;
        route: string;
        children: any[]
      })[];
    } ;
    }>): h.JSX.IntrinsicElements;
    class Component extends Protocol {
      render() {
        return (
<template >

<div 
class="container" >

<div 
class="title"   >

<span >


        ${this.item.name}
      

</span>
<span  >


        ${!this.item.children && this.item.status ? this.item.status : ''}
      

</span>
<span  >

 &rt; 

</span>
<span  >

 &lt; 

</span>
</div>
<div 
class="child"   >

<ScrollComponent >
{
              this.item.children
            .map((
              child,
              i8: number
            ) =>
              
<TreeRecursive  
item={child}  >

</TreeRecursive>
            )}
</ScrollComponent>
</div>
</div>
</template>);
      }
       runtime (_state: string | number, ctx: any, event: any, _once: number = 0) {
    try {
      
    
    
    
    // @ts-ignore
  if (typeof _state === "string" && !['click:toggle'].includes(_state)) {
    return;
  }
    switch(_state) { 
case 'click:toggle': 
    this.openTree = !this.openTree
    break;

default:
 }
    } catch(err) {
      // @ts-ignore
      displayError('Error in the component: \n\t examples/app/components/menu/TreeRecursiveButton.o3' ,err.message, err);
      throw err;
    }
  }
    }
  