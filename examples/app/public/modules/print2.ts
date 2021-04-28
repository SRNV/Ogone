import attr from './attr.ts';

export default (...args: any[]) => {
    console.warn('second print changed avv',attr(19) , ...args);
}
