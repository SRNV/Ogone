import SUI from "https://raw.githubusercontent.com/jeanlescure/short_uuid/master/mod.ts";
import XMLParser from "./XMLParser.ts";
import type { Bundle, XMLNodeDescription, Component } from "../.d.ts";

const uuid: SUI = new SUI({
  length: 5,
  shuffle: false,
  debug: false,
  dictionary: ["a", "b", "x", "y", "z", "o", "r", "s", "n", "v", "3", "5"],
});
/**
 * @name ComponentBuilder
 * @code OCB2
 * @code OCB2-OC0
 * @description this class will help build all the components of the application previously saved by the ComponentSubscriber (OCS1)
 * to do so, just pass the bundle (typeof Bundle) inside the read method.
 * ```ts
 *   ComponentBuilder.read(bundle as Bundle);
 * ```
 * it will also render the component and give all the nodes of the component by using the XMLParser
 * you can access to the rootNode by using the property rootNode
 * ```ts
 *   const { childNodes } = component.rootNode
 * ```
 */
export default class ComponentBuilder {
  /**
   * instance to parse xml
   * no xml error is thrown
   * @example
   * ```ts
   * XMLParser.parse('<div></div>')
   * ```
   */
  protected XMLParser = new XMLParser();
  getComponent(
    opts: Pick<Component, "rootNode" | "file" | "remote">,
  ): Component {
    return {
      uuid: `data-${uuid.randomUUID()}`,
      isTyped: false,
      esmExpressions: "",
      exportsExpressions: "",
      data: {},
      style: [],
      scripts: {
        runtime: "function run(){};",
      },
      imports: {},
      flags: [],
      for: {},
      refs: {},
      reactive: {},
      protocol: null,
      // if the component type is set as router
      routes: null,
      // if the component type is store
      namespace: null,
      modules: [],
      type: "component",
      requirements: null,
      hasStore: false,
      ...opts,
      mapStyleBundle: undefined,
      elements: {
        styles: opts.rootNode.childNodes.filter((n: XMLNodeDescription) => n.nodeType === 1 && n.tagName === "style"),
        template: opts.rootNode.childNodes.find((n: XMLNodeDescription) => n.nodeType === 1 && n.tagName === "template"),
        proto: opts.rootNode.childNodes.filter((n: XMLNodeDescription) => n.nodeType === 1 && n.tagName === "proto"),
      },
      context: {
        data: '',
        props: '',
        protocol: '',
        protocolClass: '',
      },
      modifiers: {
        beforeEach: '',
        compute: '',
        cases: [],
        default: '',
        build: '',
      },
    };
  }
  /**
   *
   * @param bundle {Bundle}
   * @description start reading all files saved inside bundle.files
   */
  read(bundle: Bundle) {
    // start by local components
    bundle.files.forEach((local, i) => {
      const { path, file } = local;
      const index = path;
      const rootNode: XMLNodeDescription | null = this.XMLParser.parse(file);
      if (rootNode) {
        const component = this.getComponent({
          rootNode,
          file: index,
          remote: null,
        });
        bundle.components.set(
          index,
          component,
        );
        bundle.repository[component.uuid] = {};
      }
    });
    // then render remote components
    bundle.remotes.forEach((remote, i) => {
      const { path, file } = remote;
      const index = path;
      const rootNode: XMLNodeDescription | null = this.XMLParser.parse(file);
      if (rootNode) {
        const component = this.getComponent({
          remote,
          rootNode,
          file: index,
        });
        bundle.components.set(
          index,
          component,
        );
        bundle.repository[component.uuid] = {};
      }
    });
    // finally save it into repository
    bundle.files.concat(bundle.remotes).forEach((localOrRemote) => {
      if (localOrRemote.item) {
        const parent = bundle.components.get(localOrRemote.parent);
        if (parent) {
          bundle.repository[parent.uuid] = bundle.repository[parent.uuid] || {};
          bundle.repository[parent.uuid][localOrRemote.item.path] =
            localOrRemote.path;
        }
      }
    });
  }
}
