import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import ColorPicker from "../../../ColorPicker";
import { changeDisplaySetting } from "../../../userRedux/userSetting/action";
import changeColorPng from "../../img/white/changeColor.png";

class ChangeBgColor extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    changeBgColor: PropTypes.func.isRequired,
    bgColor: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    // 颜色拾取器实例
    this._colorPicker = undefined;
  }

  shouldComponentUpdate(nextProps) {
    if (!nextProps.bgColor.hex) {
      this.props.viewer.resetSceneBackgroundColor();
      return false;
    }
    if (nextProps.bgColor && !_.isEqual(nextProps.bgColor, this.props.bgColor)) {
      this.changeBgColor(nextProps.bgColor.hex, nextProps.bgColor.alpha);
    }
    return false;
  }

  onClick() {
    if (this._colorPicker) {
      this._colorPicker.dismiss();
      this._colorPicker = undefined;
    } else {
      ColorPicker.showAtRight(
        {
          title: "背景色",
          onConfirm: (color) => {
            this.props.changeBgColor(color);
          },
          didMount: (ref) => {
            this._colorPicker = ref;
          },
          onClose: () => {
            this._colorPicker = undefined;
          },
          onRestore: () => {
            this.props.changeBgColor({});
          }
        }, this.props.viewer.viewportDiv);
    }
  }

  changeBgColor(color, opacity) {
    this.props.viewer.setSceneBackGroundColor(
      color,
      opacity
    );
  }

  render() {
    return (
      <div
        title="改变背景色"
        role="button"
        tabIndex={0}
        style={{
          display: 'flex'
        }}
        onClick={(e) => {
          this.onClick(e);
        }}
      >
        <img
          style={{
            width: '32px', height: '32px', paddingLeft: 0, boxSizing: 'border-box', cursor: 'pointer'
          }}
          alt="change backgroundColor"
          src={changeColorPng}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  bgColor: state.userSetting.displaySetting.bgColor,
});
const mapDispatchToProps = (dispatch) => ({
  changeBgColor: value => dispatch(
    changeDisplaySetting('bgColor', value)
  ),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeBgColor);
