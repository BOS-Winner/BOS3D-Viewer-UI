/**
 * @author 郭少涛
 * @create 2019/7/16 13 :00
 * @class UndoRedo
 **/

/**
 * 这里用了逻辑比较简单的实现方式：
 * 当drawable发生变化，保存变化之前的状态，撤销的时候直接替换
 * 优点是不需要计算，代码比较简单，缺点是消耗内存
 */

let UndoRedo = function (editor) {
  this._undoList = [];
  this._redoList = [];
  this.editor = editor;
  // (undoListCount, redoListCount) => {}
  this.onListChangeCallback = undefined;
}

UndoRedo.prototype.undo = function () {
  if (this._undoList.length > 0 ) {
    let item = this._undoList.pop();
    let drawable = item.targets[0];
    if (item.type === UndoRedoType.add) {
      this.editor.deleteDrawable(drawable);
      item.type = UndoRedoType.delete;
      this._redoList.push(item);
    } else if (item.type === UndoRedoType.delete) {
      this.editor.addDrawable(drawable);
      item.type = UndoRedoType.add;
      this._redoList.push(item);
    } else {
      for (let i = 0, len = item.targets.length; i < len; i += 1) {
        let t = item.targets[i];
        let b = item.attributes[i];
        item.attributes[i] = this.editor.changeDrawable(t, b);
      }
      this._redoList.push(item)
    }
    if (this.onListChangeCallback) {
      this.onListChangeCallback(this._undoList.length, this._redoList.length);
    }
  }

}

UndoRedo.prototype.redo = function () {
  if (this._redoList.length > 0 ) {
    let item = this._redoList.pop();
    let drawable = item.targets[0];
    if (item.type === UndoRedoType.add) {
      this.editor.deleteDrawable(drawable);
      item.type = UndoRedoType.delete;
      this._undoList.push(item);
    } else if (item.type === UndoRedoType.delete) {
      this.editor.addDrawable(drawable);
      item.type = UndoRedoType.add;
      this._undoList.push(item);
    } else {
      for (let i = 0, len = item.targets.length; i < len; i += 1) {
        let t = item.targets[i];
        let b = item.attributes[i];
        item.attributes[i] = this.editor.changeDrawable(t, b);
      }
      this._undoList.push(item)
    }
    if (this.onListChangeCallback) {
      this.onListChangeCallback(this._undoList.length, this._redoList.length);
    }
  }
}

UndoRedo.prototype.insert = function (undoRedoItem) {
  // 每次进行新的操作之后要清空重做队列
  if (this._redoList.length > 0) {
    this._redoList = [];
  }
  if (this._undoList.length > 0 ) {
    let lastItem = this._undoList[this._undoList.length - 1];
    if (lastItem.eventID && lastItem.eventID === undoRedoItem.eventID) {
      // 连续操作值记录第一次的操作，中间的都省略。
      return;
    }
  }
  this._undoList.push(undoRedoItem);
  if (this.onListChangeCallback) {
    this.onListChangeCallback(this._undoList.length, this._redoList.length);
  }
}

/**
 * 除了add、move意外的都可以归为一类，表示属性发生变化，分这么细有助于扩展。
 */
const UndoRedoType = {
  delete: "delete",
  add: "add",
  move: "move",
  scale: "scale",
  rotate: "rotate",
  fillColor: "fillColor",
  strokeColor: "strokeColor",
  strokeWidth: "strokeWidth",
  fontSize: "fontSize",
  fontFamily: "fontFamily",
  text: "text"
}

/**
 * 表示一个历史操作
 * @param targets 对应的drawables
 * @param type 操作类型，见UndoRedoType
 * @param attributes 操作之前序列化后的属性数组
 * @param eventID 操作唯一标识，用来识别连续的操作，比如连续改变strokeWidth，这样只会保存为一次操作。
 * @constructor
 * 注： 之所以用数组，是为以后多选功能预留，同时操作多个元素。
 */

let UndoRedoItem = function (targets, type, attributes, eventID) {
  this.targets = targets;
  this.type = type;
  this.attributes = attributes;
  this.eventID = eventID;
}

export {
  UndoRedoType,
  UndoRedoItem,
  UndoRedo
};
