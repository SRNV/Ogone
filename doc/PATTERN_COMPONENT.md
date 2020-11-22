# Ogone Component Declaration's pattern
Ogone's reactivity would be quiet inspired by Svelte's Reactivity

the idea is to use vars (from the template provided by the end user), and to assign  value in two time.
for this we would use two functions `component_ctx` and `init`.
the first one contains the second one.

```js
function component_ctx() {
  // element's vars declarations here like: let tmp, n;
  // ...
  function init() {
    // element assignment here
  }
  return {
    init,
  };
}
customElement.define('[component-uuid]', class extends HTMLElement {
  connectedCallback() {
    super();
    const ctx = component_ctx();
    const template = ctx.init();
  }
})
```
# TODO: more documentations here

```js
import Component from '../[path_to_component].ts';

function component_ctx() {
  // tmp is a template element
  // n3 is a div element
  // t4 is a boundtext textnode
  let tmp1,
  n2,
  n3,
  t4,
  /* boundtextnode with end user's input */
  t4_data_update;
  t4_data_prev,
  t4_data_next
  /* c5 is a component */
  c5,
  c5_props_update,
  /* and then the component */
  component = new Component();

  /* will assign all the nodes inside vars*/
  function init() {
    tmp1 = document.createElement('template');
    n3 = document.createElement('div');
    c5 = document.createElement('data-[uuid_sub_component]');
    t4 = new Text(' ');
    t4_data_update = () => this.message;
    /* using the component's props attribute value */
    c5_props_update = () => ({
      message: this.message
    });
    // append childs
    tmp1.append(n3);
    n3.append(t4);
    n3.append(c5);
    // TODO attributes and bound attributes
    // return the template
    return tmp1;
  }
  /* general updates */
  function update() {
    t4_data_next = t4_data_update(component);
    if (t4_data2_prev !== t4_data_next) {
      t4.data = t4_data_next;
      t4_data2_prev = t4_data_next;
    }
    /* using the component's props attribute value */
    c5.props(c5_props_update(component));
  }
  return {
    component,
    init: init.bind(component),
    update: update.bind(component)
  }
}
customElement.define('data-[uuid_component]', class extends HTMLElement {
  constructor() {
    super();
    const { init, update, component } = component_ctx();
    let template = init();
    let templateContent = template.content;
    this.component = component;

    const shadowRoot = this.attachShadow({mode: 'open'})
      .appendChild(templateContent.cloneNode(true));
  }
});
```