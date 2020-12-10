import { colors } from "../deps.ts";
const { red, green, bgRed, bgGreen } = colors;
export default {
    "0.24.0": `Ogone is actively looking for collaborators.
    Any advice, any problem report related to the development, to the use of Ogone, will be studied and will get a response as soon as possible.
    note that if you come across a bug but don't report it, it may never be resolved.
    Thank you for your interest, and your participation in this project.
    a problem, a question or an idea ? please open an issue on the Ogone github repo: https://github.com/SRNV/Ogone/issues`,
    "0.25.0": `Ogone's internal architecture has changed. for readability, all files under classes/ are now in PascalCases.
    no more nested file inside folders to prevent complex architecture`,
    "0.27.0": `${red('BREAKING')}: use statement is no more supported, please use instead the syntax 'import component ComponentName from '...''`,
    "0.28.0": `${green('feat')}: start tuning your webcomponents with Ogone, by using the attribute is on the component's template.
        also ${green('Ogone')} is changing it's style, we will now follow the JSX syntax for props and flags, using curly braces instead of quotes
        basically this means instead typing this:
            ${bgRed(':item="this.item"')}
        you will now have to type this:
            ${bgGreen('item={this.item}')}

        dynamic transformation can be done with your IDE using the following regexp:
            ${green('/(?<=\\s)(:)(.+?)((=)(["\'`])(.*?)(\\5))/')}
        replacing the result by:
            ${green('$2$4{$6}')}

        same thing for the flags:
            ${bgRed('--for="item of this.array"')}
        you will now have to type this:
            ${bgGreen('--for={item of this.array}')}
    `,
}