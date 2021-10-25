import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import Modal from "../../Base/Modal";
import AnnotationListItem from "./AnnotationListItem";
import AnnotationStore from "../AnnotationStore";
import style from "./AnnotationList.less";
import { AnnotationEditor } from "../../../Libs/annotation/AnnotationEditor";
import { AntdIcon } from '../../utils/utils';
import Empty from '../../Base/Empty/index';
import { DEFAULT_MODAL_PLACE } from '../../constant.js';

class AnnotationList extends React.Component {
  constructor(props) {
    super(props);
    this.annotionStore = AnnotationStore.getSharedInstance();
    this.refreshList = this.refreshList.bind(this);
    this.state = {
      items: this.annotionStore.getAllAnnotations(),
      showUpdateConfirm: true,
      showDeleteConfirm: true
    };
    this.createAnnotation = this.createAnnotation.bind(this);
    this.deleteAnnotation = this.deleteAnnotation.bind(this);
    this.updateAnnotationBgImage = this.updateAnnotationBgImage.bind(this);
    this.changeAnnotationName = this.changeAnnotationName.bind(this);
  }

  componentDidMount() {
    this.annotionStore.addChangeCallback(this.refreshList);
    // window.setTimeout(() => {
    //   this.createAnnotation()
    // }, 200)
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

  updateAnnotationBgImage(annotation, checked) {
    const viewer = this.props.viewer;
    const scene = _.cloneDeep(viewer.viewerImpl.getSceneState());
    const imageInfo = viewer.viewerImpl.modelManager.getModelSnapshotPhoto();
    const snapshot = {
      code: new Date().getTime().toString(),
      name: '快照',
      description: '',
      cameraState: scene.camera,
      componentState: scene.state,
      highlightComponentsKeys: scene.selection,
      highlightModelsKeys: scene.modelSelection,
    };
    if (snapshot) {
      annotation.snapshot = snapshot;
      AnnotationEditor.changeBackgroundImage(
        annotation.data, imageInfo.imgURL,
        imageInfo.width,
        imageInfo.height);
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
    const { isMobile, HorizontalorVerticalScreen } = this.props;
    const minWidth = isMobile ? 166 : 300;
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
        isMobile={isMobile}
      />
    ));
    const contentDom = listItems && listItems.length === 0 ? (
      <Empty>
        <div>您还没有新建过批注</div>
        <div>点击顶部的"新建批注"试试吧</div>
      </Empty>
    ) : listItems;
    return (
      <div>
        <Modal
          onCancel={() => {
            this.props.close();
          }}
          visible
          title="批注"
          height="70%"
          width={isMobile ? '176px' : '350px'}
          minWidth={minWidth}
          minHeight={340}
          top={DEFAULT_MODAL_PLACE.annotation.top}
          right={DEFAULT_MODAL_PLACE.annotation.right}
          viewportDiv={this.props.viewer.viewportDiv}
          theme={isMobile ? "mobile-theme-one" : ''}
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
      </div>

    );
  }
}

AnnotationList.propTypes = {
  close: PropTypes.func,
  editAnnotation: PropTypes.func,
  viewer: PropTypes.object.isRequired,
};

AnnotationList.defaultProps = {
  close: () => { },
  editAnnotation: () => { },
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  isMobile: state.system.isMobile,
  HorizontalorVerticalScreen: state.system.HorizontalorVerticalScreen,
});
const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AnnotationList);
