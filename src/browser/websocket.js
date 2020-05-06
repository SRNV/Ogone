/*
const $APPWS_REPLACED_VAR$___ = new WebSocket(`ws://${host}/%%id%%`);
$APPWS_REPLACED_VAR$___.onopen = () => {
  
};
$APPWS_REPLACED_VAR$___.onclose = () => {
  location.reload();
};
$APPWS_REPLACED_VAR$___.onmessage = (event) => {
  if ($APPWS_REPLACED_VAR$___.readyState !== 1) return;
  if (event.data === 'reload') {
    location.reload();
    return;
  }
  const ev = JSON.parse(event.data);
  if (ev.id) {
    //
  }
};
*/