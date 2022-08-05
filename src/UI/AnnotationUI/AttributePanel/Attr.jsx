import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import FillAttributePanel from "./FillAttributePanel";
import StrokeAttributePanel from "./StrokeAttributePanel";
import TextAttributePanel from "./TextAttributePanel";
import { ButtonAction, DEF_COLOR } from '../resource';

import style from "./style.less";

class Attr extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const { selectedButton, isTextAttri, isMobile } = this.props;
    const showFillAttr = [
      ButtonAction.DrawText, ButtonAction.DrawRect, ButtonAction.DrawCircle,
      ButtonAction.DrawEllipse, ButtonAction.DrawCloudLine, ButtonAction.DrawFreeCloudLine]
      .includes(selectedButton);

    const showStrokeAttr = [
      ButtonAction.DrawLine,
      ButtonAction.DrawFreeLine,
      ButtonAction.DrawArrow,
      ButtonAction.DrawRect,
      ButtonAction.DrawCircle,
      ButtonAction.DrawEllipse,
      ButtonAction.DrawCloudLine,
      ButtonAction.DrawFreeCloudLine]
      .includes(selectedButton);

    const showTextAttr = [ButtonAction.DrawText].includes(selectedButton);

    // 当前选择的操作按钮是否可以内部填充颜色，如果选择画线条，只有线条宽，没有填充功能，此时需要适当改变下标题显示
    const seletedBtnCanFill = !!showFillAttr;

    if (!showFillAttr && !showStrokeAttr && !showTextAttr) return <div />;

    return (
      <div className={style.attributeContainer}>
        {
          showFillAttr && (
            <FillAttributePanel
              isTextAttri={isTextAttri}
              fillColor={(this.props.fillColor === "none" && this.props.isTextAttri === true) ? DEF_COLOR : this.props.fillColor}
              setFillColor={this.props.setFillColor}
              isMobile={isMobile}
            />
          )
        }
        {
          showStrokeAttr && (
            <StrokeAttributePanel
              strokeColor={this.props.strokeColor}
              strokeWidth={this.props.strokeWidth}
              setStrokeColor={this.props.setStrokeColor}
              setStrokeWidth={this.props.setStrokeWidth}
              seletedBtnCanFill={seletedBtnCanFill}
              isMobile={isMobile}
            />
          )
        }

        {showTextAttr && (
          <TextAttributePanel
            fontSize={this.props.fontSize}
            text={this.props.text}
            setFontSize={this.props.setFontSize}
            setText={this.props.setText}
            isMobile={isMobile}
          />
        )}

      </div>
    );
  }
}

Attr.propTypes = {
  // snapshot: PropTypes.object,
  // editorData: PropTypes.object,
  // onClose: PropTypes.func,
  // onSave: PropTypes.func,
  // viewer: PropTypes.object.isRequired,
  setText: PropTypes.func.isRequired,
  setFontSize: PropTypes.func.isRequired,
  text: PropTypes.string,
  fontSize: PropTypes.number.isRequired,
  strokeColor: PropTypes.string.isRequired,
  strokeWidth: PropTypes.number.isRequired,
  setStrokeColor: PropTypes.func.isRequired,
  setStrokeWidth: PropTypes.func.isRequired,
  setFillColor: PropTypes.func.isRequired,
  fillColor: PropTypes.string.isRequired,
  isTextAttri: PropTypes.bool.isRequired,
  selectedButton: PropTypes.string,
  isMobile: PropTypes.bool.isRequired,
};

Attr.defaultProps = {
  // snapshot: undefined,
  // editorData: undefined,
  // onClose: () => { },
  // onSave: () => { }
  text: "",
  selectedButton: ""
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D || state.system.viewer2D,
});
const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Attr);

export { Attr };
