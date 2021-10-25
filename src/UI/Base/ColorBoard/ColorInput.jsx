import React from "react";
import _ from "lodash-es";
import PropTypes from "prop-types";
import toastr from "../../toastr";
import style from "./style.less";

/**
 * rgba转hex
 * @param {string} r - r的字符串
 * @param {string} g - g的字符串
 * @param {string} b - b的字符串
 * @param {string} a - a的字符串
 * @return {string} - hex的字符串
 */
function rgba2hex(r, g, b, a) {
  return _.padStart(Number(r).toString(16), 2, '0')
    + _.padStart(Number(g).toString(16), 2, '0')
    + _.padStart(Number(b).toString(16), 2, '0')
    + _.padStart(Math.round(Number(a) * 255).toString(16), 2, '0');
}

/**
 * hex转rgba
 * @param {string} hex - hex的字符串
 * @return {{r: string, g: string, b: string, a: string}}
 */
function hex2rgba(hex) {
  return {
    r: parseInt(hex.slice(0, 2), 16)
      .toString(),
    g: parseInt(hex.slice(2, 4), 16)
      .toString(),
    b: parseInt(hex.slice(4, 6), 16)
      .toString(),
    a: _.round(parseInt(hex.slice(6, 8), 16) / 255, 2)
      .toString()
  };
}

/**
 * @class ColorInput
 * @desc 颜色输入框
 */
class ColorInput extends React.Component {
  /**
   * @constructor
   * @param {object} props
   * @param {string} [props.color = ''] - 颜色, 八位十六进制数，不包括#
   * @param {function} [props.onChange] - 颜色变化回调，只有合法时才触发，传入color
   */
  constructor(props) {
    super(props);
    const initColor = {
      r: '0',
      g: '0',
      b: '0',
      a: '1',
      hex: '000000ff',
    };
    if (props.color.length === 8) {
      initColor.hex = props.color;
      _.assign(initColor, hex2rgba(props.color));
    }
    this.state = {
      mode: 'rgba',
      ...initColor
    };
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.color !== this.props.color) {
      this.setState({
        hex: nextProps.color,
        ...hex2rgba(nextProps.color)
      });
      return false;
    } else {
      return true;
    }
  }

  onChangeMode(e) {
    e.preventDefault();
    e.stopPropagation();
    const {
      mode, hex
    } = this.state;
    if (mode === 'rgba') {
      // rgba转hex
      this.setState({
        mode: 'hex',
      });
    } else if (/^[\da-f]{8}$/.test(hex)) {
      // hex转rgba，先验证hex有效性，无效则不转换
      this.setState({
        mode: 'rgba',
      });
    } else {
      toastr.error("hex值错误", "", {
        target: `#${this.props.viewportId}`
      });
    }
  }

  onChange(e) {
    const target = e.target;
    let value = target.value;
    if (target.getAttribute('data-num') === 'hex' && /^[\da-f]*$/.test(value)) {
      this.setState({
        hex: value
      });
      if (value.length === 8) {
        this.props.onChange(value);
      }
    }
    if (/^[rgb]$/.test(target.getAttribute('data-num')) && /^\d*$/.test(value)) {
      if (Number(value) > 255) {
        value = '255';
      }
      if (Number(value) <= 0) {
        value = '0';
      }
      const state = {
        ...this.state,
        [target.getAttribute('data-num')]: value.replace(/^0+(\d+)/, '$1')
      };
      state.hex = rgba2hex(state.r, state.g, state.b, state.a);
      this.props.onChange(state.hex);
      this.setState(state);
    }
    if (target.getAttribute('data-num') === 'a') {
      if (value === '01') value = '1';
      if (value === '') value = '0';
      if (/^(1|0(\.\d{0,2})?)$/.test(value)) {
        this.setState(state => {
          const hex = `${state.hex.slice(0, 6)}${
            _.padStart(Math.round(Number(value) * 255).toString(16), 2, '0')
          }`;
          this.props.onChange(hex);
          return {
            a: value,
            hex
          };
        });
      }
    }
  }

  render() {
    const content = [];
    const {
      r, g, b, a, hex, mode
    } = this.state;
    if (mode === 'rgba') {
      content.push(
        <input key="r" data-num="r" type="text" maxLength={3} value={r} />
      );
      content.push(
        <input key="g" data-num="g" type="text" maxLength={3} value={g} />
      );
      content.push(
        <input key="b" data-num="b" type="text" maxLength={3} value={b} />
      );
      content.push(
        <input key="a" data-num="a" type="text" maxLength={4} value={a} />
      );
    } else {
      content.push(
        <input
          key="hex"
          type="text"
          data-num="hex"
          value={hex}
          maxLength={8}
        />
      );
    }
    return (
      <div
        className={style["color-input"]}
        onChange={e => {
          this.onChange(e);
        }}
      >
        <span>
          {mode === 'rgba' ? 'rgba(' : '#'}
        </span>
        <div>
          {content}
        </div>
        <span>
          {mode === 'rgba' && ')'}
        </span>
        <button
          className={style.changeMode}
          type="button"
          onClick={(e) => {
            this.onChangeMode(e);
          }}
        >
          {mode === 'rgba' ? 'hex' : 'rgba'}
        </button>
      </div>
    );
  }
}

ColorInput.propTypes = {
  color: PropTypes.string,
  onChange: PropTypes.func,
  viewportId: PropTypes.string.isRequired,
};

ColorInput.defaultProps = {
  color: '',
  onChange: () => {}
};

export default ColorInput;
