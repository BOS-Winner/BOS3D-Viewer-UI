import { Drawable, ScalePosition } from "./Drawable.js";
import { createLine } from "./DomUtils.js";


let Line = function (svg) {
    Drawable.call(this, svg);
    this.domElement = createLine();
    this.type = "Line";
};

Line.prototype = Object.assign(Object.create(Drawable.prototype), {
    constructor: Line
});

Line.prototype.attribute = function() {
  let attribute = Drawable.prototype.attribute.call(this);
  attribute.fillColor = "none";
  return attribute;
}

Line.prototype.draw = function () {
    let line = this.domElement;
    if (line) {
        line.setAttributeNS(null, "x1", this.drawStartPoint.x);
        line.setAttributeNS(null, "y1", this.drawStartPoint.y);
        line.setAttributeNS(null, "x2", this.drawEndPoint.x);
        line.setAttributeNS(null, "y2", this.drawEndPoint.y);
        Drawable.prototype.draw.call(this);
    }
};

Line.prototype.drawToCanvas = function (context) {
  if (this.isValidColor(this.strokeColor)) {
    context.save();
    context.strokeStyle = this.strokeColor;
    context.lineWidth = this.strokeWidth;
    if (this.rotate.angle > 0) {
      let center = this.getCenter();
      context.translate(center.x, center.y);
      context.rotate(this.rotate.angle*Math.PI/180);
      context.translate(-center.x, -center.y);
    }
    context.beginPath();
    context.moveTo(this.drawStartPoint.x, this.drawStartPoint.y);
    context.lineTo(this.drawEndPoint.x, this.drawEndPoint.y);
    context.closePath();
    context.stroke();
    context.restore();
  }

}

export { Line };
