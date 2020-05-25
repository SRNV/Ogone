# Async Components

Ogone supports Async Components (AC). AC are those components that are waiting for all promises internals or externals to be resolved before rendering.

6 features rules an AC

    - type="async"
    - --await
    - --defer
    - --then
    - --catch
    - --finally

by setting type="async" to the proto of the component, you're making this component an AC:
```typescript
// async-component.o3
<proto type="async"/>
```
### --await
_only in AC_

In this AC you will be allowed to use --await feature, this component will wait for the img tag to dispatch load event:
```typescript
// async-component.o3
<img --await src="public/ogone.svg">
<proto type="async"/>
```

or any event:
```typescript
// async-component.o3
<img --await="waitingForThisEvent" src="public/ogone.svg">
<proto type="async"/>
```


