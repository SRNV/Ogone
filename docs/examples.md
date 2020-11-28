
### Async component example

[read this documentation on Async Components](https://github.com/SRNV/Ogone/blob/master/docs/async.README.md).

```typescript
// require statement tells to the parent component what is needed inside the component.
require id as number;
// use statement tells to Ogone to use the file as store-component
use @/examples/tests/async/reloading/store.o3 as 'store-component';

<template>
  <store-component namespace="user"/>
  <div> Welcome ${user ? user.username : ''}</div>
  <img src="public/ogone.svg"  --await />
</template>
<proto type="async">
  def:
    user: null
  before-each: // 0.6.0
    const getUser = () => Store.dispatch('user/getUser', this.id)
        .then((user) => {
          this.user = user;
          return user;
        });
  case 'async:update':
    getUser();
  break;
  default:
    getUser().then(user => Async.resolve(user));
</proto>

```

let's see what we can do inside the parent component

```typescript
use @/examples/tests/async/reloading/async.o3 as 'async-component';
use @/examples/tests/async/reloading/store.o3 as 'store-component';

<template>
  <store-component namespace="user" />
  <async-component :id="id" --await --then:user-loaded />
</template>
<proto type="async">
  def:
    id: 1
  case 'then:user-loaded':
    Store.commit('user/USER-IS-LOADED', ctx)
      .then(() => {
        Async.resolve();
      });
    break;
</proto>
```

[for more informations on async components readme](https://github.com/SRNV/Ogone/blob/master/docs/async.README.md).

### Reflected datas

[read the docs on reflected datas](https://github.com/SRNV/Ogone/blob/master/docs/before-each.README.md)

```typescript
<proto>
  def:
    name: SRNV
    fullname: ''
  compute:
    this.fullname => this.name + Math.random();
  default:
    setTimeout(() => {
      this.name = 'Rudy';
    }, 1000);
  break;
</proto>
<template>Hello ${fullname}</template>
```

more on reflected datas

```typescript
<template>
  ${position.name} ${position.origin}
  <p --for="item of position.test">
    ${item}
  </p>
</template>
<proto>
  def:
    x: 0
    y: 0
    position:
      name: Test
      origin: 0
      test: []
  compute:
    //  this is a reflection
    this.position.origin => this.x;
    // you can reflect any property of your data
    this.position.test[this.position.origin -1] => this.position.origin;
    this.position.test[this.position.origin] => 'yup';
    // or
    this.position.name => {
      return `${this.x}, test ${this.y}`;
    };
  default:
    setInterval(() => {
      this.x++;
      this.y--;
    }, 500);
    break;
</proto>

```

[for more informations on reflected datas](https://github.com/SRNV/Ogone/blob/master/docs/before-each.README.md)

### menu component example

```typescript
use @/examples/app/stores/menu.store.o3 as 'store-component'
use @/examples/app/components/menu/tree-recursive-button.o3 as 'tree-recursive'
use @/examples/app/components/logo.o3 as 'logo-el'


<proto def="examples/app/defs/menu-main.yml">
  def:
    isOpen: false
  case 'click:toggle-menu':
    Store.dispatch('menu/toggle');
  break;
</proto>

<template>
  <store-component namespace="menu" />
  <div class="left-menu"
    --class="{ close: !this.isOpen }">
    <div class="header">
      <logo-el --click:toggle-menu></logo-el>
      <div>0.1.0</div>
    </div>
    <div class="tree">
      <tree-recursive --for="item of menu" :item="item">
      </tree-recursive>
    </div>
  </div>
  <div --class="{ darken: this.isOpen }" --click:toggle-menu></div>
</template>
```

### recursive component example

```typescript
require item as Object

use @/examples/app/components/menu/tree-recursive-button.o3 as 'tree-recursive'
use @/examples/app/components/scroll.o3 as 'scroll'

<proto>
  def:
    openTree: false
  case 'click:toggle':
    this.openTree = !this.openTree
  break;
</proto>

<template>
  <div class="container">
    <div class="title" --click:toggle --router-go="item.route">
      <span>
      ${item.name}
      </span>
      <span --class="!item.children && item.status ? `status ${item.status}` : ''">
        ${!item.children && item.status ? item.status : ''}
      </span>
      <span --if="item.children && !openTree"> > </span>
      <span --else-if="item.children && openTree"> < </span>
    </div>
    <div class="child" --if="item.children" --class="{ 'child-open': openTree }">
      <scroll>
        <tree-recursive
          --if="!!item.children"
          --for="child of item.children"
          :item="child ? child : {}"></tree-recursive>
      </scroll>
    </div>
  </div>
</template>
```
# Learn Ogone

to see more stuffs from Ogone, clone this repository

```shell
deno run --allow-all --unstable examples/app/index.ts
```
