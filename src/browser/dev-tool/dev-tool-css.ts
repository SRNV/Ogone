export default (opts: any) => `
body {
    background: #424242;
    color: rgb(60%, 60%, 60%);
    padding: 0px;
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
    background: #333333;
    color: white;
    width: 300px;
    position: fixed;
    right: 0;
    height: 100%;
    top: 0;
    z-index: 20;
    transform: translateX(100%);
    transition: 0.5s ease;
  }
  .diagnostics-open {
    transform: translateX(0%);
    transition: 0.5s ease;
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
`;