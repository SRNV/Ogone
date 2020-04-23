module.exports = function() {
  this.intervals.forEach((int) => clearInterval(int));
  this.timeouts.forEach((tim) => clearTimeout(tim));
  this.immediates.forEach((imm) => clearImmediate(imm));
};