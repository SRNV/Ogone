
<p align="center">
  <img src="https://github.com/SRNV/Ogone/raw/master/public/ogone-svg.svg">
</p>
<h1 align="center">Ogone</h1>
<p align="center">
   <a href="https://github.com/SRNV/Ogone/releases">
     <img alt="ogone version" src="https://img.shields.io/github/v/release/SRNV/Ogone?modifierColor=black">
   </a>
   <a href="https://github.com/SRNV/Ogone">
     <img alt="ogone commit" src="https://img.shields.io/github/last-commit/SRNV/Ogone?modifierColor=black">
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
     <img alt="deno version" src="https://img.shields.io/badge/deno-^1.4.0-lightgrey?logo=deno">
   </a>
   <a href="https://deno.land/x/ogone">
     <img alt="denoland" src="http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno&modifierColor=black">
   </a>
   <a href="https://nest.land/package/Ogone">
     <img alt="nest badge" src="https://nest.land/badge.svg">
   </a>
</p>

# Description

use Ogone to compile web-components for your applications. it's based on Deno.
Actually Ogone is under an experimental phase. avoid using it for production.
Ogone has it own extension `*.o3` which allow some new features.


If you're interested by this project: [please join the Discord here](https://discord.gg/gCnGzh2wMc)

# Installation

```typescript
// from deno.land/x
import o3 from 'https://deno.land/x/ogone@<version>/mod.ts';

// from x.nest.land
import o3 from 'https://x.nest.land/Ogone@<version>/mod.ts';

o3.run({
  entrypoint: 'path/to/root-component.o3',
  modules: '/modules',
  port: 8080,
});
```

- [Introduction](https://github.com/SRNV/Ogone/tree/master/docs/introduction.md)
- [Examples](https://github.com/SRNV/Ogone/tree/master/docs/examples.md)
- [Contributions](https://github.com/SRNV/Ogone/tree/master/docs/contributions.md)


# Overview

> find this example in this repository

```typescript
import component StoreMenu from '@/examples/app/stores/StoreMenu.o3';

/**
 * @name Burger
 * @description
 *   this component will open the menu in the application
*/
<template>
  <StoreMenu namespace="menu" />
  <div class="container" --click:openMenu>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
  </div>
</template>

<proto>
  declare:
    public isOpen: boolean = false;
  case 'click:openMenu':
    Store.dispatch('menu/toggle')
    Store.dispatch('menu/checkController')
      .then((res: any) => {
        console.warn(res);
      });
    break;
</proto>

<style>
  @const shadowColor = #00000045;
  @const lineBackground = #848181;
  .container {
    padding: 9px;
    width: 28px;
    height: auto;
    background: var(--o-header);
    display: flex;
    flex-direction: column;
    filter: drop-shadow(0px 0px 0px $shadowColor);
    &:hover {
      filter: drop-shadow(0px 5px 3px $shadowColor);
    }
    &:hover .line {
      background: var(--o-primary);
    }
    .line {
      background: $lineBackground;
      margin-top: 2px;
      margin-bottom: 2px;
      height: 4px;
    }
    .line, & {
      border-radius: 5px;
      transition: filter 0.2s ease;
      cursor: pointer;
    }
  }
</style>

```
---

# Extensions
  the only extension available is Otone on Visual Studio Code, this one includes the following configurations:
  - snippets
  - syntax high-lighting
  - diagnostics
  - webview (live edition)
  - overviews
  - quick naviguation
