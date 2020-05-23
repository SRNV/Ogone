![ogone](https://raw.githubusercontent.com/SRNV/Ogone/master/public/ogone_small.svg?token=AI44MA4AIHORIV6GFZ2OFBK6ZBGUI)
# Ogone
[![stars](https://img.shields.io/github/stars/SRNV/Ogone)](https://github.com/SRNV/Ogone/stargazers)
[![issues](https://img.shields.io/github/issues/SRNV/Ogone)](https://github.com/SRNV/Ogone/issues)
[![license](https://img.shields.io/github/license/SRNV/Ogone)](https://github.com/SRNV/Ogone)
# Description
use Ogone to compile web-components for your applications. it's based on Deno.
Actually Ogone is under an experimental phase. avoid using it for production.
Ogone has it own extension `*.o3` which allow some new features.
No Proxies, no getters, no setters used for the reactivity, just code...

# Installation
```
import o3 from 'https://raw.githubusercontent.com/SRNV/Ogone/master/mod.ts';
...
o3.run({
  entrypoint: 'path/to/root-component.o3',
  port: 8080,
});
```
# Usage
After the first example, in your root-component.o3, you can make this first greeting app
```
<p>Hello ${name}</p>
<proto>
  def:
    name: SRNV
</proto>
```
let's change the name after 1 second.

```
<p>Hello ${name}</p>
<proto>
  def:
    name: SRNV
  default:
    setTimeout(() => {
      this.name = 'Rudy';
    }, 1000);
  break;
</proto>
```
this will only update the textnode containing 'Hello ${name}' and replace name by it's value.
You certainly recognized the default expression of a switch statement.

### so now what is proto def ?
Making the choice to use only the switch statement to rule the code, causes that the wordings has to be clear enough to understand what is going on.

instead of using script tag, I choosed to use proto which is a custom element. the fact is, when we define the Ogone components we are not building a module js. you wont be able to use inside `<proto>` the import/export statements.

at this point, it means Ogone has to read something that is undefined because it's all new to code component only in a switch statement.

### ok but def ?
`def` means 'definition' (like Python), this custom statement let you define the data of your component.
`def` is the area that only accepts YAML

### output

Ogone will wrap your code into a tiny function which takes 3 arguments.
the state of the component, the context of the function and an event (Event | undefined)
```
(function(_state, ctx, event) {
  switch(_state) {
    // there is your code
  }
})
```

### why in a switch statement ?

Switch statement provides a out-of-box well structured code. it's globally readable and understood by all.
And Ogone is follwing a minimalistic philosophy. using few options/expressions to structure the code is a good way to make it clear, readable, radically clean.

## Expressions and Custom Expressions

Following this structure of declarations is strongly recommanded:

- def* (YAML)
- before-each* (TODO, for global declarations)
- case
- default

* only supported by Ogone
# Learn Ogone

to see more stuffs from Ogone, clone this repository
```
deno run --allow-all --unstable example/app/index.ts
```

# Support
To support, join the [discord](https://discord.com/channels/710950501398610061/710950501398610064) server or do not hesitate to write issues.


# Todo
- [ ] HMR
- [ ] Imports modules
- [ ] Integrated test environment
  - [ ] case 'test' is supported
  - [ ] stress mode is supported
- [ ] Controllers Components
- [ ] Write robust tests for Ogone
  - [ ] Dom-parser is solid
  - [ ] Js-this is solid
  - [ ] Scope-css is solid
- [ ] Switch every files to Typescript
  - [ ] Write types
- [ ] Typescript supported in `<proto>`
- [ ] Write more exceptions for each features
- [ ] Write docs
- [ ] Write more examples