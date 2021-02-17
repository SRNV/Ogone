export default (...args: any[]) => {
    console.warn('printed from a module', ...args);
}