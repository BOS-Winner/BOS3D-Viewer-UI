import React from "react";
import PropTypes from "prop-types";
import style from "./style.less";

class TextAttributePanel extends React.Component {
  constructor(props) {
    super(props);
    this.onRangeChange = this.onRangeChange.bind(this);
    this.onRangeChangeStart = this.onRangeChangeStart.bind(this);
  }

  onRangeChangeStart () {
    // 用这个标识来判断onRangeChange是否发生在同一次操作中
    this.eventID = new Date().getTime();
  }

  onRangeChange (event) {
    const value = event.currentTarget.value;
    if (this.props.setFontSize) {
      this.props.setFontSize(parseInt(value, 10), this.eventID);
    }
  }

  render () {
    return (
      <div className={style.attribute}>
        <span className={style["attribute-name"]}>字号</span>
        <div className={style["attribute-value"]}>
          <div className={style.strokeAttribute}>
            <input className={style.range} type="range" min={14} max={60} step={1} onMouseDown={this.onRangeChangeStart} onTouchStart={this.onRangeChangeStart} onChange={this.onRangeChange} value={this.props.fontSize} />
            <span className={style.strokeWidth}>{this.props.fontSize}</span>
          </div>
        </div>
      </div>
    );
  }
}

TextAttributePanel.propTypes = {
  fontSize: PropTypes.number,
  setFontSize: PropTypes.func,
};

TextAttributePanel.defaultProps = {
  fontSize: 16,
  setFontSize: () => { },
};

export default TextAttributePanel;
