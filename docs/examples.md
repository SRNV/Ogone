
### Async component example

[read this documentation on Async Components](https://github.com/SRNV/Ogone/blob/master/docs/async.README.md).

```typescript
import component StoreComponent from "@/examples/tests/async/reloading/store.o3";

<template>
  <StoreComponent namespace="user"/>
  <div> Welcome ${user ? user.username : ''}</div>
  <img src="public/ogone.svg"  --await />
</template>
<proto type="async">
  def:
    // inherit statement tells to the parent component what is needed inside the component.
    inherit number: null
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
import component AsyncComponent from  "@/examples/tests/async/reloading/async.o3";
import component StoreComponent from "@/examples/tests/async/reloading/store.o3";

<template>
  <StoreComponent namespace="user" />
  <AsyncComponent :id="id" --await --then:user-loaded />
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
import component StoreMenu from '@/examples/app/stores/StoreMenu.o3';
import component TreeRecursive from '@/examples/app/components/menu/TreeRecursiveButton.o3';
import component LogoEl from '@/examples/app/components/Logo.o3';

<template>
  <StoreMenu namespace="menu" />
  <div
    class="left-menu"
    --class={{ close: !this.isOpen }}>
    <div class="header">
      <LogoEl --click:toggle-menu></LogoEl>
      <div>0.1.0</div>
    </div>
    <div class="tree">
      <TreeRecursive --for={item of this.menu} item={item} />
    </div>
  </div>
  <div --class={{ darken: this.isOpen }} --click:toggle-menu></div>
</template>

<proto def="examples/app/defs/menu-main.yml">
  def:
    isOpen: false
  case 'click:toggle-menu':
    Store.dispatch('menu/toggle');
    break;
</proto>
```

### recursive component example

```typescript
import component ScrollComponent from '@/examples/app/components/Scroll.o3';
import component TreeRecursive from '@/examples/app/components/menu/TreeRecursiveButton.o3';

<template>
  <div class="container">
    <div
      class="title"
      --click:toggle
      --router-go={this.item.route}>
      <span>
      ${this.item.name}
      </span>
      <span --class={!this.item.children && this.item.status ? `status ${this.item.status}` : ''}>
        ${!this.item.children && this.item.status ? this.item.status : ''}
      </span>
      <span --if={this.item.children && !this.openTree}> > </span>
      <span --else-if={this.item.children && this.openTree}> < </span>
    </div>
    <div
      class="child"
      --if={this.item.children}
      --class={{ 'child-open': this.openTree }}>
      <ScrollComponent>
        <TreeRecursive
          --for={child of this.item.children}
          item={child}></TreeRecursive>
      </ScrollComponent>
    </div>
  </div>
</template>

<proto>
  declare:
    public openTree: boolean = false;
    public inherit item: {
      route: string;
      status?: string;
      name?: string;
      children: ({
        status?: string;
        name: string;
        route: string;
        children: any[]
      })[];
    } = { route: '', children: []};
  case 'click:toggle':
    this.openTree = !this.openTree
    break;
</proto>
```
# Learn Ogone

to see more stuffs from Ogone, clone this repository

```shell
deno run --allow-all --unstable examples/app/index.ts
```
