class Context{
  constructor({ajax}){
    this.ajax=ajax;
  }
  add(model){
    model.prototype.__context__ = this;
  }
}

export default Context;

