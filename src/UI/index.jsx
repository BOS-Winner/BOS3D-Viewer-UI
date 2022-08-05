import React from 'react';
import ReactDOM from "react-dom";
import EventEmitter from "events";
import { createStore } from "redux";
import _ from "lodash-es";
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import reducer from "./reducer";
import Viewer3DUI from './Viewer3DUI';
import {
  snapshotLn, markLn, roadnetLn, roamRecord
} from "./generateListener";
import AnnotationStore from "./AnnotationUI/AnnotationStore";
import uaFactory from "./userActionFactory";
import {
  setToolbarState, changeDisplaySetting, setCustomToolbarState, changeBestView, changeBaking
} from "./userRedux/userSetting/action";
import { DEFAULT_TOOL } from "./constant";
import { mobileCheck, HVScreen } from "./utils/utils";

ConfigProvider.config({
  prefixCls: 'bos3d',
});

class BOS3DUI {
  constructor(props) {
    const ee = new EventEmitter();
    const viewer3D = props.viewer3D;
    const BIMWINNER = props.BOS3D ? { BOS3D: props.BOS3D } : props.BIMWINNER;
    const store = createStore(
      reducer,
      {
        system: {
          viewer3D: props.viewer3D,
          BIMWINNER,
          apiVersion: props.apiVersion || 'api',
          eventEmitter: ee,
          DOMMark: new BIMWINNER.BOS3D.DOMMark(props.viewer3D),
          SpriteMark: new BIMWINNER.BOS3D.SpriteMark(props.viewer3D),
          offline: props.offline || false,
          linkage: props.linkage,
          customMenu: props.customMenu || [], // 用户自定义右键菜单
          treeNodeStatistic: props.treeNodeStatistic || { layer: 0, order: true }, // 开启模型树中节点统计，layer: 层级 ，order：顺序（true：正序，false：倒序）
          isMobile: mobileCheck(),
          HorizontalorVerticalScreen: HVScreen()
        },
      },
      process.env.NODE_ENV === 'development'
        ? window.__REDUX_DEVTOOLS_EXTENSION__?.({
          trace: true,
          stateSanitizer: state => (state.system ? { ...state, system: {} } : state),
        })
        : undefined
    );
    store.dispatch(setToolbarState(
      _.assign(_.cloneDeep(DEFAULT_TOOL), props.funcOption)
    ));
    // 存储用户自定义工具栏配置，方便用户恢复默认
    store.dispatch(setCustomToolbarState(
      _.assign(_.cloneDeep(DEFAULT_TOOL), props.funcOption)
    ));
    store.dispatch(changeDisplaySetting(
      'enableSelectionOutline',
      BIMWINNER.BOS3D.GlobalData.EnableSelectionOutline
    ));
    store.dispatch(changeDisplaySetting(
      'enableSelectionBoundingBox',
      BIMWINNER.BOS3D.GlobalData.EnableSelectionBoundingBox
    ));
    store.dispatch(changeDisplaySetting(
      'enableSelectionByTranslucent',
      BIMWINNER.BOS3D.GlobalData.EnableSelectionByTranslucent
    ));
    // 将内部UI接口向外映射，供外部调用
    this.snapshot = snapshotLn(ee, store);
    this.annotionStore = AnnotationStore.getSharedInstance();
    this.mark = markLn(ee);
    this.roadnet = roadnetLn(ee);
    this.roamRecord = roamRecord(ee);
    this.plugin = uaFactory(ee);
    this.changeBestViewVisible = (visible) => {
      store.dispatch(changeBestView(visible));
    };
    this.changeCloudBakingVisible = visible => {
      store.dispatch(changeBaking(visible));
    };
    const viewport = viewer3D.viewportDiv;
    viewport.style.position = "relative";
    const noneDisplay = document.createElement("div");
    noneDisplay.setAttribute("style", "display: none;");
    viewport.appendChild(noneDisplay);

    // destory function
    this.destory = () => {
      ReactDOM.unmountComponentAtNode(noneDisplay);
    };
    // 添加全局的提示
    ReactDOM.render(
      ReactDOM.createPortal(
        <ConfigProvider locale={zhCN} prefixCls="bos3d">
          <Viewer3DUI store={store} />
        </ConfigProvider>,
        viewport
      ),
      noneDisplay
    );
  }
}

export default BOS3DUI;
