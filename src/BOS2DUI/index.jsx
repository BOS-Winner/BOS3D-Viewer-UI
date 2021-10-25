import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import reducer from "./redux/reducer";
import Viewer2DUI from "./Viewer2DUI";

ConfigProvider.config({
  prefixCls: 'bos3d',
});

class BOS2DUI {
  constructor(props) {
    const viewer2D = props.viewer2D;
    const BOS2D = props.BOS2D;
    const store = createStore(reducer, {
      system: {
        viewer2D,
        viewer: viewer2D,
        BOS2D,
        linkage: props.linkage,
      }
    });
    const viewport = viewer2D.getViewerImpl().domElement;
    viewport.style.position = "relative";
    const noneDisplay = document.createElement("div");
    noneDisplay.setAttribute("style", "display: none;");
    viewport.appendChild(noneDisplay);
    ReactDOM.render(
      ReactDOM.createPortal(
        <ConfigProvider locale={zhCN} prefixCls="bos3d">
          <Viewer2DUI store={store} />
        </ConfigProvider>,
        viewport
      ),
      noneDisplay
    );
  }
}

window.BOS2DUI = BOS2DUI;
