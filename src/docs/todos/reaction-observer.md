## Reaction Observer
- [x] can parse array modifiers
- [ ] can parse map modifiers
- [x] can parse property settings
    - ```ts
        this.prop++
        this.prop--
        this.prop = ...
        this.prop = '...'.trim()...()
        this.prop += ...
        // etc
        ```
- [ ] can parse property assignements to any vars
    - `const arr = this.array;`