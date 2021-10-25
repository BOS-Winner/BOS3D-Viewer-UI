import React from 'react';
import PropTypes from "prop-types";
import style from "./style.less";

// tips: 根据ecma262标准，判断一个变量是不是NaN，用自己和自己比较的方法非常靠谱

/**
 * @class NumberControler
 * @desc 数字显示控制
 * @constructor
 * @param {object} props
 * @param {number} [props.initNum = 0] - init number
 * @param {number} [props.num] - 当前值，受控场景专用。此时initNum无效
 * @param {number} [props.step = 0.1] - 步进值
 * @param {number} [props.min = -114514] - 最小值
 * @param {number} [props.max = 114514] - 最大值
 * @param {function} [props.onChange = () => {}] - onChange handler
 */
class NumberControler extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      num: props.num || props.initNum,
    };
  }

  static propTypes = {
    initNum: PropTypes.number,
    step: PropTypes.number,
    onChange: PropTypes.func,
    min: PropTypes.number,
    max: PropTypes.number,
    num: PropTypes.number,
    enableMinus: PropTypes.bool,
    enableAdd: PropTypes.bool,
  };

  static defaultProps = {
    initNum: 0,
    step: 0.1,
    min: -114514,
    max: 114514,
    onChange: () => {},
    num: NaN,
    enableAdd: true,
    enableMinus: true,
  };

  shouldComponentUpdate(nextProps) {
    // 如果受控数值变化且不为NaN
    // eslint-disable-next-line no-self-compare
    if (nextProps.num !== this.props.num && nextProps.num === nextProps.num) {
      this.setState({
        num: nextProps.num,
      });
      return false;
    }
    return true;
  }

  onChange(num) {
    let _num = this.state.num + num;
    if (_num < this.props.min) _num = this.props.min;
    if (_num > this.props.max) _num = this.props.max;
    _num = parseFloat(_num.toFixed(5));
    this.props.onChange(_num);
    // 不是受控模式则手动刷新状态
    // eslint-disable-next-line no-self-compare
    if (this.props.num !== this.props.num) {
      this.setState({ num: _num });
    }
  }

  render() {
    const { num } = this.state;
    const {
      min, max, step, enableAdd, enableMinus
    } = this.props;
    return (
      <div className={style.container}>
        <div
          className={`${style.minButton} ${(num <= min) || !enableAdd ? style.disabled : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => {
            this.onChange(-step);
          }}
        >
          -
        </div>
        <div className={style.number}>{num}</div>
        <div
          className={`${style.maxButton} ${(num >= max) || !enableMinus ? style.disabled : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => {
            this.onChange(step);
          }}
        >
          +
        </div>
      </div>
    );
  }
}

export default NumberControler;
