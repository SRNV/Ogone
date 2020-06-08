function array(a) {
  return Array.from(a);
}
function arrayLast(a) {
  return a[a.length - 1];
}
function loop(a, f) {
  if ((a).length === 0) return a;
  let i = 0, length = a.length;
  for (; i < length; i++) f(a[i], i);
  return a;
}
function loopReverse(a, f) {
  if ((a).length === 0) return a;
  for (let i = a.length - 1; i >= 0; i--) f(a[i], i);
  return a;
}
function loopKeys(o, f) {
  const a = Object.keys(o);
  if ((a).length === 0) return a;
  for (var i = 0, length = a.length; i < length; i++) f(a[i], i);
  return a;
}
function loopEntries(o, f) {
  const a = Object.entries(o);
  if ((a).length === 0) return a;
  for (let i = 0, length = a.length; i < length; i++) f(a[i], i);
  return a;
}
function loopBackForFromTo(a, o) {
  const d = o.to - o.from;
  const starterId = o.from;
  if (d > 0) {
    let i = 0;
    for (; i < d; i++) {
      o.forward(
        a[starterId + i],
        starterId + i,
      );
    }
  }
  if (d < 0) {
    let i = d * -1;
    for (; i > 0; i--) o.backward();
  }
}
function ReadDescription(element) {
  let result = [];
  let str = `placeholder ${element}`;
  let attrs = str.slice(str.indexOf(" ")).replace(/\/$/g, "");
  const beginReplacer = ";$<<&< ";
  const endReplacer = " >&>>$;\n";
  const ArrayofQuote = ['\\"'];
  loop(ArrayofQuote, (quote) => {
    const activeQuote = quote.replace(/(\\)/g, "");
    const endregQ = new RegExp(`(?<!\\\\)"(\\s|\\n)*`, "gi");
    attrs = attrs.replace(new RegExp(`(\\=)(")`, "gi"), beginReplacer).replace(
      endregQ,
      endReplacer,
    );
    loop(attrs.split(beginReplacer), (s) => {
      const value = s.split(endregQ);
      attrs = attrs.replace(
        `${value[0]}${activeQuote}`,
        value[0] + endReplacer,
      );
    });
  });
  const parseAttrsArray = attrs.split(endReplacer);
  const resultattr = [];
  loop(parseAttrsArray, (at) => {
    const attr = at.split(beginReplacer)[0].trim();
    const value = at.split(beginReplacer)[1];
    value
      ? resultattr.push({
        value,
        name: attr.replace(/^(\-|\:|\@){1,2}/g, ""),
        savedName: attr.replace(/^(\-|\:|\@){1,2}/g, ""),
        flag: attr[0] === "-" && attr[1] === "-",
        prop: attr[0] === ":",
        event: attr[0] === "@",
        attr: attr[0] !== ":" && attr[0] !== "-" && attr[0] !== "@",
      })
      : [];
  });
  loop(resultattr, (att) => {
    if (att.attr) result.push(att);
    if (att.flag) {
      const resultChangeName = att;
      resultChangeName.name = "o-flag:" + resultChangeName.name;
      result.push(resultChangeName);
    }
    if (att.prop) {
      const resultChangeName = att;
      resultChangeName.name = "o-prop:" + resultChangeName.name;
      result.push(resultChangeName);
    }
    if (att.event) {
      const resultChangeName = att;
      resultChangeName.name = "o-event:" + resultChangeName.name;
      result.push(resultChangeName);
    }
  });
  return result;
}
export default ReadDescription;
