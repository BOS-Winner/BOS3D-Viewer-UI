import { Drawable, ScalePosition } from "./Drawable.js";
import { createRect, createGroup, createPath, createCircle, createSvg } from "./DomUtils.js";
import { transformBBox, matrixMultiply, transformPoint } from "./Math.js";


let CursorStyleList = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];

let rotateIcon = "data:image/x-icon;base64,AAABAAEAICAAAAEAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAD///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av//////////////Av///wL///8C////Av///wL///8w////gf///7/////Z////8/////P////Z////v////4H///8y////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C//////////////8C////Av///wL///9Q////1//////////////////////////////////////////////////////////X////VP///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL//////////////wL///8g////w///////////////6f///5f///9M////KP///w7///8O////Jv///0r///+V////5f//////////////x////yL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av//////////////Ov///+n/////////6////2b///8E////Av///wL///8C////Av///wL///8C////Av///wL///8E////Zv///+f/////////6////0D///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C///////////////3/////////7H///8S////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Dv///7P/////////+f///z7///8C////Av///wL///8C////Av///wL///8C////Av///wL///////////////////+f////BP///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////BP///5P/////////6////yD///8C////Av///wL///8C////Av///wL///8C////Av//////////////////////////////////////////////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///7P/////////x////wL///8C////Av///wL///8C////Av///wL///8C////tf////////////////////////////////////////8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Dv///+f/////////VP///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Zv/////////X////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8E////5f////////8y////Av///wL///8C////Av///xr///8G////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///+V/////////4H///8C////Av///wL///8C////t/////X///8+////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///0z/////////v////wL///8C////Av///wL////j/////////yL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Jv/////////Z////Av///wL///8C////Av////f/////////CP///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8O//////////P///8C////Av///wL///8C////8/////////8O////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wr/////////9////wL///8C////Av///wL////Z/////////yj///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Iv/////////j////Av///wL///8C////Av///7//////////Sv///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8+////9f///7f///8C////Av///wL///8C////gf////////+V////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8E////Gv///wL///8C////Av///wL///8y/////////+X///8E////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL////X/////////2b///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///1T/////////5////w7///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C/////////////////////////////////////////7X///8C////Av///wL///8C////Av///wL///8C////Av///8f/////////s////wT///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL//////////////////////////////////////////////wL///8C////Av///wL///8C////Av///wL///8C////Iv///+v/////////lf///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wT///+d////////////////////Av///wL///8C////Av///wL///8C////Av///wL///8C////QP////n/////////s////w7///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8Q////sf/////////3//////////////8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////QP///+v/////////5////2b///8E////Av///wL///8C////Av///wL///8C////Av///wL///8E////Zv///+v/////////6f///zj//////////////wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Iv///8f//////////////+X///+V////Sv///yb///8M////Dv///yj///9K////l////+n//////////////8P///8g////Av//////////////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///1T////X/////////////////////////////////////////////////////////9f///9Q////Av///wL///8C//////////////8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8y////gf///7/////Z////8/////P////Z////v////4H///8w////Av///wL///8C////Av///wL//////////////wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C////Av///wL///8C///////////z8A//88AD//MH4P/yP/x/8H/+P/D//x/wD/+P8A//z////+f////n////48////PP///zz///88////PP///zz///88f////n////5/////P/8A/x//AP+P//D/x//g/+P/xP/wfgz//AA8//8A/P//////////8="

let HANDLE_WIDTH = 15;
let HANDLE_HEIGHT = 15;
let HANDLE_ID_PREFIX = "selector-handle-";
let HANDLE_FILL_COLOR = "#0000FF";

let Selector = function (svg) {
    Drawable.call(this, svg);
    this._target = undefined;
    this._boundingPath = undefined;
    this._scaleHandles = {};
    this._rotateHandle = undefined;
    this._isActive = false;
    this._createElements();
    this.type = "Selector";
    this._svgScale = 1.0; // 跟画布的缩放一致

}

Selector.prototype = Object.assign(Object.create(Drawable.prototype), {
    constructor:Selector
})

Selector.prototype.hide = function() {
    if (this._target) {
        this._target.domElement.style.cursor = "default";
        this._target = undefined;
    }
    this.domElement.setAttributeNS(null, "display", "none");
    this._isActive = false;
}

Selector.prototype.showWithTarget = function(target) {
    if (target) {
        if (this._target) {
            this._target.domElement.style.cursor = "default";
        }
        this._target = target;
        this._target.domElement.style.cursor = "move";
        this.domElement.setAttributeNS(null, "display", "inline");
        this._isActive = true;
        this.draw();
    }
}

Selector.prototype.isActive = function() {
    return this._isActive;
}

Selector.prototype.currentTarget = function() {
    return this._target;
}

Selector.prototype.isMoveEvent = function(e) {
    let target = e.target;
    if (target === this._boundingPath) {
        return true;
    }
    return false;
}

Selector.prototype.isScaleEvent = function(e) {
    let target = e.target;
    let handles = this._scaleHandles;
    let keys = Object.keys(handles);
    for (let i = 0; i < keys.length; i += 1) {
        let key = keys[i];
        if (target === handles[key]) {
            return true;
        }
    }
    return false;
}

Selector.prototype.scalePositionOfEvent = function(e) {
    let target = e.target;
    let handles = this._scaleHandles;
    let index = target.id.indexOf(HANDLE_ID_PREFIX);
    if (index !== -1) {
        let position = target.id.substring(HANDLE_ID_PREFIX.length);
        return position;
    }
    return undefined;
}

Selector.prototype.isRotateEvent = function(e) {
    let target = e.target;
    if (target === this._rotateHandle) {
        return true;
    }
    return false;
}

Selector.prototype.hitTest = function(e) {

    let target = e.target;
    if (target === this.domElement) {
        return true;
    }

    if (this.isMoveEvent(e)) {
        return true;
    }

    if (this.isScaleEvent(e)) {
        return true;
    }

    if (this.isRotateEvent(e)) {
        return true;
    }

    return false;
}

Selector.prototype.isValid = function() {
    if (this.drawStartPoint.x === this.drawEndPoint.x && this.drawStartPoint.y === this.drawEndPoint.y) {
        return false;
    }
    return true;
}

Selector.prototype.draw = function () {
    let drawable = this._target;

    let bbox = drawable.getTransformedBBox();

    let x1 = bbox.x1;
    let y1 = bbox.y1;
    let x2 = bbox.x2;
    let y2 = bbox.y2;
    if (drawable.rotate.angle > 0) {
        //再旋转回去，因为下边要设置旋转中心。点的位置加上旋转 = 最终位置
        let rot = this.svg.createSVGTransform();
        rot.setRotate(-drawable.rotate.angle, bbox.centerX, bbox.centerY);
        let rotm = rot.matrix;
        let p = transformPoint(x1, y1, rotm);
        x1 = p.x;
        y1 = p.y;

        p = transformPoint(x2, y2, rotm);
        x2 = p.x;
        y2 = p.y;
    }

    //如果drawable方发生了上下或者左右颠倒，保持selector不颠倒
    if (x1 > x2) {
        let tem = x1;
        x1 = x2;
        x2 = tem;
    }

    if (y1 > y2) {
        let tem = y1;
        y1 = y2;
        y2 = tem;
    }

    //包围框
    this._resetBoundingPath(x1, y1, x2, y2, bbox.centerX, bbox.centerY);
    //handles(方块)
    this._resetHandles(x1, y1, x2, y2, bbox.centerX, bbox.centerY);

    if (drawable.rotate.angle > 0) {
        let transform = "rotate(" + drawable.rotate.angle + "," + bbox.centerX + "," + bbox.centerY + ")";
        this.domElement.setAttributeNS(null, "transform", transform);
    } else {
        this.domElement.removeAttributeNS(null, "transform");
    }
  
}

Selector.prototype.setSvgScale = function(scale) {
  this._svgScale = scale;
  this.draw();
}

/**
 * 缩放画布之后，方块会跟着变大，为了避免方块变大，要对其进行缩小，使之永远保持视觉大小
 */
Selector.prototype.scaleScaleHandles = function() {
  var handles = Object.values(this._scaleHandles);
  handles.push(this._rotateHandle);
  for (var i = 0, len = handles.length; i < len; i += 1) {
    var handle = handles[i];
    var rect = handle.getBoundingClientRect();
    var str = undefined;
    if (rect && rect.width && rect.height) {
      var scale = HANDLE_WIDTH / rect.width;
      let bbox = handle.getBBox();
      let centerX = bbox.x + bbox.width / 2;
      let centerY = bbox.y + bbox.height / 2;
    
      // translate(-centerX * (factor - 1), -centerY * (factor - 1));
      // scale(factor);
      
      str = "translate(" + centerX * (1 - scale) + "," + centerY * (1 - scale) + ") scale(" + scale + ")";
      handle.setAttributeNS(null, "transform", str);
    }
  }
}

Selector.prototype.getBBox = function () {
    if (this.domElement) {
        return this.domElement.getBBox();
    }
    return Drawable.prototype.getBBox();
}

Selector.prototype._createElements = function() {
    let group = createGroup();

    let path = createPath();
    path.setAttributeNS(null, "stroke", "#0000FF");
    path.setAttributeNS(null, "stroke-width", 1);

    //必须fill，不然鼠标的cursor不会变
    path.setAttributeNS(null, "fill", "#000000");
    path.setAttributeNS(null, "fill-opacity", 0);
    path.style.strokeDasharray = "5,5";
    path.style.cursor = "move";
    path.style.vectorEffect = "non-scaling-stroke";
    group.appendChild(path);
    this._boundingPath = path;

    let handles = this._createScaleHandles();
    group.appendChild(handles);

    let rotateHandle = this._createRotateHandle();
    group.appendChild(rotateHandle);
    this._rotateHandle = rotateHandle;

    this.domElement = group;
    this.hide();

}

Selector.prototype._createScaleHandles = function() {
    let group = createGroup();
    let rects = this._scaleHandles;
    Object.keys(ScalePosition).forEach(function (key, index) {
        let rect = createRect(HANDLE_WIDTH, HANDLE_HEIGHT);
        let value = ScalePosition[key];
        rect.id = HANDLE_ID_PREFIX + value;
        rect.style.cursor = CursorStyleList[index] + "-resize";
        rect.setAttributeNS(null, "fill", HANDLE_FILL_COLOR);
        group.appendChild(rect);
        rects[value] = rect;
    });
    return group;
}

Selector.prototype._createRotateHandle = function() {
    let rect = createRect(HANDLE_WIDTH, HANDLE_HEIGHT);
    rect.id = HANDLE_ID_PREFIX + "rotate";
    rect.style.cursor = "url(" + rotateIcon + ") 18 18,auto";
    rect.setAttributeNS(null, "fill", HANDLE_FILL_COLOR);
    return rect;
}

Selector.prototype._resetBoundingPath = function(x1, y1, x2, y2, centerX, centerY) {
    //path
    let d = "M" + x1 + "," + y1;
    d = d + "L" + centerX + "," + y1;
    d = d + "L" + centerX + "," + (y1 - 50);
    d = d + "L" + centerX + "," + y1;
    d = d + "L" + x2 + "," + y1;
    d = d + "L" + x2 + "," + y2;
    d = d + "L" + x1 + "," + y2;
    d = d + "Z";

    this._boundingPath.setAttributeNS(null, "d", d);
}

Selector.prototype._resetHandles = function(x1, y1, x2, y2, centerX, centerY) {
  
    // 清空一下缩放
    var handles = Object.values(this._scaleHandles);
    handles.push(this._rotateHandle);
    for (var i = 0, len = handles.length; i < len; i += 1) {
      var handle = handles[i];
      handle.setAttributeNS(null, "transform", "");
    }
  
    let halfWidth = HANDLE_WIDTH / 2;
    let halfHeight = HANDLE_HEIGHT / 2;

    let rect = this._scaleHandles[ScalePosition.LeftTop];
    rect.setAttributeNS(null, "x", x1 - halfWidth);
    rect.setAttributeNS(null, "y", y1 - halfHeight);

    rect = this._scaleHandles[ScalePosition.Top];
    rect.setAttributeNS(null, "x", centerX - halfWidth);
    rect.setAttributeNS(null, "y", y1 - halfHeight);

    rect = this._scaleHandles[ScalePosition.RightTop];
    rect.setAttributeNS(null, "x", x2 - halfWidth);
    rect.setAttributeNS(null, "y", y1 - halfHeight);

    rect = this._scaleHandles[ScalePosition.Left];
    rect.setAttributeNS(null, "x", x1 - halfWidth);
    rect.setAttributeNS(null, "y", centerY - halfHeight);

    rect = this._scaleHandles[ScalePosition.Right];
    rect.setAttributeNS(null, "x", x2 - halfWidth);
    rect.setAttributeNS(null, "y", centerY - halfHeight);

    rect = this._scaleHandles[ScalePosition.LeftBottom];
    rect.setAttributeNS(null, "x", x1 - halfWidth);
    rect.setAttributeNS(null, "y", y2 - halfHeight);

    rect = this._scaleHandles[ScalePosition.Bottom];
    rect.setAttributeNS(null, "x", centerX - halfWidth);
    rect.setAttributeNS(null, "y", y2 - halfHeight);

    rect = this._scaleHandles[ScalePosition.RightBottom];
    rect.setAttributeNS(null, "x", x2 - halfWidth);
    rect.setAttributeNS(null, "y", y2 - halfHeight);


    this._rotateHandle.setAttributeNS(null, "x", centerX - halfWidth);
    this._rotateHandle.setAttributeNS(null, "y", y1 - 50 - halfHeight);
  
    if (this._svgScale > 1.0) {
      this.scaleScaleHandles();
    }

}


export { Selector };
