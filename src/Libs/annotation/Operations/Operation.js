let OperationType = {
  Draw: "draw",
  Remove: "remove",
  Move: "move",
  Scale: "scale",
  Rotate: "rotate",
};

let Operation = function (target) {
  this.operationType = undefined;
  this.target = target;
  // 记录操作之前target的状态，在撤销和重做的时候用到。
  this.targetStatusBeforeOperation = target.toJson();
  this.startPoint = {
    x: 0,
    y: 0
  };
  this.endPoint = {
    x: 0,
    y: 0
  };
  this.lastPoint = {
    x: 0,
    y: 0
  };
};

Operation.prototype.currentTarget = function() {
  return this.target;
}

Operation.prototype.handleMouseDown = function(event) {
  if (event.button !== 0) {
    return;
  }
  let x = event.offsetX;
  let y = event.offsetY;
  this.startPoint.x = x;
  this.startPoint.y = y;
  this.lastPoint.x = x;
  this.lastPoint.y = y;
  this.endPoint.x = x;
  this.endPoint.y = y;
};

Operation.prototype.handleMouseMove = function(event) {

  let x = event.offsetX;
  let y = event.offsetY;
  this.lastPoint.x = this.endPoint.x;
  this.lastPoint.y = this.endPoint.y;
  this.endPoint.x = x;
  this.endPoint.y = y;
  this.execute();
};

Operation.prototype.handleMouseUp = function(event) {
  if (event.button !== 0) {
    return false;
  }
  this.end();
  return true;
};

Operation.prototype.execute = function () {

};

Operation.prototype.end = function () {
};

Operation.prototype.isValid = function () {
  if (this.startPoint.x === this.endPoint.x
  && this.startPoint.y === this.endPoint.y) {
    return false;
  }
  return true;
}

export {OperationType, Operation};
