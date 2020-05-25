# Async Components

Ogone supports Async Components (AC). AC are those components that are waiting for all promises internals or externals to be resolved before rendering.

6 features rules an AC

    - type="async"
    - --await
    - --then
    - --catch
    - --finally
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
// Ogone use this component as 'async-component'
use @/path/to/async-component.o3 as 'async-component';

<async-component --await />
<proto type="async"/>
```

________


