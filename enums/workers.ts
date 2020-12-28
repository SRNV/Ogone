enum Workers {
  SERVICE_DEV_READY = 'SERVICE_DEV_READY',
  INIT_MESSAGE_SERVICE_DEV = 'INIT_MESSAGE_SERVICE_DEV',
  SERVICE_DEV_GET_PORT = 'SERVICE_DEV_GET_PORT',
  LSP_SEND_PORT = 'LSP_SEND_PORT',
  LSP_OPEN_WEBVIEW = 'LSP_OPEN_WEBVIEW',
  LSP_UPDATE_CURRENT_COMPONENT = 'LSP_UPDATE_CURRENT_COMPONENT',
  LSP_UPDATE_SERVER_COMPONENT = 'LSP_UPDATE_SERVER_COMPONENT',
  LSP_CURRENT_COMPONENT_RENDERED = 'LSP_CURRENT_COMPONENT_RENDERED',
  LSP_SEND_COMPONENT_INFORMATIONS = 'LSP_SEND_COMPONENT_INFORMATIONS',
  LSP_SEND_ROOT_COMPONENT_FILE = 'LSP_SEND_ROOT_COMPONENT_FILE',
}
export default Workers;