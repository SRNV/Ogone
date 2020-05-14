let i = 0;
export default (function* gen() {
  while (true) {
    yield i++;
  }
})(0);
