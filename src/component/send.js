module.exports = function(json) {
  if(this.ws.readyState === 1){
    this.ws.send(JSON.stringify(json));
  }
};