import React from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import Bottom from "./Toolbar/Bottom";
import Measure from "./Component/Measure";
import CptInfo from "./Component/CptInfo";
import Setting from "./Component/Setting";
import BackToHome from "./Component/BackToHome";
import DrawSwitcher from "./Component/DrawSwitcher";
import LayerSwitcher from "./Component/LayerSwitcher";
import AnnotationList from "./Component/Annotation/AnnotationList";
import AnnotationEditor from "./Component/Annotation/AnnotationEditor";
import "../UI/theme/default.less";

function Viewer2DUI(props) {
  React.useEffect(() => {
    const viewer = props.store.getState().system.viewer2D;
    viewer.getViewerImpl().domElement.classList.add('bos2dui');
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
        <LayerSwitcher />
        <AnnotationList />
        <AnnotationEditor />
      </Provider>
    </React.StrictMode>
  );
}

Viewer2DUI.propTypes = {
  store: PropTypes.object.isRequired,
};

export default Viewer2DUI;
