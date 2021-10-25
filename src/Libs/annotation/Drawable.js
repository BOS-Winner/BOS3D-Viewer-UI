import { transformPoint, matrixMultiply } from "./Math.js";
import { createRect } from "./DomUtils.js";


let ScalePosition = {
  LeftTop: "left-top",
  Top: "top",
  RightTop: "right-top",
  Left: "left",
  Right: "right",
  LeftBottom: "left-bottom",
  Bottom: "bottom",
  RightBottom: "right-bottom"
};


let Drawable = function (svg) {

  this.translate = undefined;
  this.scale = undefined;
  this.rotate = {
    angle: 0
  };
  this.domElement = undefined;

  //绘制开始点和结束点
  this.drawStartPoint = {
    x: 0,
    y: 0
  };
  this.drawEndPoint = {
    x: 0,
    y: 0
  };
  //记录中间点，某些图形要用到，如FreeLine，FreeCloudLine
  this.points = undefined;
  this.strokeWidth = 5;
  this.strokeColor = "#000000";
  this.fillColor = "none";
  this.svg = svg;
  this.isDrawing = false;
  this.type = "Drawable";
  //测试用的，方便观察bbox的位置
  this._showHelper = false;

};

Drawable.prototype.isValid = function () {
  if (!this.points && this.drawStartPoint.x === this.drawEndPoint.x && this.drawStartPoint.y === this.drawEndPoint.y) {
    return false;
  } else if (this.points && this.points.length === 0) {
    return false;
  }
  return true;
};

/**
 * 表示当前图元的属性，用于属性面板
 */
Drawable.prototype.attribute = function () {
  let attribute = {};
  attribute.strokeWidth = this.strokeWidth;
  attribute.strokeColor = this.strokeColor;
  attribute.fillColor = this.fillColor;
  attribute.type = this.type;
  return attribute;
};

Drawable.prototype.addDrawPoint = function (x, y) {

};

Drawable.prototype.closePath = function () {

};

/**
 * 这个方法不会设置transform之类的信息，只会设置跟绘制相关的属性
 * 例如stroke、圆的半径、矩形的宽度等等。（子类各自设置自己的相关属性）
 * @param forced 是否强制，可以根据这个来选择清除缓存
 */
Drawable.prototype.draw = function (forced) {
  let element = this.domElement;
  element.style.strokeWidth = this.strokeWidth;
  element.style.stroke = this.strokeColor;
  element.style.fill = this.fillColor;
  //不一定所有浏览器都支持这个属性
  element.style.vectorEffect = "non-scaling-stroke";

  if (this._showHelper) {
    let bbox = this.getBBox();
    if (!this._helper) {
      this._helper = createRect(bbox.width, bbox.height);
      this._helper.style.strodeWidth = 2;
      this._helper.style.stroke = "#ff0000";
      this.svg.appendChild(this._helper);
    }
    this._helper.setAttributeNS(null, "x", bbox.x);
    this._helper.setAttributeNS(null, "y", bbox.y);
    this._helper.setAttributeNS(null, "width", bbox.width);
    this._helper.setAttributeNS(null, "height", bbox.height);
  }

  this._resetTransform();
};

Drawable.prototype.drawToCanvas = function (context) {

};

Drawable.prototype.isValidColor = function (color) {
  if (color && color != "none") {
    return true;
  }
  return false;
};

Drawable.prototype.hide = function () {
  if (this.domElement) {
    this.domElement.setAttributeNS(null, "display", "none");
  }
};

Drawable.prototype.show = function () {
  if (this.domElement) {
    this.domElement.setAttributeNS(null, "display", "");
  }
};

Drawable.prototype.setTranslate = function (x, y) {

  if (x !== 0 || y !== 0) {
    this.translate = {
      x,
      y
    };
  } else {
    this.translate = undefined;
  }
  this._resetTransform();
};

Drawable.prototype.setScale = function (x, y, scalePosition) {

  if (x !== 1 || y !== 1) {
    this.scale = {
      x,
      y,
      scalePosition
    };
  } else {
    this.scale = undefined;
  }
  this._resetTransform();
};

Drawable.prototype.setRotate = function (angle) {
  this.rotate.angle += angle;
  if (this.rotate.angle > 360) {
    this.rotate.angle -= 360;
  }
  this._resetTransform();
};

Drawable.prototype.getCenter = function () {
  let bbox = this.getBBox();
  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2
  };
};

Drawable.prototype.getSize = function () {
  let bbox = this.getBBox();
  return {
    width: bbox.width,
    height: bbox.height
  };
};

Drawable.prototype.getBBox = function () {
  if (this.domElement) {
    return this.domElement.getBBox();
  }
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
};

/**
 * 子类有不同的实现，返回变换开始时候的Bbox，因为子类可能在变化过程中发生变化
 */
Drawable.prototype.getOriginalBBoxBeforeTransform = function () {
  return this.getBBox();
};

Drawable.prototype.getTransformedBBox = function () {
  let bbox = this.getBBox();
  let centerX = bbox.x + bbox.width / 2;
  let centerY = bbox.y + bbox.height / 2;
  let x1 = bbox.x;
  let y1 = bbox.y;
  let x2 = bbox.x + bbox.width;
  let y2 = bbox.y + bbox.height;

  //重新计算bbox，因为上面获取到的bbox不包括变换
  let rotate = this.matrixForCurrentRotate();
  let translate = this.matrixForCurrentTranslate();
  let scale = this.matrixForCurrentScale();

  //注意顺序，靠右的矩阵先被应用。
  let tem = [translate, rotate, scale];
  let matrix = undefined;
  for (let i = 0; i < tem.length; i += 1) {
    let obj = tem[i];
    if (obj) {
      if (matrix) {
        matrix = matrixMultiply(matrix, obj);
      } else {
        matrix = obj;
      }
    }
  }

  if (matrix) {
    let p = transformPoint(centerX, centerY, matrix);
    centerX = p.x;
    centerY = p.y;

    p = transformPoint(x1, y1, matrix);
    x1 = p.x;
    y1 = p.y;

    p = transformPoint(x2, y2, matrix);
    x2 = p.x;
    y2 = p.y;
  }

  return {
    x1,
    y1,
    x2,
    y2,
    centerX,
    centerY
  };
};

/**
 * 缩放之后重新调整旋转中心。（因为缩放过程中旋转中心是不能变的）
 */
Drawable.prototype.adjustRotateCenter = function (svg) {

  /*
  大体思路：svg元素的getBBox返回的rect不考虑变换（包括旋转），因此要自己计算最终的bbox，
  第一步，先求出旋转中心，当svg元素的bbox发生变化，其center也发生变化，但是center并没有考虑旋转，因此要
  乘以旋转矩阵，得出新的旋转中心。
  第二步，根据新的旋转中心，反推出新的bbox的左上角和右下角的坐标
   */
  let oldCenter = this.rotate.center;
  let oldRotate = svg.createSVGTransform();
  oldRotate.setRotate(this.rotate.angle, oldCenter.x, oldCenter.y);

  let center = this.getCenter();
  let point = svg.createSVGPoint();
  point.x = center.x;
  point.y = center.y;
  let newCenter = transformPoint(point.x, point.y, oldRotate.matrix);

  let newRotate = svg.createSVGTransform();
  newRotate.setRotate(this.rotate.angle, newCenter.x, newCenter.y);
  let newRotateMatrixInverse = newRotate.matrix.inverse();

  let point1 = svg.createSVGPoint();
  point1.x = this.drawStartPoint.x;
  point1.y = this.drawStartPoint.y;
  point1 = transformPoint(point1.x, point1.y, oldRotate.matrix);
  point1 = transformPoint(point1.x, point1.y, newRotateMatrixInverse);

  let point2 = svg.createSVGPoint();
  point2.x = this.drawEndPoint.x;
  point2.y = this.drawEndPoint.y;
  point2 = transformPoint(point2.x, point2.y, oldRotate.matrix);
  point2 = transformPoint(point2.x, point2.y, newRotateMatrixInverse);

  this.drawStartPoint.x = point1.x;
  this.drawStartPoint.y = point1.y;
  this.drawEndPoint.x = point2.x;
  this.drawEndPoint.y = point2.y;

  this.rotate.center = newCenter;
  this.draw();
};

/**
 * 注意：返回的矩阵包含两个平移矩阵
 */
Drawable.prototype.matrixForCurrentScale = function () {
  if (this.scale && (this.scale.x !== 1 || this.scale.y !== 1)) {
    let point = this._translateForCurrentScale();

    let translate1 = this.svg.createSVGTransform();
    translate1.setTranslate(point.x, point.y);

    let scale = this.svg.createSVGTransform();
    scale.setScale(this.scale.x, this.scale.y);

    let translate2 = this.svg.createSVGTransform();
    translate2.setTranslate(-point.x, -point.y);
    let m = matrixMultiply(translate1.matrix, scale.matrix, translate2.matrix);
    return m;
  }
  return undefined;
};

Drawable.prototype.matrixForCurrentTranslate = function () {
  if (this.translate && (this.translate.x !== 0 || this.translate.y !== 0)) {
    let translate = this.svg.createSVGTransform();
    translate.setTranslate(this.translate.x, this.translate.y);
    return translate.matrix;
  }
  return undefined;
};

Drawable.prototype.matrixForCurrentRotate = function () {
  if (this.rotate.angle > 0) {
    //如果发生了位移，旋转中心需要重新计算。
    let bbox = this.getBBox();
    let centerX = bbox.x + bbox.width / 2;
    let centerY = bbox.y + bbox.height / 2;
    let rotate = this.svg.createSVGTransform();
    rotate.setRotate(this.rotate.angle, centerX, centerY);
    return rotate.matrix;
  }
  return undefined;
};

Drawable.prototype.transformForCurrentRotate = function () {
  if (this.rotate.angle > 0) {
    //如果发生了位移，旋转中心需要重新计算。
    let bbox = this.getBBox();
    let centerX = bbox.x + bbox.width / 2;
    let centerY = bbox.y + bbox.height / 2;
    let transform = "rotate(" + this.rotate.angle + "," + centerX + "," + centerY + ") ";
    return transform;
  }
  return undefined;
};

/**
 * 生成一个标识状态的对象，包含所有绘制所必须的信息
 */
Drawable.prototype.toJson = function () {
  let output = {};
  output.rotate = {
    angle: this.rotate.angle
  };
  output.drawStartPoint = {
    x: this.drawStartPoint.x,
    y: this.drawStartPoint.y
  };
  output.drawEndPoint = {
    x: this.drawEndPoint.x,
    y: this.drawEndPoint.y
  };
  output.strokeWidth = this.strokeWidth;
  output.strokeColor = this.strokeColor;
  output.fillColor = this.fillColor;
  output.points = this.points ? this.points.concat() : undefined;
  output.type = this.type;
  return output;
};

/**
 * 恢复到json对象所表示的状态，一般调用完之后要调用draw方法进行重绘
 * @param json 状态对象
 */
Drawable.prototype.fromJson = function (json) {

  this.drawStartPoint = json.drawStartPoint;
  this.drawEndPoint = json.drawEndPoint;
  this.strokeWidth = json.strokeWidth;
  this.strokeColor = json.strokeColor;
  this.fillColor = json.fillColor;
  this.points = json.points;
  if (json.rotate && !isNaN(json.rotate.angle) && typeof json.rotate.angle === "number") {
    this.rotate.angle = json.rotate.angle;
  }
};

Drawable.prototype._resetTransform = function () {
  let translate = this._transformForCurrentTranslate();
  let scale = this._transformForCurrentScale();
  let rotate = this.transformForCurrentRotate();
  let result = "";

  if (translate) {
    result += translate;
  }
  if (rotate) {
    result += rotate;
  }
  if (scale) {
    result += scale;
  }
  if (result.length > 0) {
    this.domElement.setAttributeNS(null, "transform", result);
  } else {
    this.domElement.removeAttributeNS(null, "transform");
  }
};

Drawable.prototype._transformForCurrentScale = function () {


  if (this.scale && (this.scale.x !== 1 || this.scale.y !== 1)) {
    let point = this._translateForCurrentScale();
    //不用SVGTransformList，因为可能有兼容问题
    let transform = "translate(" + point.x + "," + point.y + ") ";
    transform = transform + "scale(" + this.scale.x + "," + this.scale.y + ") ";
    transform = transform + "translate(" + -point.x + "," + -point.y + ") ";
    return transform;
  }
  return undefined;


};

Drawable.prototype._transformForCurrentTranslate = function () {
  let translate = this.translate;
  if (this.translate && (this.translate.x !== 0 || this.translate.y !== 0)) {
    let transform = "translate(" + translate.x + "," + translate.y + ") ";
    return transform;
  }
  return undefined;
};

Drawable.prototype._translateForCurrentScale = function () {
  let bbox = this.getOriginalBBoxBeforeTransform();
  let scalePosition = this.scale.scalePosition;
  let translateX = 0;
  let translateY = 0;
  if (scalePosition === ScalePosition.Right ||
    scalePosition === ScalePosition.RightBottom ||
    scalePosition === ScalePosition.Bottom) {
    translateX = bbox.x;
    translateY = bbox.y;
  } else if (scalePosition === ScalePosition.RightTop) {
    translateX = bbox.x;
    translateY = bbox.y + bbox.height;
  } else if (scalePosition === ScalePosition.LeftBottom) {
    translateX = bbox.x + bbox.width;
    translateY = bbox.y;
  } else if (scalePosition === ScalePosition.Left) {
    translateX = bbox.x + bbox.width;
    translateY = bbox.y;
  } else if (scalePosition === ScalePosition.LeftTop ||
    scalePosition === ScalePosition.Top) {
    translateX = bbox.x + bbox.width;
    translateY = bbox.y + bbox.height;
  }
  return {
    x: translateX,
    y: translateY
  };
};


export { Drawable, ScalePosition };


