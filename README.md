
<p align="center">
  <img src="https://github.com/SRNV/Ogone/raw/master/public/neum-ogone-1.png">
</p>
<h1 align="center">Ogone</h1>
<p align="center">
   <a href="https://github.com/SRNV/Ogone/releases">
     <img alt="ogone version" src="https://img.shields.io/github/v/release/SRNV/Ogone?style=plastic&labelColor=black">
   </a>
    <a href="https://github.com/SRNV/Ogone/stargazers">
     <img alt="stars" src="https://img.shields.io/github/stars/SRNV/Ogone">
   </a>
   <a href="https://github.com/SRNV/Ogone/issues">
     <img alt="issues" src="https://img.shields.io/github/issues/SRNV/Ogone">
   </a>
   <a href="https://github.com/SRNV/Ogone/forks">
     <img alt="forks" src="https://img.shields.io/github/forks/SRNV/Ogone">
   </a>
   <a href="https://github.com/SRNV/Ogone">
     <img alt="license" src="https://img.shields.io/github/license/SRNV/Ogone">
   </a>
   <a href="https://github.com/denoland/deno">
     <img alt="deno version" src="https://img.shields.io/badge/deno-^1.3.0-lightgrey?logo=deno">
   </a>
   <a href="https://deno.land/x/ogone">
     <img alt="denoland" src="http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?style=plastic&logo=deno&labelColor=black">
   </a>
   <a href="https://nest.land/package/Ogone">
     <img alt="nest badge" src="https://nest.land/badge.svg">
   </a>
</p>

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

- [Introduction](https://github.com/SRNV/Ogone/tree/master/docs/introduction.md)
- [Examples](https://github.com/SRNV/Ogone/tree/master/docs/examples.md)
- [Contributions](https://github.com/SRNV/Ogone/tree/master/docs/contributions.md)


---

# Extensions
  - VS Code
    - Syntax High-lighting: Otone 0.0.8^
