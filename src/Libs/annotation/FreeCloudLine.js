import { Drawable, ScalePosition } from "./Drawable.js";
import { createPath } from "./DomUtils.js";
import { crossVectors, normalizeVector, lengthOfVector, transformPoint, matrixMultiply } from "./Math.js";


let FreeCloudLine = function (svg) {
    Drawable.call(this, svg);
    this.domElement = createPath();
    this.points = [];
    this.type = "FreeCloudLine";
    // 绘制结束之后计算出来，保存
    this._pathString = undefined;
};

FreeCloudLine.prototype = Object.assign(Object.create(Drawable.prototype), {
    constructor: FreeCloudLine
});

FreeCloudLine.prototype.addDrawPoint = function(x, y) {

    let length = this.points.length;
    if (length >= 2) {
        //先插入控制点
        let controlPoint = this._calculateControlPoint(this.points[length-2], this.points[length-1], x, y);
        this.points.push(controlPoint.x, controlPoint.y);
    }
    this.points.push(x, y);
}

FreeCloudLine.prototype.closePath = function() {
    this.addDrawPoint(this.points[0], this.points[1]);
    this._pathString = this._calculatePathString();
}

FreeCloudLine.prototype.isValid = function () {
    if (this.points.length < 6) {
        //至少三个点
        return false;
    }
    return true;
};

FreeCloudLine.prototype.setTranslate = function (x, y) {
    Drawable.prototype.setTranslate.call(this, x, y);
};

FreeCloudLine.prototype.draw = function (forced) {
    let path = this.domElement;
    if (path) {
        if (forced) {
          this._pathString = this._calculatePathString();
        }
        let pathString = this._pathString ? this._pathString : this._calculatePathString();
        if (pathString) {
            path.setAttributeNS(null, "d", pathString);
        }
        Drawable.prototype.draw.call(this);
    }
};

FreeCloudLine.prototype.drawToCanvas = function (context) {
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

FreeCloudLine.prototype.getOriginalBBoxBeforeTransform = function () {
    if (this._sizeInfoBeforeTransform) {
        return this._sizeInfoBeforeTransform.bbox;
    }
    return this.getBBox();
};


FreeCloudLine.prototype._calculatePathString = function () {

    let length = this.points.length;
    if (length === 0) {
        return undefined;
    }

    let path = "M";

    if (length >= 6) {
        for (let i = 0; i < length - 2; i += 4) {
            path = path + this.points[i] + "," + this.points[i+1] + " ";
            path = path + "Q" + this.points[i+2] + "," + this.points[i+3] + " ";
        }
    }

    path = path + this.points[length - 2] + "," + this.points[length - 1] + " ";

    let lastPx = this.points[length-2];
    let lastPy = this.points[length-1];
    if (this.isDrawing === true) {
        let ex = this.drawEndPoint.x;
        let ey = this.drawEndPoint.y;
        if (ex !== lastPx || ey !== lastPy) {
            //最后一个点和drawEndPoint构成一个弧
            let controlPoint = this._calculateControlPoint(lastPx, lastPy, ex, ey);
            //最后一个控制点
            path = path + "Q" + controlPoint.x + "," + controlPoint.y + " ";
            path = path + this.drawEndPoint.x + "," + this.drawEndPoint.y;
        }
    } else {
      path += "Z";
    }



    return path;
};

FreeCloudLine.prototype._calculateControlPoint = function(x1, y1, x2, y2) {
    let vector1 = {
        x: x2 - x1,
        y: y2 - y1,
        z: 0
    };
    let vector2 = {
        x: 0,
        y: 0,
        z: 1
    };
    let crossVector = crossVectors(vector1, vector2);

    let unitCross = normalizeVector(crossVector);
    let length = lengthOfVector(vector1);

    //比两个点的距离短一些
    crossVector = {
        x: unitCross.x * length / 2,
        y: unitCross.y * length / 2
    }

    let halfPoint = {
        x: (x1 + x2)/2,
        y: (y1 + y2)/2
    };

    let controlX = crossVector.x + halfPoint.x;
    let controlY = crossVector.y + halfPoint.y;
    return {
        x: controlX,
        y: controlY
    };
}

export { FreeCloudLine };
