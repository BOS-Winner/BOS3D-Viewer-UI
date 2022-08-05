import { createSvg, createTextArea, isTouchDevice } from "./DomUtils.js";
import { OperationType, MoveOperation, DrawOperation, ScaleOperation, RotateOperation, DrawFreeCloudLineOperation, DrawTextOperation } from "./Operations/Operations.js";
import { Line } from "./Line.js";
import { Rect } from "./Rect.js";
import { Ellipse } from "./Ellipse.js";
import { Arrow } from "./Arrow.js";
import { FreeLine } from "./FreeLine.js";
import { Text } from "./Text.js";
import { CloudLine } from "./CloudLine.js";
import { FreeCloudLine } from "./FreeCloudLine.js";
import { BackgroundImage } from "./BackgroundImage.js";
import { Selector } from "./Selector.js";
import MouseDownEventWrapper from "./MouseDownEventWrapper.js"
import { UndoRedoType, UndoRedo, UndoRedoItem } from "./UndoRedo.js";

let EditMode = {
  Select: "select",
  Drag: "drag", // 用手拖动整个画布
  DrawLine: "drawLine",
  DrawRect: "drawRect",
  DrawCircle: "drawCircle",
  DrawEllipse: "drawEllipse",
  DrawArrow: "drawArrow",
  DrawFreeLine: "drawFreeLine",
  DrawText: "drawText",
  DrawCloudLine: "drawCloudLine",
  DrawFreeCloudLine: "drawFreeCloudLine"
};

let AnnotationEditor = function (width, height) {
  this.allDraws = {};
  this.editMode = EditMode.DrawLine;
  this.currentOperation = undefined;
  this.selectors = [];
  this.width = width;
  this.height = height;
  this.version = "1.0";
  this.mouseWheelZoomEnable = false;
  this._counter = 1;
  this._undoRedo = new UndoRedo(this);
  let scope = this;
  this._undoRedo.onListChangeCallback = function (undoCount, redoCount) {
    if (scope.onUndoRedo) {
      scope.onUndoRedo(undoCount > 0, redoCount > 0);
    }
  }

  this.drawInfo = {
    fillColor: "none",
    strokeColor: "#E02020",
    strokeWidth: 5,
    fontSize: 16,
    fontFamily: "PingFangSC-Regular, sans-serif"
  }
  this._scale = 1.0; // 记录当前缩放比例
  // 拖动整个画布的时候用，EditMode.Drag模式，保存开始点位置
  this._dragStart = undefined;
  this.init(width, height);

  //几个外部传进来的回调

  //选中图形的回调，参数为Drawable实例
  this.onSelectElement = undefined;
  //当所有图形都取消选中之后的回调，没有参数
  this.onUnSelectElement = undefined;
  //编辑某个图形后的回调函数，参数为Drawable实例
  this.onChangeElement = undefined;
  //绘制图形回调，参数为Drawable实例
  this.onDrawElement = undefined;
  //删除图形
  this.onRemoveElement = undefined;
  //撤销或者重做
  //（canUndo, canRedo） => {}
  this.onUndoRedo = undefined;

  //背景image，保持引用，方便设置
  this.backgroundImage = undefined;

};

AnnotationEditor.prototype.init = function (width, height) {
  let svg = createSvg();
  svg.id = "svgroot";
  this.svg = svg;
  this.setSize(width, height);
  this.mouseDownEventWrapper = new MouseDownEventWrapper(this.svg);
  this.mouseDownEventWrapper.enableMultiClickCallback = this._canDoubleClick.bind(this);

  this.registerEventListeners();
  this._cachedSelector = new Selector(this.svg);
};

AnnotationEditor.prototype.destroy = function () {
  this.unregisterEventListeners();
  this.mouseDownEventWrapper.enableMultiClickCallback = undefined;
  this.onSelectElement = undefined;
  this.onChangeElement = undefined;
  this.onDrawElement = undefined;
  this.onRemoveElement = undefined;
  this._undoRedo = undefined;

}

AnnotationEditor.prototype.registerEventListeners = function () {
  let svg = this.svg;
  if (svg) {
    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseMove = this.onMouseMove.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);
    this._onContextMenu = this.onContextMenu.bind(this);
    this._onMouseDoubleClick = this.onMouseDoubleClick.bind(this);
    this._onZoom = this.onZoom.bind(this);

    this.mouseDownEventWrapper.doubleClickCallback = this._onMouseDoubleClick;
    this.mouseDownEventWrapper.mouseDownCallback = this._onMouseDown;
    this.mouseDownEventWrapper.mouseMoveCallback = this._onMouseMove;
    this.mouseDownEventWrapper.mouseUpCallback = this._onMouseUp;

    if (isTouchDevice()) {
      svg.addEventListener("touchstart", this.mouseDownEventWrapper.handleTouchStart);
      svg.addEventListener("touchmove", this.mouseDownEventWrapper.handleTouchMove);
      svg.addEventListener("touchend", this.mouseDownEventWrapper.handleTouchEnd);
    } else {
      svg.addEventListener("mousedown", this.mouseDownEventWrapper.handleMouseDown);
      svg.addEventListener("mousemove", this.mouseDownEventWrapper.handleMouseMove);
      svg.addEventListener("mouseup", this.mouseDownEventWrapper.handleMouseUp);

      if (this.mouseWheelZoomEnable) {
        // IE9, Chrome, Safari, Opera
        svg.addEventListener("mousewheel", this._onZoom, false);
        // Firefox
        svg.addEventListener("DOMMouseScroll", this._onZoom, false)
      }
    }


    svg.addEventListener("contextmenu", this._onContextMenu);

  }
};

AnnotationEditor.prototype.unregisterEventListeners = function () {
  let svg = this.svg;
  if (svg) {

    svg.removeEventListener("mousedown", this.mouseDownEventWrapper.handleMouseDown);
    svg.removeEventListener("mousemove", this.mouseDownEventWrapper.handleMouseMove);
    svg.removeEventListener("mouseup", this.mouseDownEventWrapper.handleMouseUp);

    svg.removeEventListener("touchstart", this.mouseDownEventWrapper.handleTouchStart);
    svg.removeEventListener("touchmove", this.mouseDownEventWrapper.handleTouchMove);
    svg.removeEventListener("touchend", this.mouseDownEventWrapper.handleTouchEnd);

    svg.removeEventListener("contextmenu", this._onContextMenu);

    this.mouseDownEventWrapper.doubleClickCallback = undefined;
    this.mouseDownEventWrapper.mouseDownCallback = undefined;
    this.mouseDownEventWrapper.mouseMoveCallback = undefined;
    this.mouseDownEventWrapper.mouseUpCallback = undefined;
  }
}

/**
 * 设置整个场景的背景
 * @param imageUrl base64或者url
 * @param width 图片宽度
 * @param height 图片高度
 */
AnnotationEditor.prototype.setBackgroundImage = function (imageUrl, width, height) {

  if (imageUrl) {
    if (this.backgroundImage) {
      this._removeFromSvg(this.backgroundImage);
      this.backgroundImage = undefined;
    }
    let image = new BackgroundImage(this.svg);
    image.setImage(imageUrl, width, height);
    this._insertToSvgFromBegin(image);
    this.backgroundImage = image;
    image.draw();
    if (this.onChangeElement) {
      this.onChangeElement(image);
    }
  }
}

/**
 * 此方法故意写成了静态方法
 * 修改批注已有的背景，或者新增一个背景
 * 直接操作的是数据，与svg和绘制无关。
 */
AnnotationEditor.changeBackgroundImage = function (data, imageUrl, width, height) {

  let allDraws = data.allDraws;
  if (allDraws && allDraws.length > 0) {
    let bg = allDraws[0];
    if (bg.type === "BackgroundImage") {
      bg.width = width;
      bg.height = height;
      bg.url = imageUrl;
    }
  } else if (imageUrl) {
    let image = new BackgroundImage();
    image.setImage(imageUrl, width, height);
    let json = image.toJson();
    data.allDraws = [json];
  }
}

AnnotationEditor.prototype.undo = function () {
  this.selectors.forEach(_selector => {
    _selector.hide();
  })
  this._undoRedo.undo();
}

AnnotationEditor.prototype.redo = function () {
  this.selectors.forEach(_selector => {
    _selector.hide();
  })
  this._undoRedo.redo();
}

AnnotationEditor.prototype.setCurrentMode = function (mode) {
  if (this.editMode !== mode) {
    this.editMode = mode;
    if (mode !== EditMode.Select) {
      this._removeAllSelector();
    }
    if (this.currentOperation) {
      this.currentOperation.end();
      this.currentOperationEnded();
    }

    if (this.editMode === EditMode.Drag) {
      this.svg.style.cursor = "pointer";
    } else {
      this.svg.style.cursor = "default";
    }
  }
};

AnnotationEditor.prototype.getCurrentMode = function () {
  return this.editMode;
}

AnnotationEditor.prototype.getCurrentDrawInfo = function () {
  if (this.selectors.length > 0) {
    let selector = this.selectors[0];
    let drawable = selector.currentTarget();
    if (drawable) {
      return drawable.attribute();
    }
  }
  return { ...this.drawInfo };
}

/**
 * 设置svg画布的大小，单位是像素
 * 这个方法同样会设置svg的viewbox的宽高
 * @param width 宽度，不带单位的数字，如500
 * @param height 高度，同上
 */
AnnotationEditor.prototype.setSize = function (width, height) {
  this.width = width;
  this.height = height;
  let w = this.width ? this.width : 0;
  let h = this.height ? this.height : 0
  this.svg.setAttributeNS(null, "width", w);
  this.svg.setAttributeNS(null, "height", h);
  this.svg.setAttributeNS(null, "viewBox", "0 0 " + w + " " + h);
}

/**
 * 外部UI负责删除的交互，内部负责实现
 */
AnnotationEditor.prototype.removeAllSelectedElement = function () {

  let removed = [];
  for (let i = 0; i < this.selectors.length; i += 1) {
    let selector = this.selectors[i];
    let drawable = selector.currentTarget();
    if (drawable) {
      this._removeFromSvg(drawable);
      if (this.onRemoveElement) {
        this.onRemoveElement(drawable);
      }
      removed.push(drawable);
    }
  }
  this._removeAllSelector();
  if (removed.length > 0) {
    let undoRedoItem = new UndoRedoItem(removed, UndoRedoType.delete);
    this._undoRedo.insert(undoRedoItem);
  }
}

/**
 * 设置填充颜色，如果有选中的图形，也设置选中图形的填充
 * @param color 字符串 如"#ffffff"、"none"
 */
AnnotationEditor.prototype.setFillColor = function (color) {
  this.drawInfo.fillColor = color;
  for (let i = 0; i < this.selectors.length; i += 1) {
    let selector = this.selectors[i];
    let drawable = selector.currentTarget();
    if (drawable) {
      this._saveHistoryDrawableChange(drawable, UndoRedoType.fillColor);
      drawable.fillColor = color;
      drawable.draw();
      if (this.onChangeElement) {
        this.onChangeElement(drawable);
      }
    }
  }
}

AnnotationEditor.prototype.clearFillColor = function () {
  this.setFillColor("none");
}

/**
 * 设置描边颜色，如果有选中的图形，也设置选中图形的描边
 * @param color 字符串 如"#ffffff"、"none"
 */
AnnotationEditor.prototype.setStrokeColor = function (color) {
  this.drawInfo.strokeColor = color;
  for (let i = 0; i < this.selectors.length; i += 1) {
    let selector = this.selectors[i];
    let drawable = selector.currentTarget();
    if (drawable) {
      this._saveHistoryDrawableChange(drawable, UndoRedoType.strokeColor);
      drawable.strokeColor = color;
      drawable.draw();
      if (this.onChangeElement) {
        this.onChangeElement(drawable);
      }
    }
  }
}

/**
 * 改变strokeWidth可能是利用滑动块来实现，
 * eventID是来区分是否每次调用都属于同一次用户操作。（鼠标按下、移动、松开）
 * @param width
 * @param eventID
 */
AnnotationEditor.prototype.setStrokeWidth = function (width, eventID) {
  this.drawInfo.strokeWidth = width;
  for (let i = 0; i < this.selectors.length; i += 1) {
    let selector = this.selectors[i];
    let drawable = selector.currentTarget();
    if (drawable) {
      this._saveHistoryDrawableChange(drawable, UndoRedoType.strokeWidth, eventID);
      drawable.strokeWidth = width;
      drawable.draw();
      if (this.onChangeElement) {
        this.onChangeElement(drawable);
      }
    }
  }
}

AnnotationEditor.prototype.clearStrokeColor = function () {
  this.setStrokeColor("none");
}

/**
 * 设置字体大小，如果有选中图元，也设置该图元的字体大小
 * eventID是来区分是否每次调用都属于同一次用户操作。（鼠标按下、移动、松开）
 * @param size
 * @param eventID
 */
AnnotationEditor.prototype.setTextFontSize = function (size, eventID) {
  this.drawInfo.fontSize = size;
  for (let i = 0; i < this.selectors.length; i += 1) {
    let selector = this.selectors[i];
    let drawable = selector.currentTarget();
    if (drawable && drawable instanceof Text) {
      this._saveHistoryDrawableChange(drawable, UndoRedoType.fontSize, eventID);
      drawable.setFontSize(size);
      selector.draw();
      if (this.onChangeElement) {
        this.onChangeElement(drawable);
      }
    }
  }
}

/**
 * 设置当前选中Text的文本
 * @param text
 */
AnnotationEditor.prototype.setText = function (text) {
  for (let i = 0; i < this.selectors.length; i += 1) {
    let selector = this.selectors[i];
    let drawable = selector.currentTarget();
    if (drawable && drawable instanceof Text) {
      this._saveHistoryDrawableChange(drawable, UndoRedoType.text);
      drawable.setText(text);
      selector.draw();
      if (this.onChangeElement) {
        this.onChangeElement(drawable);
      }
    }
  }
}

AnnotationEditor.prototype.setTextFontFamily = function (family) {
  this.drawInfo.fontFamily = family;
  for (let i = 0; i < this.selectors.length; i += 1) {
    let selector = this.selectors[i];
    let drawable = selector.currentTarget();
    if (drawable && drawable instanceof Text) {
      this._saveHistoryDrawableChange(drawable, UndoRedoType.fontFamily);
      drawable.fontFamily = family;
      drawable.draw();
      selector.draw();
      if (this.onChangeElement) {
        this.onChangeElement(drawable);
      }
    }
  }
}

AnnotationEditor.prototype.zoom = function (factor) {

  if (this.currentOperation) {
    this.currentOperation.end();
    this.currentOperationEnded();
  }

  var width = this.svg.getAttributeNS(null, "width");
  var height = this.svg.getAttributeNS(null, "height");
  var w = width * factor;
  var h = height * factor;
  if (w < this.width) {
    w = this.width;
    h = this.height;
    this._scale = 1.0;
  } else {
    var scale = w / this.width;
    if (scale > 5) {
      scale = 5;
      w = scale * this.width;
      h = scale * this.height;
    }
    this._scale = scale;
  }

  this.svg.setAttributeNS(null, "width", w);
  this.svg.setAttributeNS(null, "height", h);

  var parent = this.svg.parentNode;

  if (this._scale > 1.0) {
    parent.style.overflow = "scroll";
    var scrollLeft = Math.max(0, (w - this.width) / 2);
    var scrollTop = Math.max(0, (h - this.height) / 2);
    parent.scrollLeft = scrollLeft;
    parent.scrollTop = scrollTop;
  } else {
    parent.style.overflow = "hidden";
  }
  for (let i = 0, len = this.selectors.length; i < len; i += 1) {
    let selector = this.selectors[i];
    selector.setSvgScale(this._scale);
  }

  return this._scale;
}

AnnotationEditor.prototype.zoomIn = function () {
  this.zoom(1.1);
}

AnnotationEditor.prototype.zoomOut = function () {
  this.zoom(0.9);
}

AnnotationEditor.prototype.canZoomIn = function () {
  return this._scale < 5.0;
}

AnnotationEditor.prototype.canZoomOut = function () {
  return this._scale > 1.0;
}

AnnotationEditor.prototype.onMouseDown = function (event) {
  let operation = undefined;
  // 结束文本绘制（文本绘制比较特殊）
  if (this.currentOperation instanceof DrawTextOperation) {
    // ==== 2021-8月需求 文本绘制时候 需要获取到最新配置信息start =====
    const LATEST_CFG = this.getCurrentDrawInfo();
    if (LATEST_CFG.fillColor && LATEST_CFG.fillColor !== 'none') {
      this.currentOperation.target.fillColor = LATEST_CFG.fillColor;
      this.currentOperation.target.fontSize = LATEST_CFG.fontSize;
    }
    // ==== 2021-8月需求 文本绘制时候 需要获取到最新配置信息end =====
    this.currentOperation.end();
    this.currentOperationEnded();
  }
  if (this.currentOperation) {
    operation = this.currentOperation;
  } else if (event.button === 0) {
    //只监听鼠标左键
    let drawable = this._createDrawable(this.editMode);
    if (drawable) {
      //绘制模式
      if (drawable instanceof FreeCloudLine) {
        operation = new DrawFreeCloudLineOperation(drawable);
      } else if (drawable instanceof Text) {
        operation = new DrawTextOperation(drawable);
      } else {
        operation = new DrawOperation(drawable);
      }
      this._addToSvg(drawable);
    } else if (this.editMode === EditMode.Select) {
      let drawable = this._findDrawableWithMouseEvent(event);
      let isSelector = drawable instanceof Selector;
      if (isSelector) {
        //操作元素
        let selector = drawable;
        if (selector.isMoveEvent(event)) {
          operation = new MoveOperation(selector.currentTarget());
        } else if (selector.isScaleEvent(event)) {
          operation = new ScaleOperation(selector.currentTarget());
          operation.scalePosition = selector.scalePositionOfEvent(event);
        } else if (selector.isRotateEvent(event)) {
          operation = new RotateOperation(selector.currentTarget());
          operation.rotateCenter = selector.currentTarget().getCenter();
        }
      } else if (drawable && !(drawable instanceof BackgroundImage)) {
        //选中元素
        this._addSelectorWithTarget(drawable, false);
        operation = new MoveOperation(drawable);
      } else {
        this._removeAllSelector();
      }
    } else if (this.editMode === EditMode.Drag) {
      this._dragStart = { x: event.offsetX, y: event.offsetY };
    }
  }

  if (operation) {
    if (this.currentOperation !== operation) {
      this.newOperationStarted(operation);
    }
    operation.handleMouseDown(event);
  }
};

AnnotationEditor.prototype.onMouseMove = function (event) {
  if (this.currentOperation) {
    let operation = this.currentOperation;
    operation.handleMouseMove(event);
    let drawable = operation.currentTarget();
    let selectorToUpdate = this._selectorOnTarget(drawable);
    //更新选择器
    if (selectorToUpdate) {
      selectorToUpdate.draw();
    }
  } else if (this.editMode === EditMode.Drag) {
    // 拖动画布
    if (this._dragStart) {
      var x = event.offsetX;
      var y = event.offsetY;
      var deltaX = x - this._dragStart.x;
      var deltaY = y - this._dragStart.y;
      var parent = this.svg.parentNode;
      if (parent.style.overflow === "scroll") {
        parent.scrollLeft -= deltaX;
        parent.scrollTop -= deltaY;
      }
    }
  }
};

AnnotationEditor.prototype.onMouseUp = function (event) {
  if (this.currentOperation) {
    let operation = this.currentOperation;
    let drawable = operation.currentTarget();
    let isEnd = operation.handleMouseUp(event);
    let selectorToUpdate = this._selectorOnTarget(drawable);
    if (selectorToUpdate) {
      selectorToUpdate.draw();
    }
    if (isEnd) {
      this.currentOperationEnded();
    }
  }
  this._dragStart = undefined;
};

AnnotationEditor.prototype.onMouseDoubleClick = function (event) {

  if (this.currentOperation && this.currentOperation instanceof DrawFreeCloudLineOperation) {
    // 结束绘制
    this.currentOperation.end();
    this.currentOperationEnded();
    return;
  }
  let drawable = this._findDrawableWithMouseEvent(event);
  let selector = undefined;
  if (drawable instanceof Selector) {
    //如果处于选中状态
    selector = drawable;
    drawable = drawable.currentTarget();
  }
  if (drawable && drawable instanceof Text) {
    // 进入编辑模式
    let operation = new DrawTextOperation(drawable);
    this.currentOperation = operation;
    operation.handleDoubleClick();
    if (selector) {
      this._removeSelector(selector);
    }
  }
}

AnnotationEditor.prototype.onZoom = function (event) {
  event.preventDefault();
  var delta = event.wheelDelta ? event.wheelDelta : event.detail ? -event.detail : 0
  if (delta) {
    var factor = Math.max(0.9, Math.min(1.1, delta));
    this.zoom(factor);
  }
}

AnnotationEditor.prototype.newOperationStarted = function (operation) {
  this.currentOperation = operation;
}

AnnotationEditor.prototype.currentOperationEnded = function () {
  let operation = this.currentOperation;
  if (operation) {

    this.currentOperation = undefined;
    let drawable = operation.currentTarget();
    if (operation.operationType === OperationType.Draw) {
      if (!drawable.isValid()) {
        this._removeFromSvg(drawable);
      } else {
        if (this.onDrawElement) {
          this.onDrawElement(drawable);
        }
        this._saveHistoryOperation(operation);
      }
    } else {
      if (this.onChangeElement) {
        this.onChangeElement(drawable);
      }
      if (operation.isValid()) {
        this._saveHistoryOperation(operation);
      }
    }
  }
}

AnnotationEditor.prototype.onContextMenu = function (event) {
  event.preventDefault();
}

AnnotationEditor.prototype.toJson = function () {
  this._removeAllSelector();

  if (this.currentOperation) {
    this.currentOperation.end();
    this.currentOperationEnded();
  }

  let output = {};
  output.version = this.version;
  output.width = this.width;
  output.height = this.height;
  output.drawInfo = this.drawInfo;
  let keys = Object.keys(this.allDraws);
  if (keys.length > 0) {
    output.allDraws = [];
  }
  for (let i = 0; i < keys.length; i += 1) {
    let drawable = this.allDraws[keys[i]];
    if (drawable && drawable instanceof Selector === false) {
      output.allDraws.push(drawable.toJson());
    }
  }
  return output;
}

AnnotationEditor.prototype.fromJson = function (obj) {
  if (obj) {
    let editor = this;
    if (obj.drawInfo) {
      editor.drawInfo = obj.drawInfo;
    }
    let allDraws = obj.allDraws;
    if (allDraws && allDraws.length > 0) {
      for (let i = 0; i < allDraws.length; i += 1) {
        let json = allDraws[i];
        let type = json.type;
        if (type) {
          let drawable = editor._createDrawableWithType(type);
          if (drawable) {
            drawable.fromJson(json);
            if (drawable.isValid()) {
              //背景图片保存一下，只能添加一个
              if (drawable instanceof BackgroundImage) {
                editor._insertToSvgFromBegin(drawable);
                editor.backgroundImage = drawable;
              } else {
                editor._addToSvg(drawable);
              }
            }
          }
        }
      }
    }
  }
};

AnnotationEditor.drawToSvg = function (jsonData, svg) {
  if (jsonData) {
    let allDraws = jsonData.allDraws;
    if (allDraws && allDraws.length > 0) {
      for (let i = 0; i < allDraws.length; i += 1) {
        let json = allDraws[i];
        let type = json.type;
        if (type) {
          let drawable = AnnotationEditor.createDrawableWithType(type, svg);
          if (drawable) {
            drawable.fromJson(json);
            if (drawable.isValid()) {
              //背景图片保存一下，只能添加一个
              if (drawable instanceof BackgroundImage) {
                let node = svg.firstChild;
                if (node) {
                  svg.insertBefore(drawable.domElement, node);
                } else {
                  svg.appendChild(drawable.domElement);
                }
              } else {
                svg.appendChild(drawable.domElement);
              }
              drawable.draw();
            }
          }
        }
      }
    }
  }

}

/**
 * 将svg保存为图片地址，可供img标签使用。
 * 暂时没用到这个api
 * @param callback
 */
AnnotationEditor.prototype.makeSnapshot = function (callback) {

  let svg = this.svg.outerHTML;
  let src = 'data:image/svg+xml,' + svg;
  let img = new Image();
  img.src = src;
  img.onload = function () {
    let canvas = document.createElement("canvas");
    canvas.style.width = this.width;
    canvas.style.height = this.height;
    canvas.width = this.width;
    canvas.height = this.height;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    callback(canvas.toDataURL());
  }

  // 以下这种方案暂时没用到。
  /*
  let canvas = document.createElement("canvas");
  canvas.style.width = this.width;
  canvas.style.height = this.height;
  canvas.width = this.width;
  canvas.height = this.height;
  let ctx = canvas.getContext("2d");
  let keys = Object.keys(this.allDraws);
  for (let i = 0; i < keys.length; i += 1) {
    if (this.allDraws.hasOwnProperty(keys[i])) {
      let drawable = this.allDraws[keys[i]];
      drawable.drawToCanvas(ctx);
    }
  }
  let image = canvas.toDataURL();
  return image;
   */
};

AnnotationEditor.prototype.draw = function () {
  let keys = Object.keys(this.allDraws);
  for (let i = 0; i < keys.length; i += 1) {
    let drawable = this.allDraws[keys[i]];
    drawable.draw();
  }
}

/**
 * 以下三个方法不会放到历史队列里（UndoRedo）
 * @param drawable
 */
AnnotationEditor.prototype.addDrawable = function (drawable) {
  this._addToSvg(drawable);
  if (this.onDrawElement) {
    this.onDrawElement(drawable);
  }
}

AnnotationEditor.prototype.deleteDrawable = function (drawable) {
  this._removeFromSvg(drawable);
  // 更新selectors
  this._updateSelectors();
  if (this.onRemoveElement) {
    this.onRemoveElement(drawable);
  }
}

AnnotationEditor.prototype.changeDrawable = function (drawable, attribute) {
  let oldAttribute = drawable.toJson();
  drawable.fromJson(attribute);
  drawable.draw(true);
  this._updateSelectors();
  if (this.onChangeElement) {
    this.onChangeElement(drawable);
  }
  return oldAttribute;
}

AnnotationEditor.prototype._createDrawableWithType = function (type) {
  return AnnotationEditor.createDrawableWithType(type, this.svg);
};

AnnotationEditor.createDrawableWithType = function (type, svg) {
  switch (type) {
    case "Line":
      return new Line(svg);
    case "Rect":
      return new Rect(svg);
    case "Ellipse":
      return new Ellipse(svg, false);
    case "Arrow":
      return new Arrow(svg);
    case "FreeLine":
      return new FreeLine(svg);
    case "Text":
      return new Text(svg);
    case "CloudLine":
      return new CloudLine(svg);
    case "FreeCloudLine":
      return new FreeCloudLine(svg);
    case "BackgroundImage":
      return new BackgroundImage(svg);
    default:
      return undefined;
  }
};

AnnotationEditor.prototype._addToSvg = function (drawable) {
  drawable.domElement.id = "annotation-draw-" + this._counter;
  this.svg.appendChild(drawable.domElement);
  this.allDraws[drawable.domElement.id] = drawable;
  this._counter = this._counter + 1;
};

AnnotationEditor.prototype._insertToSvgFromBegin = function (drawable) {
  drawable.domElement.id = "annotation-draw-" + this._counter;
  let node = this.svg.firstChild;
  if (node) {
    this.svg.insertBefore(drawable.domElement, node);
  } else {
    this.svg.appendChild(drawable.domElement);
  }
  this.allDraws[drawable.domElement.id] = drawable;
  this._counter = this._counter + 1;
};

AnnotationEditor.prototype._canDoubleClick = function () {
  // 自由云线允许双击结束绘制。
  if (this.currentOperation && !(this.currentOperation instanceof DrawFreeCloudLineOperation)) {
    return false;
  }
  return true;
}

AnnotationEditor.prototype._createDrawable = function (mode) {
  let drawable = undefined;
  switch (mode) {
    case EditMode.DrawLine:
      drawable = new Line(this.svg);
      break;
    case EditMode.DrawRect:
      drawable = new Rect(this.svg);
      break;
    case EditMode.DrawCircle:
      drawable = new Ellipse(this.svg, true);
      break;
    case EditMode.DrawEllipse:
      drawable = new Ellipse(this.svg, false);
      break;
    case EditMode.DrawArrow:
      drawable = new Arrow(this.svg);
      break;
    case EditMode.DrawFreeLine:
      drawable = new FreeLine(this.svg);
      break;
    case EditMode.DrawText:
      drawable = new Text(this.svg);
      break;
    case EditMode.DrawCloudLine:
      drawable = new CloudLine(this.svg);
      break;
    case EditMode.DrawFreeCloudLine:
      drawable = new FreeCloudLine(this.svg);
      break;
    default:
      break;
  }

  if (drawable) {
    this._setupDrawableStyle(drawable);
  }
  return drawable;
};

AnnotationEditor.prototype._setupDrawableStyle = function (drawable) {
  drawable.strokeWidth = this.drawInfo.strokeWidth;
  drawable.strokeColor = this.drawInfo.strokeColor;
  drawable.fillColor = this.drawInfo.fillColor;
  if (drawable instanceof Text) {
    // 2020年10月15日最新需求，文本不要描边，只要填充
    drawable.strokeColor = "none";
    drawable.strokeWidth = 0;
    drawable.fillColor = this.drawInfo.fillColor === "none" ? "#E02020" : this.drawInfo.fillColor;
    drawable.fontSize = this.drawInfo.fontSize;
    drawable.fontFamily = this.drawInfo.fontFamily;
  }
}

AnnotationEditor.prototype._removeFromSvg = function (drawable) {
  this.svg.removeChild(drawable.domElement);
  this.allDraws[drawable.domElement.id] = undefined;
  delete this.allDraws[drawable.domElement.id];
};

AnnotationEditor.prototype._findDrawableWithMouseEvent = function (event) {
  let target = event.target;
  let drawable = this.allDraws[target.id];
  while (!drawable && target.parentNode) {
    target = target.parentNode;
    drawable = this.allDraws[target.id];
  }
  return drawable;
}

AnnotationEditor.prototype._addSelectorWithTarget = function (drawable, isMultiSelect) {

  if (this._selectorOnTarget(drawable)) {
    return;
  }

  if (isMultiSelect === false) {
    this._removeAllSelector();
  }
  let selector = undefined;
  if (this.selectors.length === 0) {
    selector = this._cachedSelector;
  } else {
    selector = new Selector(this.svg);
  }
  selector.showWithTarget(drawable);
  this._addToSvg(selector);
  this.selectors.push(selector);
  if (this.onSelectElement) {
    this.onSelectElement(drawable);
  }
};

AnnotationEditor.prototype._removeAllSelector = function () {
  let scope = this;
  this.selectors.forEach(function (selector) {
    selector.hide();
    scope._removeFromSvg(selector);
  });
  this.selectors = [];
  if (this.onUnSelectElement) {
    this.onUnSelectElement();
  }
};

AnnotationEditor.prototype._removeSelector = function (selector) {
  selector.hide();
  scope._removeFromSvg(selector);
  for (let i = 0, len = this.selectors.length; i < len; i += 1) {
    if (this.selectors[i] === selector) {
      this.selectors.splice(i, 1);
      break;
    }
  }
  if (this.selectors.length === 0 && this.onUnSelectElement) {
    this.onUnSelectElement();
  }
}

AnnotationEditor.prototype._updateSelectors = function () {

  for (let i = this.selectors.length - 1; i >= 0; i -= 1) {
    let selector = this.selectors[i];
    let drawable = selector.currentTarget();
    if (drawable && this.allDraws[drawable.domElement.id]) {
      selector.draw();
    } else {
      // 已经不在画布上
      this.selectors.splice(i, 1);
      this._removeFromSvg(selector);
    }
  }
  if (this.selectors.length === 0 && this.onUnSelectElement) {
    this.onUnSelectElement();
  }
}

AnnotationEditor.prototype._hitSelector = function (event) {
  let selector = undefined;
  for (let i = 0; i < this.selectors.length; i += 1) {
    let s = this.selectors[i];
    if (s.hitTest(event)) {
      selector = s;
      break;
    }
  }
  return selector;
};

AnnotationEditor.prototype._selectorOnTarget = function (target) {
  for (let i = 0; i < this.selectors.length; i += 1) {
    let s = this.selectors[i];
    if (s.currentTarget() === target) {
      //已经添加过
      return s;
    }
  }
  return undefined;
};

/**
 * 将该操作放到历史里，实现撤销和重做功能。
 */
AnnotationEditor.prototype._saveHistoryOperation = function (operation) {
  let item = undefined;
  if (operation instanceof DrawTextOperation) {
    // 文本操作有点特殊处理
    if (operation.isEdit === true) {
      // 修改文本
      item = new UndoRedoItem([operation.target], UndoRedoType.text, [operation.targetStatusBeforeOperation]);
    } else {
      // 新增文本
      item = new UndoRedoItem([operation.target], UndoRedoType.add);
    }
  } else {
    switch (operation.operationType) {
      case OperationType.Draw:
        item = new UndoRedoItem([operation.target], UndoRedoType.add);
        break;
      case OperationType.Remove:
        item = new UndoRedoItem([operation.target], UndoRedoType.delete);
        break;
      case OperationType.Scale:
        item = new UndoRedoItem([operation.target], UndoRedoType.scale, [operation.targetStatusBeforeOperation]);
        break;
      case OperationType.Move:
        item = new UndoRedoItem([operation.target], UndoRedoType.move, [operation.targetStatusBeforeOperation]);
        break;
      case OperationType.Rotate:
        item = new UndoRedoItem([operation.target], UndoRedoType.rotate, [operation.targetStatusBeforeOperation]);
        break;
      default:
        break;
    }
  }

  if (item) {
    this._undoRedo.insert(item);
  }
}


AnnotationEditor.prototype._saveHistoryDrawableChange = function (drawable, type, eventID) {
  let item = new UndoRedoItem([drawable], type, [drawable.toJson()], eventID);
  this._undoRedo.insert(item);
}

AnnotationEditor.EditMode = EditMode;

export { AnnotationEditor };
