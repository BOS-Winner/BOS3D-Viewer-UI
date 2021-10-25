import React from "react";;
import style from "./IconItem.less";
import { AntdIcon } from '../../../utils/utils';

class ToolbarItem extends React.PureComponent {
  render () {
    const { disabled } = this.props;
    return (
      <div
        role="presentation"
        title={this.props.title}
        className={`${style.icon} ${this.props.selected ? style.iconSelected : ""} ${disabled ? style.disabled : style.canTap}`}
      >
        <AntdIcon type={this.props.icon} className={`${style.titleIcon} `} />
      </div>
    );
  }
}

ToolbarItem.propTypes = {

};

ToolbarItem.defaultProps = {

};

export default ToolbarItem;
