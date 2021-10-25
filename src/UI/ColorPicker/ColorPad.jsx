import React from "react";
import PropTypes from "prop-types";
import * as style from "./ColorPad.less";

let startEvt = "mousedown";
let moveEvt = "mousemove";
let endEvt = "mouseup";
if ("ontouchstart" in window) {
  startEvt = "touchstart";
  moveEvt = "touchmove";
  endEvt = "touchend";
}

class ColorPad extends React.Component {
  constructor(props) {
    super(props);
    this.rootDiv = React.createRef();
    this.beginChange = this.beginChange.bind(this);
    this.continueChange = this.continueChange.bind(this);
    this.endChange = this.endChange.bind(this);
  }

  componentDidMount() {
    const div = this.rootDiv.current;
    if (div) {
      div.addEventListener(startEvt, this.beginChange);
    }
  }

  componentWillUnmount() {
    const div = this.rootDiv.current;
    if (div) {
      div.removeEventListener(startEvt, this.beginChange);
    }
  }

  render() {
    return (
      <div
        ref={this.rootDiv}
        className={style.container}
        style={{ background: `hsl(${this.props.color.hsv.h},100%, 50%)` }}
      >
        <div className={style.white}>
          <div className={style.black} />
          <div
            className={style.target}
            style={{ top: `${100 - this.props.color.hsv.v}%`, left: `${this.props.color.hsv.s}%` }}
          >
            <div
              className={style.circle}
            />
          </div>
        </div>
      </div>
    );
  }

  beginChange(e) {
    const div = this.rootDiv.current;
    if (div) {
      this.handleChange(e);
      window.addEventListener(moveEvt, this.continueChange);
      window.addEventListener(endEvt, this.endChange);
    }
  }

  continueChange(e) {
    this.handleChange(e);
  }

  endChange(e) {
    const div = this.rootDiv.current;
    if (div) {
      window.removeEventListener(moveEvt, this.continueChange);
      window.removeEventListener(endEvt, this.endChange);
      // this.handleChange(e);
    }
  }

  handleChange(e) {
    const div = this.rootDiv.current;
    if (div) {
      const x = typeof e.clientX === 'number' ? e.pageX : e.touches[0].pageX;
      const y = typeof e.clientY === 'number' ? e.pageY : e.touches[0].pageY;
      const rect = div.getBoundingClientRect();
      let left = x - (rect.left + window.pageXOffset);
      let top = y - (rect.top + window.pageYOffset);
      if (left < 0) {
        left = 0;
      } else if (left > rect.width) {
        left = rect.width;
      }
      if (top < 0) {
        top = 0;
      } else if (top > rect.height) {
        top = rect.height;
      }
      const saturation = (left * 100) / rect.width;
      const bright = -((top * 100) / rect.height) + 100;
      if (this.props.colorChangeCallback) {
        this.props.colorChangeCallback({ ...this.props.color.hsv, s: saturation, v: bright });
      }
    }
  }
}

ColorPad.propTypes = {
  color: PropTypes.object,
  colorChangeCallback: PropTypes.func
};

ColorPad.defaultProps = {
  color: undefined,
  colorChangeCallback: undefined
};

export default ColorPad;
