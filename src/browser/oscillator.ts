import { OgoneBrowser } from "../../types/ogone.ts";
let Ogone: OgoneBrowser;
function _OGONE_BROWSER_CONTEXT() {
  // @ts-ignore
  const contexteAudio =
    new (window.AudioContext || window.webkitAudioContext)();
  // create Oscillator node
  Ogone.sound = (opts: any) => {
    if (Ogone.oscillator) return;
    const oscillator = contexteAudio.createOscillator();
    const gainNode = contexteAudio.createGain();
    // for the volume
    oscillator.connect(gainNode);
    gainNode.connect(contexteAudio.destination);
    if (!opts) return;
    if (!(opts instanceof Object)) return;
    const {
      hz = 440,
      type = "sine",
      duration = 20,
      volume = 0.03,
      time = 200,
    } = opts;
    oscillator.type = type;
    gainNode.gain.value = volume;
    oscillator.frequency.value = hz;
    Ogone.oscillator = oscillator;
    setTimeout(() => {
      Ogone.oscillator.start();
      setTimeout(() => {
        Ogone.oscillator.stop();
      }, duration);
    }, time);
    oscillator.onended = () => {
      Ogone.oscillator = null;
      if (opts.onended) opts.onended();
    };
  };
}
export default _OGONE_BROWSER_CONTEXT.toString()
  .replace(/_this/gi, "this")
  .replace("function _OGONE_BROWSER_CONTEXT() {", "")
  .slice(0, -1);
