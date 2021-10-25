import React from "react";
import PropTypes from "prop-types";
import style from "./ToolbarItem.less";
import { AntdIcon } from '../../utils/utils';

class ToolbarItem extends React.PureComponent {
  render () {
    const { disabled } = this.props;
    return (
      <div
        role="presentation"
        title={this.props.title}
        className={`${style.icon} ${this.props.selected ? style.iconSelected : ""} ${disabled ? style.disabled : style.canTap}`}
        onClick={disabled ? undefined : () => this.props.onClick(this.props.tag)}
      >
        <AntdIcon type={this.props.icon} className={`${style.titleIcon} `} />
      </div>
    );
  }
}

ToolbarItem.propTypes = {
  tag: PropTypes.string,
  selected: PropTypes.bool,
  title: PropTypes.string,
  icon: PropTypes.string,
  iconDisable: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool
};

ToolbarItem.defaultProps = {
  tag: undefined,
  selected: false,
  disabled: false,
  title: "",
  icon: undefined,
  iconDisable: undefined,
  onClick: () => { }
};

export default ToolbarItem;
