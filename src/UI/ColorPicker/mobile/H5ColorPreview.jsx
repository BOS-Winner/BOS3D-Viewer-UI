import React from "react";
import PropTypes from "prop-types";
import * as style from "./H5ColorPreview.less";

class H5ColorPreview extends React.Component {
  render() {
    const rgb = this.props.color.rgb;
    return (
      <div className={style.container}>
        <div style={{ backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.props.color.alpha}` }} className={style.colorPreview} />
      </div>
    );
  }

  onColorPick(index) {
    if (this.props.colorSelectCallback) {
      this.props.colorSelectCallback(this.props.colors[index]);
    }
  }

  onRecentColorPick(index, color) {
    if (color.rgb) {
      this.props.colorSelectCallback && this.props.colorSelectCallback(this.props.recentColors[index]);
    }
  }
}

H5ColorPreview.propTypes = {
  colors: PropTypes.array,
  colorSelectCallback: PropTypes.func
};

H5ColorPreview.defaultProps = {
  colors: undefined,
  colorSelectCallback: undefined
};

export default H5ColorPreview;
