import { Drawable, ScalePosition } from "./Drawable.js";
import { createText, createTextSpan, createCircle } from "./DomUtils.js";
import { transformPoint, matrixMultiply } from "./Math.js";


let Text = function (svg) {
    Drawable.call(this, svg);
    this.fontFamily = "PingFangSC-Regular, sans-serif";
    this.fontSize = 16;
    this.strokeColor = "none";
    this.strokeWidth = 0;
    this.fillColor = "#000000";
    this.domElement = createText();
    this._bboxBeforeTransform = undefined;//在变换过程中，保存原始bbox
    this.type = "Text";

};

Text.prototype = Object.assign(Object.create(Drawable.prototype), {
    constructor: Text
});

Text.prototype.attribute = function() {
  let attribute = Drawable.prototype.attribute.call(this);
  attribute.fontSize = this.fontSize;
  attribute.fontFamily = this.fontFamily;
  attribute.text = this.textContent;
  return attribute;
}

Text.prototype.setScale = function (x, y, scalePosition) {

    if (x !== 1 || y !== 1) {
        this.scale = { x,
            y,
            scalePosition };
        if (!this._bboxBeforeTransform) {
            this._bboxBeforeTransform = this.getBBox();
        }
    } else {
        this._bboxBeforeTransform = undefined;
        this.scale = undefined;
        return;
    }

    let needTransform = this._resetText();
    if (needTransform) {
        //因为文字不能真正的缩放，缩放属性只改变文本的宽度，
        //改变完宽度后，缩放要重置为1，因此这里要考虑到当前有旋转，重新计算位置。
        //实时修改坐标
        let curBBox = this.getBBox();
        let realScaleX = curBBox.width / this._bboxBeforeTransform.width;
        let realScaleY = curBBox.height / this._bboxBeforeTransform.height;
        this.scale.x = realScaleX;
        this.scale.y = realScaleY;
        let oldCenter = {
            x: this._bboxBeforeTransform.x + this._bboxBeforeTransform.width / 2,
            y: this._bboxBeforeTransform.y + this._bboxBeforeTransform.height / 2
        };

        let scale = this.matrixForCurrentScale();
        let p = { x: this._bboxBeforeTransform.x,
        y: this._bboxBeforeTransform.y };
        if (scale) {
            let m = scale;
            if (this.rotate.angle > 0) {
                let rotate = this.svg.createSVGTransform();
                rotate.setRotate(this.rotate.angle, oldCenter.x, oldCenter.y);
                m = matrixMultiply(rotate.matrix, m);

                let newCenter = transformPoint(oldCenter.x, oldCenter.y, m);
                let rot = this.svg.createSVGTransform();
                rot.setRotate(-this.rotate.angle, newCenter.x, newCenter.y);
                m = matrixMultiply(rot.matrix, m);

                // if (!this._centerC) {
                //     this._centerC = createCircle(10);
                //     this._centerC.style.fill = "#ff0000";
                //     this.svg.appendChild(this._centerC);
                // }
                // this._centerC.setAttributeNS(null, "cx", newCenter.x);
                // this._centerC.setAttributeNS(null, "cy", newCenter.y);
            }
            this.drawStartPoint = transformPoint(p.x, p.y, m);
            this.draw();
        } else {
          this.drawStartPoint = p;
          this.draw();
        }
    }

    Drawable.prototype.setScale.call(this, 1, 1, scalePosition);
};

Text.prototype.setText = function (text) {
    if (text !== this.textContent){
      this.textContent = text;
      this._resetText();
      this.draw();
    }
};

Text.prototype.setFontSize = function(size) {
  if (this.fontSize !== size) {
    this.fontSize = size;
    let text = this.domElement;
    if (text) {
      //重新计算起始点，保证图形是以左上角为基准点进行缩放的
      let oldCenter = this.getCenter();
      let oldDrawStartPoint = this.drawStartPoint;
      text.style.fontSize = this.fontSize;
      this.draw();
      if (this.rotate.angle > 0) {
        let rotate = this.svg.createSVGTransform();
        rotate.setRotate(this.rotate.angle, oldCenter.x, oldCenter.y);
        let newCenter = this.getCenter();
        let newRotate = this.svg.createSVGTransform();
        newRotate.setRotate(this.rotate.angle, newCenter.x, newCenter.y);
        let m = matrixMultiply(newRotate.matrix.inverse(), rotate.matrix);
        let newPoint = transformPoint(oldDrawStartPoint.x, oldDrawStartPoint.y, m);
        this.drawStartPoint = newPoint;
      }
    }
  }
}

Text.prototype.draw = function () {
    let text = this.domElement;
    if (text) {
        text.style.fontFamily = this.fontFamily;
        text.style.fontSize = this.fontSize;

        text.setAttributeNS(null, "x", this.drawStartPoint.x);
        text.setAttributeNS(null, "y", this.drawStartPoint.y);
        let children = text.childNodes;
        if ((!children || children.length === 0) && this.textContent && this.textContent.length > 0) {
            this._resetText();
        }
        for (let i = 0; i < children.length; i += 1) {
            let node = children[i];
            node.style.fontSize = this.fontSize;
            node.setAttributeNS(null, "x", this.drawStartPoint.x);
            node.setAttributeNS(null, "dy", this.fontSize + 2);
        }
        Drawable.prototype.draw.call(this);
    }
};

Text.prototype.drawToCanvas = function (context) {
  if (this.textContent.length > 0 && this.isValidColor(this.fillColor)) {
    context.font = "normal " + this.fontSize + "px " + this.fontFamily;
    context.fillStyle = this.fillColor;
    if (this.rotate.angle > 0) {
      let center = this.getCenter();
      context.translate(center.x, center.y);
      context.rotate(this.rotate.angle*Math.PI/180);
      context.translate(-center.x, -center.y);
    }
    let children = this.domElement.childNodes;
    for (let i = 0; i < children.length; i += 1) {
      let node = children[i];
      let text = node.textContent;
      context.fillText(text, this.drawStartPoint.x, this.drawStartPoint.y + i*this.fontSize + 2);
    }
    context.restore();
  }
}

Text.prototype.isValid = function () {
    return this.textContent && this.textContent.length > 0;
};

Text.prototype.getOriginalBBoxBeforeTransform = function () {
    if (this._bboxBeforeTransform) {
        return this._bboxBeforeTransform;
    }
    return this.getBBox();
};


Text.prototype._resetText = function () {

    //如果没在文档树中，getComputedTextLength会返回0
    if (!this.domElement.parentNode) {
        return false;
    }

    let oldBBox = this.getBBox();


    let bbox = this._bboxBeforeTransform ? this._bboxBeforeTransform : oldBBox;

    this.domElement.style.display = "none";
    let nodes = this.domElement.childNodes;
    while (nodes.length > 0) {
        this.domElement.removeChild(nodes[0]);
    }
    this.domElement.style.display = "";

    let text = this.textContent;
    let length = text.length;
    if (length === 0) {
        return false;
    }


    let width = bbox.width;
    let scale = this.matrixForCurrentScale();
    if (scale) {
        let p1 = transformPoint(bbox.x, bbox.y, scale);
        let p2 = transformPoint(bbox.x + bbox.width, bbox.y, scale);
        width = p2.x - p1.x;
    }

    if (width === 0) {
        width = 200;//初始
    }


    let spans = [];
    let ts = undefined;
    let spanText = "";
    let x = 0;
    let y = 0;
    for (let i = 0; i < length; i += 1) {
        let char = text[i];
        spanText += char;
        if (!ts) {
            ts = createTextSpan();
            ts.setAttributeNS(null, "x", this.drawStartPoint.x);
            ts.setAttributeNS(null, "dy", this.fontSize + 2);
            ts.style.fontSize = this.fontSize;
            this.domElement.appendChild(ts);
        }
        ts.textContent = spanText;
        if (ts.getComputedTextLength() >= width) {
            ts.textContent = spanText.slice(0, -1);
            ts = undefined;
            spanText = char;
        }
    }

    //返回值决定了宽度是否发生了变化
    let curBBox = this.getBBox();
    if (curBBox.width !== oldBBox.width) {
        return true;
    }
    return false;

};


Text.prototype.getBBox = function () {
    if (this.domElement) {
        return this.domElement.getBBox();
    }
    return Drawable.prototype.getBBox();
};

Text.prototype.toJson = function () {
    let obj = Drawable.prototype.toJson.call(this);
    obj.textContent = this.textContent;
    obj.fontSize = this.fontSize;
    obj.fontFamily = this.fontFamily;
    let length = this.domElement.childNodes.length;
    if (length > 0) {
        obj.textLines = [];
        for (let i = 0; i < length; i += 1) {
            let sp = this.domElement.childNodes[i];
            obj.textLines.push(sp.textContent);
        }
    }
    return obj;
};

Text.prototype.fromJson = function (json) {
    if (json.fontFamily) {
        this.fontFamily = json.fontFamily;
    }
    if (json.fontSize) {
        this.fontSize = json.fontSize;
    }

    if (json.textContent) {
        this.textContent = json.textContent;
    }

    if (json.textLines) {
        let nodes = this.domElement.childNodes;
        while (nodes.length > 0) {
          this.domElement.removeChild(nodes[0]);
        }
        for (let i = 0; i < json.textLines.length; i += 1) {
            let text = json.textLines[i];
            let ts = createTextSpan();
            ts.setAttributeNS(null, "x", this.drawStartPoint.x);
            ts.setAttributeNS(null, "dy", this.fontSize + 2);
            this.domElement.appendChild(ts);
            ts.textContent = text;
        }
    }

    Drawable.prototype.fromJson.call(this, json);


};

export { Text };
