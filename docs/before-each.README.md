# before-each

_v0.6.0_

`before-each` is a custom statement used inside the proto, this let you declare all the global variables you need in all cases/default statements.

### why using a before-each

to avoid this situation.

```javascript
case 'update:x':
    const { element } = Refs;
    //...do things
    break;
case 'update:y':
    const { element } = Refs; // this will throw an error. already declared const/let...
    //...do things
    break;
```

the same by using before-each

```javascript
before-each:
    const { element } = Refs;
case 'update:x':
case 'update:y':
    // do things
   break;
```

# examples/

## faking computed data

```typescript
<template>${position}</template>
<proto>
    def:
        x: 0
        y: 0
    before-each:
        const setPosition = () => {
            this.position = ´${this.x},${this.y}´;
        };
    case 'update:x':
    case 'update:y': setPosition(); break;
    default:
        setInterval(() => {
            this.x++;
            this.y--;
        }, 500);
        break;
</proto>
```

## use Reflections syntax instead

Reflections are custom features only supported by Ogone
these are available in the compute modifier

```typescript
<template>${position}</template>
<proto>
    def:
        x: 0
        y: 0
    compute:
        //  this is a reflection
        this.position => ´${this.x},${this.y}´;
        // or
        this.position => {
            return ´${this.x},${this.y}´;
        };
    default:
        setInterval(() => {
            this.x++;
            this.y--;
        }, 500);
        break;
</proto>
```

### Rules

- Reflections are only accepted in before-each statement
