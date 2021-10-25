import DrawOperation from "./DrawOperation.js";

/**
 * 绘制自由云线跟其他类型的操作不太一样，所以单独处理
 */
let DrawFreeCloudLineOperation = function (target) {
  DrawOperation.call(this, target);
};

DrawFreeCloudLineOperation.prototype = Object.assign(Object.create(DrawOperation.prototype), {
  constructor: DrawFreeCloudLineOperation
});

DrawFreeCloudLineOperation.prototype.handleMouseUp = function(event) {
  let x = event.offsetX;
  let y = event.offsetY;

  this.endPoint.x = x;
  this.endPoint.y = y;

  let drawable = this.target;
  drawable.drawEndPoint.x = x;
  drawable.drawEndPoint.y = y;
  drawable.addDrawPoint(x, y);

  if (event.button === 2) {
    //停止
    this.end();
    return true;
  }
  this.execute();
  return false;
}

DrawFreeCloudLineOperation.prototype.handleMouseMove = function(event) {

  let x = event.offsetX;
  let y = event.offsetY;
  this.lastPoint.x = this.endPoint.x;
  this.lastPoint.y = this.endPoint.y;
  this.endPoint.x = x;
  this.endPoint.y = y;
  let drawable = this.target;
  drawable.drawEndPoint.x = this.endPoint.x;
  drawable.drawEndPoint.y = this.endPoint.y;
  this.execute();
};

export default DrawFreeCloudLineOperation;
