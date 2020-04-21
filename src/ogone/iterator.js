function* gen(i) {
  yield i;
  while (true)
    yield i++;
} 
const iterator = gen(0);
module.exports = iterator;