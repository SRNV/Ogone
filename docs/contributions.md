# Theory

Minimalist:

  - the less is more.
  - Every solutions have a minimalist alternative solution (cleaner, scalable).
  - what you wrote twice, you have to write it once.
  - no useless code has to be compiled.
  - everything is a component, because everything is a part of a composition.

All in one. including:

  - Store
  - Router
  - Controllers for Stubs
  - Tests
    - unit tests
    - Integrations tests
    - e2e
  - HMR

---

# Format

Ogone is formatted by `deno fmt`

# Support

To support, join the [discord](https://discord.com/channels/710950501398610061/710950501398610064) server or do not hesitate to write issues.

# Todo

(\*) required before publication
(\*\*) required before 1.0.0
(...) in conception

- [x] Imports modules \*
- [ ] Integrated Ogone-Dev-Tools \*\*
- [ ] Integrated test environment \*\*
  - [ ] case 'test' is supported \*\*
  - [ ] Automated stress tests \*\*
- [x] Controllers Components (...)
- [ ] Sounds Components (...)
- [ ] Write robust tests for Ogone \*\*
  - [x] Dom-parser is solid \*\*
  - [ ] Js-this is solid \*\*
  - [x] Stress mode is supported \*\*
  - [x] Scope-css is solid \*\*
- [x] Switch every files to Typescript (almost done, need to switch js-this) \*
  - [x] Write types \*\*
  - [x] Typescript supported in `<proto>` \*\*
- [ ] Write more exceptions for each flags \*\*
- [ ] Write docs \*
- [ ] Write more examples/ \*\*
- [ ] [Complete HMR](https://github.com/SRNV/Ogone/blob/master/docs/todos/hmr.md) \*\*
- [x] [Complete Async Component](https://github.com/SRNV/Ogone/blob/master/docs/todos/async.md) \*\*
- [ ] [Complete Router Component](https://github.com/SRNV/Ogone/blob/master/docs/todos/router.md) \*\*
- [ ] [Complete Syntax-HighLighting](https://github.com/SRNV/Ogone/blob/master/docs/todos/syntax-highlight.md) \*\*
- [ ] [Complete Reaction Observer](https://github.com/SRNV/Ogone/blob/master/docs/todos/reaction-observer.md) \*\*

# Tests

Ogone implements stress mode. which run the tests each saving you make.
to run the tests:

```shell
sudo deno run --allow-all lib/stress/index.ts --stress tests
```