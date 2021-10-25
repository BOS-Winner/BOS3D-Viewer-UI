import React, { useRef, useEffect, useState } from 'react';
import PropTypes from "prop-types";
import MiniWindow from "../MiniWindow";
import myContext from "../myContext";
import EVENTS from "../EVENTS";
import CONSTANTS from "../constant";
import style from "./style.less";
import toastr from "../../UI/toastr";
import { mobileCheck, HVScreen } from '../../UI/utils/utils';

function WindowManager(props) {
  const container3DId = useRef(Math.round(Math.random() * 1000).toString());
  const container2DId = useRef(Math.round(Math.random() * 1000).toString());
  const isMobile = mobileCheck();
  const isHVScreen = HVScreen();
  console.log('is mobile:', isMobile, 'is HVScreen', isHVScreen);
  const initContainerSize = useRef(null);
  const windowSize = useRef({
    full: {
      width: 0,
      height: 0,
    },
    small: {
      width: 0,
      height: 0,
    }
  });
  const [mode, setMode] = useState(CONSTANTS.LINKAGE_MODE.ONLY3D);

  const bos2dMinWindow = useRef(null);

  useEffect(() => {
    // 初始化各个实例
    myContext.viewer3D = new myContext.BOS3D.Viewer({
      host: myContext.host,
      viewport: container3DId.current,
    });
    myContext.viewer2D = new myContext.BOS2D.Viewer2D({
      host: myContext.host,
      viewport: container2DId.current,
      linkage: {
        emitter: myContext.emitter,
        EVENTS,
      },
    });
    myContext.bos3dui = new myContext.BOS3DUI({
      viewer3D: myContext.viewer3D,
      BOS3D: myContext.BOS3D,
      linkage: {
        emitter: myContext.emitter,
        EVENTS,
        containerId: props?.id,
      },
    });
    if (myContext.BOS2DUI) {
      myContext.bos2dui = new myContext.BOS2DUI({
        viewer2D: myContext.viewer2D,
        BOS2D: myContext.BOS2D,
        linkage: {
          emitter: myContext.emitter,
          EVENTS,
        },
      });
    }

    // 初始化窗口大小
    const fullCSS = getComputedStyle(document.getElementById(container3DId.current));
    initContainerSize.current = {
      width: parseFloat(fullCSS.width),
      height: parseFloat(fullCSS.height)
    };
    windowSize.current.full.width = parseFloat(fullCSS.width);
    windowSize.current.full.height = parseFloat(fullCSS.height);

    const smallCSS = getComputedStyle(document.getElementById(container2DId.current));
    if (isMobile) {
      console.log('handle mobile');
      windowSize.current.small.width = parseFloat(fullCSS.width) * 0.8;
      windowSize.current.small.height = parseFloat(getComputedStyle(document.querySelector('body')).height) * 0.8 - 48;
    } else {
      windowSize.current.small.width = parseFloat(smallCSS.width);
      windowSize.current.small.height = parseFloat(smallCSS.height);
    }

    // 订阅和触发事件
    myContext.emitter.emit(EVENTS.ON_VIEWER_INIT_COMPLETED);
    // 全屏后改变
    myContext.emitter.on(EVENTS.ON_FULL_SCREEN, () => {
      const html = document.querySelector("html");
      setTimeout(() => {
        windowSize.current.full.width = parseFloat(html.clientWidth);
        windowSize.current.full.height = parseFloat(html.clientHeight);
        myContext.emitter.emit(EVENTS.ON_SWITCH_ONLY3D);
      }, 100);
    });
    // 关闭全屏后
    myContext.emitter.on(EVENTS.ON_CLOSE_SCREEN, () => {
      setTimeout(() => {
        windowSize.current.full.width = initContainerSize.current.width;
        windowSize.current.full.height = initContainerSize.current.height;
        myContext.emitter.emit(EVENTS.ON_SWITCH_ONLY3D);
      }, 100);
    });
    myContext.emitter.on(EVENTS.ON_SWITCH_ONLY3D, () => {
      myContext.viewer3D.resize(
        windowSize.current.full.width,
        windowSize.current.full.height
      );
      myContext.viewer2D.resize(
        windowSize.current.small.width,
        windowSize.current.small.height
      );
      setMode(CONSTANTS.LINKAGE_MODE.ONLY3D);
    });
    myContext.emitter.on(EVENTS.ON_SWITCH_MAIN3D, () => {
      if (
        myContext.viewer3D.getViewerImpl()
          .modelManager.models[myContext.modelKey].configLoader.config.hasDrawing
      ) {
        myContext.viewer3D.resize(
          windowSize.current.full.width,
          windowSize.current.full.height
        );
        myContext.viewer2D.resize(
          windowSize.current.small.width,
          windowSize.current.small.height
        );
        myContext.viewer2D.restoreCameraStatus();
        setMode(CONSTANTS.LINKAGE_MODE.MAIN3D);
      } else {
        toastr.error('', '该模型无图纸数据信息', {
          target: `#${myContext.viewer3D.viewport}`,
        });
      }
    });
    myContext.emitter.on(EVENTS.ON_SWITCH_MAIN2D, () => {
      if (isMobile) {
        myContext.viewer3D.resize(
          464,
          252
        );
        document.querySelector('#mobileToolbar').style.display = 'none';
      } else {
        myContext.viewer3D.resize(
          windowSize.current.small.width,
          windowSize.current.small.height
        );
      }
      myContext.viewer2D.resize(
        windowSize.current.full.width,
        windowSize.current.full.height - parseFloat(CONSTANTS.TITLE_HEIGHT)
      );
      setMode(CONSTANTS.LINKAGE_MODE.MAIN2D);
    });
    myContext.emitter.on(EVENTS.ON_SWITCH_BOTH, () => {
      myContext.viewer3D.resize(
        windowSize.current.full.width / 2,
        windowSize.current.full.height
      );
      myContext.viewer2D.resize(
        windowSize.current.full.width / 2,
        windowSize.current.full.height - parseFloat(CONSTANTS.TITLE_HEIGHT)
      );
      setMode(CONSTANTS.LINKAGE_MODE.BOTH);
    });

    myContext.viewer2D.getViewerImpl()
      .addEventListener(myContext.BOS2D.DRAW_EVENTS.SHOW_DRAW, obj => {
        console.log(obj);
        myContext.loadComponentRelationship();
      });
    // 注册二三维联动需要的事件
    myContext.viewer2D.addOnSelectComponentCallback((keys, ids) => {
      // getSelectedComponentPartKeys
      if (ids && ids.length > 0
      ) {
        let resultKeys = [];
        for (let i = 0, len = ids.length; i < len; i += 1) {
          const rr = myContext.query3DComponentBy2DComponent(ids[i]);
          if (rr) {
            resultKeys = resultKeys.concat(rr);
          }
        }
        if (resultKeys.length) {
          myContext.viewer3D.highlightComponentsByKey(resultKeys);
          myContext.viewer3D.adaptiveSizeByKey(resultKeys);
        } else {
          myContext.viewer3D.highlightComponentsByKey(myContext.convert2DKeyTo3D(keys));
          myContext.viewer3D.adaptiveSizeByKey(myContext.convert2DKeyTo3D(keys));
          // myContext.viewer3D.clearHighlightList();
        }
      } else {
        myContext.viewer3D.clearHighlightList();
      }
    });

    const on3DComponentPick = () => {
      const ids = myContext.viewer3D.getHighlightComponentsKey();
      if (ids && ids.length > 0) {
        let resultKeys = [];
        for (let i = 0, len = ids.length; i < len; i += 1) {
          const rr = myContext.query2DComponentBy3DComponent(ids[i]);
          if (rr) {
            resultKeys = resultKeys.concat(rr);
          }
        }
        if (resultKeys.length) {
          myContext.viewer2D.highlightComponentPartsByKeys(resultKeys);
          myContext.viewer2D.focusOnComponentPartsByKeys(resultKeys);
        } else {
          myContext.viewer2D.highlightComponentsByKeys(myContext.convert3DKeyTo2D(ids));
          myContext.viewer2D.focusOnComponentByKeys(myContext.convert3DKeyTo2D(ids));
          // myContext.viewer2D.clearAllHighlightComponents();
        }
      } else {
        myContext.viewer2D.clearAllHighlightComponents();
      }
    };

    myContext.viewer3D
      .registerModelEventListener(myContext.BOS3D.EVENTS.ON_CLICK_PICK, on3DComponentPick);
    myContext.viewer3D
      .registerModelEventListener(myContext.BOS3D.EVENTS.ON_RECTPICK_ADD, on3DComponentPick);
    myContext.viewer3D
      .registerModelEventListener(myContext.BOS3D.EVENTS.ON_RECTPICK_REMOVE, on3DComponentPick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.id]);

  let className2D = '';
  switch (mode) {
    case CONSTANTS.LINKAGE_MODE.MAIN2D:
      className2D = style.fullWindow;
      break;
    case CONSTANTS.LINKAGE_MODE.MAIN3D:
      className2D = isMobile ? style.mobileSmallWindow : style.smallWindow;
      break;
    case CONSTANTS.LINKAGE_MODE.BOTH:
      className2D = style.halfWindow;
      break;
    case CONSTANTS.LINKAGE_MODE.ONLY3D:
      className2D = style.noWindow;
      break;
    default:
      break;
  }

  let className3D = '';
  switch (mode) {
    case CONSTANTS.LINKAGE_MODE.MAIN2D:
      className3D = isMobile ? style.mobileSmallTdWindow : style.smallWindow;
      break;
    case CONSTANTS.LINKAGE_MODE.ONLY3D:
    case CONSTANTS.LINKAGE_MODE.MAIN3D:
      className3D = style.fullWindow;
      break;
    case CONSTANTS.LINKAGE_MODE.BOTH:
      className3D = style.halfWindow;
      break;
    default:
      break;
  }

  return (
    <div className={style.container}>
      <MiniWindow
        className={className2D}
        title="二维图纸"
        showTitle
        icon={mode === CONSTANTS.LINKAGE_MODE.MAIN3D ? '2D' : ''}
        showCloseIcon
        onClose={() => {
          if (mode === CONSTANTS.LINKAGE_MODE.MAIN2D) {
            myContext.emitter.emit(EVENTS.ON_SWITCH_MAIN3D);
            if (isMobile) bos2dMinWindow.current.reset();
          } else {
            myContext.emitter.emit(EVENTS.ON_SWITCH_ONLY3D);
            if (isMobile) bos2dMinWindow.current.reset();
          }
        }}
        onClickSideIcon={() => {
          myContext.emitter.emit(EVENTS.ON_SWITCH_BOTH);
        }}
        onClickMainIcon={() => {
          myContext.emitter.emit(EVENTS.ON_SWITCH_MAIN2D);
        }}
        onClickPick={() => {
          const tool = myContext.viewer2D.getViewerImpl().controlManager.getToolByName(
            myContext.BOS2D.ToolMode.PICK_BY_RECT
          );
          if (tool) {
            myContext.viewer2D.viewerImpl.controlManager.disableTool(
              myContext.BOS2D.ToolMode.PICK_BY_RECT
            );
          } else {
            myContext.viewer2D.viewerImpl.controlManager.enableTool(
              myContext.viewer2D.getViewerImpl(),
              myContext.BOS2D.ToolMode.PICK_BY_RECT
            );
          }
        }}
        onLayer={() => {
          console.log("图层");
          myContext.emitter.emit(EVENTS.ON_HANDLE_LAYER);
        }}
      >
        <div
          id={container2DId.current}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </MiniWindow>
      <MiniWindow
        className={className3D}
        icon={mode === CONSTANTS.LINKAGE_MODE.MAIN2D ? '3D' : ''}
        title="三维视图"
        showTitle={mode === CONSTANTS.LINKAGE_MODE.MAIN2D}
        showCloseIcon={mode !== CONSTANTS.LINKAGE_MODE.MAIN2D}
        onClickMainIcon={() => {
          myContext.emitter.emit(EVENTS.ON_SWITCH_MAIN3D);
        }}
        ref={bos2dMinWindow}
      >
        <div
          id={container3DId.current}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </MiniWindow>
    </div>
  );
}

WindowManager.propTypes = {
  id: PropTypes.string.isRequired
};

export default WindowManager;
