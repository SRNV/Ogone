import { colors } from "../deps.ts";
const { red, green, white, blue, gray, yellow } = colors;
function exampleFormat(txt: string) {
  return gray(txt.replace(/(\<([^>]*)+(\/){0,1}\>)/g, blue('<$2>')));
}
export default {
  "0.27.0": `${red('BREAKING: use statement is no more supported, please use instead the syntax : import component ComponentName from \'...\'')}`,
  "0.28.0": `
            - ${red(`BREAKING: ${white('Ogone is changing it\'s style,')} we will now use curly braces for props and flags, instead of quotes`)}:
                basically this means instead of typing this:
                  ${red(':item="this.item"')}
                you will now have to type this:
                  ${green('item={this.item}')}

                same thing for the flags:
                  ${red('--for="item of this.array"')}
                you will now have to type this:
                  ${green('--for={item of this.array}')}

                dynamic transformation can be done with your IDE using the following regexp:
                  ${blue('/(?<=\\s)(:|\-{2})(.+?)((=)(["\'`])(.*?)(\\5))/')}
                replacing the result by:
                  ${blue('$2$4{$6}')}


            - ${blue('chore')}: Ogone will start using workers, the first one is set for the local server.
            - ${blue('chore')}: specifying the port and the static on configurtion is no more required.

            - ${green('feat')}: using curly braces on components allows us to spread any object.
                this is the same as adding the spread flag (${green('--spread')})
                example:${exampleFormat(`
                  <MyComponent ${green('{...this.property}')} />
                  or
                  <MyComponent ${green('--spread={...this.property}')} />`)}
                duplicate is not allowed

            - ${green('feat')}: Ogone will now let you choose the type of reaction you want by setting the (${green('engine')}) attribute to your proto element
                example:${exampleFormat(`
                  <proto ${green('engine="inline-reaction"')} /> will change your script by adding a function after all assignment.
                    ${yellow('[optional]')} is set by default if the ${green('def')} modifier is used.

                  <proto ${green('engine="proxy-reaction"')} /> will tell to Ogone to use a proxy.
                    ${yellow('[optional]')} is set by default if the ${green('declare')} modifier is used.`)}

            - ${green('feat')}: start tuning your webcomponents with Ogone, by using the attribute (${green('is')}) on the template element.
                example:
                  ${exampleFormat(`<template ${green('is="my-awesome-webcomponent"')} />`)}

                you can also set the attribute (${green('engine')}) to your proto element and add the argument (${green('sync-template')})
                this will tell to Ogone to update the webcomponent's data when the component is updated.
                example: ${exampleFormat(`
                  <template ${green('is="my-awesome-webcomponent"')} />
                  <proto ${green('engine="sync-template proxy-reaction"')}>
                    // ...
                  </proto>`)}

                  if your custom element is an extension of an element, please consider using arguments like following,
                  where element is the tag you want:
                  ${exampleFormat(`
                  <template ${green('is="my-custom-element:element"')} />
                  <proto ${green('engine="sync-template proxy-reaction"')}>
                    // ...
                  </proto>`)}
                by default Ogone uses the method (${green('attributeChangedCallback')}) when any property is updated.
                your webcomponent can also expose the following methods as callback:
                 - beforeUpdate
                 - beforeDestroy
  `,
}