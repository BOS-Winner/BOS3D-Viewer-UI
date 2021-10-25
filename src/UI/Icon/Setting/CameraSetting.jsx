import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import * as THREE from "Libs/THREE";
import Slider from "Base/Slider";
import Ranger from "Base/Ranger";
import { Slider as AntdSlider, Select } from 'antd';
import { changeCameraSetting } from "../../userRedux/userSetting/action";
import style from "./style.less";
import CameraSettingHelpForVerticalPolarAngle from './_temp/mobile/CameraSettingHelpForVerticalPolarAngle/index';
import { AntdIcon } from '../../utils/utils';

const { Option } = Select;
/*
const UpPos = [
  [1, 0, 0], // x轴
  [0, 1, 0], // y轴
  [0, 0, 1], // z轴
  [-1, 0, 0], // -x轴
  [0, -1, 0], // -y轴
  [0, 0, -1] // -z轴
];
*/

class CameraSetting extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
    cameraSetting: PropTypes.object.isRequired,
    changeCameraSetting: PropTypes.func.isRequired,
    isMobile: PropTypes.bool
  };

  static defaultProps = {
    isMobile: false
  }

  constructor(props) {
    super(props);
    this.state = {
      setting: {
        animatorDuration: 800,
        minCameraRotateAngle: -90,
        maxCameraRotateAngle: 90
      },
      showCmeraRotateAnglePick: false

    };
    this.standardView = this.props.BIMWINNER.BOS3D.standardView;
    this.rotateMode = this.props.BIMWINNER.BOS3D.RotatePivotMode;
    this.controlConfig = this.props.BIMWINNER.BOS3D.ControlConfig;
    // this.dbSetLightIntensity = _.debounce(value => { this.setLightIntensity(value) }, 300);
    this.minRotateRef = React.createRef();
    this.maxRotateRef = React.createRef();
    this.animatorDurationInputRef = React.createRef();
  }

  shouldComponentUpdate(nextProps) {
    if (!_.isEqual(nextProps.cameraSetting, this.props.cameraSetting)) {
      const setting = nextProps.cameraSetting;

      const view = setting.originalView;
      if (view) {
        this.props.viewer.setOriginalView(
          new THREE.Vector3(...view.position),
          new THREE.Vector3(...view.target),
          new THREE.Vector3(...view.up),
        );
      }

      this.props.viewer.getViewerImpl().setPointRotateMode(
        this.rotateMode[setting.rotateMode]
      );

      this.lockRotate(setting.lockRotate);

      this.props.viewer.getViewerImpl().setOrbitButton(setting.orbitButton);

      this.props.viewer.getViewerImpl().setReverseWheelDirection(setting.reverseWheelDirection);

      this.props.viewer.setZoomSpeed(setting.zoomSpeed);

      if (setting.enableVerticalPolarAngle !== this.props.cameraSetting.enableVerticalPolarAngle) {
        this.props.viewer.getViewerImpl().lockAxisZ(setting.enableVerticalPolarAngle);
        // this.props.viewer.enabledCameraRotateOfVerticalPolarAngle(setting.enableVerticalPolarAngle);
      }
      const angle = setting.rotateOfVerticalPolarAngle;
      if (setting.enableVerticalPolarAngle) {
        this.props.viewer.setMinPolarAngle((angle[0] + 90) / 180 * Math.PI);
        this.props.viewer.setMaxPolarAngle((angle[1] + 90) / 180 * Math.PI);
      }
      this.minRotateRef.current.value = angle[0];
      this.maxRotateRef.current.value = angle[1];
      this.state.setting.minCameraRotateAngle = angle[0];
      this.state.setting.maxCameraRotateAngle = angle[1];

      this.props.viewer.setAnimatorDuration(setting.animatorDuration);
      this.animatorDurationInputRef.current.value = setting.animatorDuration;
      this.state.setting.animatorDuration = setting.animatorDuration || 800;
    }
    return true;
  }

  /*
  setLightIntensity(value) {
    this.props.viewer.viewerImpl.setLightIntensityFactor(value);
    this.props.viewer.render();
  }

  setCameraUp(e) {
    e.stopPropagation();
    const i = e.target.value;
    this.props.viewer.viewerImpl.cameraControl.getCamera().up.set(...UpPos[Number(i)]);
    this.props.viewer.render();
  }

  setInitView(e) {
    e.stopPropagation();
    const view = e.target.value;
    // console.log(view);
    this.props.viewer.viewerImpl.setInitialView(Number(view));
  }
  */

  setInitCamera(e) {
    e.stopPropagation();
    const camera = this.props.viewer.getViewerImpl().cameraControl.getCamera();
    this.props.changeCameraSetting('originalView', {
      position: camera.position.toArray(),
      target: camera.target.toArray(),
      up: camera.up.toArray(),
    });
  }

  setRotateMode(mode) {
    this.props.changeCameraSetting('rotateMode', mode);
  }

  lockRotate(enable) {
    this.controlConfig.NoRotate = enable;
  }

  setOrbitButton(value) {
    this.props.changeCameraSetting('orbitButton', value);
  }

  reverseWheelDirection(value) {
    this.props.changeCameraSetting('reverseWheelDirection', value);
  }

  enableVerticalPolarAngle(enable) {
    this.props.changeCameraSetting('enableVerticalPolarAngle', enable);
  }

  setMinCameraRotateAngle(angle) {
    const maxAngle = Number(this.maxRotateRef.current.value);
    if (angle >= -90 && angle <= maxAngle) {
      this.props.changeCameraSetting('rotateOfVerticalPolarAngle', [angle, maxAngle]);
    } else if (angle < -90) {
      this.props.changeCameraSetting('rotateOfVerticalPolarAngle', [-90, maxAngle]);
      this.minRotateRef.current.value = -90;
    } else if (angle > maxAngle) {
      this.props.changeCameraSetting('rotateOfVerticalPolarAngle', [maxAngle, maxAngle]);
      this.minRotateRef.current.value = maxAngle;
    }
  }

  setMaxCameraRotateAngle(angle) {
    const minAngle = Number(this.minRotateRef.current.value);
    if (angle >= minAngle && angle <= 90) {
      this.props.changeCameraSetting('rotateOfVerticalPolarAngle', [minAngle, angle]);
    } else if (angle < minAngle) {
      this.props.changeCameraSetting('rotateOfVerticalPolarAngle', [minAngle, minAngle]);
      this.maxRotateRef.current.value = minAngle;
    } else if (angle > 90) {
      this.props.changeCameraSetting('rotateOfVerticalPolarAngle', [minAngle, 90]);
      this.maxRotateRef.current.value = 90;
    }
  }

  setAnimatorDuration(timeout) {
    if (timeout >= 50 && timeout <= 2000) {
      this.props.changeCameraSetting('animatorDuration', timeout);
    } else if (timeout < 50) {
      this.props.changeCameraSetting('animatorDuration', 50);
      this.animatorDurationInputRef.current.value = '50';
    } else if (timeout > 2000) {
      this.props.changeCameraSetting('animatorDuration', 2000);
      this.animatorDurationInputRef.current.value = '2000';
    }
  }

  setZoomSpeed(speed) {
    this.props.changeCameraSetting('zoomSpeed', speed);
  }

  render() {
    const { isMobile } = this.props;
    const setting = this.props.cameraSetting;
    const changeSetting = this.props.changeCameraSetting;

    return (
      <div className={style.settingContainer}>
        {/* 这些功能三维还没做完 */}
        {/* <div className={style.settingItem}>
          <span>模型轴向</span>
          <select defaultValue={2} onChange={e => this.setCameraUp(e)}>
            <option value={0}>X轴朝上</option>
            <option value={1}>Y轴朝上</option>
            <option value={2}>Z轴朝上</option>
            <option value={3}>X轴朝下</option>
            <option value={4}>Y轴朝下</option>
            <option value={5}>Z轴朝下</option>
          </select>
        </div> */}
        {/* <div className={style.settingItem}>
          <span>初始观察视角</span>
          <select defaultValue={this.standardView.Home} onChange={e => this.setInitView(e)}>
            <option value={this.standardView.Home}>默认</option>
            <option value={this.standardView.Back}>后</option>
            <option value={this.standardView.BackLeft}>后</option>
            <option value={this.standardView.BackRight}>后</option>
            <option value={this.standardView.BackToLeft}>后</option>
            <option value={this.standardView.BackToRight}>后</option>
            <option value={this.standardView.BackToTop}>后</option>
          </select>
        </div> */}
        <div className={style.settingItem}>
          <span>初始观察位置</span>
          <button
            type="button"
            onClick={e => {
              this.setInitCamera(e);
            }}
            className="bos-btn bos-btn-primary"
          >
            将当前位置设置为初始观察位置
          </button>
        </div>
        <div className={style.settingItem}>
          <span>旋转模式</span>
          {isMobile && (
            <select
              value={setting.rotateMode}
              onChange={e => {
                e.stopPropagation();
                const mode = e.target.value;
                this.setRotateMode(mode);
              }}
              style={{ width: '40%' }}
            >
              <option value="MOUSEPOINT">绕鼠标按下位置对应的构件旋转</option>
              <option value="SELECTION">绕选中的构件旋转</option>
              <option value="CENTER">绕场景中心旋转</option>
              <option value="CAMERA">绕相机旋转</option>
            </select>
          )}
          {!isMobile && (
            <div className="boss3d-theme-one-form-form-antd">
              <Select
                style={{ width: 240, marginTop: 10 }}
                placeholder="请选择旋转模式"
                value={setting.rotateMode}
                onChange={e => { this.setRotateMode(e) }}
                dropdownClassName="boss3d-theme-one-form-form-antd-dropdown bos3d-select-dropdown-select-single-has-anticon"
                getPopupContainer={() => this.props.viewer.viewportDiv}
              >
                <Option value="MOUSEPOINT">绕鼠标按下位置对应的构件旋转</Option>
                <Option value="SELECTION">绕选中的构件旋转</Option>
                <Option value="CENTER">绕场景中心旋转</Option>
                <Option value="CAMERA">绕相机旋转</Option>
              </Select>
            </div>
          )}
        </div>
        <div className={style.settingItem}>
          <span>旋转锁定</span>
          <Slider
            checked={setting.lockRotate}
            onClick={enable => { changeSetting('lockRotate', enable) }}
          />
        </div>
        <div className={style.settingItem}>
          <span>鼠标习惯</span>
          {isMobile
            && (
              <select
                value={setting.orbitButton}
                onChange={e => {
                  e.stopPropagation();
                  this.setOrbitButton(e.target.value);
                }}
                style={{ width: '40%' }}
              >
                <option value="left">左键旋转</option>
                <option value="right">右键旋转</option>
              </select>
            )}
          {!isMobile && (
            <div className="boss3d-theme-one-form-form-antd">
              <Select
                value={setting.orbitButton}
                style={{ width: 240, marginTop: 10 }}
                placeholder="请选择鼠标习惯"
                onChange={e => { this.setOrbitButton(e) }}
                dropdownClassName="boss3d-theme-one-form-form-antd-dropdown bos3d-select-dropdown-select-single-has-anticon"
                getPopupContainer={() => this.props.viewer.viewportDiv}
              >
                <Option value="left">左键旋转</Option>
                <Option value="right">右键旋转</Option>
              </Select>
            </div>
          )}
        </div>
        <div className={style.settingItem}>
          <span>反转滚轮缩放方向</span>
          <Slider
            checked={setting.reverseWheelDirection}
            onClick={enable => { this.reverseWheelDirection(enable) }}
          />
        </div>
        <div className={style.settingItem} style={isMobile ? { borderBottom: 'none' } : {}}>
          <span>缩放速度</span>
          {
            !isMobile && (
              <div className={style.rangeInput}>
                <span>慢</span>
                <Ranger
                  min={0.2}
                  step={0.4}
                  max={1.8}
                  value={setting.zoomSpeed}
                  onChange={speed => this.setZoomSpeed(speed)}
                />
                <span>快</span>
              </div>
            )
          }
        </div>
        {
          // 缩放速度 移动端适配 start
          isMobile && (
            <div className={style.settingItem}>
              <div className={style.mobileSettingItemOne}>
                <div>
                  <AntdSlider
                    min={0.2}
                    step={0.1}
                    max={1.8}
                    value={setting.zoomSpeed}
                    onChange={speed => this.setZoomSpeed(speed)}
                  />
                </div>
                <div className={style.mobileSettingItemOneBottom}>
                  <span>慢</span>
                  <span>快</span>
                </div>
              </div>
            </div>
          )
          // 缩放速度 移动端适配 end
        }
        {/*  ==== 相机俯仰角 适配相关 start==== */}
        {
          // 相机俯仰角 web端 start
          !isMobile && (
            <div className={style.settingItem}>
              <span>相机俯仰角</span>
              <div className={style.rotateInput}>
                <div
                  style={{
                    visibility: setting.enableVerticalPolarAngle ? 'visible' : 'hidden',
                  }}
                >
                  <input
                    ref={this.minRotateRef}
                    type="number"
                    defaultValue={-90}
                    min={-90}
                    max={90}
                    step={1}
                    onBlur={e => {
                      e.stopPropagation();
                      const val = e.target.value;
                      if (/^-?\d+$/.test(val)) {
                        this.setMinCameraRotateAngle(Number(val));
                      }
                    }}
                    onChange={e => {
                      e.target.focus();
                    }}
                  />
                  -
                  <input
                    ref={this.maxRotateRef}
                    type="number"
                    defaultValue={90}
                    min={-90}
                    max={90}
                    step={1}
                    onBlur={e => {
                      e.stopPropagation();
                      const val = e.target.value;
                      if (/^-?\d+$/.test(val)) {
                        this.setMaxCameraRotateAngle(Number(val));
                      }
                    }}
                    onChange={e => {
                      e.target.focus();
                    }}
                  />
                  <span style={{ margin: "0 3px" }}>度</span>
                </div>
                <Slider
                  checked={setting.enableVerticalPolarAngle}
                  onClick={enable => { this.enableVerticalPolarAngle(enable) }}
                />
              </div>
            </div>
          )
          // 相机俯仰角 web端 end
        }
        {
          // 相机俯仰角 h5端 start
          isMobile && (
            <>
              <div className={style.settingItemHasChild}>
                {/* 顶部 start */}
                <div className={style.settingItemHasChildTop}>
                  <span>相机俯仰角</span>
                  <div>
                    <input
                      type="hidden"
                      ref={this.minRotateRef}
                    />
                    <input
                      type="hidden"
                      ref={this.maxRotateRef}
                    />
                    <Slider
                      checked={setting.enableVerticalPolarAngle}
                      onClick={enable => { this.enableVerticalPolarAngle(enable) }}
                    />
                  </div>
                </div>
                {/* 顶部 end */}
                <div style={{ margin: 10 }} />
                {/* 中间 start */}
                <div className={style.settingItemHasChildTop} hidden={!setting.enableVerticalPolarAngle}>
                  <span className={style.mobilePolarAngleWrap}>
                    相机俯仰角区间
                    <span className={style.mobileValue}>
                      {this.state.setting.minCameraRotateAngle}
                      {' '}
                      ~
                      {' '}
                      {this.state.setting.maxCameraRotateAngle}
                    </span>
                    度
                    <AntdIcon
                      role="presentation"
                      type="iconicon_arrowright"
                      className={`${style.mobilePolarAngleIcon} ${this.state.showCmeraRotateAnglePick ? style.open : ''}`}
                      onClick={() => {
                        this.setState((state) => ({
                          showCmeraRotateAnglePick: !state.showCmeraRotateAnglePick
                        }));
                      }}
                    />
                  </span>
                </div>
                {/* 中间 end */}
                <div style={{ margin: 10 }} />
                {/* bottom  start */}
                {this.state.showCmeraRotateAnglePick && setting.enableVerticalPolarAngle && (
                  <div className={style.pickMobileWrap}>
                    <CameraSettingHelpForVerticalPolarAngle
                      minCameraRotateAngle={this.state.setting.minCameraRotateAngle + 90}
                      maxCameraRotateAngle={this.state.setting.maxCameraRotateAngle + 90}
                      setMaxCameraRotateAngle={(val) => {
                        this.setMaxCameraRotateAngle(Number(val));
                      }}
                      setMinCameraRotateAngle={(val) => {
                        this.setMinCameraRotateAngle(Number(val));
                      }}
                    />
                  </div>
                )}
                {/* bottom end */}
              </div>

            </>
          )
          // 相机俯仰角 h5端 end
        }
        {/*  ==== 相机俯仰角 适配相关 end==== */}

        {/*  ==== 动画持续时间（全局，默认值800ms） 适配相关 START==== */}
        {
          !isMobile && (
            <div className={style.settingItem}>
              <span>动画持续时间（全局，默认值800ms）</span>
              <div>
                <input
                  style={{ width: 78 }}
                  ref={this.animatorDurationInputRef}
                  type="number"
                  defaultValue={800}
                  min={50}
                  max={2000}
                  step={50}
                  onChange={e => {
                    e.target.focus();
                  }}
                  onBlur={e => {
                    e.stopPropagation();
                    const val = e.target.value;
                    if (/^\d+$/.test(val)) {
                      this.setAnimatorDuration(Number(val));
                    }
                  }}
                />
                <span style={{ marginLeft: "6px" }}>ms</span>
              </div>
            </div>
          )
        }
        {
          isMobile && (
            <>
              <div className={style.settingItem} style={isMobile ? { borderBottom: 'none' } : {}}>
                <span>动画持续时间（全局，默认值800ms）</span>
                <div>
                  <input
                    style={{ width: 78 }}
                    ref={this.animatorDurationInputRef}
                    defaultValue={800}
                    min={50}
                    max={2000}
                    step={50}
                    onChange={e => {
                      e.target.focus();
                    }}
                    type="hidden"
                    onBlur={e => {
                      e.stopPropagation();
                      const val = e.target.value;
                      if (/^\d+$/.test(val)) {
                        this.setAnimatorDuration(Number(val));
                      }
                    }}
                  />
                  {this.state.setting.animatorDuration}
                  <span style={{ marginLeft: "6px" }}>ms</span>
                </div>
              </div>
              <div className={style.settingItem}>
                <div className={style.mobileSettingItemOne}>
                  <div>
                    <AntdSlider
                      min={50}
                      max={2000}
                      step={50}
                      value={this.state.setting.animatorDuration}
                      onChange={speed => this.setAnimatorDuration(speed)}
                    />
                  </div>
                  <div className={style.mobileSettingItemOneBottom}>
                    <span>50 ms</span>
                    <span>2000 ms</span>
                  </div>
                </div>
              </div>
            </>
          )
        }
        {/*  ==== 动画持续时间（全局，默认值800ms） 适配相关 END==== */}

        {/* <div className={style.settingItem}>
          <span>光照强度</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={0.72}
            onChange={e => {
              e.stopPropagation();
              this.dbSetLightIntensity(Number(e.target.value));
            }}
          />
        </div> */}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
  cameraSetting: state.userSetting.cameraSetting,
});
const mapDispatchToProps = (dispatch) => ({
  changeCameraSetting: (name, value) => dispatch(changeCameraSetting(name, value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CameraSetting);
