function* gen(i: number): Generator {
  yield i;
  while (true) {
    yield i++;
  }
}
const iterator: Generator = gen(0);
export default iterator;
