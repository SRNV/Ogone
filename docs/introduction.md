# Description

use Ogone to compile web-components for your applications. it's based on Deno.
Actually Ogone is under an experimental phase. avoid using it for production.
Ogone has it own extension `*.o3` which allow some new features.
No Proxies, no getters, no setters used for the reactivity, just code...

# Usage

After the first example, in your root-component.o3, you can make this first greeting app

```typescript
<proto>
  def:
    name: SRNV
</proto>
<template>Hello ${name}</template>
```

let's change the name after 1 second.

```typescript
<proto>
  def:
    name: SRNV
  default:
    setTimeout(() => {
      this.name = 'World';
    }, 1000);
  break;
</proto>
<template>Hello ${name}</template>
```

this will only update the textnode containing 'Hello \${name}' and replace name by it's value.
You certainly recognized the default expression of a switch statement.

### so now what is proto def ?

Making the choice to use only the switch statement to rule the code, includes that the wordings has to be clear enough to understand what is going on.

instead of using script tag, I choosed to use proto tag which is a custom element. the fact is, when we define the Ogone components we are not building a module js. you wont be able to use inside `<proto>` the import statements.
we will see after how to import modules inside your component.

at this point, it means Ogone has to read something that is not conventionnal. It's all new to code component only in a switch statement.

### ok but def ?!

`def` means 'definition' or 'define' (like Python), this custom statement let you define the data of your component.
`def` is the area that only supports YAML language

### output

Ogone will wrap your code into a tiny function which takes 3 arguments.
the state of the component, the context of the function and an event (Event | undefined)

```typescript
(function (_state, ctx, event) {
  switch (_state) {
    ${yourCode}
  }
});
```

### why in a switch statement ?

Switch statement provides an out of the box well structured code. it's globally readable and understood by all.
And Ogone is follwing a minimalistic philosophy. using few options/expressions to structure the code is a good way to make it clear, readable, radically clean.

## Expressions and Custom Expressions

Following this structure of declarations is strongly recommanded:

- def\* (YAML)
- declare\*
- before-each\*
- case
- default

\*only supported by Ogone

---
