import { Drawable, ScalePosition } from "./Drawable.js";
import { createImage } from "./DomUtils.js";




let BackgroundImage = function (svg) {
  Drawable.call(this, svg);
  this.domElement = createImage();
  this.type = "BackgroundImage";
};

BackgroundImage.prototype = Object.assign(Object.create(Drawable.prototype), {
  constructor: BackgroundImage
});

BackgroundImage.prototype.setImage = function(url, width, height) {
    this.url = url;
    this.width = width ? width : 0;
    this.height = height ? height : 0;
};

BackgroundImage.prototype.attribute = function() {
  let attribute = {};
  attribute.width = this.width;
  attribute.height = this.height;
  attribute.url = this.url;
  return attribute;
}

BackgroundImage.prototype.isValid = function () {
  if (this.url && this.width !== 0 && this.height !== 0) {
    return true;
  }
  return false;
};

BackgroundImage.prototype.draw = function () {
  let image = this.domElement;
  if (image) {
    image.setAttributeNS('http://www.w3.org/1999/xlink','href',this.url);
    image.setAttributeNS(null, "x", this.drawStartPoint.x);
    image.setAttributeNS(null, "y", this.drawStartPoint.y);
    image.setAttributeNS(null, "width", this.width);
    image.setAttributeNS(null, "height", this.height);
    Drawable.prototype.draw.call(this);
  }
};

BackgroundImage.prototype.drawToCanvas = function (context) {
  // if (this.isValid()) {
  //   // let image = new Image();
  //   // image.src =
  //   context.drawImage(this.domElement, 0, 0);
  // }
}

BackgroundImage.prototype.toJson = function () {
  let obj = Drawable.prototype.toJson.call(this);
  obj.width = this.width;
  obj.height = this.height;
  obj.url = this.url;
  return obj;
};

BackgroundImage.prototype.fromJson = function (json) {
  this.width = json.width;
  this.height = json.height;
  this.url = json.url;
  Drawable.prototype.fromJson.call(this, json);
}

export { BackgroundImage };
