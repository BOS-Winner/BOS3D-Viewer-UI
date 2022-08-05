import React from "react";
import PropTypes from "prop-types";
import _ from "lodash-es";
import { connect } from "react-redux";
import { Annotation } from "AnnotationUI";
import { showAnnotationEditor } from "../../redux/bottomRedux/action";

function AnnotationEditor(props) {
  const data = React.useMemo(() => {
    const _d = {};
    if (props.show) {
      if (props.editorData) {
        _d.editorData = props.editorData;
      } else {
        const { GlobalData: { UseWebGL } } = props.BOS2D;
        let screenShotCanvas = document.createElement("canvas");
        const selectedParts = props.viewer.getSelectedComponentPartKeys();
        let cloneSelectInfo = {};
        props.viewer.screenShot((_canvas) => {
          screenShotCanvas = _canvas;
        });
        if (UseWebGL) {
          if (selectedParts[0]) {
            cloneSelectInfo.componentPartKey = selectedParts[0].componentPartKey;
          }
          // UseWebGL 模式下需要先渲染一遍再截图
          props.viewer.viewerImpl.scene.render();
        } else {
          cloneSelectInfo = _.cloneDeep(selectedParts);
        }
        _d.snapshot = {
          code: new Date().getTime()
            .toString(),
          name: '批注',
          description: '',
          imageURL: screenShotCanvas.toDataURL(),
          imageWidth: screenShotCanvas.width,
          imageHeight: screenShotCanvas.height,
          drawState: {
            camera: _.cloneDeep(props.viewer.getCameraStatus()),
            selectedParts: cloneSelectInfo,
          }
        };
      }
    }
    return _d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.show]);
  return (
    props.show ? (
      <Annotation
        viewer={props.viewer}
        snapshot={data.snapshot}
        editorData={data.editorData}
        onClose={props.onClose}
      />
    ) : <></>
  );
}

AnnotationEditor.propTypes = {
  show: PropTypes.bool.isRequired,
  editorData: PropTypes.object,
  viewer: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  BOS2D: PropTypes.object.isRequired
};

AnnotationEditor.defaultProps = {
  editorData: undefined,
};

const mapStateToProps = (state) => ({
  show: state.bottom.annotationEditor.show,
  editorData: state.bottom.annotationEditor.data,
  viewer: state.system.viewer2D,
  BOS2D: state.system.BOS2D,
});
const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(showAnnotationEditor(false)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AnnotationEditor);
export default WrappedContainer;
