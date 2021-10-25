import React from "react";
import PropTypes from "prop-types";
import * as style from "./ColorBar.less";

class ColorBar extends React.Component {
  constructor(props) {
    super(props);

    this.barDiv = React.createRef();
    this.shapeDiv = React.createRef();
    this.beginChange = this.beginChange.bind(this);
    this.continueChange = this.continueChange.bind(this);
    this.endChange = this.endChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const shapeDiv = this.shapeDiv.current;
    if (shapeDiv) {
      shapeDiv.addEventListener("touchstart", this.beginChange);
    }
    const barDiv = this.barDiv.current;
    if (barDiv) {
      barDiv.addEventListener("touchstart", this.beginChange);
    }
  }

  componentWillUnmount() {
    const shapeDiv = this.shapeDiv.current;
    if (shapeDiv) {
      shapeDiv.removeEventListener("touchstart", this.beginChange);
    }
    const barDiv = this.barDiv.current;
    if (barDiv) {
      barDiv.removeEventListener("touchstart", this.beginChange);
    }
  }

  render() {
    const rgb = this.props.color.rgb;
    return (
      <div className={style.container}>
        <div ref={this.barDiv} className={style.colorBar}>
          <div className={style.colorBarBg} />
          <div className={style.target} style={{ left: `${(this.props.color.hsv.h * 100) / 360}%` }}>
            <div className={style.shape} ref={this.shapeDiv} />
          </div>
        </div>
      </div>
    );
  }

  beginChange(e) {
    e.stopPropagation();
    const shapeDiv = this.shapeDiv.current;
    if (shapeDiv) {
      this.handleChange(e);
      window.addEventListener("touchmove", this.continueChange);
      window.addEventListener("touchend", this.endChange);
    }
  }

  continueChange(e) {
    this.handleChange(e);
  }

  endChange(e) {
    const shapeDiv = this.shapeDiv.current;
    if (shapeDiv) {
      window.removeEventListener("touchmove", this.continueChange);
      window.removeEventListener("touchend", this.endChange);
      this.handleChange(e);
    }
  }

  handleChange(e) {
    const div = this.barDiv.current;
    if (div) {
      if (e.touches[0]) {
        const x = e.touches[0].pageX;
        const rect = div.getBoundingClientRect();
        const left = x - (rect.left + window.pageXOffset);
        let h = 0;
        if (left < 0) {
          h = 0;
        } else if (left > rect.width) {
          h = 359;
        } else {
          const percent = (left * 100) / rect.width;
          h = ((360 * percent) / 100);
        }

        if (this.props.colorChangeCallback) {
          this.props.colorChangeCallback({ ...this.props.color.hsv, h });
        }
      }
    }
  }
}

ColorBar.propTypes = {
  color: PropTypes.object,
  colorChangeCallback: PropTypes.func
};

ColorBar.defaultProps = {
  color: undefined,
  colorChangeCallback: undefined

};

export default ColorBar;
