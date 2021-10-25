import {OperationType, Operation} from "./Operation.js";
import {rotateAngleWithPoint} from "../DomUtils.js";
import {ScalePosition} from "../Drawable.js";
import {matrixMultiply, transformPoint} from "../Math.js";

/**
 * 缩放操作
 */
let ScaleOperation = function (target, scalePosition) {
  Operation.call(this, target);
  this.operationType = OperationType.Scale;
  this.scalePosition = scalePosition;
  this.originalTargetSize = target.getSize();
};

ScaleOperation.prototype = Object.assign(Object.create(Operation.prototype), {
  constructor: ScaleOperation
});

ScaleOperation.prototype.execute = function () {
  let drawable = this.target;
  let dx = this.endPoint.x - this.startPoint.x;
  let dy = this.endPoint.y - this.startPoint.y;
  //这个角度是从-y开始计算的
  let angle = this.target.rotate.angle;
  if (angle > 0) {
    //这行是计算x轴的旋转角度
    angle = (angle + 90) * Math.PI / 180;
    //如果图形发生了旋转，则在x、y方向的变化应该根据角度重新计算。
    let length = Math.sqrt(dx * dx + dy * dy);
    let moveAngle = rotateAngleWithPoint(dx, dy);
    //计算相对于x轴旋转的角度
    let theta = moveAngle - angle;
    dx = Math.cos(theta) * length;
    dy = Math.sin(theta) * length;
  }
  let size = this.originalTargetSize;
  let xScale = 1;
  let yScale = 1;

  let scalePosition = this.scalePosition;

  switch (scalePosition) {
    case ScalePosition.Top:
      yScale = (size.height - dy) / size.height;
      break;
    case ScalePosition.Bottom:
      yScale = (size.height + dy) / size.height;
      break;
    case ScalePosition.Right:
      xScale = (size.width + dx) / size.width;
      break;
    case ScalePosition.Left:
      xScale = (size.width - dx) / size.width;
      break;
    case ScalePosition.LeftTop:
      xScale = (size.width - dx) / size.width;
      yScale = (size.height - dy) / size.height;
      break;
    case ScalePosition.RightTop:
      xScale = (size.width + dx) / size.width;
      yScale = (size.height - dy) / size.height;
      break;
    case ScalePosition.LeftBottom:
      xScale = (size.width - dx) / size.width;
      yScale = (size.height + dy) / size.height;
      break;
    case ScalePosition.RightBottom:
      xScale = (size.width + dx) / size.width;
      yScale = (size.height + dy) / size.height;
      break;
    default:
      break;
  }
  drawable.setScale(xScale, yScale, scalePosition);
};

ScaleOperation.prototype.end = function () {
  //将缩放的变换应用于各个点。
  let drawable = this.target;
  let scale = drawable.matrixForCurrentScale();
  let rotate = drawable.matrixForCurrentRotate();
  if (scale) {
    let matrix = scale;
    if (rotate) {
      //把所有矩阵应用到点上
      //如果有旋转的话，还得倒过去，旋转变换不能丢。
      //注意顺序，靠右的矩阵先被应用
      matrix = matrixMultiply(rotate, matrix);
      let bbox = drawable.getTransformedBBox();
      let rotateInverse = drawable.svg.createSVGTransform();
      rotateInverse.setRotate(drawable.rotate.angle, bbox.centerX, bbox.centerY);
      matrix = matrixMultiply(rotateInverse.matrix.inverse(), matrix);
    }

    let p = drawable.drawStartPoint;
    drawable.drawStartPoint = transformPoint(p.x, p.y, matrix);
    p = drawable.drawEndPoint;
    drawable.drawEndPoint = transformPoint(p.x, p.y, matrix);
    let points = drawable.points;
    if (points && points.length > 0) {
      for (let i = 0; i < points.length; i += 2) {
        let x = points[i];
        let y = points[i+1];
        let p1 = transformPoint(x, y, matrix);
        points[i] = p1.x;
        points[i+1] = p1.y;
      }
    }
  }
  //必须先调用draw，保证后边设置transform能正确设置（如rotate的center）
  drawable.draw(true);
  drawable.setScale(1, 1);
};

export default ScaleOperation;
