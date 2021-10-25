import React from "react";
import PropTypes from "prop-types";
import _ from "lodash-es";
import * as style from "./ColorInput.less";
import { convertHexColorToHSV, convertRGBColorToHex } from "./Util";

class ColorInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputHexRef = React.createRef();
    this.inputRRef = React.createRef();
    this.inputGRef = React.createRef();
    this.inputBRef = React.createRef();

    this.rgbChange = this.rgbChange.bind(this);
    this.hexChange = this.hexChange.bind(this);
    this.state = {
      propsHex: this.props.color.hex,
      editedHex: undefined
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.color.hex !== prevState.propsHex) {
      return {
        editedHex: undefined,
        propsHex: nextProps.color.hex
      };
    }
    return null;
  }

  render() {
    return (
      <div className={style.container}>
        <div className={style.hexContainer}>
          <span className={style.label} >HEX</span>
          <input
            ref={this.inputHexRef}
            onChange={this.hexChange}
            value={this.state.editedHex ? this.state.editedHex : this.props.color.hex}
            type="text"
            className={style.inputHex}
          />
        </div>
        <div className={style.rgbContainer}>
          <span className={style.label}>RGB</span>
          <div className={style.rgbInputs}>
            <input
              ref={this.inputRRef}
              onChange={this.rgbChange}
              value={this.props.color.rgb.r}
              type="text"
              className={style.inputRgb}
            />
            <input
              ref={this.inputGRef}
              onChange={this.rgbChange}
              value={this.props.color.rgb.g}
              type="text"
              className={style.inputRgb}
            />
            <input
              ref={this.inputBRef}
              onChange={this.rgbChange}
              value={this.props.color.rgb.b}
              type="text"
              className={style.inputRgb}
            />
          </div>

        </div>
      </div>
    );
  }

  rgbChange() {
    let r = parseInt(this.inputRRef.current.value, 10);
    let g = parseInt(this.inputGRef.current.value, 10);
    let b = parseInt(this.inputBRef.current.value, 10);
    if (_.isNaN(r)) {
      r = 0;
    }
    if (_.isNaN(g)) {
      g = 0;
    }
    if (_.isNaN(b)) {
      b = 0;
    }
    if (this.props.colorChangeCallback) {
      const hex = convertRGBColorToHex({ r, g, b });
      const hsv = convertHexColorToHSV(hex);
      this.props.colorChangeCallback(hsv);
      this.setState({
        editedHex: hex
      });
    }
  }

  hexChange() {
    const hex = this.inputHexRef.current.value;
    if (hex.length === 7 && hex[0] === "#") {
      if (this.props.colorChangeCallback) {
        const hsv = convertHexColorToHSV(hex);
        this.props.colorChangeCallback(hsv);
      }
    }
    this.setState({
      editedHex: hex
    });
  }
}

ColorInput.propTypes = {
  color: PropTypes.object,
  colorChangeCallback: PropTypes.func,
};

ColorInput.defaultProps = {
  color: undefined,
  colorChangeCallback: undefined,
};

export default ColorInput;
