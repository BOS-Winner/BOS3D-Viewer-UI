import React from "react";
import PropTypes from "prop-types";
import { Popover } from 'antd';
import { saveSvgAsPng } from "save-svg-as-png";
import SmallConfirm from "Base/SmallConfirm";
import style from "./AnnotationListItem.less";
import AnnotationStore from "../AnnotationStore";
import { AntdIcon } from '../../utils/utils';
import AnnotationForm from './AnnotationForm';
import ImgPreview from "../ImgPreview";
import Modal from "../../Base/Modal";

const DEFAULT_NAME = "批注名字";

class AnnotationListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editName: false,
      previewModal: {
        visible: false
      },
      confirmModalVisiable: false,
      isPopoverVisible: false
    };
    this.svgContainer = React.createRef();
    this.edit = this.edit.bind(this);
    this.delete = this.delete.bind(this);
    this.annotationClicked = this.annotationClicked.bind(this);
    this.rootRef = React.createRef();
    this.previewRef = React.createRef();
  }

  componentDidUpdate() {
    this.reset();
  }

  componentDidMount() {
    this.reset();
  }

  reset() {
    const itemData = this.props.itemData;
    if (itemData && this.svgContainer.current) {
      // itemData包含data和id
      const data = itemData.data;
      if (data) {
        if (this.svg && this.svg.parentNode) {
          this.svg.parentNode.removeChild(this.svg);
        }
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        this.svg = svg;
        // 计算缩放
        const parent = this.svgContainer.current;
        parent.appendChild(this.svg);
        const svgWidth = data.width;
        const svgHeight = data.height;
        const parentRect = parent.getBoundingClientRect();
        const scale1 = parentRect.width / parentRect.height;
        const scale2 = svgWidth / svgHeight;
        let width = parentRect.width;
        let height = parentRect.height;
        if (scale1 > scale2) {
          width = height * scale2;
        } else {
          height = width / scale2;
        }
        this.svg.setAttributeNS(null, "width", width);
        this.svg.setAttributeNS(null, "height", height);
        this.svg.setAttributeNS(null, "viewBox", `0 0 ${svgWidth} ${svgHeight}`);
        AnnotationStore.getSharedInstance().drawAnnotationToSvg(data, this.svg);
      }
    }
  }

  edit() {
    this.setState({
      isPopoverVisible: false
    });
    this.props.editAnnotation(this.props.itemData);
  }

  delete() {
    if (this.props.showDeleteConfirm) {
      this.setState({
        confirmModalVisiable: true
      });
    } else {
      this.props.deleteAnnotation(this.props.itemData.id);
    }
  }

  annotationClicked() {
    const snap = this.props.itemData.snapshot;
    if (this.props.isMobile) {
      this.onPreview();
    }
    if (snap) {
      const viewer = this.props.viewer;
      if (snap.drawState) {
        viewer.setCameraStatus(snap.drawState.camera);
        viewer.highlightComponentPartsByKeys(snap.drawState.selectedParts);
      } else {
        const state = {
          camera: snap.cameraState,
          state: snap.componentState,
          selection: snap.highlightComponentsKeys,
          modelSelection: snap.highlightModelsKeys
        };
        viewer.getViewerImpl().setSceneState(state);
      }
    }
  }

  editName() {
    this.setState({
      editName: true
    });
  }

  cancelEditName() {
    this.setState({
      editName: false
    });
  }

  inputKeyDown(event) {
    if (event.keyCode === 13) {
      this.setName();
    }
  }

  setName(name) {
    const tempName = name || '';
    this.setState({
      editName: false
    });
    if (!tempName.trim()) {
      return;
    }
    this.props.changeAnnotationName(this.props.itemData, tempName);
  }

  downloadImage() {
    saveSvgAsPng(this.svg, `${this.props.itemData.name || DEFAULT_NAME}.png`, {
      fonts: []
    });
  }

  onPreview() {
    this.setState({
      isPopoverVisible: false
    });
    const parent = this.previewRef.current;
    const cloneSvg = this.svg.cloneNode(true);
    parent.innerHTML = "";
    parent.appendChild(cloneSvg);
    this.setState({
      previewModal: {
        visible: true,
        url: ''
      }
    });
  }

  onPopoverVisibleChange = visible => {
    this.setState({ isPopoverVisible: visible });
  };

  render() {
    const { previewModal, confirmModalVisiable, isPopoverVisible } = this.state;
    const { isMobile } = this.props;
    let name = this.props.itemData.name;
    if (!name || name.length === 0) {
      name = DEFAULT_NAME;
    }
    // console.log(this.props.itemData, 'this.props.itemData');
    const ActionJSXInMobile = (
      <div className={`${style.mobileActionWrap}`}>
        <button type="button" className={`${style.actionBtn}  bos-btn `} onClick={() => { this.edit() }}>
          {' '}
          <AntdIcon type="iconedit" />
          {' '}
          编辑批注
        </button>
        <button type="button" className={`${style.actionBtn} bos-btn `} onClick={() => { this.downloadImage() }}>
          {' '}
          <AntdIcon type="icondownload" />
          {' '}
          下载批注
        </button>
      </div>
    );

    return (
      <div ref={this.rootRef} className={style.container}>
        <div className={style.header}>
          {
            this.state.editName
              ? <AnnotationForm initValue={name} type="name" isMobile={isMobile} onSubmit={this.setName.bind(this)} cancelEdit={this.cancelEditName.bind(this)} />
              : (
                <span role="presentation" onClick={this.editName.bind(this)} className={style.name}>
                  <AntdIcon type="iconicon_edit" />
                  {' '}
                  {name}
                </span>
              )
          }
        </div>
        <div className={style.centerContent}>
          <div
            role="presentation"
            className={style.preview}
            title="点击浏览模型批注"
            ref={this.svgContainer}
            onClick={this.annotationClicked}
          />

          <span role="presentation" className={style.remove} onClick={() => { this.delete() }} />
          {
            !isMobile && (
              <div className={style.action}>
                <button type="button" className={`${style.actionBtn}  bos-btn bos-btn-primary`} onClick={() => { this.onPreview() }}>
                  {' '}
                  <AntdIcon type="iconcomponentvisible" />
                  {' '}
                  预览批注
                </button>
                <button type="button" className={`${style.actionBtn}  bos-btn bos-btn-primary`} onClick={() => { this.edit() }}>
                  {' '}
                  <AntdIcon type="iconedit" />
                  {' '}
                  编辑批注
                </button>
                <button type="button" className={`${style.actionBtn} bos-btn bos-btn-primary`} onClick={() => { this.downloadImage() }}>
                  {' '}
                  <AntdIcon type="icondownload" />
                  {' '}
                  下载批注
                </button>
              </div>
            )
          }
          {isMobile && (
            <div className={`${style.mobileFooter}`}>
              <Popover
                placement="topRight"
                trigger="click"
                overlayClassName={style.mobilePopOverlayClass}
                content={ActionJSXInMobile}
                visible={isPopoverVisible}
                onVisibleChange={this.onPopoverVisibleChange}
              >
                <div className={`${style.mobileMoreAction}`}><AntdIcon type="iconicon_more_1" /></div>
              </Popover>
            </div>
          )}
        </div>
        {
          <Modal
            visible={previewModal.visible}
            onCancel={() => {
              this.setState({
                previewModal: {
                  visible: false
                }
              });
            }}
            title="预览批注"
            top={isMobile ? '10%' : undefined}
            height="70%"
            width="46%"
            right="27%"
            minWidth={350}
            minHeight={330}
            viewportDiv={this.props.viewer.getViewerImpl().domElement}
          >
            <ImgPreview>
              <div className={style.previewInModal} ref={this.previewRef} />
            </ImgPreview>
          </Modal>
        }
        {confirmModalVisiable && this.props.showDeleteConfirm && (
          <div className={style.confirmContainer}>
            <div>
              <SmallConfirm
                title="确定删除此批注吗？"
                isMobile={isMobile}
                type="danger"
                onOk={neverConfirm => {
                  this.props.deleteAnnotation(this.props.itemData.id, neverConfirm);
                  this.setState({ confirmModalVisiable: false });
                }}
                onCancel={neverConfirm => { this.setState({ confirmModalVisiable: false }) }}
              />
            </div>
          </div>
        )}

      </div>
    );
  }
}

AnnotationListItem.propTypes = {
  itemData: PropTypes.object,
  deleteAnnotation: PropTypes.func,
  editAnnotation: PropTypes.func,
  updateAnnotationBgImage: PropTypes.func,
  changeAnnotationName: PropTypes.func,
  viewer: PropTypes.object.isRequired,
  showUpdateConfirm: PropTypes.bool,
  showDeleteConfirm: PropTypes.bool,
  isMobile: PropTypes.bool,

};

AnnotationListItem.defaultProps = {
  itemData: {},
  deleteAnnotation: () => { },
  editAnnotation: () => { },
  updateAnnotationBgImage: () => { },
  changeAnnotationName: () => { },
  showUpdateConfirm: true,
  showDeleteConfirm: true,
  isMobile: false
};

export default AnnotationListItem;
