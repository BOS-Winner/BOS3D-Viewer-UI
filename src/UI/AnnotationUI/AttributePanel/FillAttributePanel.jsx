import React from "react";
import PropTypes from "prop-types";
import style from "./style.less";
import ColorPickButton from "./ColorPickButton";
import { DEF_COLOR } from '../resource'
class FillAttributePanel extends React.PureComponent {

  render() {
    const { isTextAttri, isMobile } = this.props;
    let fillColorTitle = isTextAttri ? '颜色' : '填充色';
    let restoreColor = isTextAttri ? DEF_COLOR : 'none'
    return (
      <div className={style.attribute}>
        <div className={style["attribute-name"]}>{fillColorTitle}</div>
        <div className={style["attribute-value"]}>
          <ColorPickButton
            setColor={this.props.setFillColor}
            color={this.props.fillColor}
            restoreColor={restoreColor}
            canClearColor
            isMobile={isMobile}
          />
        </div>
      </div>
    );
  }
}

FillAttributePanel.propTypes = {
  fillColor: PropTypes.string,
  setFillColor: PropTypes.func
};

FillAttributePanel.defaultProps = {
  fillColor: "#FFFFFF",
  setFillColor: () => { }
};

export default FillAttributePanel;
