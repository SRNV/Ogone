import print2 from './print2.ts';

export default (...args: any[]) => {
    console.warn('printed from a module', ...args);
    print2('test importing files');
}