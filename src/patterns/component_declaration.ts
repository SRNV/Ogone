// @ts-nocheck
function component_ctx(element_"{{ vmc_name }}") {
  "{{ element_vars /** let n1, n2; */ }}"
  // reactive function will be imported
  let component = reactive("{{ vmc_instantiate }}", update);
  const "{{ props_name }}" = element_"{{ vmc_name }}".props;
  /**
   * all lifeCycle of the component
   */
  const connected = "{{ vmc_name }}".connected && "{{ vmc_name }}".connected.bind(component);
  const beforeUpdate = "{{ vmc_name }}".beforeUpdate && "{{ vmc_name }}".beforeUpdate.bind(component);
  const updated = "{{ vmc_name }}".updated && "{{ vmc_name }}".updated.bind(component);
  const beforeDestroy = "{{ vmc_name }}".beforedDstroy && "{{ vmc_name }}".beforedDstroy.bind(component);
  const destroyed = "{{ vmc_name }}".destroyed && "{{ vmc_name }}".destroyed.bind(component);
  // all render iteration functions
  "{{ iterations_declarations }}"
  /* will assign all the nodes inside vars*/
  function init() {
    "{{ element_assignments }}"
    // append childs - attributes will use set attribute
    "{{ element_parent_append_childs /** parent.append(...childs) */ }}"
    // call the functions that render the first iterations
    // first iterations has no iteration ancestors
    "{{ iterations_call }}"
    // should return the root template
    "{{ return_root_template }}"
  }
  /* general updates */
  function update() {
    if (beforeUpdate) {
      beforeUpdate(component);
    }
    // all update of bound textnodes
    "{{ bound_textnodes_updates }}"
    // all update of bound attributes
    "{{ bound_attributes_updates }}"
    // all component should update their props
    "{{ props_updates }}"
    // call the functions that render the first iterations
    // first iterations has no iteration ancestors
    "{{ iterations_call }}"
    if (updated) {
      updated(component);
    }
  }
  /** when the component is destroyed */
  function destroy() {
    // before we destroy all the elements
    if (beforeDestroy) {
      beforeDestroy(component);
    }
    // all elements destructions
    // element.remove();
    "{{ element_destructions }}"
    // finally destroyed component
    if (destroyed) {
      destroyed(component);
    }
  }
  function connectedFn() {
    if (connected) {
      connected(component);
    }
  }
  return {
    component,
    init: init.bind(component),
    update: update.bind(component),
    destroy: destroy.bind(component),
    connected: connectedFn.bind(component),
  }
}
customElements.define('"{{ uuid_component }}"', class extends HTMLElement {
  constructor() {
    super();
    this.props = reactive({}, () => this.update());
    const { init, update, destroy, component, connected } = component_ctx(this);
    let template = init();
    // @ts-ignore
    this.component = component;
    /**
     * set all the lifecycle
     */
    this.connected = connected;
    this.update = update;
    this.destroy = destroy;
    if ("{{ vmc_name }}".props) {
      this.props = "{{ vmc_name }}".props.bind(component);
    }
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(...template.childNodes);
  }

  connectedCallback() {
    this.connected && this.connected();
    this.update && this.update();
  }
});