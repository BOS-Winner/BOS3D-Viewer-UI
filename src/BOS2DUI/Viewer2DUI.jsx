import React from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import toastr from "toastr";
import Bottom from "./Toolbar/Bottom";
import Measure from "./Component/Measure";
import CptInfo from "./Component/CptInfo";
import Setting from "./Component/Setting";
import BackToHome from "./Component/BackToHome";
import DrawSwitcher from "./Component/DrawSwitcher";
import ViewSwitcher from "./Component/ViewSwitcher";
import LayerSwitcher from "./Component/LayerSwitcher";
import AnnotationList from "./Component/Annotation/AnnotationList";
import AnnotationEditor from "./Component/Annotation/AnnotationEditor";
import MouceIcon from "./Component/MouceIcon";
import "../UI/theme/default.less";

function Viewer2DUI(props) {
  React.useEffect(() => {
    const viewer = props.store.getState().system.viewer2D;
    const BOS2D = props.store.getState().system.BOS2D;
    viewer.getViewerImpl().domElement.classList.add('bos2dui');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // 注册图纸加载错误通知
    viewer.registerDrawEventListener(BOS2D.DRAW_EVENTS.DRAW_LOAD_ERROR, () => {
      toastr.error("图纸加载错误", "", {
        target: viewer.getViewerImpl().domElement,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.StrictMode>
      <Provider store={props.store}>
        <Bottom />
        <Measure />
        <Setting />
        <CptInfo />
        <BackToHome />
        <DrawSwitcher />
        <ViewSwitcher />
        <LayerSwitcher />
        <AnnotationList />
        <AnnotationEditor />
        <MouceIcon />
      </Provider>
    </React.StrictMode>
  );
}

Viewer2DUI.propTypes = {
  store: PropTypes.object.isRequired,
};

export default Viewer2DUI;
