import React from "react";
import PropTypes from "prop-types";
import style from "./style.less";

/**
 * @class ColorBar
 * @desc 颜色滑块控制
 */
class ColorBar extends React.Component {
  /**
   * @constructor
   * @param {object} props
   * @param {number} [props.color = -1] 颜色，六位十六进制数
   * @param {number} [props.opacity = -1] 透明度，0-255
   * @param {function} [props.onChange] 滑块变动时触发的回调，依次传入color和opacity
   */
  constructor(props) {
    super(props);
    this.state = {
      color: props.color < 0 ? 0 : props.color,
      opacity: props.opacity < 0 ? 255 : props.opacity
    };
  }

  shouldComponentUpdate(nextProps) {
    if ((nextProps.color !== this.props.color) || (nextProps.opacity !== this.props.opacity)) {
      this.setState(state => ({
        color: nextProps.color < 0 ? state.color : nextProps.color,
        opacity: nextProps.color < 0 ? state.opacity : nextProps.opacity
      }));
      return false;
    } else {
      return true;
    }
  }

  onChange(e) {
    let { color, opacity } = this.state;
    const value = parseInt(e.target.value, 10);
    switch (e.target.getAttribute("data-num")) {
      case 'r':
        color = color & 0xffff | (value << 16);
        break;
      case 'g':
        color = color & 0xff00ff | (value << 8);
        break;
      case 'b':
        color = color & 0xffff00 | value;
        break;
      case 'a':
        opacity = value;
        break;
      default:
        break;
    }
    this.props.onChange(color, opacity, this);
  }

  render() {
    const { color, opacity } = this.state;
    const r = color >> 16;
    const g = color >> 8 & 0xff;
    const b = color & 0xff;
    return (
      <div
        className={style["color-bar"]}
        role="presentation"
        onClick={e => {
          e.stopPropagation();
        }}
        onChange={e => {
          this.onChange(e);
        }}
      >
        <div>
          <span>红：</span>
          <input data-num="r" type="range" min={0} max={255} step={1} value={r} />
        </div>
        <div>
          <span>绿：</span>
          <input data-num="g" type="range" min={0} max={255} step={1} value={g} />
        </div>
        <div>
          <span>蓝：</span>
          <input data-num="b" type="range" min={0} max={255} step={1} value={b} />
        </div>
        <div>
          <span>透明度：</span>
          <input data-num="a" type="range" min={0} max={255} step={1} value={opacity} />
        </div>
      </div>
    );
  }
}

ColorBar.propTypes = {
  onChange: PropTypes.func,
  color: PropTypes.number,
  opacity: PropTypes.number,
};

ColorBar.defaultProps = {
  onChange: (color, opacity, that) => {
    that.setState({
      color,
      opacity
    });
  },
  color: -1,
  opacity: -1,
};

export default ColorBar;
