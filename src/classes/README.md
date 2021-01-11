# Classes
for consistency and readability, all contributors that want to add any class to Ogone's rendering process has to follow those rules, any Pull Request that doesn't scale with those rules wont be accepted:

- all classes have to be exported by default, and be the only one class exported by all files under classes/
- document any class with the following pattern:
    ```
    /**
    * @name ClassName
    * @code O<Capitals><StepNumber>[-<ParentCode>[
    * @description <descriptions>
    * ```ts
    *   ClassName.method(bundle as Bundle);
    * ```
    * @dependency DependencyName
    *    ```ts
    *      DependencyName.method(...args: DependencyNameArgs[]): DependencyNameReturnType
    *    ```
    */
    export default class ClassName {};
    ```
- the class Utils is the final Class, and has to be extended and not instanciated
- Typescript file