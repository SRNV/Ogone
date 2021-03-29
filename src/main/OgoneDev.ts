import HMR from "../classes/HMR.ts";
import Ogone from './OgoneBase.ts';
import { HTMLOgoneElement } from '../ogone.main.d.ts';

HMR.useOgone(Ogone);
/**
 * a function to display all the error with the HMR's message overlap
 * @param message the title of the error
 * @param errorType the type of the error
 * @param errorObject the error that you would throw without this function
 */
export function displayError(message: string, errorType: string, errorObject: Error) {
  // here we render the errors in development
  HMR.showHMRMessage(`
  ${message}
  <span class="critic">${errorType}</span>
  <span class="critic">${errorObject && errorObject.message ? errorObject.message : ''}</span>
  `);
};
/**
 * a way to save the component to the HMR system
 * @param Onode the component to add to the HMR
 */
export function subscribeComponent(Onode: HTMLOgoneElement) {
  if (Onode.isComponent) {
    HMR.components[Onode.uuid!] = HMR.components[Onode.uuid!] || [];
    HMR.components[Onode.uuid!]
      .push(Onode);
  }
}
Ogone.subscribeComponent = subscribeComponent;
export {
  Ogone,
};