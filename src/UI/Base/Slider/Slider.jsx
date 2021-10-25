import React from "react";
import PropTypes from "prop-types";
import style from "./style.less";

/**
 * @class Slider
 * @desc 滑块
 */
class Slider extends React.Component {
  /**
   * @constructor
   * @param {object} props
   * @param {boolean} [props.defaultChecked = false] - 默认是否选中
   * @param {function} props.onClick - 点击回调，回传是否选中(boolean)
   * @param {boolean} [props.checked] - 是否选中，可以用于受控的情况
   */
  constructor(props) {
    super(props);
    this.state = {
      checked: props.checked || props.defaultChecked,
    };
  }

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    defaultChecked: PropTypes.bool,
    checked: PropTypes.oneOf([true, false, undefined]),
  };

  static defaultProps = {
    defaultChecked: false,
    checked: undefined,
  };

  shouldComponentUpdate(nextProps) {
    if (nextProps.checked !== this.props.checked && nextProps.checked !== undefined) {
      this.setState({ checked: nextProps.checked });
      return false;
    }
    return true;
  }

  onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof this.props.checked === 'boolean') {
      this.props.onClick(!this.state.checked);
    } else {
      this.setState(state => {
        this.props.onClick(!state.checked);
        return {
          checked: !state.checked
        };
      });
    }
  }

  render() {
    return (
      <div
        className={`${style.slider} ${this.state.checked && style.checked}`}
        role="button"
        tabIndex={0}
        onClick={e => { this.onClick(e) }}
      />
    );
  }
}

export default Slider;
