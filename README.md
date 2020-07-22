<p align="center">
  <img src="https://github.com/SRNV/Ogone/raw/master/public/neum-ogone-2" width="350">
</p>

# Ogone

[![deno version](https://img.shields.io/badge/deno-^1.0.2-informational)](https://github.com/denoland/deno)
[![stars](https://img.shields.io/github/stars/SRNV/Ogone)](https://github.com/SRNV/Ogone/stargazers)
[![issues](https://img.shields.io/github/issues/SRNV/Ogone)](https://github.com/SRNV/Ogone/issues)
[![forks](https://img.shields.io/github/forks/SRNV/Ogone)](https://github.com/SRNV/Ogone/forks)
[![license](https://img.shields.io/github/license/SRNV/Ogone)](https://github.com/SRNV/Ogone)
[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/Ogone@0.16.0-rc.0)

---
# Description

use Ogone to compile web-components for your applications. it's based on Deno.
Actually Ogone is under an experimental phase. avoid using it for production.
Ogone has it own extension `*.o3` which allow some new features.
No Proxies, no getters, no setters used for the reactivity, just code...

# Installation

```typescript
import o3 from 'https://x.nest.land/Ogone@0.16.0-rc.3/mod.ts';

o3.run({
  entrypoint: 'path/to/root-component.o3',
  modules: '/modules',
  port: 8080,
});
```
# Learn Ogone

to see more stuffs from Ogone, clone this repository

```shell
deno run --allow-all --unstable examples/app/index.ts
```

- [Introduction](https://github.com/SRNV/Ogone/tree/master/docs/introduction.md)
- [Examples](https://github.com/SRNV/Ogone/tree/master/docs/examples.md)
- [Contributions](https://github.com/SRNV/Ogone/tree/master/docs/contributions.md)


---

# Extensions
  - VS Code
    - Syntax High-lighting: Otone 0.0.8^
