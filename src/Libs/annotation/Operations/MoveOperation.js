import {OperationType, Operation} from "./Operation.js";
import {transformPoint} from "../Math.js";

/**
 * 移动操作
 */
let MoveOperation = function (target) {
  Operation.call(this, target);
  this.operationType = OperationType.Move;
};

MoveOperation.prototype = Object.assign(Object.create(Operation.prototype), {
  constructor: MoveOperation
});

MoveOperation.prototype.execute = function () {
  let dx = this.endPoint.x - this.startPoint.x;
  let dy = this.endPoint.y - this.startPoint.y;
  this.target.setTranslate(dx, dy);
};

MoveOperation.prototype.end = function() {
  //将缩放的变换应用于各个点。
  let drawable = this.target;
  let translate = drawable.translate;
  if (translate && (translate.x !== 0 || translate.y !== 0)) {
    let matrix = drawable.matrixForCurrentTranslate();
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
    drawable.draw(true);
    drawable.setTranslate(0, 0);
  }
}

export default MoveOperation;
