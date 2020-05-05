let i = 0;
module.exports = (function* gen() {
  while (true)
    yield i++;
})(0);