import React from "react";
import PropTypes from "prop-types";
import * as style from "./CommonColor.less";

class CommonColor extends React.Component {
  render() {
    return (
      <div className={style.container}>
        <header className={style.top} >
          <div className={style.topTitle}>快速选色</div>
        </header>
        <section className={style.colorItemWrap} >
          {
            this.props.colors.map((color, index) => (
              <div
                role="presentation"
                key={`${index}`}
                className={style.colorItem}
                style={{ backgroundColor: `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.alpha})` }}
                onClick={() => this.onColorPick(index)}
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

CommonColor.propTypes = {
  colors: PropTypes.array,
  colorSelectCallback: PropTypes.func
};

CommonColor.defaultProps = {
  colors: undefined,
  colorSelectCallback: undefined
};

export default CommonColor;
