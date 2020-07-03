export default (opts: any) =>
  `
body {
    background: #424242;
    color: rgb(60%, 60%, 60%);
    padding: 0px;
    font-family: sans-serif;
  }
  *::selection {
    background: var(--o-primary);
    color: var(--o-background);
  }
  pre {tab-size: 3;}

  *:root {
    --o-secondary: #61c3aa;
    --o-primary: #b5b0fa;
    --o-black: #202229;
    --o-grey: #808080;
    --o-dark-blue: #3b6879;
    --o-error: #ff0076;
    --o-warning: #f9f694;
    --o-success: #94f9c6;
    --o-info: #b5e4ff;
    --o-background: white;
    --o-header: #333333;
  }
  /* width */
  ::-webkit-scrollbar {
    width: 7px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: var(--o-black);
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: var(--o-grey);
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: var(--o-primary);
  }
  .ogone-logo {
    position: fixed;
    z-index: -200;
    bottom: -5px;
    left: -10px;
    opacity: .4;
  }
  .dev-tool-viewer {
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  svg {
    overflow: visible;
  }
  .dev-tool-informations {
    user-select: none;
    z-index: 2;
    font-family: sans-serif;
    background: #333333;
    color: #777777;
    width: 100vw;
    position: fixed;
    left: 0;
    bottom: 0;
    padding: 5px;
  }
  .diagnostics {
    display: flex;
    flex-direction: column;
    background: #333333;
    color: white;
    width: 300px;
    position: fixed;
    right: 0;
    height: 100%;
    top: 0;
    z-index: 5000;
    transform: translateX(100%);
    transition: 0.5s ease;
    overflow-y: auto;
  }
  .diagnostics-open {
    transform: translateX(0%);
    transition: 0.5s ease;
  }
  .diagnostics-panel {
    background: #232323;
    flex: 0;
    border-top: 1px solid #525252;
    color: #9c9c9c;
    white-space: pre-line;
    letter-spacing: 1px;
    font-size: 10pt;
    transition: 0.5s ease;
    overflow-x: hidden;
    overflow-y: scroll;
  }
  .diagnostics-container {
    margin: 5px;
    background: #333333;
    padding: 10px;
    border: 1px solid #525252;
    word-break: break-word;
    filter: drop-shadow(0px 4px 1px black);
  }
  .diagnostics-panel-open {
    flex: 2;
  }
  .diagnostics > h5.title {
    margin-left: 10px;
    color: #adadad;
    font-weight: 400;
    letter-spacing: 4px;
    flex: 0;
    user-select: none;
    cursor: pointer;
  }
  .devtool-label {
    position: fixed;
    z-index: 2000;
    background: #333333d6;
    color: #ababab;
    padding: 10px;
    left: 642px;
    font-family: sans-serif;
    top: 171px;
    pointer-events: none;
    display: none;
    user-select: none;
  }
  .diagnostics-root,
  .diagnostics-element,
  .diagnostics-async,
  .diagnostics-router,
  .diagnostics-store,
  .diagnostics-component {
    flex: 0;
    padding: 7px;
  }
  .diagnostics-root {
    background: #b5b0fa;
  }
  .diagnostics-component {
    background: #61c3aa;
  }
  .diagnostics-async {
    background: #eee47f;
  }
  .diagnostics-store {
    background: #b5e4ff;
  }
  .diagnostics-router {
    background: orange;
  }
  .diagnostics-element {
    background: #777777;
  }
  .diagnostics-tree-type-figure {
    width: auto;
    height: 0px;
    padding: 3px;
    border-radius: 0;
    margin-right: 10px;
    border: 1px solid;
  }
  details.diagnostics-data-details {
    background: #00000023;
  }
  div.diagnostics-data-container,
  details.diagnostics-data-details {
    padding-left: 15px;
    margin-top: 5px;
    margin-bottom: 5px;
    cursor: pointer;
  }
  span.boolean, span.null, span.number {
    color: #f680f7;
  }
  span.function {
    color: #80e0f7;
  }
  span.string {
    color: #61c3aa;
  }
  span.constructor {
    color: #e576e6;
  }
  span.string, span.number, span.boolean, span.function {
    margin-left: 10px;
  }
  details.diagnostics-data-details.array > summary {
    color: #585858;
  }
  details:not([open]) > summary.object::after {
    content: " {...}";
  }
  details:not([open]) > summary.array::after {
    content: " [...]";
  }
`;
