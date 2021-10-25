import React from "react";
import PropTypes from "prop-types";
import _ from "lodash-es";
import { connect } from "react-redux";
import style from "./style.less";
import ColorPicker from "../../ColorPicker";
import { AntdIcon } from '../../utils/utils';
import { Popover } from 'antd';

function getHex(hex = "") {
  if (hex.length < 5) {
    return ''
  }
  if (hex.length > 7) {
    hex = hex.slice(0, -2)
  }
  return hex
}

function getAlpha(hex = "") {
  let _a = 1;
  if (hex) {
    if (hex.startsWith('#')) {
      hex = hex.slice(1)
    }
    if (hex.length > 6) {
      _a = _.round(parseInt(hex.slice(6, 8), 16) / 255, 2)
        .toString()
    }
  }
  return _a;
}

class ColorPickButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      propsHex: '',
      editedHex: '',
      isPopoverVisible: false
    }
    // 颜色拾取器实例
    this._colorPicker = undefined;

    this.setColor = this.setColor.bind(this);
    this.clearColor = this.clearColor.bind(this);
    this.toggleColorPicker = this.toggleColorPicker.bind(this);
    this.ref = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let hex = getHex(nextProps.color);
    if (hex !== prevState.propsHex) {
      return {
        editedHex: undefined,
        propsHex: hex
      };
    }
    return null;
  }

  componentWillUnmount() {
    if (this._colorPicker) {
      this._colorPicker.dismiss();
      this._colorPicker = undefined;
    }
  }

  setColor(hex, opacity) {
    if (hex !== undefined) {
      let o = opacity === undefined ? 1.0 : opacity;
      o *= 255;
      o = Math.round(o);
      let str = o.toString(16);
      if (str.length === 1) {
        str = `0${str}`;
      }
      if (this.props.setColor) {
        this.props.setColor(hex + str);
      }
    }
    if (this._colorPicker) {
      this._colorPicker.dismiss();
      this._colorPicker = undefined;
    }
  }

  restoreColor() {
    if (this.props.setColor) {
      this.props.setColor(this.props.restoreColor);
    }
    this._colorPicker.dismiss();
    this._colorPicker = undefined;
  }

  clearColor() {
    if (this.props.setColor) {
      this.props.setColor("none");
    }
  }

  toggleColorPicker() {
    const { color, isMobile } = this.props;
    if (!isMobile) return
    if (this._colorPicker) {
      this._colorPicker.dismiss();
      this._colorPicker = undefined;
    } else {
      ColorPicker.showAtRight(
        {
          hexColor: this.props.color === "none" ? undefined : this.props.color,
          restoreColor: this.props.restoreColor === "none" ? undefined : { hex: this.props.restoreColor },
          onConfirm: (color) => {
            this.setColor(color.hex, color.alpha);
          },
          onRestore: () => {
            this.restoreColor();
          },
          didMount: (ref) => {
            this._colorPicker = ref;
          },
          onClose: () => {
            this._colorPicker = undefined;
          }
        }, this.props.viewer.viewportDiv, 1000);
    }
  }

  onHexChange = (e) => {
    const { color } = this.props;
    let alpha = parseInt(getAlpha(color));

    const hex = e.target.value;
    if (hex.length === 7 && hex[0] === "#") {
      this.setColor(hex, alpha)
    }
    this.setState({
      editedHex: hex
    });
  }

  onAlphaChange = (e) => {
    const { color } = this.props;
    const hex = getHex(color);
    let value = parseInt(e.target.value, 10);
    if (_.isNaN(value)) {
      value = 0;
    }
    if (/^[\d]*$/.test(value)) {
      if (Number(value) > 100) {
        value = '100';
      }
      if (Number(value) <= 0) {
        value = '0';
      }
      if (color !== 'none') {
        this.setColor(hex, value / 100)
      }
    }
  }

  onPopoverVisibleChange = visible => {
    this.setState({ isPopoverVisible: visible });
  };

  onRestore = () => {
    const { color, restoreColor } = this.props;
    // 重置颜色
    this.setState({
      isPopoverVisible: false,
    });
    if (restoreColor === 'none') {
      this.props.setColor(restoreColor);
    } else {
      this.setColor(restoreColor, 1);
    }
  }

  render() {
    const { editedHex, isPopoverVisible } = this.state
    const { color, isMobile } = this.props;
    // console.log(restoreColor, 'restoreColor')
    // console.log(color, 'color')
    const hex = color === 'none' ? '#' : getHex(color);
    let alpha = color === 'none' ? '' : parseInt(getAlpha(color) * 100);
    let disabled = color === 'none' ? true : false

    let popoverContentJSX = <div><ColorPicker
      isModal={false}
      onConfirm={(color) => {
        this.setState({
          isPopoverVisible: false,
        });
        this.setColor(color.hex, color.alpha);
      }}
      onRestore={this.onRestore}
      hexColor={color}
      alpha={alpha / 100}
    /> </div>

    const selectColorJSX = <div className={style.input} style={{ padding: 0 }} onClick={this.toggleColorPicker}>
      <div
        className={`${color === 'none' ? style.disabledDiv : ''}`}
        style={{
          width: 34,
          backgroundColor: color === 'none' ? '#fff' : color,
        }}
      />
      <div className={style.dropdown} ><AntdIcon type="iconicon_arrowdown" /></div>
    </div>

    return (
      <div className={style.colorPickerButton} ref={this.ref}>
        <div className={style.inputGroup}  >
          {isMobile && selectColorJSX}
          {!isMobile && <Popover
            content={popoverContentJSX}
            destroyTooltipOnHide={true}
            visible={isPopoverVisible}
            onVisibleChange={this.onPopoverVisibleChange}
            title={null}
            overlayClassName={"annotation-ui-module-popver-wrap"}
            trigger="click"
            placement="top"
            getPopupContainer={() => this.props.viewer.viewportDiv}
          >
            {selectColorJSX}
          </Popover>}
          {!isMobile && <div >
            <input
              className={`${style.input} ${style.inputHex}  `}
              key="hex"
              type="text"
              value={editedHex ? editedHex : hex}
              maxLength={10}
              onChange={this.onHexChange}
            />
          </div>}
          {!isMobile &&
            <div >
              <input type="text" className={`${style.input} ${style.inputAlpha}  `} disabled={disabled} value={alpha} onChange={this.onAlphaChange} />
              <span className={`${style.symbol}  `} >%</span>
            </div>
          }
        </div>
      </div >
    );
  }
}

ColorPickButton.propTypes = {
  viewer: PropTypes.object.isRequired,
  color: PropTypes.string,
  restoreColor: PropTypes.string,
  setColor: PropTypes.func,
};

ColorPickButton.defaultProps = {
  color: "#FFFFFFFF",
  restoreColor: undefined,
  setColor: undefined,
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D || state.system.viewer2D,
});
const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ColorPickButton);
