import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { updateList } from "./action";
import Icon from "../Base/Icon";
import toastr from "../toastr";
import ColorPicker from "../ColorPicker";
// import changeColorPng from "./img/white/changeColor.png";
import { AntdIcon } from '../utils/utils';
import iconstyle from '../Toolbar/bottom.less';

class ChangeCptColor extends React.Component {
  constructor(props) {
    super(props);
    // 颜色拾取器实例
    this._colorPicker = undefined;
    this.state = {
      selected: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mode !== this.props.mode && this.props.mode === "漫游模式") {
      this.closeColorPicker();
    }
  }

  openColorPicker() {
    ColorPicker.showAtRight(
      {
        title: "构件上色",
        onConfirm: (color) => {
          this.onChangeCptColor(color.hex, color.alpha);
        },
        didMount: (ref) => {
          this._colorPicker = ref;
          this.setState({
            selected: true,
          });
        },
        onClose: () => {
          this._colorPicker = undefined;
          this.setState({
            selected: false,
          });
        },
        onRestore: () => {
          this.restoreCptColor();
        }
      }, this.props.viewer.viewportDiv
    );
  }

  closeColorPicker() {
    if (this._colorPicker) {
      this._colorPicker.dismiss();
      this._colorPicker = undefined;
    }
  }

  onClick() {
    if (this._colorPicker) {
      this.closeColorPicker();
    } else {
      this.openColorPicker();
    }
  }

  onChangeCptColor(color, opacity) {
    const viewer3D = this.props.viewer;
    const keys = viewer3D.getHighlightComponentsKey();
    if (keys.length === 0) {
      toastr.error("未选中构件", "", {
        target: `#${viewer3D.viewport}`
      });
      return;
    }
    viewer3D.colorfulComponentsByKey(keys, color, opacity);
    viewer3D.closeHighlightComponentsByKey(keys);
    this.props.updateList({
      type: 'colorful',
      name: "构件变色",
      keys,
      color,
      opacity
    });
  }

  restoreCptColor() {
    const viewer3D = this.props.viewer;
    const keys = viewer3D.getHighlightComponentsKey();
    if (keys.length === 0) {
      toastr.error("未选中构件", "", {
        target: `#${viewer3D.viewport}`
      });
      return;
    }
    viewer3D.closeColorfulComponentsByKey(keys);
    viewer3D.closeHighlightComponentsByKey(keys);
  }

  render() {
    return (
      <div
        title="构件上色"
        role="button"
        tabIndex={0}
        onClick={(e) => {
          this.onClick(e);
        }}
      >
        {/* <Icon img={changeColorPng} selected={this.state.selected} /> */}
        <Icon
          icon={<AntdIcon type="iconcomponentcoloring" className={iconstyle.icon} />}
          selected={this.state.selected}
          title=""
          showTitle={false}
        />
      </div>
    );
  }
}

ChangeCptColor.propTypes = {
  updateList: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  mode: state.button.mode,
});
const mapDispatchToProps = (dispatch) => ({
  updateList: item => { dispatch(updateList(item)) }
});

const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeCptColor);

export default WrappedContainer;
