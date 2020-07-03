export default (opts: any) =>
  `
  svg * {
    transform-origin: center;
  }
  @keyframes dash-slide {
    from {
      stroke-dashoffset: 0%;
    }
    to {
      stroke-dashoffset: 50%;
    }
  }
  @keyframes reaction {
    from {
      fill: orange;
    }
    to {
      fill: #484848;
    }
  }
  line {
    animation: dash-slide;
    animation-iteration-count: infinite;
    animation-duration: 10s;
    animation-direction: alternate;
  }
  .reaction {
    animation: reaction;
    animation-iteration-count: infinite;
    animation-duration: 0.5s;
    animation-direction: alternate;
  }
  .component {
    stroke: #61c3aa;
    stroke-width: 5px;
    fill: #484848;
  }
  .async {
    stroke: #eee47f;
    stroke-width: 5px;
    fill: #484848;
  }
  .async-shadow {
    stroke: #33291a;
    stroke-width: 5px;
    fill: #33291a;
  }
  .store {
    stroke: #b5e4ff;
    stroke-width: 10px;
    fill: #484848;
  }
  .router {
    stroke: orange;
    stroke-width: 7px;
    fill: #484848;
  }
  .component-shadow, .store-shadow, .router-shadow {
    stroke: #25423a;
    stroke-width: 5px;
    fill: #25423a;
  }
  .root {
    stroke: #b5b0fa;
    stroke-width: 5px;
    fill: #484848;
  }
  .root-shadow {
    stroke: #302f46;
    stroke-width: 5px;
    fill: #302f46;
  }
  .element {
    stroke: #333333;
    stroke-width: 5px;
    fill: #484848;
  }
  .element-shadow {
    stroke:#232323;
    stroke-width: 5px;
    fill:#232323;
  }
  .root,
  .root-shadow,
  .component,
  .component-shadow,
  .router,
  .router-shadow,
  .store,
  .store-shadow,
  .async,
  .async-shadow,
  .element,
  .element-shadow {
    cursor: pointer;
    transform-origin: center;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .root:hover,
  .component:hover,
  .async:hover,
  .router:hover,
  .store:hover,
  .element:hover {
    fill: #686868;
  }
  line.store, line.router {
    stroke-dashoffset: 837;
    stroke-dasharray: 34;
  }
  line.component {
    stroke-width: 5;
    stroke: #61c3aa;
  }
  line.async {
    stroke-width: 5;
    stroke: #808080;
    stroke-dashoffset: 837;
    stroke-dasharray: 11;
  }
  .async.resolved {
    stroke-width: 5;
    stroke: #eee47f;
    stroke-dashoffset: 837;
    stroke-dasharray: none;
  }
  line.element {
    stroke: #999999;
  }
`;
