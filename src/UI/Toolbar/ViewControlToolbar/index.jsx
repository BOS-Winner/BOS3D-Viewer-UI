import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Menu, Dropdown, Tooltip } from "antd";
import _ from "lodash-es";
import toastr from "toastr";
import * as style from "./index.less";
import { isLandscape } from "../../utils/device";
import { resetHistory } from "../../Icon/action";
import { AntdIcon } from "../../utils/utils";
import AxisController from "./AxisController.js";
import MobileHelper from './MobileHelper/index';
import { Server } from "../../server/server";

function fuckFSC(dom) {
  if (dom.requestFullscreen) {
    return dom.requestFullscreen();
  } else if (dom.webkitRequestFullscreen) {
    return dom.webkitRequestFullscreen();
  } else if (dom.mozRequestFullScreen) {
    return dom.mozRequestFullScreen();
  } else {
    return dom.msRequestFullscreen();
  }
}

function fuckExitFSC() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else {
    document.msExitFullscreen();
  }
}

const BestViewStatus = {
  Open: "#04CB02",
  Pending: "#FFAD0D",
  Close: "rgb(4, 203, 4)",
  Error: "#F03D3D",
};

class ViewControlToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.width = 0;
    this.height = 0;
    // this.saveCanvasSize();
    this.fscLner = this.fscLner.bind(this);
    window.isFullScreen = false;
    this.state = {
      viewerUUId: "",
      isFullScreen: false,
      // isShowDropDownMenu: false,
      viewController: true,
      axisController: false,

      // 最佳视角模式状态
      bestViewStatus: BestViewStatus.Close,

      // 最佳视角是否需要重新计算
      bestViewRedo: false,

      // 后台的最佳视角是否已经生成
      bestViewExisted: false,
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.dropDownMenuRef = React.createRef();
    // 轴向控制器对象
    this.axisController = null;
    this.currentAngle = 0;
    this.currentVector = undefined;
    this.linkage = true;
    this.axisControllerLinkage = true;
  }

  static defaultProps = {
    linkage: {},
    isMobile: false
  };

  componentDidMount() {
    document.addEventListener("fullscreenchange", this.fscLner);
    document.addEventListener("webkitfullscreenchange", this.fscLner);
    document.addEventListener("mozfullscreenchange", this.fscLner);
    document.addEventListener("MSFullscreenChange", this.fscLner);
    this.hanldeInitViewportId(this.props.viewer.viewerImpl.uuid);

    // 初始化轴向控制器
    this.axisController = new AxisController({
      viewer: this.props.viewer,
      callback: this.handleRotaRotate,
    });
    window.haha = this.axisController;
    this.axisController.init();
  }

  componentWillUnmount() {
    document.removeEventListener("fullscreenchange", this.fscLner);
    document.removeEventListener("webkitfullscreenchange", this.fscLner);
    document.removeEventListener("mozfullscreenchange", this.fscLner);
    document.removeEventListener("MSFullscreenChange", this.fscLner);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.bestView && !this.props.bestView) {
      this.getBestViewStatus();
    }
    return true;
  }

  /**
   * 获取初始化viewportId
   * @param {string} uuid viewerUUid
   */
  hanldeInitViewportId(uuid) {
    this.setState({ viewerUUId: uuid });
  }

  async getBestViewStatus() {
    const viewer = this.props.viewer;
    const allModelKeys = viewer.getViewerImpl().getAllBimModelsKey();
    if (!allModelKeys.length) {
      const scope = this;
      clearTimeout(this.customGetBestViewStatusTimer);
      this.customGetBestViewStatusTimer = setTimeout(() => scope.getBestViewStatus(), 3000);
      return;
    }
    const server = new Server({ viewer: this.props.viewer });
    const result = await server.getBestViewStatus();
    if (result.code === "SUCCESS") {
      // 判断当前有没有生成最佳视角
      if (result.data["viewport"]) {
        this.setState({ bestViewExisted: true });
      }
      // 如果默认关闭则退出
      if (!result.data.switch || result.data.switch === "false") return;
      const { data: { viewport } } = result;
      const { position: viewportJson } = JSON.parse(viewport);
      const cameraInfo = {
        position: {
          x: viewportJson.camera[0],
          y: viewportJson.camera[1],
          z: viewportJson.camera[2]
        },
        target: {
          x: viewportJson.target[0],
          y: viewportJson.target[1],
          z: viewportJson.target[2]
        },
        up: { x: 0, y: 0, z: 1 },
      };
      // 飞向最佳视角
      this.props.viewer.flyTo(cameraInfo, () => {
        // 设置为主视角
        this.setMainView();
      });
      // 同步状态
      this.setState({
        bestViewStatus: BestViewStatus.Open,
        bestViewRedo: false,
        bestViewExisted: true,
      });
    } else {
      toastr.error(result.message);
    }
  }

  /**
   * 回到初始视角状态
   */
  mainView = () => {
    this.props.viewer.resetScene();
  };

  /**
   * 设置初始视角
   */
  setMainView = () => {
    const camera = this.props.viewer.viewerImpl.cameraControl.getCamera();
    this.props.viewer.setOriginalView(
      camera.position.clone(),
      camera.target.clone(),
      camera.up.clone()
    );
  };

  /**
   * 重置主视图
   */
  resetMainView = () => {
    const originView = this.props.viewer.getInitView();
    this.props.viewer.setOriginalView(
      originView.position,
      originView.target,
      originView.up
    );
  };

  /**
   * 控制视角控制器
   */
  handleViewController = () => {
    const { viewController } = this.state;
    if (viewController) {
      // 当前需要关闭视图控制器
      this.props.viewer.disableViewController();
    } else {
      // 当前需要开启视图控制器
      this.props.viewer.enableViewController();
    }
    // 更新视图控制器状态
    this.setState((state) => ({
      ...state,
      viewController: !viewController,
    }));
  };

  handleAxisController = () => {
    const { axisController } = this.state;
    if (this.axisController) {
      this.axisController.handleVisible();
    }
    this.setState((state) => ({
      ...state,
      axisController: !axisController,
    }));
    if (!axisController) {
      this.props.viewer.registerCameraEventListener(
        this.props.BIMWINNER.BOS3D.EVENTS.ON_CAMERA_CHANGE,
        this.cameraChangeCallback
      );
      const cameraInfo = this.props.viewer.getViewerImpl().camera;
      this.currentVector = _.cloneDeep(cameraInfo.position);
    } else {
      // 卸载监听函数
      this.props.viewer.unregisterCameraEventListener(
        this.props.BIMWINNER.BOS3D.EVENTS.ON_CAMERA_CHANGE,
        this.cameraChangeCallback
      );
    }
  };

  // 相机的监听回调
  cameraChangeCallback = (info) => {
    if (!this.linkage) return;
    // return;
    const {
      viewer,
      BIMWINNER: {
        BOS3D: { THREE },
      },
    } = this.props;
    // 打开轴向控制器的时候的位置向量
    const tempInitVector = _.cloneDeep(this.currentVector);
    // 当前旋转相机的位置向量
    const currentPosition = info.camera.position;
    // 如果开始的向量获取到了
    if (tempInitVector) {
      // 模型包围盒
      const box = viewer.viewerImpl.modelManager.boundingBox;
      // 获取中心点
      const center = box.getCenter(new THREE.Vector3());
      // 2个点之间的角度获取
      let c1 = (Math.atan2(tempInitVector.y - center.y, tempInitVector.x - center.x)
        * 180)
        / Math.PI;
      let c2 = (Math.atan2(
        currentPosition.y - center.y,
        currentPosition.x - center.x
      )
        * 180)
        / Math.PI;

      let angle;
      c1 = c1 <= -90 ? 360 + c1 : c1;
      c2 = c2 <= -90 ? 360 + c2 : c2;

      // 夹角获取
      angle = Math.floor(c2 - c1);
      angle = angle < 0 ? angle + 360 : angle;
      // 循环设置
      if (angle < 60 && angle >= 0) {
        angle += 360;
      }
      // this.axisControllerLinkage = false;
      this.axisController.setPoint(angle);
      // this.axisControllerLinkage = true;
    }
  };

  /**
   * 控制轴向控制器旋转
   * @param {number} value 旋转度数
   */
  handleRotaRotate = (value) => {
    const tempValue = value > 360 ? value - 360 : value;
    if (tempValue % 360 === this.currentAngle || !this.axisControllerLinkage) {
      return;
    }
    const tag = tempValue % 360 > this.currentAngle ? 1 : -1;
    this.currentAngle = tempValue % 360;
    const {
      viewer,
      BIMWINNER: { BOS3D },
    } = this.props;
    // 根据角度设置相机旋转
    const viewportStyle = getComputedStyle(viewer.viewportDiv);
    const viewportWidth = parseFloat(viewportStyle.width);
    const x = _.round(viewportWidth / 360, 7);
    // 如果有高亮构件的话需要设置旋转中心
    const highLightCptKeyList = viewer.getHighlightComponentsKey();
    if (highLightCptKeyList.length) {
      const box = viewer.viewerImpl.getBoundingBoxByIds(highLightCptKeyList);
      console.log(box);
      const center = box.getCenter(new BOS3D.THREE.Vector3());
      console.log(center);
      // this.linkage = false;
      viewer.rotateCamera([tag * x, 0], center);
      // this.linkage = true;
      return;
    }

    // 旋转一周有误差
    // this.linkage = false;
    viewer.rotateCamera([tag * x, 0]);
    // this.linkage = true;
  };

  handleBestView = async () => {
    const { bestViewStatus, bestViewRedo } = this.state;
    const server = new Server({ viewer: this.props.viewer });

    // 如果当前状态是关闭的，则开启最佳视角
    if (bestViewStatus === BestViewStatus.Close || bestViewStatus === BestViewStatus.Pending || BestViewStatus === BestViewStatus.Error) {
      this.setState({
        bestViewStatus: BestViewStatus.Pending,
      });
      const bestResult = await server.getBestView("", bestViewRedo);
      if (bestResult.code === "SUCCESS" && bestResult.data?.viewport) {
        // 同步状态到服务器
        const result = await server.setBestViewStatus("", true);
        if (result.code !== "SUCCESS") {
          toastr.error(result.message);
        }
        // tip
        toastr.success("启用最佳视角模式成功", "", {
          target: this.props.viewer.getViewerImpl().domElement,
        });
        this.setState({
          bestViewStatus: BestViewStatus.Open,
          bestViewRedo: false,
          bestViewExisted: true,
        });
        const { data: { viewport } } = bestResult;
        const { position: viewportJson } = JSON.parse(viewport);
        const cameraInfo = {
          position: {
            x: viewportJson.camera[0],
            y: viewportJson.camera[1],
            z: viewportJson.camera[2]
          },
          target: {
            x: viewportJson.target[0],
            y: viewportJson.target[1],
            z: viewportJson.target[2]
          },
          up: { x: 0, y: 0, z: 1 },
        };
        // 飞向最佳视角
        this.props.viewer.flyTo(cameraInfo, () => {
          // 设置为主视角
          this.setMainView();
        });
      } else if (bestResult.code !== "SUCCESS") {
        toastr.error("启用最佳视角模式失败", "", {
          target: this.props.viewer.getViewerImpl().domElement,
        });
        this.setState({
          bestViewStatus: BestViewStatus.Error,
          bestViewRedo: true,
          bestViewExisted: false,
        });
      } else {
        // 请求计算状态
        clearTimeout(this.timeId);
        this.timeId = setTimeout(() => {
          this.handleBestView();
        }, 1000 * 10);
      }
    }

    // 如果当前状态是开启的，则关闭最佳视角
    if (bestViewStatus === BestViewStatus.Open) {
      toastr.success("关闭最佳视角模式成功", "", {
        target: this.props.viewer.getViewerImpl().domElement,
      });
      this.setState({ bestViewStatus: BestViewStatus.Close });
      this.resetMainView();
      const result = await server.setBestViewStatus("", false);
      if (result.code !== "SUCCESS") {
        toastr.error(result.message);
      }
    }
  }

  /**
   * 重置主视图
   * @description 如果最佳视角模式开启，则关闭
   */
  handleResetMainView = () => {
    this.resetMainView();
    if (this.state.bestViewStatus === BestViewStatus.Open) {
      this.handleBestView();
    }
    this.mainView();
  }

  /**
   * 设置当前为主视图
   */
  handleSetMainView = async () => {
    // 关闭最佳视角模式
    // 如果当前状态是开启的，则关闭最佳视角
    if (this.state.bestViewStatus === BestViewStatus.Open) {
      const server = new Server({ viewer: this.props.viewer });
      toastr.success("关闭最佳视角模式成功", "", {
        target: this.props.viewer.getViewerImpl().domElement,
      });
      this.setState({ bestViewStatus: BestViewStatus.Close });
      this.resetMainView();
      const result = await server.setBestViewStatus("", false);
      if (result.code !== "SUCCESS") {
        toastr.error(result.message);
      }
    }

    this.setMainView();
  }

  render() {
    const { isMobile } = this.props;
    if (isMobile) {
      return (
        <MobileHelper
          viewer={this.props.viewer}
          BIMWINNER={this.props.BIMWINNER}
          mainView={this.mainView}
          setMainView={this.setMainView}
          resetMainView={this.resetMainView}
        />
      );
    }
    // 菜单列表
    const menuList = [
      {
        text: "跳转主视图",
        func: this.mainView,
      },
      {
        text: "当前视图设为主视图",
        func: this.handleSetMainView,
      },
      {
        text: "重置主视图",
        func: this.handleResetMainView,
      },
      {
        text: this.state.viewController ? "关闭视图控制器" : "打开视图控制器",
        func: this.handleViewController,
      },
      {
        text: this.state.axisController
          ? "关闭轴向旋转控制"
          : "打开轴向旋转控制",
        func: this.handleAxisController,
      },
    ];
    // 菜单
    const MenuItem = (text = "", func = () => { }) => (
      <Menu.Item
        title={text}
        key={text}
        onClick={func}
        className={style.customMenuItem}
      >
        <span role="presentation">{text}</span>
      </Menu.Item>
    );
    // 下拉菜单
    const menu = () => (
      <Menu className={style.customDropMenu}>
        {menuList.map((item) => MenuItem(item.text, item.func))}
        {this.props.bestView && (
          <Menu.Item
            disabled={this.state.bestViewStatus === BestViewStatus.Pending}
            onClick={this.handleBestView}
          >
            <div className={style.itemContainer}>
              <div
                className={style.bestViewStatus}
                style={{
                  background: this.state.bestViewStatus,
                  display: this.state.bestViewExisted || this.state.bestViewStatus === BestViewStatus.Pending || this.state.bestViewStatus === BestViewStatus.Error ? "block" : "none",
                }}
              />
              {
                this.state.bestViewStatus === BestViewStatus.Pending
                  ? (
                    <Tooltip
                      title="最佳视角模式启用中，请等待一段时间！"
                      color="#444444"
                    >
                      <span>
                        启用最佳视角模式
                      </span>
                    </Tooltip>
                  ) : (
                    <span>
                      {this.state.bestViewStatus === BestViewStatus.Close
                        ? "启用最佳视角模式"
                        : "关闭最佳视角模式"}
                    </span>
                  )
              }
              <Tooltip
                title="“启用后，系统会自动计算出最适合观察模型位置的视角;计算完成后，点击初始化或主视图按钮即可查看。”"
                color="#444444"
                arrowPointAtCenter
                overlayStyle={{
                  width: "192px",
                  height: "117px",
                  borderRadius: "4px",
                  fontSize: '13px',
                  lineHeight: "24px"
                }}
              >
                <AntdIcon type="icontips_kehover" className={style.itemIcon} />
              </Tooltip>
            </div>
          </Menu.Item>
        )}

      </Menu>
    );

    return (
      <div className={style.toolbar}>
        <div
          role="presentation"
          title="初始化"
          onClick={() => this.mainView()}
          className={style.toolbarMainView}
        >
          <AntdIcon type="iconhomepage" className={`${style.iconHome}`} />
        </div>
        <div
          role="presentation"
          title={this.state.isFullScreen ? "退出全屏" : "全屏"}
          onClick={() => this.fullScreen()}
          className={style.toolbarFullScreen}
        >
          {/* TODO: 需要UI更新关闭全屏icon */}
          <AntdIcon
            type={this.state.isFullScreen ? "iconclose" : "iconfullscreen"}
            className={`${style.icon}`}
          />
        </div>
        <Dropdown
          overlay={menu}
          placement="bottomRight"
          overlayClassName={style.customDropDown}
          arrow
          getPopupContainer={() => this.props.viewer.viewportDiv}
        >
          <div className={style.toolBarDropDownMenu}>
            <AntdIcon type="iconexpandmore" className={`${style.icon}`} />
          </div>
        </Dropdown>
      </div>
    );
  }

  saveCanvasSize() {
    const canvas = document.querySelector(`[id="${this.state.viewerUUId}"]>canvas`);
    this.width = parseInt(getComputedStyle(canvas).width, 10);
    this.height = parseInt(getComputedStyle(canvas).height, 10);
  }

  fscLner() {
    const viewer3D = this.props.viewer;
    if (
      !(
        document.fullscreenElement
          || document.webkitIsFullScreen
          || document.mozFullScreen
          || document.msFullscreenElement
      )
    ) {
      viewer3D.resize(this.width, this.height);
      console.log('hahah');
      this.setState({
        isFullScreen: false,
      });
      window.isFullScreen = false;
    } else {
      this.saveCanvasSize();
      setTimeout(() => {
        const bodyStyle = getComputedStyle(document.querySelector("#viewport") || document.querySelector("body"));
        let width = parseFloat(bodyStyle.width);
        let height = parseFloat(bodyStyle.height);
        // iOS safari竖屏要交换宽高
        const deviceTest = this.props.BIMWINNER.BOS3D.DeviceTest;
        if (
          deviceTest.isSafari()
          && deviceTest.isTouchDevice()
          && isLandscape()
        ) {
          [width, height] = [height, width];
        }
        viewer3D.resize(width, height);
        this.setState({
          isFullScreen: true,
        });
        window.isFullScreen = true;
      }, 20);
    }
  }

  mainView() {
    this.props.viewer.resetScene();
    this.props.resetHistory();
  }

  fullScreen() {
    if (this.state.isFullScreen) {
      const linkage = this.props.linkage;
      if (linkage.emitter) {
        linkage.emitter.emit(linkage.EVENTS.ON_CLOSE_SCREEN);
        fuckExitFSC();
      } else {
        fuckExitFSC();
      }
      fuckExitFSC();
    } else {
      const linkage = this.props.linkage;
      // 判断是否是二三维联动
      if (linkage.emitter) {
        fuckFSC(document.getElementById(linkage.containerId));
        linkage.emitter.emit(linkage.EVENTS.ON_FULL_SCREEN);
      } else {
        fuckFSC(this.props.viewer.viewportDiv);
      }
    }
  }

  onDropDownMenuClick(index) {
    if (index === 0) {
      // 只设置相机
      this.props.viewer.resetScene({ view: true });
      this.hideDropDownMenu();
    } else if (index === 1) {
      const camera = this.props.viewer.viewerImpl.cameraControl.getCamera();
      this.props.viewer.setOriginalView(
        camera.position.clone(),
        camera.target.clone(),
        camera.up.clone()
      );
    } else if (index === 2) {
      this.props.viewer.setOriginalView();
    }
    this.hideDropDownMenu();
  }

  onMouseDown(e) {
    if (e) {
      const target = e.target;
      const div = this.dropDownMenuRef.current;
      if (div.contains(target)) {
        return;
      }
    }
    this.hideDropDownMenu();
  }
}

ViewControlToolbar.propTypes = {
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
  resetHistory: PropTypes.func.isRequired,
  linkage: PropTypes.object,
  isMobile: PropTypes.bool,
  bestView: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
  linkage: state.system.linkage,
  isMobile: state.system.isMobile,
  bestView: state.userSetting.bestView,
});

const mapDispatchToProps = (dispatch) => ({
  resetHistory: () => {
    dispatch(resetHistory());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewControlToolbar);
