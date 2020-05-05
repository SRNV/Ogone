class Context {
  constructor() {
    this.collection = new Map();
  }
  read(context) {
    if (this.collection.has(context.id)) {
      console.error('context is already defined');
    } else {
      this.setContext(context);
    }
  }
  setContext(context) {
    const item = context;
    Object.defineProperty(item, 'length', {
      get() {
        return item.getContextEvaluatedLength(item.querySelector, item.component);
      }
    });
    this.collection.set(item.id, item);
  }

  getContextLength(id) {
    const item = this.getItem(id);
    if (!item) return null;
    if (item.parentId) {
      const parent = this.getContext(item.parentId);
      return item.length * parent.length;
    } else {
      return item.length;
    }
  }
}
export default new Context();