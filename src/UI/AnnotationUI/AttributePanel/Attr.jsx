import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import FillAttributePanel from '../AttributePanel/FillAttributePanel'
import StrokeAttributePanel from '../AttributePanel/StrokeAttributePanel'
import TextAttributePanel from '../AttributePanel/TextAttributePanel'
import { ButtonAction, DEF_COLOR } from '../resource'

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
      ButtonAction.DrawLine, ButtonAction.DrawFreeLine, ButtonAction.DrawArrow, ButtonAction.DrawRect,
      ButtonAction.DrawCircle, ButtonAction.DrawEllipse, ButtonAction.DrawCloudLine, ButtonAction.DrawFreeCloudLine]
      .includes(selectedButton);

    const showTextAttr = [ButtonAction.DrawText].includes(selectedButton);

    // 当前选择的操作按钮是否可以内部填充颜色，如果选择画线条，只有线条宽，没有填充功能，此时需要适当改变下标题显示
    let seletedBtnCanFill = showFillAttr ? true : false;

    if (!showFillAttr && !showStrokeAttr && !showTextAttr) return <div></div>

    return (
      <div className={style.attributeContainer}>
        {
          showFillAttr && <FillAttributePanel
            isTextAttri={isTextAttri}
            fillColor={(this.props.fillColor === "none" && this.props.isTextAttri === true) ? DEF_COLOR : this.props.fillColor}
            setFillColor={this.props.setFillColor}
            isMobile={isMobile}
          />
        }
        {
          showStrokeAttr && <StrokeAttributePanel
            strokeColor={this.props.strokeColor}
            strokeWidth={this.props.strokeWidth}
            setStrokeColor={this.props.setStrokeColor}
            setStrokeWidth={this.props.setStrokeWidth}
            seletedBtnCanFill={seletedBtnCanFill}
            isMobile={isMobile}
          />
        }

        {showTextAttr && <TextAttributePanel
          fontSize={this.props.fontSize}
          text={this.props.text}
          setFontSize={this.props.setFontSize}
          setText={this.props.setText}
          isMobile={isMobile}
        />
        }

      </div>
    );
  }
}

Attr.propTypes = {
  snapshot: PropTypes.object,
  editorData: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  viewer: PropTypes.object.isRequired,
};

Attr.defaultProps = {
  snapshot: undefined,
  editorData: undefined,
  onClose: () => { },
  onSave: () => { }
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
});
const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Attr);

export { Attr };
