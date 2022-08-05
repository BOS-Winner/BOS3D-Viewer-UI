import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import Modal from "Base/Modal";
import AnnotationListItem from "AnnotationUI/AnnotationList/AnnotationListItem";
import AnnotationStore from "AnnotationUI/AnnotationStore";
import style from "AnnotationUI/AnnotationList/AnnotationList.less";
import { AnnotationEditor } from "Libs/annotation/AnnotationEditor";
import Empty from "../../../UI/Base/Empty";
import { showAnnotationEditor, showAnnotationList, changeMode } from "../../redux/bottomRedux/action";
import { AntdIcon, mobileCheck } from '../../../UI/utils/utils';
// import * as MODE from "../../redux/bottomRedux/mode";

class AnnotationList extends React.Component {
  constructor(props) {
    super(props);
    this.annotionStore = AnnotationStore.getSharedInstance();
    this.refreshList = this.refreshList.bind(this);
    this.annotionStore.addChangeCallback(this.refreshList);
    this.state = {
      items: this.annotionStore.getAllAnnotations(),
      showUpdateConfirm: true,
      showDeleteConfirm: true
    };
    this.createAnnotation = this.createAnnotation.bind(this);
    this.deleteAnnotation = this.deleteAnnotation.bind(this);
    this.updateAnnotationBgImage = this.updateAnnotationBgImage.bind(this);
    this.changeAnnotationName = this.changeAnnotationName.bind(this);
    this.isMobile = mobileCheck();
  }

  createAnnotation() {
    this.props.editAnnotation();
  }

  deleteAnnotation(annotationID, checked) {
    this.annotionStore.deleteAnnotation(annotationID);
    if (checked) {
      this.setState({
        showDeleteConfirm: false
      });
    }
  }

  // componentDidUpdate() {
  //   this.props.changeMode(MODE.annotation);
  // }

  updateAnnotationBgImage(annotation, checked) {
    const viewer = this.props.viewer;
    const canvas = viewer.getViewerImpl().canvas;
    const selectedParts = this.props.viewer.getSelectedComponentPartKeys();
    let cloneSelectInfo = {};
    const { GlobalData: { UseWebGL } } = this.props.BOS2D;
    if (selectedParts[0] && UseWebGL) {
      cloneSelectInfo.componentPartKey = selectedParts[0].componentPartKey;
    } else {
      cloneSelectInfo = _.cloneDeep(selectedParts);
    }
    const snapshot = {
      code: new Date().getTime().toString(),
      name: '批注',
      description: '',
      drawState: {
        camera: _.cloneDeep(viewer.getCameraStatus()),
        selected: cloneSelectInfo,
      }
    };
    if (snapshot) {
      annotation.snapshot = snapshot;
      AnnotationEditor.changeBackgroundImage(
        annotation.data, canvas.toDataURL(),
        canvas.width,
        canvas.height);
      this.annotionStore.updateAnnotation(annotation);
    }
    if (checked) {
      this.setState({
        showUpdateConfirm: false
      });
    }
  }

  refreshList() {
    this.setState({
      items: this.annotionStore.getAllAnnotations()
    });
  }

  changeAnnotationName(annotation, name) {
    this.annotionStore.changeAnnotationName(annotation, name);
  }

  componentWillUnmount() {
    this.annotionStore.removeChangeCallback(this.refreshList);
  }

  render() {
    const listItems = this.state.items.map((item) => (
      <AnnotationListItem
        key={item.id}
        updateAnnotationBgImage={this.updateAnnotationBgImage}
        itemData={item}
        editAnnotation={this.props.editAnnotation}
        deleteAnnotation={this.deleteAnnotation}
        changeAnnotationName={this.changeAnnotationName}
        viewer={this.props.viewer}
        showDeleteConfirm={this.state.showDeleteConfirm}
        showUpdateConfirm={this.state.showUpdateConfirm}
      />
    ));
    const contentDom = listItems && listItems.length === 0 ? (
      <Empty>
        <div>您还没有新建过批注</div>
        <div>点击顶部的&quot;新建批注&ldquo;试试吧</div>
      </Empty>
    ) : listItems;
    const customMobile = this.isMobile ? {
      top: '10px',
      right: '80px'
    } : {};
    return (
      <Modal
        onCancel={() => {
          this.props.close();
        }}
        visible={this.props.visible}
        title="批注"
        height="70%"
        minWidth={300}
        minHeight={340}
        {...customMobile}
        viewportDiv={this.props.viewer.getViewerImpl().domElement}
      >
        <div className={style.container}>
          <button className={style.createButton} type="button" onClick={this.createAnnotation}>
            <AntdIcon type="iconplus" />
            {' '}
            新建批注
          </button>
          <div className={style.listContainer}>
            {
              contentDom
            }
          </div>
        </div>
      </Modal>
    );
  }
}

AnnotationList.propTypes = {
  close: PropTypes.func.isRequired,
  editAnnotation: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  changeMode: PropTypes.func.isRequired,
  BOS2D: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer2D,
  BOS2D: state.system.BOS2D,
  visible: state.bottom.showAnnotationList,
});
const mapDispatchToProps = (dispatch) => ({
  editAnnotation: data => dispatch(showAnnotationEditor(true, data)),
  close: () => dispatch(showAnnotationList(false)),
  changeMode: mode => {
    dispatch(changeMode(mode));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AnnotationList);
