import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import cloneDeep from "lodash-es/cloneDeep";
import { Modal as AntdModal } from 'antd';
import style from "./index.less";
import { AnnotationEditor } from "../../Libs/annotation/AnnotationEditor";
import ToolbarItem from './ToolbarItem/ToolbarItem';
import AnnotationStore from "./AnnotationStore";
import ImageMover from "./ImageMover";
// import Alert from "../Base/Alert/Alert";
import Modal from "../Base/Modal";
import MainPanel from "./MainPanel";
import { ButtonAction, BUTTON_ICONS } from './resource';
import ComfirmContent from './ComfirmContent';

class Annotation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      attribute: {},
      disableActions: [
        ButtonAction.Delete,
        ButtonAction.Undo,
        ButtonAction.Redo,
        ButtonAction.Drag,
        ButtonAction.ZoomOut
      ],
      selectedButton: undefined,
      drawableInSelectAction: {}, // 在选择状态下，选中的是哪个类型批注
      isModalVisible: false,
      isUpdate: false,
    };
    this.haveUnSavedStuff = false;
    this.rootRef = React.createRef();
    this.svgContainerRef = React.createRef();
    this.colorBoardContainerRef = React.createRef();
    this.annotionStore = AnnotationStore.getSharedInstance();
    this.initEditor(props);
    this.toolbarButtonAction = this.toolbarButtonAction.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.setStrokeColor = this.setStrokeColor.bind(this);
    this.setStrokeWidth = this.setStrokeWidth.bind(this);
    this.setFillColor = this.setFillColor.bind(this);
    this.setFontSize = this.setFontSize.bind(this);
    this.setText = this.setText.bind(this);
    this.save = this.save.bind(this);
    this.close = this.close.bind(this);
    const clientWidth = this.props.viewer.viewportDiv
      ? this.props.viewer.viewportDiv.clientWidth
      : this.props.viewer.getViewerImpl().domElement.clientWidth;
    this.isSmallMobile = clientWidth < 760;
  }

  componentDidMount() {
    this.annotionStore.ui = this;
    // 背景色与模型背景色一致
    const pstyle = window.getComputedStyle(this.rootRef.current.parentNode);
    this.rootRef.current.style.background = pstyle.background;
    const parent = this.svgContainerRef.current;
    this.editor.setSize(parent.clientWidth, parent.clientHeight);
    parent.appendChild(this.editor.svg);

    // 一定要在svg被添加到屏幕上之后再绘制其中的元素，否则的话，有些函数例如getBBox会返回0
    if (this.props.editorData) {
      this.editor.fromJson(this.props.editorData.data);
      this.editor.draw();
      this.annotation = this.props.editorData;
      this.handleIsUpdate();
    }
    if (this.props.snapshot) {
      const { imageURL, imageWidth, imageHeight } = this.props.snapshot;
      this.editor.setBackgroundImage(imageURL, imageWidth, imageHeight);
    }
    this.resetAttributePanel();
  }

  componentWillUnmount() {
    this.editor.destroy();
    this.editor = undefined;
    this.annotionStore.ui = undefined;
  }

  handleIsUpdate = () => {
    this.setState({
      isUpdate: true,
    });
  }

  initEditor() {
    this.editor = new AnnotationEditor(500, 500);
    this.onSelectSvgElement = this.onSelectSvgElement.bind(this);
    this.onChangeSvgElement = this.onChangeSvgElement.bind(this);
    this.onUnSelectElement = this.onUnSelectElement.bind(this);
    this.editor.onUndoRedo = this.onUndoRedo.bind(this);
    this.editor.onSelectElement = this.onSelectSvgElement;
    this.editor.onChangeElement = this.onChangeSvgElement;
    this.editor.onDrawElement = this.onChangeSvgElement;
    this.editor.onRemoveElement = this.onChangeSvgElement;
    this.editor.onUnSelectElement = this.onUnSelectElement;
  }

  resetAttributePanel() {
    const drawInfo = this.editor.getCurrentDrawInfo();
    this.setState({
      attribute: drawInfo
    });
  }

  toolbarButtonAction(action) {
    if (this.state.selectedButton === action) return;
    switch (action) {
      case ButtonAction.Select:
        this.editor.setCurrentMode(AnnotationEditor.EditMode.Select);
        break;
      case ButtonAction.DrawLine:
        this.editor.setCurrentMode(AnnotationEditor.EditMode.DrawLine);
        break;
      case ButtonAction.DrawFreeLine:
        this.editor.setCurrentMode(AnnotationEditor.EditMode.DrawFreeLine);
        break;
      case ButtonAction.DrawArrow:
        this.editor.setCurrentMode(AnnotationEditor.EditMode.DrawArrow);
        break;
      case ButtonAction.DrawRect:
        this.editor.setCurrentMode(AnnotationEditor.EditMode.DrawRect);
        break;
      case ButtonAction.DrawCircle:
        this.editor.setCurrentMode(AnnotationEditor.EditMode.DrawCircle);
        break;
      case ButtonAction.DrawEllipse:
        this.editor.setCurrentMode(AnnotationEditor.EditMode.DrawEllipse);
        break;
      case ButtonAction.DrawCloudLine:
        this.editor.setCurrentMode(AnnotationEditor.EditMode.DrawCloudLine);
        break;
      case ButtonAction.DrawFreeCloudLine:
        this.editor.setCurrentMode(AnnotationEditor.EditMode.DrawFreeCloudLine);
        break;
      case ButtonAction.DrawText:
        this.editor.setCurrentMode(AnnotationEditor.EditMode.DrawText);
        break;
      case ButtonAction.Undo:
        this.editor._removeAllSelector();
        this.editor.undo();
        break;
      case ButtonAction.Redo:
        this.editor.redo();
        break;
      case ButtonAction.Delete:
        this.editor.removeAllSelectedElement();
        break;
      case ButtonAction.Drag:
        this.editor.setCurrentMode(AnnotationEditor.EditMode.Drag);
        break;
      case ButtonAction.ZoomIn:
        this.editor._removeAllSelector();
        this.editor.zoomIn();
        if (!this.editor.canZoomIn()) {
          this.disableAction(ButtonAction.ZoomIn);
        }
        this.enableAction(ButtonAction.ZoomOut);
        this.enableAction(ButtonAction.Drag);
        break;
      case ButtonAction.ZoomOut:
        this.editor._removeAllSelector();
        this.editor.zoomOut();
        if (!this.editor.canZoomOut()) {
          this.disableAction(ButtonAction.ZoomOut);
          this.disableAction(ButtonAction.Drag);
          if (this.editor.getCurrentMode() === AnnotationEditor.EditMode.Drag) {
            this.editor.setCurrentMode(AnnotationEditor.EditMode.Select);
            this.setState({
              selectedButton: ButtonAction.Select
            });
          }
        }
        this.enableAction(ButtonAction.ZoomIn);
        break;
      default:
        break;
    }
    if (action !== ButtonAction.Undo
      && action !== ButtonAction.Redo
      && action !== ButtonAction.Delete
      && action !== ButtonAction.ZoomOut
      && action !== ButtonAction.ZoomIn) {
      this.setState({
        selectedButton: action
      });
    }
    // 切换不同的标签需要重置颜色
    this.resetDrawInfoCfg();
    this.resetAttributePanel();
    this.setState({
      drawableInSelectAction: {}
    });
  }

  onChangeSvgElement() {
    this.haveUnSavedStuff = true;
  }

  onSelectSvgElement(drawable) {
    this.resetAttributePanel();
    this.enableAction(ButtonAction.Delete);
    if (drawable && drawable.type) {
      this.setState({ drawableInSelectAction: drawable });
    }
  }

  onUnSelectElement() {
    this.disableAction(ButtonAction.Delete);
  }

  onUndoRedo(canUndo, canRedo) {
    if (canUndo) {
      this.enableAction(ButtonAction.Undo);
    } else {
      this.disableAction(ButtonAction.Undo);
    }
    if (canRedo) {
      this.enableAction(ButtonAction.Redo);
    } else {
      this.disableAction(ButtonAction.Redo);
    }
  }

  resetDrawInfoCfg() {
    const _initDrawCfg = {
      fillColor: "none",
      strokeColor: "#E02020",
      strokeWidth: 5,
      fontSize: 16,
    };
    this.editor.clearFillColor();
    this.editor.setStrokeColor(_initDrawCfg.strokeColor);
    this.editor.setStrokeWidth(_initDrawCfg.strokeWidth, Date.now());
    this.editor.setTextFontSize(_initDrawCfg.fontSize, Date.now());
  }

  setStrokeColor(color) {
    this.editor.setStrokeColor(color);
    this.resetAttributePanel();
  }

  setStrokeWidth(width, eventID) {
    this.editor.setStrokeWidth(width, eventID);
    this.resetAttributePanel();
  }

  setFillColor(color) {
    if (color === "none") {
      this.editor.clearFillColor();
    } else {
      this.editor.setFillColor(color);
    }
    this.resetAttributePanel();
  }

  setFontSize(size, eventID) {
    this.editor.setTextFontSize(size, eventID);
    this.resetAttributePanel();
  }

  setText(text) {
    this.editor.setText(text);
    this.resetAttributePanel();
  }

  save() {
    const data = this.editor.toJson();
    const callback = (annotation) => {
      this.annotation = annotation;
      this.props.onSave(data);
      this.haveUnSavedStuff = false;
      this.setState({
        isModalVisible: true
      });
    };
    if (this.annotation) {
      const annotation = cloneDeep(this.annotation);
      annotation.data = data;
      this.annotionStore.updateAnnotation(annotation, callback);
    } else {
      const annotation = this.annotionStore.createEmptyAnnotation();
      annotation.data = data;
      annotation.snapshot = {
        code: this.props.snapshot.code,
        name: this.props.snapshot.name,
        description: this.props.snapshot.description,
        cameraState: this.props.snapshot.cameraState,
        componentState: this.props.snapshot.componentState,
        highlightComponentsKeys: this.props.snapshot.highlightComponentsKeys,
        highlightModelsKeys: this.props.snapshot.highlightModelsKeys,
        // 图纸会有这个属性，但没有上述相机和高亮相关的状态，因为二者概念不一致
        drawState: this.props.snapshot.drawState,
      };
      this.annotionStore.addAnnotation(annotation, callback);
    }
  }

  close() {
    if (this.haveUnSavedStuff) {
      this.showAlert();
    } else {
      this.props.onClose();
    }
  }

  exit() {
    this.props.onClose();
  }

  disableAction(action) {
    const disableActions = this.state.disableActions;
    if (disableActions.indexOf(action) === -1) {
      disableActions.push(action);
      this.setState({
        disableActions
      });
    }
  }

  enableAction(action) {
    this.setState(prv => {
      const disableActions = prv.disableActions;
      for (let i = disableActions.length - 1; i >= 0; i -= 1) {
        if (disableActions[i] === action) {
          disableActions.splice(i, 1);
        }
      }
      return {
        disableActions
      };
    });
  }

  showAlert() {
    this.setState({
      isModalVisible: true
    });
  }

  onKeyUp(event) {
    const keyCode = event.keyCode;
    if (keyCode === 8) {
      if (this.editor.getCurrentMode() === AnnotationEditor.EditMode.Select) {
        this.editor.removeAllSelectedElement();
      }
    }
  }

  isActionDisable(action) {
    return this.state.disableActions.indexOf(action) !== -1;
  }

  render() {
    const { drawableInSelectAction } = this.state;
    const { editorData, isMobile } = this.props;
    const modalWidth = isMobile ? 300 : 350;
    return (
      <div ref={this.rootRef} className={style.container}>
        <div role="presentation" ref={this.svgContainerRef} tabIndex={-1} className={style["svg-container"]} onKeyUp={this.onKeyUp} />

        <div className={style.imageMoverContainer}>
          <ImageMover
            buttonAction={this.toolbarButtonAction}
            disableActions={this.state.disableActions}
            moveSelected={this.state.selectedButton === ButtonAction.Drag}
          />
        </div>

        {this.rootRef.current && (
          <Modal
            visible
            onCancel={() => {

            }}
            title={editorData ? "编辑批注" : "新建批注"}
            top={isMobile ? '1%' : '10%'}
            left={isMobile ? '10%' : 'initial'}
            right={isMobile ? 'initial' : '1%'}
            height="auto"
            width={`${modalWidth}px`}
            minWidth={modalWidth}
            minHeight={340}
            viewportDiv={this.rootRef.current}
            closable={false}
          >
            <MainPanel
              disableActions={this.state.disableActions}
              buttonAction={this.toolbarButtonAction}
              selectedButton={this.state.selectedButton}
              strokeColor={this.state.attribute.strokeColor}
              strokeWidth={this.state.attribute.strokeWidth}
              fillColor={this.state.attribute.fillColor}
              fontSize={this.state.attribute.fontSize}
              setStrokeWidth={this.setStrokeWidth}
              setStrokeColor={this.setStrokeColor}
              setFillColor={this.setFillColor}
              setFontSize={this.setFontSize}
              setText={this.setText}
              isTextAttri={this.editor.getCurrentMode() === AnnotationEditor.EditMode.DrawText || this.state.attribute.type === "Text"}
              drawableInSelectAction={drawableInSelectAction}
              isMobile={isMobile}
            />
          </Modal>
        )}

        <div className={style.rightTopContainer}>
          <ToolbarItem title="保存" icon={BUTTON_ICONS.saveIcon} onClick={this.save} />
          <ToolbarItem title="退出" icon={BUTTON_ICONS.closeIcon} onClick={() => { this.annotionStore.exitEditAnnotation() }} />
        </div>

        <AntdModal width={280} style={{ top: 'calc(50% - 162px' }} visible={this.state.isModalVisible} getContainer={false} footer={null} maskClosable={false} closable={false} wrapClassName={style.confirmModal}>
          <ComfirmContent
            haveUnSavedStuff={this.haveUnSavedStuff}
            onClose={this.props.onClose}
            update={this.state.isUpdate}
            handleUpdate={this.handleIsUpdate}
            onCancel={() => {
              this.setState({
                isModalVisible: false
              });
            }}
          />
        </AntdModal>
      </div>
    );
  }
}

Annotation.propTypes = {
  snapshot: PropTypes.object,
  editorData: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  viewer: PropTypes.object.isRequired,
  isMobile: PropTypes.bool,
};

Annotation.defaultProps = {
  snapshot: undefined,
  editorData: undefined,
  onClose: () => { },
  onSave: () => { },
  isMobile: false,
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
)(Annotation);

export { Annotation };
