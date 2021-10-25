import { Drawable, ScalePosition } from "./Drawable.js";
import { createRect } from "./DomUtils.js";


let Rect = function (svg) {
    Drawable.call(this, svg);
    this.domElement = createRect();
    this.type = "Rect";
};

Rect.prototype = Object.assign(Object.create(Drawable.prototype), {
    constructor: Rect
});

Rect.prototype.draw = function () {
    let rect = this.domElement;
    if (rect) {
        let r = this._rect();

        rect.setAttributeNS(null, "x", r.x);
        rect.setAttributeNS(null, "y", r.y);
        rect.setAttributeNS(null, "width", r.width);
        rect.setAttributeNS(null, "height", r.height);

        Drawable.prototype.draw.call(this);
    }
};

Rect.prototype.drawToCanvas = function (context) {
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
    let rect = this._rect();
    if (needFill) {
      context.fillStyle = this.fillColor;
      context.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
    if (needStroke) {
      context.strokeStyle = this.strokeColor;
      context.lineWidth = this.strokeWidth;
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
    context.restore();
  }

}


Rect.prototype._rect = function () {
  let sx = this.drawStartPoint.x;
  let sy = this.drawStartPoint.y;
  let ex = this.drawEndPoint.x;
  let ey = this.drawEndPoint.y;

  let width = Math.abs(ex - sx);
  let height = Math.abs(ey - sy);
  return {
    x: Math.min(sx, ex),
    y: Math.min(sy, ey),
    width: width,
    height: height
  }
}
export { Rect };
