import XMLParser from "./XMLParser.ts";
import type { Bundle, XMLNodeDescription, Component } from "../.d.ts";

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
    const template = opts.rootNode.childNodes
      .find((n: XMLNodeDescription) => n.nodeType === 1 && n.tagName === "template");
    const protos = opts.rootNode.childNodes.filter((n: XMLNodeDescription) => n.nodeType === 1 && n.tagName === "proto");
    return {
      uuid: `data-${crypto.getRandomValues(new Uint32Array(1)).join('')}`,
      isTyped: false,
      dynamicImportsExpressions: "",
      esmExpressions: "",
      exportsExpressions: "",
      data: {},
      style: [],
      scripts: {
        runtime: "function run(){};",
      },
      imports: {},
      deps: [],
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
        template,
        proto: protos,
      },
      context: {
        data: '',
        props: '',
        protocol: '',
        protocolClass: '',
        reuse: template?.attributes?.is as string || null,
        engine: protos[0] && protos[0].attributes.engine
          ? (protos[0].attributes.engine as string).split(' ')
          : [],
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
      const rootNode: XMLNodeDescription | null = this.XMLParser.parse(path, file);
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
      const rootNode: XMLNodeDescription | null = this.XMLParser.parse(path, file);
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
