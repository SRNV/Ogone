import factory from "./factory.ts";

export default (opts: any) =>
  `
function openOgoneDevTool() {
    Ogone.DevTool = window.open('', 'Ogone Dev Tool', devTool_window_parameters);
    if (!Ogone.DevTool) {
      Ogone.error('Dev Tool is blocked', 'Ogone Dev Tool has been blocked by the browser. please allow pop-up to have access to Dev Tool', {
        message: 'allow pop-up',
      });
    }
  ${factory(opts)}
  Ogone.ComponentCollectionManager.setLabels();
}
`;
