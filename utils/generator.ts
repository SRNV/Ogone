let i = 0;
export default (function* gen() {
  while (true) {

    let base = 0;
    crypto.getRandomValues(new Uint8Array(10))
      .forEach((int) => {
        base +=+ int
      });
    const res = Math.floor((Math.random() * 200000) + base);
    yield i+=+ res;
  }
})();
