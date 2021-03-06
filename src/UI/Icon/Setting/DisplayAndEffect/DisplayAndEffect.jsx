import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import Slider from "Base/Slider";
import Ranger from "Base/Ranger";
import Header from 'Base/Header';
import { Slider as AntdSlider } from 'antd';
import ChangeBgColor from "../ChangeBgColor";
import SunLight from "./SunLight";
import SkyBox from "./SkyBox";
import { changeDisplaySetting } from "../../../userRedux/userSetting/action";
import settingStyle from "../style.less";
import displaySettingStyle from "./style.less";

class DisplayAndEffect extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
    displaySetting: PropTypes.object.isRequired,
    changeDisplaySetting: PropTypes.func.isRequired,
    isShown: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool,
    modelDetail: PropTypes.object,
  };

  static defaultProps = {
    isMobile: false,
    modelDetail: {}
  }

  constructor(props) {
    super(props);
    this.BOS3D = this.props.BIMWINNER.BOS3D;
    this.state = {
      hasLight: false,
    };
    // this.BOS3D.GlobalData.EnableSelectionOutline = true;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const newSetting = nextProps.displaySetting;
    const oldSetting = this.props.displaySetting;
    if (!_.isEqual(oldSetting, newSetting)) {
      this.BOS3D.GlobalData.EnableSelectionOutline = newSetting.enableSelectionOutline;
      this.BOS3D.GlobalData.EnableSelectionBoundingBox = newSetting.enableSelectionBoundingBox;
      this.BOS3D.GlobalData.EnableSelectionByTranslucent = newSetting.enableSelectionByTranslucent;
      if (newSetting.showCptLines !== oldSetting.showCptLines) {
        this.showCptLines(newSetting.showCptLines);
      }
      const viewer = this.props.viewer;
      if (
        newSetting.enableLogarithmicDepthBuffer !== oldSetting.enableLogarithmicDepthBuffer
      ) {
        viewer.enableLogarithmicDepthBuffer(newSetting.enableLogarithmicDepthBuffer);
      }
      if (newSetting.lightIntensityFactor !== oldSetting.lightIntensityFactor) {
        viewer.setLightIntensityFactor(newSetting.lightIntensityFactor + 1);
      }
      if (newSetting.enableShadow !== oldSetting.enableShadow) {
        viewer.getViewerImpl()
          .enableShadow(newSetting.enableShadow);
      }
      if (newSetting.enableExtraLight !== oldSetting.enableExtraLight) {
        const enable = newSetting.enableExtraLight;
        const models = Object.values(viewer.getViewerImpl().modelManager.models);
        if (enable && nextState.hasLight) {
          // ?????????????????????????????????
          models.forEach(m => {
            if (m.hasLights()) {
              m.enabledLights();
            }
          });
          viewer.getRootScene().lightManager.disableLights();
        } else {
          // ?????????????????????????????????
          models.forEach(m => {
            if (m.hasLights()) {
              m.disabledLights();
            }
          });
          viewer.getRootScene().lightManager.enableLights();
        }
        viewer.render();
      }
    }
    // ????????????????????????????????????????????????
    if (nextProps.isShown && !this.props.isShown) {
      const models = Object.values(this.props.viewer.getViewerImpl().modelManager.models);
      const hasLight = models.some(m => m.hasLights());
      this.setState({
        hasLight,
      });
      return false;
    }
    return true;
  }

  showCptLines(show) {
    const viewer3D = this.props.viewer;
    viewer3D.getViewerImpl().setDrawingStyle(
      show ? this.BOS3D.DrawingStyle.SHADINGWITHLINE : this.BOS3D.DrawingStyle.SHADING
    );
    viewer3D.render();
  }

  setLightIntensityFactor(val) {
    this.props.changeDisplaySetting('lightIntensityFactor', val);
  }

  setShadow(enable) {
    if (enable) {
      this.props.changeDisplaySetting('enableExtraLight', false);
    }
    this.props.changeDisplaySetting('enableShadow', enable);
  }

  setExtraLight(enable) {
    if (enable) {
      this.props.changeDisplaySetting('enableShadow', false);
      this.props.changeDisplaySetting('lightEffect', {
        ...this.props.displaySetting.lightEffect,
        enable: false,
      });
    }
    this.props.changeDisplaySetting('enableExtraLight', enable);
  }

  render() {
    const enableObj = this.props.displaySetting;
    const { hasLight } = this.state;
    const { isMobile, modelDetail } = this.props;
    const isPicker = modelDetail.picker; // ?????????????????????????????????
    return (
      <div>
        <div className={settingStyle.settingContainer}>
          {!isMobile && <Header title="??????" />}
          {isMobile && <div className={displaySettingStyle.mobileTitleOne}>??????</div>}
          {/* 5.0 ????????? */}
          {/* <div className={settingStyle.settingItem}>
            <span>???????????????????????????</span>
            <Slider
              checked={enableObj.enableSelectionOutline}
              onClick={checked => {
                this.props.changeDisplaySetting('enableSelectionOutline', checked);
              }}
            />
          </div> */}
          {
            (
              <>
                <div className={settingStyle.settingItem}>
                  <span>???????????????</span>
                  <Slider
                    checked={enableObj.enableSelectionBoundingBox}
                    onClick={checked => {
                      this.props.changeDisplaySetting('enableSelectionBoundingBox', checked);
                    }}
                  />
                </div>
                <div className={settingStyle.settingItem}>
                  <span>???????????????</span>
                  <Slider
                    checked={enableObj.enableSelectionByTranslucent}
                    onClick={checked => {
                      this.props.changeDisplaySetting('enableSelectionByTranslucent', checked);
                    }}
                  />
                </div>
                {
                  !isPicker
                  && (
                    <div className={settingStyle.settingItem}>
                      <span>???????????????</span>
                      <Slider
                        checked={enableObj.showCptLines}
                        onClick={checked => {
                          this.props.changeDisplaySetting('showCptLines', checked);
                        }}
                      />
                    </div>
                  )
                }
              </>
            )
          }
          <div className={settingStyle.settingItem}>
            <span>?????????</span>
            <ChangeBgColor />
          </div>
        </div>
        {!isMobile && <Header title="??????" />}
        {isMobile && <div className={displaySettingStyle.mobileTitleOne}>??????</div>}
        <div className={settingStyle.settingContainer}>
          <div className={settingStyle.settingItem} style={isMobile ? { marginTop: 0 } : {}}>
            <div>??????</div>
            <Slider
              checked={enableObj.enableShadow}
              onClick={showShadow => this.setShadow(showShadow)}
            />
          </div>
          <SunLight
            viewer={this.props.viewer}
            displaySetting={this.props.displaySetting}
            changeDisplaySetting={(k, v) => this.props.changeDisplaySetting(k, v)}
          />
          {
            hasLight ? (
              <div className={settingStyle.settingItem}>
                <div>????????????</div>
                <Slider
                  checked={enableObj.enableExtraLight}
                  onClick={enable => this.setExtraLight(enable)}
                />
              </div>
            ) : <></>
          }
          <div className={settingStyle.settingItem}>
            <span>???????????????</span>
            <Slider
              checked={enableObj.enableLogarithmicDepthBuffer}
              onClick={enable => {
                this.props.changeDisplaySetting('enableLogarithmicDepthBuffer', enable);
              }}
            />
          </div>
          <div className={settingStyle.settingItem} style={isMobile ? { borderBottom: 'none' } : {}}>
            <span>????????????</span>
            {!isMobile && (
              <div className={displaySettingStyle.lightIntensity}>
                <Ranger
                  min={-1}
                  max={1}
                  step={0.1}
                  value={enableObj.lightIntensityFactor}
                  onChange={val => this.setLightIntensityFactor(val)}
                />
                <div className={displaySettingStyle.tag}>
                  <span>-1</span>
                  <span>0</span>
                  <span>&nbsp;1</span>
                </div>
              </div>
            )}
          </div>
          {/* ?????????????????? start */}
          {
            isMobile && (
              <div className={settingStyle.settingItem}>

                <div className={settingStyle.mobileSettingItemOne}>
                  <div>
                    <AntdSlider
                      min={-1}
                      max={1}
                      step={0.1}
                      value={enableObj.lightIntensityFactor}
                      onChange={val => this.setLightIntensityFactor(val)}
                    />
                  </div>
                  <div className={settingStyle.mobileSettingItemOneBottom}>
                    <span>-1</span>
                    <span>0</span>
                    <span>1</span>
                  </div>
                </div>
              </div>
            )
          }
          <SkyBox
            viewer={this.props.viewer}
            displaySetting={this.props.displaySetting}
            changeDisplaySetting={(k, v) => this.props.changeDisplaySetting(k, v)}
            isMobile={isMobile}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
  displaySetting: state.userSetting.displaySetting,
  modelDetail: state.system.model,
});
const mapDispatchToProps = (dispatch) => ({
  changeDisplaySetting: (name, value) => {
    dispatch(changeDisplaySetting(name, value));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DisplayAndEffect);
