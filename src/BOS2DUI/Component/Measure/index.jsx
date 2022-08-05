import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import toastr from "customToastr";
import SettingAlert from "../../../UI/Icon/Measure/SettingAlert";
import MobileHelper from "../../../UI/Icon/Measure/MobileHelper";
// import AdjustAlert from "../../../UI/Icon/Measure/AdjustAlert";
import MeasureToolbar from "./MeasureToolbar";
import { changeMode, changeMouseIcon } from "../../redux/bottomRedux/action";
import * as MODE from "../../redux/bottomRedux/mode";
import "./index.less";

class Measure extends React.Component {
  constructor(props) {
    super(props);
    this.buttonAction = this.buttonAction.bind(this);
    this.state = {
      setModal: {
        visible: false
      }
    };

    // 如果初始化视图的时候已经是处于测量模式下
    const viewer = this.props.viewer;
    const PICK_BY_MEASURE = this.props.BOS2D.ToolMode.PICK_BY_MEASURE;
    const tool = viewer.viewerImpl.controlManager.getToolByName(PICK_BY_MEASURE);
    if (tool) {
      this.measure = viewer.viewerImpl.measure;
    }
  }

  componentDidUpdate(prevProps) {
    // 开启测量
    if (prevProps.mode !== MODE.pickByMeasure && this.props.mode === MODE.pickByMeasure) {
      const viewer = this.props.viewer;
      const PICK_BY_MEASURE = this.props.BOS2D.ToolMode.PICK_BY_MEASURE;
      viewer.viewerImpl.controlManager.enableTool(viewer.viewerImpl, PICK_BY_MEASURE);
      toastr.info("选定合适视角测量", "", {
        target: viewer.getViewerImpl().domElement,
      });
      this.measure = viewer.viewerImpl.measure;
      this.measure.open();
      this.measure.setCurrentMode("Distance");
      if (this.measure) {
        this.measure.didEndMeasureCallback = this.didEndMeasureCallback.bind(this);
      }
      viewer.render();
    }
    // 关闭测量
    if (this.props.mode !== MODE.pickByMeasure && prevProps.mode === MODE.pickByMeasure) {
      const viewer = this.props.viewer;
      const PICK_BY_MEASURE = this.props.BOS2D.ToolMode.PICK_BY_MEASURE;
      viewer.viewerImpl.controlManager.disableTool(PICK_BY_MEASURE);
      this.measure.didEndMeasureCallback = undefined;
      this.measure = undefined;
      viewer.render();
    }
  }

  onClick() {
    if (this.props.mode === "测量模式") {
      this.onCancelSetModal();
    }
  }

  buttonAction(index) {
    if (!this.measure) {
      return;
    }
    if (index === 0) {
      // 距离
      this.measure.setCurrentMode("Distance");
      this.props.changeMouseIcon("测量距离模式");
    } else if (index === 1) {
      // 角度
      this.measure.setCurrentMode("Angle");
      this.props.changeMouseIcon("测量角度模式");
    } else if (index === 2) {
      // 面积
      this.measure.setCurrentMode("Area");
      this.props.changeMouseIcon("测量面积模式");
    } else if (index === 5) {
      // 设置校准
      this.props.changeMouseIcon("测量距离模式");
      this.measure.setCurrentMode("Adjust");
    } else if (index === 6) {
      // 设置测量
      this.setState({
        setModal: {
          type: 'Setting',
          visible: true,
          allUnits: this.measure.supportUnits(),
          unit: this.measure.getCurrentUnit(),
          precision: this.measure.getCurrentPrecision(),
        }
      });
    } else if (index === 7) {
      // 删除
      this.measure.removeSelectedMeasure();
    } else if (index === 8) {
      console.log("测量体积");
      // 测量体积
      this.measure.setCurrentMode("Volume");
    } else if (index === 9) {
      console.log("最小距离");
      // 测量最小距离
      this.measure.setCurrentMode("MinDistance");
    } else {
      // 点击取消选择
      this.measure.setCurrentMode("");
      this.props.changeMouseIcon("");
    }
  }

  didEndMeasureCallback(result) {
    if (this.measure.getCurrentMode() === "Adjust") {
      // 测量校验弹窗
      // console.log('result', result)
      this.setState({
        setModal: {
          type: 'Adjust',
          visible: true,
          allUnits: this.measure.supportUnits(),
          unit: result.unit,
          value: result.value,
        }
      });
    }
  }

    // 取消设置的弹窗
    onCancelSetModal = () => {
      this.setState({
        setModal: {
          visible: false
        }
      });
    }

    // 确认设置
    onOkSet = (obj) => {
      console.log(`确认设置`, obj);
      const { setModal } = this.state;
      if (setModal.type === 'Setting') {
        // 弹窗设置回调
        if (obj.unit) {
          this.measure.setUnit(obj.unit);
        }
        if (obj.precision) {
          this.measure.setPrecision(obj.precision);
        }
      }
      if (setModal.type === 'Adjust') {
        // 设置测量校验
        if (obj !== undefined) {
          this.measure.setAdjustForCurrentAdjustItem(obj.unit, obj.value);
        }
      }
    }

  cancelCurrentAdjust = () => {
    this.measure.cancelCurrentAdjust();
  }

  render() {
    const selected = (this.props.mode === MODE.pickByMeasure);
    const { isMobile } = this.props;
    const { setModal } = this.state;

    return (
      <>
        {
          selected
            ? (
              <MeasureToolbar
                parentNode={this.props.viewer.viewportDiv}
                buttonAction={this.buttonAction}
              />
            )
            : null
        }
        { selected && this.props.BOS2D.DeviceTest.isMobileDevice() && <MobileHelper /> }

        {selected && setModal.visible && (
          <SettingAlert
            parentNode={this.props.viewer.viewportDiv}
            allUnits={setModal.allUnits}
            unit={setModal.unit}
            precision={setModal.precision}
            value={setModal.value}
            type={setModal.type}
            onOk={this.onOkSet}
            cancelAdjust={this.cancelCurrentAdjust}
            close={this.onCancelSetModal}
            isMobile={isMobile}
          />
        )}
      </>
    );
  }
}

Measure.propTypes = {
  changeMouseIcon: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  viewer: PropTypes.object.isRequired,
  BOS2D: PropTypes.object.isRequired,
  isMobile: PropTypes.bool,
};

Measure.defaultProps = {
  isMobile: false
};

const mapStateToProps = (state) => ({
  mode: state.bottom.mode,
  viewer: state.system.viewer2D,
  BOS2D: state.system.BOS2D,
});
const mapDispatchToProps = (dispatch) => ({
  changeMode: mode => {
    dispatch(changeMode(mode));
  },
  changeMouseIcon: mode => {
    dispatch(changeMouseIcon(mode));
  },
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Measure);

export default WrappedContainer;
