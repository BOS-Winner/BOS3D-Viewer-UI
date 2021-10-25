import React from "react";
import PropTypes from "prop-types";
import * as style from "./RecentColors.less";

class RecentColors extends React.Component {
  render() {
    return (
      <div className={style.container}>
        <header className={style.top} >
          <div className={style.topRightArea} >
            <span className={style.topTitle}>最近：</span>
          </div>
        </header>
        <section className={style.colorItemWrap} >
          {
            this.props.recentColors.map((color, index) => (
              <div
                role="presentation"
                key={`${index}`}
                className={style.colorItemSm}
                style={color.rgb ? { backgroundColor: `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.alpha})` } : {}}
                onClick={() => this.onRecentColorPick(index, color)}
              />
            ))
          }
        </section>
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

RecentColors.propTypes = {
  colors: PropTypes.array,
  colorSelectCallback: PropTypes.func
};

RecentColors.defaultProps = {
  colors: undefined,
  colorSelectCallback: undefined
};

export default RecentColors;
