# before-each

`before-each` is a custom statement used inside the proto, this let you declare all the global variables you need in all cases/default statements.

### why using a before-each

to avoid this situation

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
