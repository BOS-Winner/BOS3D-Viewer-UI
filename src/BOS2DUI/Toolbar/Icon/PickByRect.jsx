import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import toastr from "customToastr";
// import pickByRectImg from "IconImg/white/pickByRect.png";
import { changeMode } from "../../redux/bottomRedux/action";
import * as MODE from "../../redux/bottomRedux/mode";
import { AntdIcon } from '../../../UI/utils/utils';
import iconStyle from '../../Theme/icon.less';



class PickByRect extends React.Component {
  static propTypes = {
    mode: PropTypes.string.isRequired,
    viewer2D: PropTypes.object.isRequired,
    BOS2D: PropTypes.object.isRequired,
    changeMode: PropTypes.func.isRequired,
  };

  shouldComponentUpdate(nextProps) {
    if (this.props.mode !== MODE.pickByRect && nextProps.mode === MODE.pickByRect) {
      this.props.viewer2D.getViewerImpl().controlManager.enableTool(
        this.props.viewer2D.getViewerImpl(),
        this.props.BOS2D.ToolMode.PICK_BY_RECT,
      );
      toastr.info("按住'Ctrl'键,框选模式为增选;按住'Alt'键,框选模式为减选", '', {
        target: this.props.viewer2D.getViewerImpl().domElement
      });
    }
    if (this.props.mode === MODE.pickByRect && nextProps.mode !== MODE.pickByRect) {
      this.props.viewer2D.getViewerImpl().controlManager.disableTool(
        this.props.BOS2D.ToolMode.PICK_BY_RECT,
      );
    }
    return true;
  }

  render() {
    return (
      <div title="框选">
        <Icon
          selected={this.props.mode === MODE.pickByRect}
          className={iconStyle.icon}
          icon={<AntdIcon type="iconboxselection" />}
          title="框选"
          onClick={() => {
            this.props.changeMode(this.props.mode === MODE.pickByRect ? '' : MODE.pickByRect);
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mode: state.bottom.mode,
  viewer2D: state.system.viewer2D,
  BOS2D: state.system.BOS2D,
});
const mapDispatchToProps = (dispatch) => ({
  changeMode: (mode) => dispatch(changeMode(mode)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PickByRect);

export default WrappedContainer;
