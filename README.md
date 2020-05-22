![ogone](https://raw.githubusercontent.com/SRNV/Ogone/master/public/ogone_small.svg?token=AI44MA4AIHORIV6GFZ2OFBK6ZBGUI)
# Ogone
[![stars](https://img.shields.io/github/stars/SRNV/Ogone)](https://github.com/SRNV/Ogone/stargazers)
[![issues](https://img.shields.io/github/issues/SRNV/Ogone)](https://github.com/SRNV/Ogone/issues)
[![license](https://img.shields.io/github/license/SRNV/Ogone)](https://github.com/SRNV/Ogone)
# Description
use Ogone to compile web-components for your applications. it's based on Deno, it use YAML for the minimalism.
Actually Ogone is under an experimental phase. avoid using it for production.
Ogone has it own extension `*.o3` which allow some new features.

# Installation
```
import o3 from 'https://raw.githubusercontent.com/SRNV/Ogone/master/mod.ts';
...
o3.serve({
  entrypoint: 'path/to/root-component.o3',
  port: 8080,
});
```
# Usage
following the first example in your root-component.o3 you can make this first greeting app
```
<p>Hello ${name}</p>
<proto>
  def:
    name: Rudy
</proto>
```
