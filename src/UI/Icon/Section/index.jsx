import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Modal from "Base/Modal";
import Card from "Base/Card";
import { Select } from "antd";
import { changeMode } from "../action";
import Icon from "../../Base/Icon";
import toastr from "../../toastr";
import style from "./style.less";
import { AntdIcon } from "../../utils/utils";
import iconstyle from "../../Toolbar/bottom.less";
import mobilestyle from "./mobilestyle.less";
import { DEFAULT_MODAL_PLACE } from "../../constant";
// import MeasureControl from '../Measure/MobileHelper/MeasureControl';

class SectionPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      mode: props.mode,
      showPlane: true,
      isShowSectionBox: true,
      selectDir: '',
      touchProgress: 50,
      leftRightRotation: 0,
      upDownRoataion: 0,
    };
    this.sectionPlane = null;
    // this.touchProgress = 50;
    // this.leftRightRotation = 0;
    // this.upDownRoataion = 0;
    this.isTouchDevice = props.BIMWINNER.BOS3D.DeviceTest.isTouchDevice();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mode !== "剖切模式" && this.props.mode === "剖切模式") {
      // 切换模式时提示用户
      if (prevProps.mode.length > 0) {
        toastr.remove();
        toastr.info(`剖切模式下将关闭${prevProps.mode}`, "", {
          target: `#${this.props.viewer.viewport}`,
        });
      }
    }
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(prevProps) {
    // 如果由当前的剖切模式切换到其他模式则关闭当前的剖切模式
    if (prevProps.mode !== "剖切模式" && this.props.mode === "剖切模式") {
      // 关闭模型剖切
      if (this.state.mode === "剖切模式") {
        this.props.viewer.disableSectionBox();
      }
      // 关闭自由剖切模式
      if (this.sectionPlane) {
        this.sectionPlane.exit();
        this.sectionPlane = null;
        this.setState((state) => ({
          ...state,
          mode: "",
          showModal: false,
        }));
      }
      this.props.viewer.render();
      this.setState((state) => ({
        ...state,
        mode: "",
        showModal: false,
      }));
    }
  }

  /**
   * 开启自由剖切
   */
  startFreeSection = () => {
    const BIMWINNER = this.props.BIMWINNER;
    this.sectionPlane = new BIMWINNER.BOS3D.SectionPlane({
      direction: "Forward",
      id: "SectionPlane",
      plane: "X",
      progress: 50,
      viewer: this.props.viewer,
    });
    if (this.isTouchDevice) {
      this.sectionPlane.coordinateSystem.hide(true);
    }
    this.props.viewer.render();
  };

  /**
   * 开启关闭剖切弹窗
   */
  triggerPopUp = () => {
    const mode = this.props.mode;
    if (mode === "剖切模式") {
      this.props.changeMode("");
      // 关闭模型剖切
      if (this.state.mode === "剖切模式") {
        this.props.viewer.disableSectionBox();
        this.props.viewer.render();
      }
      // 关闭自由剖切模式
      if (this.sectionPlane) {
        this.sectionPlane.exit();
        this.sectionPlane = null;
      }
      this.setState((state) => ({
        ...state,
        mode: "",
      }));
    } else {
      this.props.changeMode("剖切模式");
    }
    this.setState((state) => ({
      ...state,
      showModal: !state.showModal,
    }));
  };

  /**
   * 切换剖切模式
   * @param {string} type 剖切模式
   */
  switchSection = (type) => {
    this.state.selectDir = '';
    if (type === "自由剖切模式") {
      // this.props.changeMode("自由剖切模式");
      this.setState((state) => ({
        ...state,
        showPlane: true,
        mode: "自由剖切模式",
      }));
      // 关闭模型剖切
      this.props.viewer.disableSectionBox();
      this.props.viewer.render();
      // 开启自由剖切
      this.startFreeSection();
    } else {
      // this.props.changeMode("剖切模式");
      this.setState((state) => ({
        ...state,
        isShowSectionBox: true,
        mode: "剖切模式",
      }));
      // 关闭自由剖切模式
      if (this.sectionPlane) {
        this.sectionPlane.exit();
        this.sectionPlane = null;
      }
      // 开启模型剖切额模式
      this.props.viewer.enableSectionBox();
      this.props.viewer.setSectionBoxMode("normal");
      this.props.viewer.render();
    }
  };

  /**
   * 选择轴向
   * @param {string}} value 选择轴向
   */
  handleSelect = (value) => {
    const type = value;
    this.setState({
      selectDir: type
    });
    if (type[0] === "-") {
      this.sectionPlane.setDirection("Reverse");
      this.sectionPlane.setPlane(type[1]);
    } else {
      this.sectionPlane.setDirection("Forward");
      this.sectionPlane.setPlane(type);
    }
    if (this.isTouchDevice) {
      this.sectionPlane.setProgress(this.state.touchProgress);
    }
    this.setState({
      touchProgress: 50,
      leftRightRotation: 0,
      upDownRoataion: 0
    });
    this.props.viewer.render();
  };

  /**
   * 是否显示
   * @param {object} e 事件
   */
  switchShowPlane = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState((state) => {
      if (state.showPlane) {
        this.sectionPlane.hidePlane();
      } else {
        this.sectionPlane.showPlane();
      }
      return {
        showPlane: !state.showPlane,
      };
    });
  };

  toggleSectionBox() {
    const visible = this.state.isShowSectionBox;
    if (visible) {
      this.props.viewer.hideSectionBox();
    } else {
      this.props.viewer.showSectionBox();
    }
    this.setState({
      isShowSectionBox: !visible,
    });
  }

  resetSectionBox() {
    this.props.viewer.resetSectionBox();
    this.setState({
      isShowSectionBox: true,
    });
  }

  onTouchMove = (clientX, clientY) => {
    this.props.viewer.getViewerImpl().controlManager.getToolByName('pickByMeasure').touchPointMove({
      clientX,
      clientY
    });
  }

  setProgress = (e) => {
    e.stopPropagation();
    this.touchProgress = Number(e.target.value);
    this.setState({
      touchProgress: Number(e.target.value)
    });
    this.sectionPlane.setProgress(this.touchProgress);
    this.props.viewer.render();
  }

  // 左右旋转
  customRotation = (a, b) => {
    this.leftRightRotation = a;
    this.upDownRoataion = b;
    this.setState({
      leftRightRotation: a,
      upDownRoataion: b
    });
    this.sectionPlane.setRotateAngle(a, b);
    this.props.viewer.render();
  }

  render() {
    const { showModal, mode } = this.state;
    const { isMobile } = this.props;
    if (isMobile) {
      return this.renderMobileJsx();
    }
    const sectionMode = [
      {
        icon: "iconziyoupouqie-01",
        title: "自由剖切",
        func: () => this.switchSection("自由剖切模式"),
        active: mode === "自由剖切模式",
      },
      {
        icon: "iconmoxingpouqie-01",
        title: "模型剖切",
        func: () => this.switchSection("剖切模式"),
        active: mode === "剖切模式",
      },
    ];

    const freeItem = [
      {
        value: "X",
        text: "X轴",
      },
      {
        value: "Y",
        text: "Y轴",
      },
      {
        value: "Z",
        text: "Z轴",
      },
      {
        value: "-X",
        text: "-X轴",
      },
      {
        value: "-Y",
        text: "-Y轴",
      },
      {
        value: "-Z",
        text: "-Z轴",
      },
    ];
    return (
      <div id="customSection">
        <Modal
          visible={showModal}
          onCancel={this.triggerPopUp}
          title="剖切"
          width="350px"
          height="220px"
          top={DEFAULT_MODAL_PLACE.section.top}
          right={DEFAULT_MODAL_PLACE.section.right}
          left={DEFAULT_MODAL_PLACE.section.left}
          minWidth={350}
          minHeight={220}
          viewportDiv={this.props.viewer.viewportDiv}
        >
          <div className={style.sectionGroup}>
            {sectionMode.map((item) => (
              <Card
                key={item.title}
                icon={item.icon}
                title={item.title}
                func={item.func}
                active={item.active}
              />
            ))}
          </div>
          <div className={style.divider} />
          {mode === "自由剖切模式" ? (
            <div className={style.freeWrapper}>
              <Select
                className={style.select}
                onChange={this.handleSelect}
                dropdownClassName={style.dropDown}
                defaultValue="X"
              >
                {freeItem.map((item) => (
                  <Select.Option
                    key={item.value}
                    value={item.value}
                    className={style.option}
                  >
                    {item.text}
                  </Select.Option>
                ))}
              </Select>
              <div
                title={
                  this.state.showPlane ? "点击隐藏剖切面" : "点击显示剖切面"
                }
                className={style.eye}
                role="presentation"
                onClick={this.switchShowPlane}
              >
                <AntdIcon
                  type={
                    this.state.showPlane
                      ? "iconcaozuolishikejian-01"
                      : "iconcaozuolishibukejian-01"
                  }
                />
              </div>
            </div>
          ) : null}
          {mode === "剖切模式" ? (
            <div className={style.btnGroup}>
              <div role="presentation" onClick={() => this.toggleSectionBox()}>
                {this.state.isShowSectionBox ? "隐藏剖切框" : "显示剖切框"}
              </div>
              <div role="presentation" onClick={() => this.resetSectionBox()}>
                重置剖切框
              </div>
            </div>
          ) : null}
        </Modal>

        <div
          title="剖切"
          role="button"
          tabIndex={0}
          onClick={() => {
            this.triggerPopUp();
          }}
        >
          <Icon
            icon={
              <AntdIcon type="iconmoxingpouqie-01" className={iconstyle.icon} />
            }
            selected={this.state.showModal}
            title="剖切"
          />
        </div>
      </div>
    );
  }

  renderMobileJsx() {
    const { showModal, mode, selectDir } = this.state;
    // const { isMobile } = this.props;
    const sectionMode = [
      {
        icon: "iconziyoupouqie-01",
        title: "自由剖切",
        func: () => this.switchSection("自由剖切模式"),
        active: mode === "自由剖切模式",
      },
      {
        icon: "iconmoxingpouqie-01",
        title: "模型剖切",
        func: () => this.switchSection("剖切模式"),
        active: mode === "剖切模式",
      },
    ];

    const freeItem = [
      {
        value: "X",
        text: "X轴",
      },
      {
        value: "Y",
        text: "Y轴",
      },
      {
        value: "Z",
        text: "Z轴",
      },
      {
        value: "-X",
        text: "-X轴",
      },
      {
        value: "-Y",
        text: "-Y轴",
      },
      {
        value: "-Z",
        text: "-Z轴",
      },
    ];

    const customStyle = {
      width: '68px',
      height: '56px'
    };
    const selectElementStyle = {
      paddingLeft: selectDir.length > 1 ? 12 : 20
    };
    return (
      <div id="customSection">
        {/* {mode === "自由剖切模式" && (
          <MeasureControl
            onTouchMove={()=>{}}
            ok={() => {}}
            cancel={() => {}}
            viewer={this.props.viewer}
          />
        )} */}
        <Modal
          visible={showModal}
          onCancel={this.triggerPopUp}
          title="剖切"
          width="176px"
          minWidth={176}
          minHeight={220}
          viewportDiv={this.props.viewer.viewportDiv}
          theme="mobile-theme-one"
        >
          <section className={mobilestyle.container}>
            <div className={mobilestyle.sectionGroup}>
              {sectionMode.map((item) => (
                <Card
                  notHover
                  key={item.title}
                  icon={item.icon}
                  func={item.func}
                  active={item.active}
                  customStyle={customStyle}
                />
              ))}
            </div>
            <div className={mobilestyle.divider} />
            {mode === "自由剖切模式" ? (
              <>
                <h3 className={mobilestyle.h3}>自由剖切</h3>
                <div className={mobilestyle.freeWrapper}>
                  <select
                    style={selectElementStyle}
                    className={mobilestyle.select}
                    onChange={(e) => {
                      this.handleSelect(e.target.value);
                    }}
                    defaultValue="X"
                  >
                    {freeItem.map((item) => (
                      <option
                        key={item.value}
                        value={item.value}
                        className={mobilestyle.option}
                      >
                        {item.text}
                      </option>
                    ))}
                  </select>
                  <div
                    title={
                      this.state.showPlane ? "点击隐藏剖切面" : "点击显示剖切面"
                    }
                    className={mobilestyle.eye}
                    role="presentation"
                    onClick={this.switchShowPlane}
                  >
                    <AntdIcon
                      type={
                        this.state.showPlane
                          ? "iconcaozuolishikejian-01"
                          : "iconcaozuolishibukejian-01"
                      }
                    />
                  </div>
                </div>
                <span className={style.customSubTitle} style={{ marginTop: '10px' }}>轴向距离</span>
                <div className={style.customInput}>
                  <span>0</span>
                  <div className={style.range}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={this.state.touchProgress}
                      onChange={e => { this.setProgress(e) }}
                    />
                  </div>
                  <span>100%</span>
                </div>
                <span className={style.customSubTitle}>左右旋转</span>
                <div className={style.customInput}>
                  <span>0</span>
                  <div className={style.range}>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={this.state.leftRightRotation}
                      onChange={e => { this.customRotation(Number(e.target.value), this.state.upDownRoataion) }}
                    />
                  </div>
                  <span>360°</span>
                </div>
                <span className={style.customSubTitle}>上下旋转</span>
                <div className={style.customInput}>
                  <span>0</span>
                  <div className={style.range}>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={this.state.upDownRoataion}
                      onChange={e => { this.customRotation(this.state.leftRightRotation, Number(e.target.value)) }}
                    />
                  </div>
                  <span>360°</span>
                </div>
              </>
            ) : null}
            {mode === "剖切模式" ? (
              <>
                <h3 className={mobilestyle.h3}>模型剖切</h3>
                <div className={mobilestyle.btnGroup}>
                  <div role="presentation" className="bos-btn bos-btn-primary" onClick={() => this.toggleSectionBox()}>
                    <AntdIcon type="iconicon_yincangpouqiekuang-01" />
                    {this.state.isShowSectionBox ? "隐藏剖切框" : "显示剖切框"}
                  </div>
                  <div role="presentation" className="bos-btn bos-btn-default" onClick={() => this.resetSectionBox()}>
                    <AntdIcon type="iconicon_zhongzhipouqiekuang-" />
                    重置剖切框
                  </div>
                </div>
              </>
            ) : null}
          </section>

        </Modal>

        <div
          title="剖切"
          role="button"
          tabIndex={0}
          onClick={() => {
            this.triggerPopUp();
          }}
        >
          <Icon
            icon={
              <AntdIcon type="iconmoxingpouqie-01" className={iconstyle.icon} />
            }
            selected={this.state.showModal}
            title="剖切"
          />
        </div>
      </div>
    );
  }
}

SectionPopup.propTypes = {
  changeMode: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
  isMobile: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => ({
  mode: state.button.mode,
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
  isMobile: state.system.isMobile,
});
const mapDispatchToProps = (dispatch) => ({
  changeMode: (mode) => {
    dispatch(changeMode(mode));
  },
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionPopup);

export default WrappedContainer;
