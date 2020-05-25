# Async Components

Ogone supports Async Components (AC). AC are those components that are waiting for all promises internals or externals to be resolved before rendering.

6 features rules an AC

    - type="async"
    - --await
    - --then:...
    - --catch:...
    - --finally:...
    - --defer

by setting type="async" to the proto of the component, you're making this component an AC:
```typescript
// async-component.o3
<proto type="async"/>
```
________

### --await
_only in an Async Component_

In this AC you will be allowed to use --await feature, this component will wait for the img tag to dispatch load event:
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
________

### --then:...
_in any Component_

Waiting for the resolution of the AC.
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

Any error inside an AC.
catch is a mixed feature/case, it means that it requires the name of case that you will use after an error in AC.
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
finally is a mixed feature/case, it means that it requires the name of case that you will use after resolution/error in AC.
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
