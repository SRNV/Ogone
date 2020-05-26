import beforeCase from "../src/lib/js-this/src/render/before-case.ts";

beforeCase({}, {}, `
  before-each:
    const { content } = Refs;
  def:
    user: null
  case 'init':
    setTimeout(() => {
      // should trigger the then case of parent
    }, 0);
      Async.resolve(true);
  break;
`);