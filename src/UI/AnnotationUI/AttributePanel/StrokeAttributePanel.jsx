import React from "react";
import PropTypes from "prop-types";
import style from "./style.less";
import ColorPickButton from "./ColorPickButton";
import { DEF_COLOR } from '../resource';

class StrokeAttributePanel extends React.Component {
  constructor(props) {
    super(props);
    this.onRangeChange = this.onRangeChange.bind(this);
    this.onRangeChangeStart = this.onRangeChangeStart.bind(this);
  }

  onRangeChange(event) {
    const value = event.currentTarget.value;
    if (this.props.setStrokeWidth) {
      this.props.setStrokeWidth(parseInt(value, 10), this.eventID);
    }
  }

  onRangeChangeStart() {
    // 用这个标识来判断onRangeChange是否发生在同一次操作中
    this.eventID = new Date().getTime();
  }

  render() {
    const { seletedBtnCanFill, isMobile } = this.props;
    const borderColorTitle = seletedBtnCanFill ? '边框色' : '颜色';
    const borderWidthTitle = seletedBtnCanFill ? '边框宽度' : '宽度';

    return (
      <>
        <div className={style.attribute}>
          <span className={style["attribute-name"]}>{borderColorTitle}</span>
          <div className={style["attribute-value"]}>
            <ColorPickButton setColor={this.props.setStrokeColor} color={this.props.strokeColor} restoreColor={DEF_COLOR} isMobile={isMobile} />
          </div>
        </div>
        <div className={style.attribute}>
          <span className={style["attribute-name"]}>{borderWidthTitle}</span>
          <div className={style["attribute-value"]}>
            <div className={style.strokeAttribute}>
              <input className={style.range} type="range" min={1} max={20} step={1} onMouseDown={this.onRangeChangeStart} onTouchStart={this.onRangeChangeStart} onChange={this.onRangeChange} value={this.props.strokeWidth} />
              <span className={style.strokeWidth}>{this.props.strokeWidth}</span>
            </div>
          </div>
        </div>
      </>
    );
  }
}

StrokeAttributePanel.propTypes = {
  strokeWidth: PropTypes.number,
  strokeColor: PropTypes.string,
  setStrokeWidth: PropTypes.func,
  setStrokeColor: PropTypes.func,
};

StrokeAttributePanel.defaultProps = {
  strokeWidth: 1,
  strokeColor: "none",
  setStrokeWidth: () => { },
  setStrokeColor: () => { },
};

export default StrokeAttributePanel;
