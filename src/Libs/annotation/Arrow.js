import { Drawable, ScalePosition } from "./Drawable.js";
import { createPolygon, pointToString } from "./DomUtils.js";

function getHex(hex = "") {
  if (hex.length < 5) {
    return ''
  }
  if (hex.length > 7) {
    hex = hex.slice(0, -2)
  }
  return hex
}

function getAlpha(hex = "") {
  let _a = 1;
  if (hex) {
    if (hex.startsWith('#')) {
      hex = hex.slice(1)
    }
    if (hex.length > 6) {
      _a = Math.round(parseInt(hex.slice(6, 8), 16) / 255 * 100, 2) / 100
        .toString()
    }
  }
  return _a;
}
let Arrow = function (svg) {
  Drawable.call(this, svg);
  this.fillColor = this.strokeColor;
  this.arrowTailWidth = 5;
  this.arrowWidth = 15;
  this.strokeWidth = this.arrowTailWidth / 2;
  this.domElement = createPolygon();
  this.type = "Arrow";
};

Arrow.prototype = Object.assign(Object.create(Drawable.prototype), {
  constructor: Arrow
});

Arrow.prototype.attribute = function () {
  let attribute = Drawable.prototype.attribute.call(this);
  attribute.fillColor = "none";
  return attribute;
}

Arrow.prototype.draw = function () {
  let polygon = this.domElement;
  if (polygon) {
    // polygon 涉及到双透明的问题，就是 fill opacity 跟 加上 stroke opacity 会形成双透明叠加。所以原型的画法不能，颜色不能保护 rgba; 使用纯颜色，opacity 抽离到外部。
    // new insert start
    let alpha = getAlpha(this.strokeColor);
    let hex = getHex(this.strokeColor);
    this.fillColor = hex;
    // new insert end
    let points = this._calculatePoints();
    polygon.setAttributeNS(null, "points", points.join(" "));
    Drawable.prototype.draw.call(this);
    // new insert start 重绘
    this.domElement.style.opacity = alpha;
    this.domElement.style.stroke = hex;
    // new insert end
  }
};

Arrow.prototype.drawToCanvas = function (context) {
  if (this.isValidColor(this.strokeColor)) {
    context.save();
    context.strokeStyle = this.strokeColor;
    context.fillStyle = this.strokeColor;
    context.lineWidth = this.strokeWidth;
    if (this.rotate.angle > 0) {
      let center = this.getCenter();
      context.translate(center.x, center.y);
      context.rotate(this.rotate.angle * Math.PI / 180);
      context.translate(-center.x, -center.y);
    }
    let points = this._calculatePoints();
    // 别忘了最后的Z
    let path = new Path2D("M" + points.join(" ") + "Z");
    context.stroke(path);
    context.fill(path);
    context.restore();
  }
}


Arrow.prototype._calculatePoints = function () {
  let sx = this.drawStartPoint.x;
  let sy = this.drawStartPoint.y;
  let ex = this.drawEndPoint.x;
  let ey = this.drawEndPoint.y;

  //这里的代码难以阅读，为了避免计算量，其实就是简单的正弦余弦计算。
  let halfTailWidth = this.arrowTailWidth / 2;
  let halfArrowWidth = this.arrowWidth / 2;
  let angle = Math.atan2(ey - sy, ex - sx);

  let sinAngle = Math.sin(angle);
  let cosAngle = Math.cos(angle);
  let dx1 = sinAngle * halfArrowWidth;
  let dy1 = cosAngle * halfArrowWidth;

  let dx2 = sinAngle * halfTailWidth;
  let dy2 = cosAngle * halfTailWidth;

  //如果长度不够容下三角形
  let length = Math.pow(sx - ex, 2) + Math.pow(sy - ey, 2);
  if (length < this.arrowWidth * this.arrowWidth) {
    ex = sx + this.arrowWidth * cosAngle;
    ey = sy + this.arrowWidth * sinAngle;
  }

  //箭头的尾部，三角形开始的地方
  let triangleStartMidX = ex - dy1 * 2;
  let triangleStartMidY = ey - dx1 * 2;

  let startX = sx + dx2;
  let startY = sy - dy2;

  let endX = sx - dx2;
  let endY = sy + dy2;

  //箭头的上翼
  let arrowTopX = triangleStartMidX + dx1;
  let arrowTopY = triangleStartMidY - dy1;

  //箭头的下翼
  let arrowBottomX = triangleStartMidX - dx1;
  let arrowBottomY = triangleStartMidY + dy1;

  //上腰和下腰（两个转折点）
  let arrowTopMidX = triangleStartMidX + dx2;
  let arrowTopMidY = triangleStartMidY - dy2;

  let arrowBottomMidX = triangleStartMidX - dx2;
  let arrowBottomMidY = triangleStartMidY + dy2;

  let points = [];
  points.push(startX, startY);
  points.push(arrowTopMidX, arrowTopMidY);
  points.push(arrowTopX, arrowTopY);
  points.push(ex, ey);
  points.push(arrowBottomX, arrowBottomY);
  points.push(arrowBottomMidX, arrowBottomMidY);
  points.push(endX, endY);
  return points;
}

export { Arrow };
