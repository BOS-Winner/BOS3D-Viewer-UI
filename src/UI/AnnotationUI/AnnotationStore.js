import cloneDeep from "lodash-es/cloneDeep";
import generateUUID from "../utils/generateUUID";
import { AnnotationEditor } from "../../Libs/annotation/AnnotationEditor";

let count = 0
/**
 * 所有批注保存在这个类里边
 */
class AnnotationStore {
  constructor() {
    this.annotations = [];
    this.onChangeCallbacks = [];

    // 添加批注的回调函数:(annotation, function:(state,annotation)=>{} ) => {}
    // 参数里的函数是给外部二次开发者调用的，传进来的state如果为true,才会真正的添加批注，
    // 相当于给外部开发者一次拦截的机会。
    // 下面几个类似
    this.addListener = undefined;
    this.deleteListener = undefined;
    this.updateListener = undefined;
    this.renameListener = undefined;
    this.exitListener = undefined;

    // 指向当前编辑视图AnnotationUI
    this.ui = undefined;
  }

  static getSharedInstance () {
    if (!this.instance) {
      this.instance = new AnnotationStore();
    }
    return this.instance;
  }

  /**
   * 添加批注，给外部开发者用，不会走addListener回调
   * @param annotation
   */
  add (annotation) {
    const anno = this._convertOldDataToNewIfNeed(annotation);
    if (!anno) return;
    let result = false;
    for (let i = 0, len = this.annotations.length; i < len; i += 1) {
      if (this.annotations[i].id === anno.id) {
        this.annotations[i] = cloneDeep(anno);
        this._onChange();
        result = true;
        break;
      }
    }
    if (!result) {
      this.annotations.push(anno);
      this._onChange();
    }
  }

  /**
   * 删除批注，给外部开发者用，不会走deleteListener回调
   * @param annotationID
   */
  delete (annotationID) {
    for (let i = 0, len = this.annotations.length; i < len; i += 1) {
      if (this.annotations[i].id === annotationID) {
        this.annotations.splice(i, 1);
        this._onChange();
        break;
      }
    }
  }

  /**
   * 更新批注，给外部开发者用，不会走updateListener回调
   * @param annotation
   */
  update (annotation) {
    for (let i = 0, len = this.annotations.length; i < len; i += 1) {
      if (this.annotations[i].id === annotation.id) {
        this.annotations[i] = cloneDeep(annotation);
        this._onChange();
        break;
      }
    }
  }

  /**
   * 更新批注的名字，给外部开发者调用，不会走renameListener回调
   * @param annotationID
   * @param name
   */
  rename (annotationID, name) {
    for (let i = 0, len = this.annotations.length; i < len; i += 1) {
      if (this.annotations[i].id === annotationID) {
        this.annotations[i].name = name;
        this._onChange();
        break;
      }
    }
  }

  /**
   * 退出编辑器，不触发任何提示，不保存当前修改
   */
  exit () {
    if (this.ui) {
      this.ui.exit();
    }
  }

  /**
   * 程序内部添加批注。（用户点创建批注保存的时候，调用这个函数）
   * 会调用addListener回调，给二次开发者一次拦截机会
   * @param annotation
   */
  addAnnotation (annotation, callback) {
    let result = false;
    for (let i = 0, len = this.annotations.length; i < len; i += 1) {
      if (this.annotations[i].id === annotation.id) {
        this.annotations[i] = cloneDeep(annotation);
        result = true;
        break;
      }
    }
    if (!result) {
      if (typeof this.addListener === "function") {
        const scope = this;
        this.addListener(annotation, (state, annotation2) => {
          if (state) {
            scope.annotations.push(annotation2 || annotation);
            scope._onChange();
            if (callback) {
              callback(annotation);
            }
          }
        });
      } else {
        this.annotations.push(annotation);
        this._onChange();
        if (callback) {
          callback(annotation);
        }
      }
    }
  }

  /**
   * 程序内部删除批注
   * 会调用deleteListener回调，给二次开发者一次拦截机会
   * @param annotationID
   */
  deleteAnnotation (annotationID) {
    let index = -1;
    for (let i = 0, len = this.annotations.length; i < len; i += 1) {
      if (this.annotations[i].id === annotationID) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      if (typeof this.deleteListener === "function") {
        const scope = this;
        this.deleteListener(annotationID, (state) => {
          if (state) {
            scope.annotations.splice(index, 1);
            scope._onChange();
          }
        });
      } else {
        this.annotations.splice(index, 1);
        this._onChange();
      }
    }
  }

  /**
   * 程序内部更新批注（1、在列表界面点击更新批注会调用；2、编辑批注点击保存的时候会调用）
   * 会调用updateListener回调，给二次开发者一次拦截机会
   * @param annotation
   */
  updateAnnotation (annotation, callback) {
    let index = -1;
    for (let i = 0, len = this.annotations.length; i < len; i += 1) {
      if (this.annotations[i].id === annotation.id) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      if (typeof this.updateListener === "function") {
        const scope = this;
        this.updateListener(annotation, (state, annotation2) => {
          if (state) {
            scope.annotations[index] = cloneDeep(annotation2 || annotation);
            scope._onChange();
            if (callback) {
              callback(annotation);
            }
          }
        });
      } else {
        this.annotations[index] = cloneDeep(annotation);
        this._onChange();
        if (callback) {
          callback(annotation);
        }
      }
    }
  }

  /**
   * 设置批注名字
   * 会调用renameListener回调，给二次开发者一次拦截机会
   * @param annotationID
   * @param name
   */
  renameAnnotation (annotationID, name) {
    let index = -1;
    for (let i = 0, len = this.annotations.length; i < len; i += 1) {
      if (this.annotations[i].id === annotationID) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      if (typeof this.renameListener === "function") {
        const scope = this;
        this.renameListener(annotationID, name, (state, newName) => {
          if (state) {
            scope.annotations[index].name = newName || name;
            scope._onChange();
          }
        });
      } else {
        this.annotations[index].name = name;
        this._onChange();
      }
    }
  }

  exitEditAnnotation () {
    if (typeof this.exitListener === "function") {
      const scope = this;
      this.exitListener((state) => {
        if (state && scope.ui) {
          scope.ui.close();
        }
      });
    } else if (this.ui) {
      this.ui.close();
    }
  }

  drawAnnotationToSvg (annotation, svg) {
    AnnotationEditor.drawToSvg(annotation, svg);
  }

  changeAnnotationName (annotation, name) {
    this.renameAnnotation(annotation.id, name);
  }

  createEmptyAnnotation () {
    count++;
    const obj = {};
    obj.id = generateUUID();
    obj.name = `批注${count}`;
    return obj;
  }

  getAllAnnotations () {
    return cloneDeep(this.annotations);
  }

  addChangeCallback (callback) {
    if (typeof callback === "function") {
      this.onChangeCallbacks.push(callback);
    }
  }

  removeChangeCallback (callback) {
    if (typeof callback === "function") {
      for (let i = 0, len = this.onChangeCallbacks.length; i < len; i += 1) {
        if (this.onChangeCallbacks[i] === callback) {
          this.onChangeCallbacks.splice(i, 1);
          break;
        }
      }
    }
  }

  _onChange () {
    for (let i = 0, len = this.onChangeCallbacks.length; i < len; i += 1) {
      const callback = this.onChangeCallbacks[i];
      callback();
    }
  }

  /**
   * 为了兼容旧的批注数据
   * @param annotation
   * @return 转化后的数据，或者undefined（数据有误）
   * @private
   */
  _convertOldDataToNewIfNeed (annotation) {
    if (annotation.id && annotation.data) {
      // 新的格式
      return annotation;
    } else if (annotation.code && annotation.imageURL) {
      // 旧的格式

      const snapshot = {};
      snapshot.cameraState = annotation.cameraState;
      snapshot.componentState = annotation.componentState;
      snapshot.highlightComponentsKeys = annotation.highlightComponentsKeys;
      snapshot.highlightModelsKeys = annotation.highlightModelsKeys;
      const newAnnotation = {};
      newAnnotation.data = {};
      newAnnotation.snapshot = snapshot;
      newAnnotation.id = annotation.code;
      newAnnotation.name = annotation.name;

      newAnnotation.data.width = annotation.width;
      newAnnotation.data.height = annotation.height;
      AnnotationEditor.changeBackgroundImage(
        newAnnotation.data,
        annotation.imageURL,
        annotation.width,
        annotation.height
      );

      return newAnnotation;
    }
    return undefined;
  }
}

export default AnnotationStore;
