import React from "react";
import PropTypes from "prop-types";
import * as style from "./AlphaBar.less";

class AlphaBar extends React.Component {
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
    const gradient = {
      background: `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b}, 0) 0%,
           rgba(${rgb.r},${rgb.g},${rgb.b}, 1) 100%)`,
    };
    return (
      <div ref={this.barDiv} className={style.container}>
        <div className={style.alphaBarBg} style={gradient} />
        <div className={style.target} style={{ left: `${(this.props.color.alpha * 100)}%` }}>
          <div className={style.shape} ref={this.shapeDiv} />
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
      let left = x - (rect.left + window.pageXOffset);
      if (left < 0) {
        left = 0;
      }

      if (left > rect.width) {
        left = rect.width;
      }
      const alpha = left / rect.width;

      if (this.props.alphaChangeCallback) {
        this.props.alphaChangeCallback(alpha);
      }
    }
  }
}

AlphaBar.propTypes = {
  color: PropTypes.object,
  alphaChangeCallback: PropTypes.func
};

AlphaBar.defaultProps = {
  color: undefined,
  alphaChangeCallback: undefined
};

export default AlphaBar;
