function array(a) {return Array.from(a)};
function arrayLast(a) {return a[a.length-1]};
function loop(a,f){
    if((a).length === 0) return a;
    let i = 0, length = a.length;
    for(;i<length;i++){ f(a[i],i); }
    return a
}
function loopReverse(a,f){
    if((a).length === 0) return a;
    for(let i = a.length-1;i >= 0;i--){ f(a[i],i); }
    return a
}
function loopKeys(o, f){
    const a = Object.keys(o);
    if((a).length === 0) return a;
    for(var i = 0, length = a.length;i<length;i++){ f(a[i],i); }
    return a
}
function loopEntries(o, f){
    const a = Object.entries(o)
    if((a).length === 0) return a;
    for(let i = 0, length = a.length;i<length;i++){ f(a[i],i); }
    return a
}
function loopBackForFromTo(a, o){
    const d = o.to - o.from;
    const starterId = o.from;
    if (d > 0){
        let i = 0;
        for (;i < d; i++) { o.forward(
            a[starterId+i], starterId+i
        ); }
    }
    if (d < 0){
        let i = d*-1
        for(;i > 0;i--){ o.backward(); }
    }
};
function SetScopedCSS(cssStr, scopeId) {
  const regCSSByEnd = /\}/gi;
  const regCSSByBegin = /\{/gi;
  const splittedCSSByEnd = cssStr.split(regCSSByEnd);
  let result = cssStr;
  let resultCSS = '';
  loop(splittedCSSByEnd, part => {
      const scbb = part.split(regCSSByBegin);
      loop(scbb, (p, id) => {
          if (id !== 0 || p.trim() === "") return;
          const splittedSelector = p.split(/\:/gi)
          const pseudoC = splittedSelector[1] ? ':' + splittedSelector[1] : '';
          const element = splittedSelector[0]
          scbb[id] = element
              .replace(/([\.\#]){0,1}([^\>\,\s][a-zA-Z0-9\_\.\#\-]*)+/gi, `$1$2[${scopeId}]`) +
              (pseudoC ? pseudoC : '');
      })
      if (scbb[1] !== undefined) {
          const style = scbb[1];
          const selector = scbb[0];
          resultCSS += `${selector}{${style}}`;
      }
  })
  return notEmpty(resultCSS) ? resultCSS : result;
}
