import { Drawable, ScalePosition } from "./Drawable.js";
import { createPath } from "./DomUtils.js";



let FreeLine = function (svg) {
    Drawable.call(this, svg);
    this.points = [];
    this.domElement = createPath();
    this.type = "FreeLine";
};

FreeLine.prototype = Object.assign(Object.create(Drawable.prototype), {
    constructor: FreeLine
});

FreeLine.prototype.addDrawPoint = function(x, y) {
    this.points.push(x, y);
}

FreeLine.prototype.attribute = function() {
  let attribute = Drawable.prototype.attribute.call(this);
  attribute.fillColor = "none";
  return attribute;
}

FreeLine.prototype.draw = function () {
    let path = this.domElement;
    if (path) {
      //忽略fillColor
      this.fillColor = "none";
      path.setAttributeNS(null, "d", "M" + this.points.join(" "));
      Drawable.prototype.draw.call(this);
    }
};

FreeLine.prototype.drawToCanvas = function (context) {
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
    let path = new Path2D("M" + this.points.join(" "));
    context.stroke(path);
    context.restore();
  }

}


export { FreeLine };
