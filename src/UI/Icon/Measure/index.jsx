import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { changeMode, changeMouseIcon } from "../action";
import Icon from "../../Base/Icon";
import toastr from "../../toastr";
// import measurePng from "../img/white/measure.png";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';
import MeasureToolbar from "./MeasureToolbar";
import SettingAlert from "./SettingAlert";
import MobileHelper from "./MobileHelper";
import { modeMap, EVENT } from "../../constant";

class Measure extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      setModal: {
        visible: false
      },
      activeMeasureMode: 0,
    };
    this.buttonAction = this.buttonAction.bind(this);

    // 如果初始化视图的时候已经是处于测量模式下
    const viewer = this.props.viewer;
    const PICK_BY_MEASURE = this.props.BIMWINNER.BOS3D.ToolMode.PICK_BY_MEASURE;
    const tool = viewer.viewerImpl.controlManager.getToolByName(PICK_BY_MEASURE);
    if (tool) {
      this.measure = viewer.viewerImpl.measure;
    }
  }

  componentDidUpdate(prevProps) {
    const viewer = this.props.viewer;
    //  Handle mode Tips
    if (
      this.props.modeStack.includes(modeMap.sectionMode)
      && this.props.mode === modeMap.measureMode
    ) {
      toastr.info(`测量模式下,将自动隐藏剖切盒或者剖切面`, "", {
        target: `#${viewer.viewport}`
      });
      this.props.ee.emit(EVENT.handleSectionStatus, false);
    } else if (
      prevProps.mode !== ""
      && prevProps.mode !== modeMap.sectionMode
      && prevProps.mode !== modeMap.measureMode
      && this.props.mode === modeMap.measureMode
    ) {
      toastr.info(`测量模式下将关闭${prevProps.mode}`, "", {
        target: `#${viewer.viewport}`
      });
    }

    // start measure mode
    if (prevProps.mode !== modeMap.measureMode && this.props.mode === modeMap.measureMode) {
      const PICK_BY_MEASURE = this.props.BIMWINNER.BOS3D.ToolMode.PICK_BY_MEASURE;
      viewer.viewerImpl.controlManager.enableTool(viewer.viewerImpl, PICK_BY_MEASURE);
      toastr.info("选定合适视角测量", "", {
        target: `#${viewer.viewport}`
      });
      this.measure = viewer.viewerImpl.measure;
      this.measure.open();
      if (!this.props.modeStack.includes(modeMap.sectionMode)) {
        this.buttonAction(0);
      }
      if (this.measure) {
        this.measure.didEndMeasureCallback = this.didEndMeasureCallback.bind(this);
      }
      viewer.render();
    }
    // 关闭测量
    if (
      this.props.mode !== modeMap.measureMode
      && prevProps.mode === modeMap.measureMode
    ) {
      // this.props.changeMode("");
      const PICK_BY_MEASURE = this.props.BIMWINNER.BOS3D.ToolMode.PICK_BY_MEASURE;
      viewer.viewerImpl.controlManager.disableTool(PICK_BY_MEASURE);
      this.measure.didEndMeasureCallback = undefined;
      this.buttonAction(-1);
      this.measure = undefined;
      this.props.ee.emit(EVENT.handleSectionStatus, true);
      viewer.render();
    }
  }

  handleMeasureStatus = (status = true) => {
    const viewer = this.props.viewer;
    const PICK_BY_MEASURE = this.props.BIMWINNER.BOS3D.ToolMode.PICK_BY_MEASURE;
    if (status) {
      // 启动测量控制器
      viewer.viewerImpl.controlManager.enableTool(viewer.viewerImpl, PICK_BY_MEASURE);
      toastr.info("选定合适视角测量", "", {
        target: `#${viewer.viewport}`
      });
      this.measure = viewer.viewerImpl.measure;
      this.measure.open();
      // 默认测量距离
      this.measure.setCurrentMode("Distance");
      if (this.measure) {
        this.measure.didEndMeasureCallback = this.didEndMeasureCallback.bind(this);
      }
      viewer.render();
    } else {
      viewer.viewerImpl.controlManager.disableTool(PICK_BY_MEASURE);
      this.measure.didEndMeasureCallback = undefined;
      this.buttonAction(-1);
      this.measure = undefined;
      this.props.ee.emit(EVENT.handleSectionStatus, true);
      viewer.render();
    }
  }

  onClick() {
    // Close the measure mode
    if (
      this.props.mode === modeMap.measureMode
      || this.props.modeStack.includes(modeMap.measureMode)
    ) {
      this.props.changeMode(modeMap.exit, modeMap.measureMode);
      // this.buttonAction(-1);
      this.onCancelSetModal();
    } else {
      // start the measure mode
      this.props.changeMode(modeMap.measureMode);
    }
  }

  /**
   * 切换测量模式(距离，角度，面积，体积等)
   * @param {number} index 测量方式的索引
   * @returns {null}
   */
  buttonAction(index) {
    if (!this.measure) {
      const { viewer } = this.props;
      if (this.props.modeStack.includes(modeMap.sectionMode) && index > -1) {
        const PICK_BY_MEASURE = this.props.BIMWINNER.BOS3D.ToolMode.PICK_BY_MEASURE;
        viewer.viewerImpl.controlManager.enableTool(viewer.viewerImpl, PICK_BY_MEASURE);
        toastr.info("选定合适视角测量", "", {
          target: `#${viewer.viewport}`
        });
        this.measure = viewer.viewerImpl.measure;
        this.measure.open();
        if (this.measure) {
          this.measure.didEndMeasureCallback = this.didEndMeasureCallback.bind(this);
        }
        viewer.render();
      } else {
        return;
      }
    }
    if (index === -1) {
      this.measure.setCurrentMode("");
      this.props.changeMouseIcon("");
      this.setState({
        activeMeasureMode: index,
      });
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
    } else if (index === 3) {
      // 体积
      this.measure.setCurrentMode("Volume");
      this.props.changeMouseIcon("测量体积模式");
    } else if (index === 4) {
      // 最小距离

      this.measure.setCurrentMode("MinDistance");
      this.props.changeMouseIcon("测量最小距离模式");
    } else if (index === 5) {
      // 设置校准
      this.measure.setCurrentMode("Adjust");
      this.props.changeMouseIcon("测量校准模式");
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
    }
    // change mode;
    this.setState({
      activeMeasureMode: index,
    });
    this.props.changeMode(modeMap.measureMode);
    this.props.ee.emit(EVENT.handleSectionStatus, false);
  }

  didEndMeasureCallback(result) {
    if (this.measure.getCurrentMode() === "Adjust") {
      // 测量校验弹窗
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
    const { setModal } = this.state;
    const { isMobile, modelDetail } = this.props;
    const selected = (this.props.modeStack.includes(modeMap.measureMode));
    return (
      <div>
        <div
          title="模型测量"
          role="button"
          tabIndex={0}
          onClick={() => {
            this.onClick();
          }}
        >
          {/* <Icon img={measurePng} selected={selected} /> */}
          <Icon
            icon={<AntdIcon type="iconceliang" className={iconstyle.icon} />}
            title="测量"
            selected={selected}
          />
        </div>
        {
          selected
            ? (
              <MeasureToolbar
                parentNode={this.props.viewer.viewportDiv}
                buttonAction={this.buttonAction}
                close={() => {
                  this.onClick();
                }}
                isMobile={isMobile}
                modelDetail={modelDetail}
                viewer={this.props.viewer}
                activeMeasureMode={this.state.activeMeasureMode}
              />
            )
            : null
        }
        {selected && this.props.BIMWINNER.BOS3D.DeviceTest.isMobileDevice() && <MobileHelper />}

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
      </div>
    );
  }
}

Measure.propTypes = {
  changeMode: PropTypes.func.isRequired,
  changeMouseIcon: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  modeStack: PropTypes.array.isRequired,
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
  isMobile: PropTypes.bool,
  modelDetail: PropTypes.object,
  ee: PropTypes.object.isRequired,
};

Measure.defaultProps = {
  isMobile: false,
  modelDetail: {}
};

const mapStateToProps = (state) => ({
  mode: state.button.mode,
  modeStack: state.button.modeStack,
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
  isMobile: state.system.isMobile,
  HorizontalorVerticalScreen: state.system.HorizontalorVerticalScreen,
  modelDetail: state.system.model,
  ee: state.system.eventEmitter,
});
const mapDispatchToProps = (dispatch) => ({
  changeMode: (mode, exitMode) => {
    dispatch(changeMode(mode, exitMode));
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
