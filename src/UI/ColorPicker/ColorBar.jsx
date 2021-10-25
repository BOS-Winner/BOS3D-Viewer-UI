import React from "react";
import PropTypes from "prop-types";
import * as style from "./ColorBar.less";

class ColorBar extends React.Component {
  constructor(props) {
    super(props);

    this.barDiv = React.createRef();
    this.beginChange = this.beginChange.bind(this);
    this.continueChange = this.continueChange.bind(this);
    this.endChange = this.endChange.bind(this);
    this.shapeDiv = React.createRef();
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const div = this.barDiv.current;
    if (div) {
      div.addEventListener("click", this.handleChange);
    }
    const shapeDiv = this.shapeDiv.current;
    if (shapeDiv) {
      shapeDiv.addEventListener("mousedown", this.beginChange);
    }
  }

  componentWillUnmount() {
    const shapeDiv = this.shapeDiv.current;
    if (shapeDiv) {
      shapeDiv.removeEventListener("mousedown", this.beginChange);
    }
    const div = this.barDiv.current;
    if (div) {
      div.removeEventListener("click", this.handleChange);
    }
  }

  render() {
    const rgb = this.props.color.rgb;
    return (
      <div className={style.container}>
        <div style={{ backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.props.color.alpha}` }} className={style.colorPreview} />
        <div ref={this.barDiv} className={style.colorBar}>
          <div className={style.colorBarBg} />
          <div className={style.target} style={{ left: `${(this.props.color.hsv.h * 100) / 360}%` }}>
            <div
              className={style.shape}
              ref={this.shapeDiv}
            />
          </div>
        </div>
      </div>
    );
  }

  beginChange(e) {
    const shapeDiv = this.shapeDiv.current;
    if (shapeDiv) {
      this.handleChange(e);
      window.addEventListener("mousemove", this.continueChange);
      window.addEventListener("mouseup", this.endChange);
    }
  }

  continueChange(e) {
    this.handleChange(e);
  }

  endChange(e) {
    const shapeDiv = this.shapeDiv.current;
    if (shapeDiv) {
      window.removeEventListener("mousemove", this.continueChange);
      window.removeEventListener("mouseup", this.endChange);
      this.handleChange(e);
    }
  }

  handleChange(e) {
    const div = this.barDiv.current;
    if (div) {
      const x = typeof e.clientX === 'number' ? e.pageX : e.touches[0].pageX;
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

ColorBar.propTypes = {
  color: PropTypes.object,
  colorChangeCallback: PropTypes.func
};

ColorBar.defaultProps = {
  color: undefined,
  colorChangeCallback: undefined

};

export default ColorBar;
