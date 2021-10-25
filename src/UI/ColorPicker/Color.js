import _ from "lodash-es";

const Color = function () {
  this.hex = undefined;
  this.rgb = undefined;
  this.alpha = 1.0;
  this.hsv = undefined;
};

Color.prototype.isEqualTo = function (color) {
  return this.hex === color.hex && this.alpha === color.alpha;
};

Color.prototype.copy = function () {
  return _.cloneDeep(this);
};

export default Color;
