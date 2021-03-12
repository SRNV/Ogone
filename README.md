
<p align="center">
  <img src="https://raw.githubusercontent.com/SRNV/Ogone/0.28.0/src/public/ogone-svg.svg" width="350">
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
     <img alt="deno version" src="https://img.shields.io/badge/deno-^1.7.0-lightgrey?logo=deno">
   </a>
   <a href="https://deno.land/x/ogone">
     <img alt="denoland" src="http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno&modifierColor=black">
   </a>
   <a href="https://nest.land/package/Ogone">
     <img alt="nest badge" src="https://nest.land/badge.svg">
   </a>
</p>

# Description

Ogone for Front-end fields using Deno.
Designed differently, start creating differently.
Everything is a component because everything is a part of the composition.

Actually Ogone is too young to be used for production, expect breaking changes until the 1.0.0.

Ogone has it's own extension `*.o3` which allows some new features.


If you're interested by this project: [please join the Discord here](https://discord.gg/gCnGzh2wMc)

# Installation

```shell
deno install -Afq --unstable https://deno.land/x/ogone/cli/ogone.ts
```

and run your application like following
```
ogone run path/to/Application.o3
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
