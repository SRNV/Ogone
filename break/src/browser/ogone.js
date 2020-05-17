const Ogone = {
  render: [],
  events: [],
  styles: [],
  templates: {},
  texts: [],
  contexts: {},
  components: {},
  classes: {},
  errorPanel: null,
  error(message, errorType, errorObject) {
    // here we render the errors in development
    if (!this.errorPanel) {
      const p = document.createElement('div');
      Object.entries({
        zIndex: '5000000',
        background: '#00000097',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        overflowY: 'auto',
        overflowY: 'auto',
        justifyContent: 'center',
        display: 'grid',
        flexDirection: 'column',
      }).forEach(([key, value]) => p.style[key] = value);
      this.errorPanel = p;
    }
    const err = document.createElement('div');
    Object.entries({
      zIndex: '5000000',
      background: '#000000',
      minHeight: 'fit-content',
      maxWidth: '70%',
      padding: '21px',
      color: 'red',
      borderLeft: '3px solid red',
      margin: 'auto',
      display: 'inline-flex',
      flexDirection: 'column',
    }).forEach(([key, value]) => err.style[key] = value);
    const errorId = this.errorPanel.childNodes.length + 1;
    const code = document.createElement('code');
    const stack = document.createElement('code');
    const h = document.createElement('h4');
    // set the text
    h.innerText = `[Ogone] Error ${errorId}: ${errorType || 'Undefined Type'}`;
    code.innerText = `${message.trim()}`;
    stack.innerText = `${errorObject && errorObject.stack ? errorObject.stack.replace(message, '') : '' }`;
    // check if stack is empty or not
    if (!stack.innerText.length && errorObject && errorObject.message) {
      stack.innerText = `${errorObject && errorObject.message ? errorObject.message : '' }`;
    }
    !stack.innerText.length ? stack.innerText = 'undefined stack' : '';
    // set the styles
    code.style.marginLeft = '20px';
    code.style.whiteSpace = 'pre-wrap';
    code.style.wordBreak = 'break-word';
    stack.style.marginLeft = '20px';
    stack.style.color = '#dc7373';
    stack.style.padding = '17px';
    stack.style.background = '#462626';
    stack.style.whiteSpace = 'pre-wrap';
    stack.style.wordBreak = 'break-word';
    stack.style.border = '1px solid';
    stack.style.marginTop = '10px';
    h.style.color = '#8c8c8c';
    this.errorPanel.style.paddingTop = '30px';
    // set the grid of errors
    err.style.gridArea = `e${errorId}`;
    const m = 2;
    let grid = '';
    let i = 0;
    let a = 0;
    for (i = 0, a = this.errorPanel.childNodes.length + 1; i < a; i++) {
      grid += `e${i+1} `;
    }
    let b = i;
    while (i % m) {
      grid += `e${b} `;
      i++;
    }
    const cells = grid.split(' ');
    var o,j,temparray,chunk = m;
    let newgrid = '';
    for (o=0,j=cells.length-1; o<j; o+=chunk) {
        temparray = cells.slice(o,o+chunk);
        newgrid += ` "${temparray.join(' ')}"`;
    }
    this.errorPanel.style.gridGap = '10px';
    this.errorPanel.style.gridAutoRows = 'max-content';
    this.errorPanel.style.gridTemplateAreas = newgrid;
    // append elements
    err.append(h, code, stack);
    this.errorPanel.append(err);
    this.errorPanel.style.pointerEvents = 'scroll';
    //  append only if it's not in the document
    !this.errorPanel.isConnected ? document.body.append(this.errorPanel) : [];
  },
};
