import React from "react";
import PropTypes from "prop-types";
import { padStart } from "lodash-es";
import ColorMatrix from "./ColorMatrix";
import ColorBar from "./ColorBar";
import ColorInput from "./ColorInput";
import style from "./style.less";

/**
 * @class ColorBoard
 * @desc 调色板
 */
class ColorBoard extends React.Component {
  /**
   * @constructor
   * @param {object} props
   * @param {string} props.viewportId - html元素的id，用于在指定元素内弹出提示框
   * @param {string} [props.className] - css className
   * @param {CSSStyleDeclaration} [props.style] - css style
   * @param {function} props.onOk - 点击确定回调，传入颜色（16进制整数）和透明度（0-255）
   * @param {function} [props.onCancel] - 点击取消回调
   * @param {function} [props.onClear] - 点击清除回调
   */
  constructor(props) {
    super(props);
    this.state = {
      color: 0,
      opacity: 255,
    };
  }

  onColorSelect(colorArr) {
    this.setState({
      color: (colorArr[0] << 16) + (colorArr[1] << 8) + colorArr[2],
      opacity: 255,
    });
  }

  preventEvent(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const r = (this.state.color & 0xff0000) >> 16;
    const g = (this.state.color & 0xff00) >> 8;
    const b = this.state.color & 0xff;
    const a = this.state.opacity / 255;
    return (
      <div
        className={`${style.palette} ${this.props.className}`}
        style={this.props.style}
        role="presentation"
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <div className={style.layout}>
          <ColorMatrix onClick={colorArr => { this.onColorSelect(colorArr) }} />
          <div className={style.smallScreen}>
            <div
              className={style["color-preview"]}
              style={{
                backgroundColor: `rgba(${r},${g},${b},${a})`
              }}
            />
            <ColorBar
              color={this.state.color}
              opacity={this.state.opacity}
              onChange={(color, opacity) => {
                this.setState({
                  color,
                  opacity
                });
              }}
            />
            <ColorInput
              color={`${
                padStart(this.state.color.toString(16), 6, '0')
              }${
                padStart(this.state.opacity.toString(16), 2, '0')
              }`}
              onChange={color => {
                this.setState({
                  color: parseInt(color.slice(0, 6), 16),
                  opacity: parseInt(color.slice(6), 16)
                });
              }}
              viewportId={this.props.viewportId}
            />
          </div>
        </div>
        <div className={style.buttonGroup}>
          <button
            type="button"
            onClick={(e) => {
              this.preventEvent(e);
              this.props.onOk(this.state.color, this.state.opacity);
            }}
          >
            确认
          </button>
          <button
            type="button"
            onClick={(e) => {
              this.preventEvent(e);
              this.props.onCancel();
            }}
          >
            取消
          </button>
          {
            this.props.onClear
              ? (
                <button
                  type="button"
                  onClick={(e) => {
                    this.preventEvent(e);
                    this.props.onClear();
                  }}
                >
                  清除
                </button>
              )
              : null
          }
        </div>
      </div>
    );
  }
}

ColorBoard.propTypes = {
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onClear: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  viewportId: PropTypes.string.isRequired,
};

ColorBoard.defaultProps = {
  onCancel: () => {},
  onClear: undefined,
  className: '',
  style: {},
};

export default ColorBoard;
