function* gen(i) {
  yield i;
  while (true) {
    yield i++;
  }
}
const iterator = gen(0);
export default iterator;
