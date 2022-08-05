import React from "react";
import ReactDOM from "react-dom";
import EventEmitter from "events";
import myContext from "./myContext";
import WindowManager from "./WindowManager";
import EVENTS from "./EVENTS";

/**
 * @class Linakge
 * @desc 二三维联动模块
 */
class Linkage {
  /**
   * @constructor
   * @param {object} props - 参数
   * @param {object} props.host - host，目前bos3d和bos2d要求用同一个host
   * @param {object} props.BOS3D - BOS3D对象
   * @param {object} props.BOS2D - BOS2D对象
   * @param {object} props.BOS3DUI - BOS3DUI对象
   * @param {object} props.BOS2DUI - BOS2DUI对象
   * @param {function} [props.onInitComplete] - 初始化完成后的callback
   * @param {string} props.selector - css selector,用来将联动模块渲染到指定的元素上
   */
  constructor(props) {
    this.token = props.token;
    this.share = props.share;
    this.viewerInitComplete = false;
    this.waitLoadList = [];
    myContext.host = props.host;
    myContext.BOS3D = props.BOS3D;
    myContext.BOS2D = props.BOS2D;
    myContext.BOS3DUI = props.BOS3DUI;
    myContext.BOS2DUI = props.BOS2DUI;
    myContext.token = props.token;
    myContext.share = props.share;

    const emitter = new EventEmitter();
    myContext.emitter = emitter;

    emitter.on(EVENTS.ON_VIEWER_INIT_COMPLETED, () => {
      this._clearWaitLoadList();
      this.viewer3D = myContext.viewer3D;
      this.viewer2D = myContext.viewer2D;
      this.bos3dui = myContext.bos3dui;
      if (typeof props.onInitComplete === 'function') {
        props.onInitComplete();
      }
      // const css = getComputedStyle(document.querySelector(props.selector));
      // myContext.containerSize = {
      //   width: parseFloat(css.width),
      //   height: parseFloat(css.height),
      // };
      // 图纸数据加载为空的监听事件
      myContext.viewer2D.registerDrawEventListener(
        myContext.BOS2D.DRAW_EVENTS.DRAW_EMPTY,
        (data) => {
          console.log(data);
        });
    });
    // 获取需要挂载的dom元素
    const container = document.querySelector(props.selector);
    const [, id] = props.selector.split('#');
    this.containerId = id;
    ReactDOM.render(<WindowManager id={id} />, container);
  }

  addView(modelKey, projKey) {
    if (this.viewerInitComplete) {
      myContext.viewer3D.addView(modelKey, projKey, this.token, this.share);
      myContext.viewer2D.addView(modelKey, projKey, this.token, this.share);
      myContext.modelKey = modelKey;
    } else {
      this.waitLoadList.push([modelKey, projKey]);
    }
  }

  removeView(modelKey) {
    myContext.viewer3D.removeView(modelKey);
    myContext.viewer2D.removeView(modelKey);
  }

  _clearWaitLoadList() {
    this.viewerInitComplete = true;
    this.waitLoadList.forEach(item => {
      this.addView(item[0], item[1]);
    });
    this.waitLoadList = [];
  }

  _cameraListener3D(event) {
    // 更新绘制
    const camera = event.camera;
    const position = camera.getWorldPosition(new myContext.BOS3D.THREE.Vector3());
    const direction = camera.getWorldDirection(new myContext.BOS3D.THREE.Vector3());
    myContext.viewer2D.show3DCamera([
      position.x,
      position.y
    ], [
      direction.x,
      direction.y
    ]);
  }

  _cameraListener2D(event) {
    const viewer3DImpl = myContext.viewer3D.getViewerImpl();
    const position = event.position;
    const camera = viewer3DImpl.camera;
    viewer3DImpl.locateToPoint({
      x: position[0],
      y: position[1],
      z: camera.position.z
    });
  }

  showCameraState() {
    // 3D无对应构件时不聚焦
    const viewer2D = myContext.viewer2D;
    const viewer3D = myContext.viewer3D;
    if (viewer3D && viewer2D) {
      viewer3D.registerCameraEventListener(myContext.BOS3D.EVENTS.ON_CAMERA_CHANGE, this._cameraListener3D);
      const viewer2DImpl = viewer2D.getViewerImpl();
      viewer2DImpl.cameraControl.addEventListener(myContext.BOS2D.EVENTS.ON_VIEWER3D_CAMERA_CHANGE, this._cameraListener2D);
    }
  }

  hideCameraState() {
    // 3D无对应构件时不聚焦
    const viewer2D = myContext.viewer2D;
    const viewer3D = myContext.viewer3D;
    if (viewer3D && viewer2D) {
      viewer3D.unregisterCameraEventListener(myContext.BOS3D.EVENTS.ON_CAMERA_CHANGE, this._cameraListener3D);
      const viewer2DImpl = viewer2D.getViewerImpl();
      viewer2DImpl.cameraControl.removeEventListener(myContext.BOS2D.EVENTS.ON_VIEWER3D_CAMERA_CHANGE, this._cameraListener2D);
    }
  }
}

export default Linkage;
