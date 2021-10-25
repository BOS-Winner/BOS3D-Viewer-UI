import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
// import zoomByRectImg from "IconImg/white/zoomByRect.png";
import { changeMode } from "../../redux/bottomRedux/action";
import * as MODE from "../../redux/bottomRedux/mode";
import { AntdIcon } from '../../../UI/utils/utils';
import iconStyle from '../../Theme/icon.less';


class ZoomByRect extends React.Component {
  static propTypes = {
    mode: PropTypes.string.isRequired,
    viewer2D: PropTypes.object.isRequired,
    BOS2D: PropTypes.object.isRequired,
    changeMode: PropTypes.func.isRequired,
  };

  shouldComponentUpdate(nextProps) {
    if (this.props.mode !== MODE.zoomByRect && nextProps.mode === MODE.zoomByRect) {
      this.props.viewer2D.getViewerImpl().controlManager.enableTool(
        this.props.viewer2D.getViewerImpl(),
        this.props.BOS2D.ToolMode.ZOOM_BY_RECT,
      );
    }
    if (this.props.mode === MODE.zoomByRect && nextProps.mode !== MODE.zoomByRect) {
      this.props.viewer2D.getViewerImpl().controlManager.disableTool(
        this.props.BOS2D.ToolMode.ZOOM_BY_RECT,
      );
    }
    return true;
  }

  render() {
    return (
      <div title="框选放大">
        <Icon
          className={iconStyle.icon}
          selected={this.props.mode === MODE.zoomByRect}
          icon={<AntdIcon type="iconkuangxuanfangda2-01" />}
          title="框选放大"
          onClick={() => {
            this.props.changeMode(this.props.mode === MODE.zoomByRect ? '' : MODE.zoomByRect);
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
)(ZoomByRect);

export default WrappedContainer;
