import { Drawable, ScalePosition } from "./Drawable.js";
import { createEllipse } from "./DomUtils.js";


let Ellipse = function (svg, isCircle) {
    Drawable.call(this, svg);
    this._isCircle = isCircle ? isCircle : false;
    this.domElement = createEllipse();
    this.type = "Ellipse";
};

Ellipse.prototype = Object.assign(Object.create(Drawable.prototype), {
    constructor: Ellipse
});

Ellipse.prototype.setTranslate = function(x, y) {
  //一旦发生变换，就不是一个圆了，变成椭圆
  if (this._isCircle) {
    this._resetDrawEndPoint();
    this._isCircle = false;
  }
  Drawable.prototype.setTranslate.call(this,x, y);
}

Ellipse.prototype.setScale = function (x, y, scalePosition) {
  if (this._isCircle) {
    this._resetDrawEndPoint();
    this._isCircle = false;
  }
  Drawable.prototype.setScale.call(this, x, y, scalePosition);
}

Ellipse.prototype.setRotate = function (angle) {
  if (this._isCircle) {
    this._resetDrawEndPoint();
    this._isCircle = false;
  }
  Drawable.prototype.setRotate.call(this, angle);
};

Ellipse.prototype.draw = function () {
    let ellipse = this.domElement;
    if (ellipse) {
        let e = this._getParameters();
        ellipse.setAttributeNS(null, "cx", e.cx);
        ellipse.setAttributeNS(null, "cy", e.cy);
        ellipse.setAttributeNS(null, "rx", e.rx);
        ellipse.setAttributeNS(null, "ry", e.ry);
        Drawable.prototype.draw.call(this);
    }
};

Ellipse.prototype.drawToCanvas = function (context) {
  let needFill = this.isValidColor(this.fillColor);
  let needStroke = this.isValidColor(this.strokeColor);
  if (needFill || needStroke) {
    context.save();
    if (this.rotate.angle > 0) {
      let center = this.getCenter();
      context.translate(center.x, center.y);
      context.rotate(this.rotate.angle*Math.PI/180);
      context.translate(-center.x, -center.y);
    }
    let e = this._getParameters();
    if (this._isCircle) {
      context.beginPath();
      context.arc(e.cx, e.cy, e.rx, 0, 2*Math.PI);
      context.closePath();
    } else {
      // 椭圆
      // 并不是所有浏览器都支持ellipse方法
      if (typeof context.ellipse === "function") {
        context.beginPath();
        context.ellipse(e.cx, e.cy, e.rx, e.ry, 0, 0, Math.PI*2);
        context.closePath();
      } else {
        this._ellipse(e.cx, e.cy, e.rx, e.ry, context);
      }
    }

    if (needFill) {
      context.fillStyle = this.fillColor;
      context.fill();
    }
    if (needStroke) {
      context.strokeStyle = this.strokeColor;
      context.lineWidth = this.strokeWidth;
      context.stroke();
    }
    context.restore();
  }
}

Ellipse.prototype.toJson = function() {
  let obj = Drawable.prototype.toJson.call(this);
  obj.isCircle = this._isCircle;
  return obj;
}

Ellipse.prototype.fromJson = function(json) {
  Drawable.prototype.fromJson.call(this, json);
  if (json.isCircle) {
    this._isCircle = json.isCircle;
  }
}

Ellipse.prototype._getParameters = function () {
  let sx = this.drawStartPoint.x;
  let sy = this.drawStartPoint.y;
  let ex = this.drawEndPoint.x;
  let ey = this.drawEndPoint.y;

  let width = Math.abs(ex - sx);
  let height = Math.abs(ey - sy);
  let rx = width / 2;
  let ry = height / 2;
  let radius = Math.min(rx, ry);

  if (this._isCircle) {
    //如果是圆，半径相同
    rx = radius;
    ry = radius;
  }

  let cx = 0;
  let cy = 0;
  if (sx > ex) {
    //反着画的
    cx = sx - rx;
  } else {
    cx = sx + rx;
  }

  if (sy > ey) {
    //反着画的
    cy = sy - ry;
  } else {
    cy = sy + ry;
  }

  return {
    cx, cy, rx, ry
  };
}

Ellipse.prototype._resetDrawEndPoint = function () {
  let sx = this.drawStartPoint.x;
  let sy = this.drawStartPoint.y;
  let ex = this.drawEndPoint.x;
  let ey = this.drawEndPoint.y;

  let width = Math.abs(ex - sx);
  let height = Math.abs(ey - sy);
  let diameter = Math.min(width, height);

  if (sx > ex) {
    //反着画的
    ex = sx - diameter;
  } else {
    ex = sx + diameter;
  }

  if (sy > ey) {
    //反着画的
    ey = sy - diameter;
  } else {
    ey = sy + diameter;
  }
  this.drawEndPoint.x = ex;
  this.drawEndPoint.y = ey;
}

/**
 * 网上抄来的方法，绘制椭圆
 * @param x 中心点坐标x
 * @param y 中心点坐标y
 * @param a x轴半径
 * @param b y轴半径
 * @param context
 * @private
 */
Ellipse.prototype._ellipse = function (x, y, a, b, context) {
  let k = .5522848,
    ox = a * k, // 水平控制点偏移量
    oy = b * k; // 垂直控制点偏移量</p> <p> ctx.beginPath();
  //从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
  context.beginPath();
  context.moveTo(x - a, y);
  context.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
  context.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
  context.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
  context.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
  context.closePath();

}

export { Ellipse };
