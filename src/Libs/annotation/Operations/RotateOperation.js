import {OperationType, Operation} from "./Operation.js";
import {rotateAngleWithPoint} from "../DomUtils.js";

/**
 * 旋转操作
 */
let RotateOperation = function (target) {
  Operation.call(this, target);
  this.operationType = OperationType.Rotate;
  this.rotateCenter = {
    x: 0,
    y: 0
  };
};

RotateOperation.prototype = Object.assign(Object.create(Operation.prototype), {
  constructor: RotateOperation
});

RotateOperation.prototype.execute = function () {
  let angle = this._rotateAngle();
  let drawable = this.target;
  drawable.setRotate(angle);
};

RotateOperation.prototype._rotateAngle = function () {
  let startOrientation = {};
  startOrientation.x = this.lastPoint.x - this.rotateCenter.x;
  startOrientation.y = this.lastPoint.y - this.rotateCenter.y;
  let endOrientation = {};
  endOrientation.x = this.endPoint.x - this.rotateCenter.x;
  endOrientation.y = this.endPoint.y - this.rotateCenter.y;

  let startAngle = rotateAngleWithPoint(startOrientation.x, startOrientation.y);
  let endAngle = rotateAngleWithPoint(endOrientation.x, endOrientation.y);

  let angle = endAngle - startAngle;

  if (angle < 0) {
    angle += Math.PI * 2;
  }
  angle = angle * 180 / Math.PI;
  return angle;

};

export default RotateOperation;
