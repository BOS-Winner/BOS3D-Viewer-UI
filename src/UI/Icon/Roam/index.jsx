import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import Modal from "Base/Modal";
import Card from "Base/Card";
import { changeMode, changeMouseIcon } from "../action";
// import Instructions from "./Instructions";
import FreeRoamOption from "./FreeRoamOption";
import RouteRoam from "./RouteRoam";
import RoamRecord from "./RoamRecord";
import MobileHelper from "./MobileHelper";
import SubTitle from "../../Base/SubTitle";
import toastr from "../../toastr";
import style from "./style.less";
import { AntdIcon } from "../../utils/utils";
import iconstyle from "../../Toolbar/bottom.less";
// 图片资源
import direction01 from './img/directionItem.png';
import direction02 from './img/directionItem2.png';
import speedtip from './img/speedtip.png';
import updowntip from './img/updowntip.png';
import mousetip from './img/mousetip.png';
import { DEFAULT_MODAL_PLACE, EVENT } from "../../constant";

class Roam extends React.Component {
  constructor(props) {
    super(props);
    const cameraControl = props.viewer.getViewerImpl().cameraControl;
    this.enableChangeManHeight = !!cameraControl.getRealManHeight;
    this.state = {
      dialogVisible: false,
      showTips: false,
      routeRoamVisible: false,
      freeRoam: false,
      roamRecordVisible: false,
      manHeight: this.enableChangeManHeight
        ? cameraControl.getRealManHeight() / 1000
        : 1.5,

      // 改版后新增参数
      currentMode: "",
      ShowRoamSettingPanel: true, // 显示漫游控制面板，默认打开
      ShowOperationTip: true, // 显示漫游提示面板， 默认打开
      ShowRouteRoamPanel: true,
      ShowRouteRecordPanel: true,
    };
  }

  componentDidMount() {
    this.props.eventEmitter.on(EVENT.handleRoamRecordStatus, (status = false) => {
      const {
        BIMWINNER: { BOS3D },
        viewer,
      } = this.props;
      if (status) {
        // 每次开始漫游前先取消下漫游模式
        BOS3D.Plugins.Roam.Roam.cancelRoam(viewer);

        // 开启自由漫游
        BOS3D.Plugins.Roam.FreeRoam.startFreeRoam(viewer);
      } else {
        BOS3D.Plugins.Roam.Roam.cancelRoam(viewer);
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.mode !== "漫游模式"
      && this.props.mode === "漫游模式"
      // && prevProps.mode !== ""
    ) {
      // componentDidUpdate 方法执行了两遍，所以把它放到异步队列
      window.setTimeout(() => {
        toastr.info(`进入漫游模式，其他窗口将自动关闭`, "", {
          target: `#${this.props.viewer.viewport}`,
        });
      });
    }

    // 如果关闭漫游模式
    if (prevProps.mode === "漫游模式" && this.props.mode !== "漫游模式") {
      // 漫游模式切换到其他模式需要重新设置此项
      // this.props.viewer.viewerImpl.controlManager.setControlMode(this.props.viewer.viewerImpl, "pick");
      const {
        BIMWINNER: { BOS3D },
        viewer,
      } = this.props;
      BOS3D.Plugins.Roam.Roam.cancelRoam(viewer);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        routeRoamVisible: false,
        roamRecordVisible: false,
        freeRoam: false,
        showTips: false,
        dialogVisible: false
      });
    }
  }

  changeDialog(visible) {
    // 关闭漫游modal框
    this.setState({
      dialogVisible: visible,
    });
    this.props.changeMode("");
  }

  // 点击漫游icon
  onClick = () => {
    const selected = this.props.mode === "漫游模式";
    // 在漫游模式则退出，否则切换选择漫游模式对话框的显隐
    if (selected) {
      this.changeDialog(false);
    } else {
      // 在这里要判断是不是移动端模式
      if (this.props.BIMWINNER.BOS3D.DeviceTest.isMobileDevice()) {
        this.freeRoam();
        return;
      }
      this.setState((state) => ({
        dialogVisible: !state.dialogVisible,
      }));
      // 默认开启自由漫游
      this.freeRoam();
    }
  }

  freeRoam() {
    const {
      BIMWINNER: { BOS3D },
      viewer,
    } = this.props;
    // 每次开始漫游前先取消下漫游模式
    BOS3D.Plugins.Roam.Roam.cancelRoam(viewer);

    // 开启自由漫游
    BOS3D.Plugins.Roam.FreeRoam.startFreeRoam(viewer);

    // 移动端不显示tips
    const showTips = !this.props.BIMWINNER.BOS3D.DeviceTest.isMobileDevice();

    // 切换全局状态
    this.props.changeMode("漫游模式");
    this.setState({
      showTips,
      freeRoam: true,
      currentMode: "自由漫游",
      ShowOperationTip: true, // 默认打开
    });
  }

  routeRoam() {
    const {
      BIMWINNER: { BOS3D },
      viewer,
    } = this.props;
    // 每次开始漫游前先取消下漫游模式
    BOS3D.Plugins.Roam.Roam.cancelRoam(viewer);

    // 开启路径漫游
    this.freeRoam();
    // 切换状态
    this.setState({
      routeRoamVisible: true,
      currentMode: "路径漫游",
      ShowOperationTip: false, // 如果开始漫游的话就关闭提示
    });
    this.props.changeMode("漫游模式");
    this.props.changeMouseIcon("路径漫游模式");
  }

  roamRecord() {
    const {
      BIMWINNER: { BOS3D },
      viewer,
    } = this.props;
    // 每次开始漫游前先取消下漫游模式
    BOS3D.Plugins.Roam.Roam.cancelRoam(viewer);

    // 开启路径漫游
    this.freeRoam();

    this.props.changeMode("漫游模式");
    this.props.changeMouseIcon("漫游录制模式");
    this.setState({
      roamRecordVisible: true,
      currentMode: "漫游记录",
      ShowOperationTip: false, // 如果开始漫游的话就关闭提示
    });
  }

  // 修改漫游配置
  changeGlobalConfig(checked, mode, opt) {
    const {
      BIMWINNER: { BOS3D },
      viewer,
    } = this.props;
    if (mode === "manHeight") {
      this.setState((state) => ({
        ...state,
        manHeight: opt.value,
      }));
      return;
    }
    BOS3D.Plugins.Roam.Roam.changeRoamConfig(viewer, checked, mode, opt);
  }

  // 控制视角编辑器位置
  handleEditorPosition = ({ top, right, width }) => {
    const editorDom = document.querySelector("#editorModal");
    if (editorDom) {
      editorDom.style.top = `${top}px`;
      editorDom.style.right = `${right + width}px`;
    }
  }

  render() {
    const selected = this.props.mode === "漫游模式";
    const {
      currentMode,
      ShowRoamSettingPanel,
      ShowOperationTip,
      ShowRouteRoamPanel,
      ShowRouteRecordPanel
    } = this.state;
    const roamMode = [
      {
        icon: "iconfreeroam",
        title: "自由漫游",
        func: () => this.freeRoam(),
        active: currentMode === "自由漫游",
      },
      {
        icon: "iconpathroaming",
        title: "路径漫游",
        func: (e) => this.routeRoam(e),
        active: currentMode === "路径漫游",
      },
      {
        icon: "iconroamingrecording",
        title: "漫游录制",
        func: (e) => this.roamRecord(e),
        active: currentMode === "漫游记录",
      },
    ];

    // 更多漫游提示
    const moreRoamTip = [
      {
        title: "调整速度",
        img: speedtip,
      },
      {
        title: '调整视角',
        img: mousetip,
      },
      {
        title: '上移和下移',
        img: updowntip,
      }
    ];
    return (
      <div
        title="漫游"
        role="button"
        tabIndex={0}
        onClick={() => {
          this.onClick();
        }}
      >
        {/* 漫游模式移动端开启 */}
        {this.state.freeRoam
          && this.props.BIMWINNER.BOS3D.DeviceTest.isMobileDevice() && (
          <MobileHelper />
        )}

        {/* 工具条中的图标按钮 */}
        <Icon
          selected={selected}
          icon={<AntdIcon type="iconroam" className={iconstyle.icon} />}
          title="漫游"
        />

        {/* 漫游弹窗 */}
        <Modal
          visible={this.state.dialogVisible}
          onCancel={() => {
            this.changeDialog(false);
          }}
          title="漫游"
          width="350px"
          height="auto"
          top={DEFAULT_MODAL_PLACE.roam.top}
          right={DEFAULT_MODAL_PLACE.roam.right}
          left={DEFAULT_MODAL_PLACE.roam.left}
          minWidth={350}
          minHeight={500}
          viewportDiv={this.props.viewer.viewportDiv}
          DragCallBack={this.handleEditorPosition}
          id="roamDom"
        >
          {/* 漫游模式 */}
          <div className={style.modeContainer}>
            {roamMode.map((item) => (
              <Card
                key={item.title}
                icon={item.icon}
                title={item.title}
                func={item.func}
                active={item.active}
                customStyle={{ width: "98px", margin: "0" }}
              />
            ))}
          </div>
          {/* 漫游设置标题 */}
          <SubTitle
            title="漫游设置"
            onChange={() => {
              this.setState(state => ({
                ShowRoamSettingPanel: !state.ShowRoamSettingPanel
              }));
            }}
            // 只有在漫游过程中才可以展示漫游设置
            unfoldStatus={ShowRoamSettingPanel}
            disabled={!currentMode}
          />
          {/* 漫游设置 */}
          {
            ShowRoamSettingPanel ? (
              <FreeRoamOption
                onChange={(mode, checked, opt) => this.changeGlobalConfig(checked, mode, opt)}
                realManHeight={this.state.manHeight}
                BOS3D={this.props.BIMWINNER.BOS3D}
                viewer={this.props.viewer}
                modelDetail={this.props.modelDetail}
              />
            ) : null
          }

          {/* 操作提示标题 */}
          <SubTitle
            title="操作提示"
            onChange={() => {
              this.setState(state => ({
                ...state,
                ShowOperationTip: !state.ShowOperationTip
              }));
            }}
            customStyle={{ margin: 0 }}
            // 只有在漫游过程中才可以展示漫游设置
            unfoldStatus={ShowOperationTip}
          />

          {/* 操作提示 */}
          {ShowOperationTip ? (
            <div className={style.tipContainer}>
              {/* 小标题 */}
              <span className={style.subTitle}>漫游操作</span>
              {/* 方向提示 */}
              <div className={style.directionGroup}>
                <div className={style.item}>
                  <img src={direction01} alt="方向" />
                </div>
                <div className={style.item}>
                  <img src={direction02} alt="方向" />
                </div>
              </div>
              {/* 文字提示 */}
              <div className={style.tipText}>
                <span>Shift + 方向键</span>
                <span style={{ color: '#3A98FF', marginLeft: '16px' }}>加速</span>
              </div>

              {/* 其他的提示 */}
              <div className={style.moreTipGroup}>
                {moreRoamTip.map(item => (
                  <div key={item.title} className={style.moreTipItem}>
                    <span>{item.title}</span>
                    <div>
                      <img src={item.img} alt={item.title} />
                    </div>
                  </div>
                ))}

              </div>

              {/* 文字提示 */}
              <div className={style.tipText} style={{ marginBottom: 0 }}>
                <span>上移和下移，开启重力后不可用</span>
              </div>
            </div>
          ) : null}

          {/* 路径漫游的操作面板 */}
          {/* {currentMode === "路径漫游" ? ( */}
          <div style={{ display: currentMode === "路径漫游" ? "block" : "none" }}>
            {/* 标题 */}
            <SubTitle
              title="路径漫游"
              onChange={() => {
                this.setState(state => ({
                  ...state,
                  ShowRouteRoamPanel: !state.ShowRouteRoamPanel
                }));
              }}
              tipIcon={currentMode === "路径漫游"}
              tipContent="一条路径由多个视角组成，调整场景后点击【添加视角】按钮保存当前视角，获取多个视角后点击【保存路径】按钮完成路径设置。"
              // 只有在漫游过程中才可以展示漫游设置
              unfoldStatus={ShowRouteRoamPanel}
            />
            {/* 路径漫游 */}
            <div style={{ display: ShowRouteRoamPanel ? "block" : "none" }}>
              <RouteRoam active={currentMode === "路径漫游"} />
            </div>

          </div>
          {/* ) : null} */}

          {/* 漫游记录 */}
          {
            // currentMode === "漫游记录" ? (
            <div style={{ display: currentMode === "漫游记录" ? "block" : "none" }}>
              {/* 标题 */}
              <SubTitle
                title="漫游记录"
                onChange={() => {
                  this.setState(state => ({
                    ...state,
                    ShowRouteRecordPanel: !state.ShowRouteRecordPanel
                  }));
                }}
                // 只有在漫游过程中才可以展示漫游设置
                unfoldStatus={ShowRouteRecordPanel}
              />

              {/* 路径漫游 */}
              <div
                style={{ display: ShowRouteRecordPanel ? "block" : "none" }}
              >
                <RoamRecord
                  visible={this.state.roamRecordVisible}
                  viewer={this.props.viewer}
                  BIMWINNER={this.props.BIMWINNER}
                  active={currentMode === "漫游记录"}
                  eventEmitter={this.props.eventEmitter}
                />
              </div>
            </div>
            // ) : null
          }
          <div style={{ marginBottom: 16 }} />
        </Modal>
      </div>
    );
  }
}

Roam.propTypes = {
  changeMode: PropTypes.func.isRequired,
  changeMouseIcon: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
  modelDetail: PropTypes.object,
  eventEmitter: PropTypes.object,
};

Roam.defaultProps = {
  modelDetail: {},
  eventEmitter: {}
};

const mapStateToProps = (state) => ({
  mode: state.button.mode,
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
  eventEmitter: state.system.eventEmitter,
  modelDetail: state.system.model,
});
const mapDispatchToProps = (dispatch) => ({
  changeMode: (mode) => {
    dispatch(changeMode(mode));
  },
  changeMouseIcon: (mode) => {
    dispatch(changeMouseIcon(mode));
  },
});
const WrappedContainer = connect(mapStateToProps, mapDispatchToProps)(Roam);

export default WrappedContainer;
