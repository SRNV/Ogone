# Async Components
_v 0.3.0_

Ogone supports Async Components. Async Components are those components that are waiting for all promises internals or externals to be resolved before rendering.

6 features rules an Async Component

    - type="async"
    - --await
    - --then:...
    - --catch:...
    - --finally:...
    - --defer

by setting type="async" to the component's proto, you're making it an Async Component:
```typescript
// async-component.o3
<proto type="async"/>

```

note that root component can't be async, we will follow this structure:
![ogone](https://raw.githubusercontent.com/SRNV/Ogone/master/src/docs/assets/async.1.jpg)
________

### --await
_only in an Async Component_

In this Async Component you will be allowed to use --await feature, this component will wait for the img tag to dispatch load event:
```typescript
// async-component.o3
<img --await src="public/ogone.svg">
<proto type="async"/>
```

or any event:
```typescript
// async-component.o3
<img --await="'waitingForThisEvent'" src="public/ogone.svg">
<proto type="async"/>
```

we can also wait for a component to resolve all it's internal promises:
```typescript
// async-parent-component.o3
// Ogone use this component as 'async-component'
use @/path/to/async-component.o3 as 'async-component';

<async-component --await />
<proto type="async"/>
```
![ogone](https://raw.githubusercontent.com/SRNV/Ogone/master/src/docs/assets/async.3.jpg)
________

### --then:...
_in any Component_

Waiting for the resolution of the Async Component.
Then is a mixed feature/case, it means that it requires the name of case that you will use after the resolution of the component.
Use `--then` like in JS:
```typescript
// Ogone use this component as 'async-component'
use @/path/to/async-component.o3 as 'async-component';

<async-component --await --then:caseName/>
<proto type="async">
  case 'then:caseName':
    console.log('promise resolved', ctx);
  break;
</proto>
```
________

### --catch:...
_in any Component_

Any error inside an Async Component.
catch is a mixed feature/case, it means that it requires the name of case that you will use after an error in Async Component.
Use `--catch` like in JS:
```typescript
// Ogone use this component as 'async-component'
use @/path/to/async-component.o3 as 'async-component';

<async-component --await --catch:caseName/>
<proto type="async">
  case 'catch:caseName':
    console.log('promise error caught', ctx);
  break;
</proto>
```
________


### --finally:...
_in any Component_

internal promises all fulfilled successfully or rejected.
finally is a mixed feature/case, it means that it requires the name of case that you will use after resolution/error in Async Component.
Use `--finally` like in JS:
```typescript
// Ogone use this component as 'async-component'
use @/path/to/async-component.o3 as 'async-component';

<async-component --await --finally:caseName/>
<proto type="async">
  case 'finally:caseName':
    console.log('promise fulfilled', ctx);
  break;
</proto>
```
________


### --defer
_in any Component_

Inserts a promise or anything into an Async Component.
the Async Component will includes this promise in it's own promise group.

```typescript
// Ogone use this component as 'async-component'
use @/path/to/async-component.o3 as 'async-component';

<async-component --await --defer="promise"/>
<proto type="async">
  def:
    promise: null
  default:
  this.promise = new Promise((resolve) => {
     setTimeout(() => {
        // aync-component will render only after this resolution
        resolve();
     }, 1500);
  })
</proto>
```
________

# Todo
define the shape of `ctx` object sent to --then feature.
