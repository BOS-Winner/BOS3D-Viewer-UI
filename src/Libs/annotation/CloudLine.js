import { Drawable, ScalePosition } from "./Drawable.js";
import { createPath } from "./DomUtils.js";
import { matrixMultiply, transformPoint } from "./Math.js";




let CloudLine = function (svg) {
    Drawable.call(this, svg);
    this.maxSegLength = 20;
    this._pathString = undefined;
    this._sizeInfoBeforeTransform = undefined;//在变换过程中，保存原始bbox
    this.domElement = createPath();
    this.type = "CloudLine";
};

CloudLine.prototype = Object.assign(Object.create(Drawable.prototype), {
    constructor: CloudLine
});

CloudLine.prototype.draw = function () {
    let path = this.domElement;
    if (path) {

        this._calculatePathString();
        if (this._pathString) {
            path.setAttributeNS(null, "d", this._pathString);
        }
        Drawable.prototype.draw.call(this);
    }
};

CloudLine.prototype.drawToCanvas = function (context) {
  if (this._pathString) {
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
      let path = new Path2D(this._pathString);
      if (needFill) {
        context.fillStyle = this.fillColor;
        context.fill(path);
      }

      if (needStroke) {
        context.lineWidth = this.strokeWidth;
        context.strokeStyle = this.strokeColor;
        context.stroke(path);
      }
      context.restore();
    }
  }


}

CloudLine.prototype.getOriginalBBoxBeforeTransform = function () {
    if (this._sizeInfoBeforeTransform) {
        return this._sizeInfoBeforeTransform.bbox;
    }
    return this.getBBox();
};

CloudLine.prototype.getBBox = function () {
    if (this.domElement) {
        let sx = Math.min(this.drawStartPoint.x, this.drawEndPoint.x);
        let sy = Math.min(this.drawStartPoint.y, this.drawEndPoint.y);
        let ex = Math.max(this.drawStartPoint.x, this.drawEndPoint.x);
        let ey = Math.max(this.drawStartPoint.y, this.drawEndPoint.y);
        let width = ex - sx;
        let height = ey - sy;
        return {
            x: sx,
            y: sy,
            width: width,
            height: height
        };
    }
    return Drawable.prototype.getBBox();
};

CloudLine.prototype.setScale = function (x, y, scalePosition) {

    if (x !== 1 || y !== 1) {
        this.scale = { x,
            y,
            scalePosition };
        if (!this._sizeInfoBeforeTransform) {
            this._sizeInfoBeforeTransform = {
                bbox: this.getBBox(),
                drawStartPoint: this.drawStartPoint,
                drawEndPoint: this.drawEndPoint
            };
        }
    } else {
        this._sizeInfoBeforeTransform = undefined;
        this.scale = undefined;
        return;
    }

    let scale = this.matrixForCurrentScale();
    if (scale) {
        //因为文字不能真正的缩放，缩放属性只改变文本的宽度，
        //改变完宽度后，缩放要重置为1，因此这里要考虑到当前有旋转，重新计算位置。
        //实时修改坐标
        let curBBox = this.getBBox();
        let oldBBox = this._sizeInfoBeforeTransform.bbox;
        let realScaleX = curBBox.width / oldBBox.width;
        let realScaleY = curBBox.height / oldBBox.height;
        this.scale.x = realScaleX;
        this.scale.y = realScaleY;
        let oldCenter = {
            x: oldBBox.x + oldBBox.width / 2,
            y: oldBBox.y + oldBBox.height / 2
        };

        let m = scale;
        if (this.rotate.angle > 0) {
            let rotate = this.svg.createSVGTransform();
            rotate.setRotate(this.rotate.angle, oldCenter.x, oldCenter.y);
            m = matrixMultiply(rotate.matrix, m);

            let newCenter = transformPoint(oldCenter.x, oldCenter.y, m);
            let rot = this.svg.createSVGTransform();
            rot.setRotate(-this.rotate.angle, newCenter.x, newCenter.y);
            m = matrixMultiply(rot.matrix, m);
        }
        this.drawStartPoint = transformPoint(this._sizeInfoBeforeTransform.drawStartPoint.x, this._sizeInfoBeforeTransform.drawStartPoint.y, m);
        this.drawEndPoint = transformPoint(this._sizeInfoBeforeTransform.drawEndPoint.x, this._sizeInfoBeforeTransform.drawEndPoint.y, m);
        this.draw();
    }

    Drawable.prototype.setScale.call(this, 1, 1, scalePosition);
};

CloudLine.prototype._calculatePathString = function () {
    let sx = Math.min(this.drawStartPoint.x, this.drawEndPoint.x);
    let sy = Math.min(this.drawStartPoint.y, this.drawEndPoint.y);
    let ex = Math.max(this.drawStartPoint.x, this.drawEndPoint.x);
    let ey = Math.max(this.drawStartPoint.y, this.drawEndPoint.y);
    let width = ex - sx;
    let height = ey - sy;

    let segLengthX = 0;
    let countX = 0;
    if (width < this.maxSegLength) {
        segLengthX = width;
        countX = 1;
    } else {
        countX = Math.ceil(width / this.maxSegLength);
        segLengthX = width / countX;
    }

    let segLengthY = 0;
    let countY = 0;
    if (height < this.maxSegLength) {
        segLengthY = height;
        countY = 1;
    } else {
        countY = Math.ceil(height / this.maxSegLength);
        segLengthY = height / countY;
    }


    let points = "M" + sx.toString() + "," + sy.toString() + " ";
    let points1 = "";
    let points2 = "";

    //为了减少循环次数
    let x = sx;
    let halfSegLengthX = segLengthX / 2;
    for (let i = 0; i < countX; i += 1) {
        let x2 = x;
        x += segLengthX;
        let controlX = x - halfSegLengthX;
        let controlY = sy - halfSegLengthX;
        let pair1 = "Q" + controlX.toString() + "," + controlY.toString() + " " + x.toString() + "," + sy.toString() + " ";
        points1 += pair1;

        controlY = ey + halfSegLengthX;
        let pair2 = "Q" + controlX.toString() + "," + controlY.toString() + " " + x2.toString() + "," + ey.toString() + " ";
        points2 = pair2 + points2;
    }

    let points3 = "";
    let y = sy;
    let halfSegLengthY = segLengthY / 2;
    for (let i = 0; i < countY; i += 1) {
        let y2 = y;
        y += segLengthY;
        let controlX = ex + halfSegLengthY;
        let controlY = y - halfSegLengthY;
        let pair1 = "Q" + controlX.toString() + "," + controlY.toString() + " " + ex.toString() + "," + y.toString() + " ";
        points1 += pair1;

        controlX = sx - halfSegLengthY;
        let pair2 = "Q" + controlX.toString() + "," + controlY.toString() + " " + sx.toString() + "," + y2.toString() + " ";
        points3 = pair2 + points3;
    }

    this._pathString = points + points1 + points2 + points3;

};

export { CloudLine };
