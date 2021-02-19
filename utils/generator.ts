let i = 0;
export default (function* gen() {
  while (true) {
    yield i+=+ Math.floor(Math.random() * 200000);
  }
})();
