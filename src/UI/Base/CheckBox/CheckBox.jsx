import * as React from "react";
import PropTypes from "prop-types";
import normalIcon from "./normal.png";
import selectIcon from "./select.png";
import * as style from "./CheckBox.less";

class CheckBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: props.checked
    };
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.checked !== this.props.checked) {
      this.setState({
        checked: nextProps.checked,
      });
      return false;
    }

    return true;
  }

  click() {
    const checked = this.state.checked;
    this.setState({
      checked: !checked
    });
    this.props.onValueChange(!checked);
  }

  render() {
    return (
      <div role="presentation" className={style.container}>
        <div
          role="presentation"
          className={style.box}
          style={{
            width: `${this.props.width}px`,
            height: `${this.props.height}px`,
            backgroundImage: `url(${this.state.checked ? this.props.selectIconUrl : this.props.normalIconUrl})`,
          }}
          onClick={(e) => { this.click(e) }}
        />
      </div>
    );
  }
}

CheckBox.propTypes = {
  checked: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  onValueChange: PropTypes.func,
  normalIconUrl: PropTypes.string,
  selectIconUrl: PropTypes.string,
};

CheckBox.defaultProps = {
  // 初始值
  checked: false,
  width: 16,
  height: 16,
  onValueChange: () => {},
  normalIconUrl: normalIcon,
  selectIconUrl: selectIcon,
};

export default CheckBox;
