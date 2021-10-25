import {OperationType, Operation} from "./Operation.js";

/**
 * 绘制操作，可处理多数图形（直线、圆、矩形、云线）
 * @param target
 * @constructor
 */
let DrawOperation = function (target) {
  Operation.call(this, target);
  this.operationType = OperationType.Draw;
};

DrawOperation.prototype = Object.assign(Object.create(Operation.prototype), {
  constructor: DrawOperation
});

DrawOperation.prototype.handleMouseDown = function(event) {
  if (event.button !== 0) {
    return;
  }
  let drawable = this.target;
  if (drawable.isDrawing === false) {
    Operation.prototype.handleMouseDown.call(this, event);
    drawable.drawStartPoint.x = this.startPoint.x;
    drawable.drawStartPoint.y = this.startPoint.y;
    drawable.drawEndPoint.x = this.endPoint.x;
    drawable.drawEndPoint.y = this.endPoint.y;
    drawable.isDrawing = true;
  }

}

DrawOperation.prototype.handleMouseMove = function(event) {
  let x = event.offsetX;
  let y = event.offsetY;

  this.lastPoint.x = this.endPoint.x;
  this.lastPoint.y = this.endPoint.y;
  this.endPoint.x = x;
  this.endPoint.y = y;
  let drawable = this.target;
  drawable.drawEndPoint.x = x;
  drawable.drawEndPoint.y = y;
  drawable.addDrawPoint(this.endPoint.x, this.endPoint.y);
  this.execute();
}

DrawOperation.prototype.execute = function () {
  let drawable = this.target;
  if (drawable) {
    drawable.draw();
  }
};

DrawOperation.prototype.end = function() {
  let drawable = this.target;
  if (drawable) {
    drawable.isDrawing = false;
    drawable.closePath();
    drawable.draw();
  }
}

export default DrawOperation;
