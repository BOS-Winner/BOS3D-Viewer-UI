import React from "react";
import PropTypes from "prop-types";
import style from "./icon.less";

/**
 * @class Icon
 * @desc 图标类，方便创建Icon
 * @constructor
 * @param {object} props
 * @param {string} [className] - custom class name
 * @param {htmlElement} icon - antdIcon
 * @param {string} title - 图标名称
 * @param {boolean} [showTitle = true] - 默认显示图标名称
 * @param {boolean} [selected = false] - is selected
 */
class Icon extends React.PureComponent {
  render() {
    return (
      <div
        className={`${style.icon} ${this.props.className}`}
        role="button"
        tabIndex={0}
        data-selected={this.props.selected}
        onClick={ev => {
          this.props.onClick(ev);
        }}
        // style={this.props.title && this.props.title.length > 2 ? { width: `${this.props.title.length * 16}px` } : {}}
      >
        {this.props.icon}
        {this.props.showTitle
          ? <span>{this.props.title}</span>
          : null}
      </div>
    );
  }
}

Icon.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.object.isRequired,
  title: PropTypes.string,
  showTitle: PropTypes.bool,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};

Icon.defaultProps = {
  className: "",
  selected: false,
  title: "",
  showTitle: true,
  onClick: () => {},
};

export default Icon;
