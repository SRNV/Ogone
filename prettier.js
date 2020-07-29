Ogone.contexts["data-xaraa-nd14"] = function (opts) {
  const GET_TEXT = opts.getText;
  const GET_LENGTH = opts.getLength;
  const POSITION = opts.position;
  const message = this.message;
  const links = this.links;
  const _____a_ = [1, 2] || [];
  let i0 = POSITION[4], item = (_____a_)[i0];
  let i1 = POSITION[5], t = (_____a_)[i1];
  if (GET_LENGTH) return (_____a_).length;
  if (GET_TEXT) {
    try {
      return eval("(" + GET_TEXT + ")");
    } catch (err) {
      Ogone.error(
        "Error in component:\n\t cli/test/components/brand-component.o3 " +
          `${GET_TEXT}`,
        err.message,
        err,
      );
      throw err;
    }
  }
  return { i0, item, i1, t, message, links };
};
