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
        const drawCanvas = props.viewer.getViewerImpl().canvas;
        const canvas = document.createElement('canvas');
        canvas.width = drawCanvas.width;
        canvas.height = drawCanvas.height;
        const ctx = canvas.getContext("2d");
        props.viewer.getViewerImpl().getViewerDiv().querySelectorAll('canvas').forEach(c => {
          ctx.drawImage(c, 0, 0, canvas.width, canvas.height);
        });
        _d.snapshot = {
          code: new Date().getTime()
            .toString(),
          name: '批注',
          description: '',
          imageURL: canvas.toDataURL(),
          imageWidth: canvas.width,
          imageHeight: canvas.height,
          drawState: {
            camera: _.cloneDeep(props.viewer.getCameraStatus()),
            selectedParts: _.cloneDeep(props.viewer.getSelectedComponentPartKeys()),
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
};

AnnotationEditor.defaultProps = {
  editorData: undefined,
};

const mapStateToProps = (state) => ({
  show: state.bottom.annotationEditor.show,
  editorData: state.bottom.annotationEditor.data,
  viewer: state.system.viewer2D,
});
const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(showAnnotationEditor(false)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AnnotationEditor);
export default WrappedContainer;
