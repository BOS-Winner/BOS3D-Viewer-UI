import {OperationType, Operation} from "./Operation.js";
import {createTextArea} from "../DomUtils.js";


let DrawTextOperation = function (target) {
  Operation.call(this, target);
  this.operationType = OperationType.Draw;
  // 添加文本和编辑都用的这个类，用这个标识来区分。
  this.isEdit = false;
  this._textarea = createTextArea();
};

DrawTextOperation.prototype = Object.assign(Object.create(Operation.prototype), {
  constructor: DrawTextOperation
});

DrawTextOperation.prototype.end = function () {
  this._textarea.onblur = undefined;
  let text = this._textarea.value;
  let drawable = this.target;
  let parent = this._textarea.parentNode;
  parent.removeChild(this._textarea);
  drawable.isDrawing = false;
  drawable.show();
  if (typeof drawable.setText === "function") {
    drawable.setText(text);
  }
  drawable.closePath();
  drawable.draw();
}

DrawTextOperation.prototype.handleMouseUp = function(event) {

  let drawable = this.target;
  if (drawable.isDrawing === false) {
    if (event.button !== 0) {
      return;
    }
    let x = event.offsetX;
    let y = event.offsetY;
    drawable.drawStartPoint.x = x;
    drawable.drawStartPoint.y = y;
    drawable.isDrawing = true;
    if (drawable.svg && drawable.svg.parentNode) {
      this._showTextArea();
    }
  } else if (event.target !== this._textarea) {
    this.end();
    return true;
  }
  return false;
}

DrawTextOperation.prototype.handleDoubleClick = function () {
  let drawable = this.target;
  if (drawable.isDrawing === false) {
    drawable.isDrawing = true;
    if (drawable.svg && drawable.svg.parentNode) {
      this._showTextArea();
      this.isEdit = true;
      drawable.hide();
    }
  }
}

DrawTextOperation.prototype._showTextArea = function () {
  let drawable = this.target;
  let parent = drawable.svg.parentNode;
  this._textarea.style.position = "absolute";
  this._textarea.style.width = "200px";
  this._textarea.style.height = "100px";
  if (drawable.textContent && drawable.textContent.length > 0) {
    this._textarea.value = drawable.textContent;
  }
  this._textarea.style.left = drawable.drawStartPoint.x.toString() + "px";
  this._textarea.style.top = drawable.drawStartPoint.y.toString() + "px";
  this._textarea.style.fontSize = drawable.fontSize + "px";
  this._textarea.style.fontFamily = drawable.fontFamily;
  parent.appendChild(this._textarea);
  this._textarea.focus();
}

export default DrawTextOperation;
