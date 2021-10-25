import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import MobileTool from "./MobileTool";
import Icon from "../../Base/Icon";
import SVGRect from "./SVGRect";
import { changeMode } from "../action";
import toastr from "../../toastr";
import fuckIE from "../../theme/fuckIE.less";
// import pickByRectPng from "../img/white/pickByRect.png";
import { AntdIcon } from "../../utils/utils";
import iconstyle from '../../Toolbar/bottom.less';

/**
 * @class 框选模式
 */
class PickByRect extends React.PureComponent {
  componentDidUpdate(prevProps) {
    const viewer = this.props.viewer;
    const PICK_BY_RECT = this.props.BIMWINNER.BOS3D.ToolMode.PICK_BY_RECT;
    const isMobile = this.props.BIMWINNER.BOS3D.DeviceTest.isMobileDevice();
    toastr.remove();
    if (prevProps.mode !== "框选模式" && this.props.mode === '框选模式') {
      if (!isMobile) {
        toastr.info("按住'Ctrl'键,框选模式为增选;按住'Alt'键,框选模式为减选", "", {
          target: `#${viewer.viewport}`,
        });
      }
      viewer.viewerImpl.controlManager.enableTool(viewer.viewerImpl, PICK_BY_RECT);
      viewer.render();
      // 切换模式时提示用户
      if (prevProps.mode.length > 0) {
        toastr.info(`框选模式下将关闭${prevProps.mode}`, "", {
          target: `#${viewer.viewport}`
        });
      }
    }

    if (prevProps.mode === "框选模式" && this.props.mode !== '框选模式') {
      viewer.viewerImpl.controlManager.disableTool(PICK_BY_RECT);
      viewer.render();
    }
  }

  onClick() {
    if (!this.props.modelLoad) return;
    const selected = (this.props.mode === "框选模式");
    this.props.changeMode(selected ? "" : "框选模式");
  }

  render() {
    const selected = (this.props.mode === "框选模式");
    const isMobile = this.props.BIMWINNER.BOS3D.DeviceTest.isMobileDevice();
    return (
      <div
        className={selected ? fuckIE.select : ''}
        title="框选"
        role="button"
        tabIndex={0}
        onClick={() => { this.onClick() }}
      >
        <Icon
          icon={<AntdIcon type="iconboxselection" className={iconstyle.icon} />}
          title="框选"
          selected={selected}
        />
        {selected
          && (
            <SVGRect
              viewer={this.props.viewer}
              BIMWINNER={this.props.BIMWINNER}
              ee={this.props.ee}
            />
          )}
        {selected && isMobile && <MobileTool viewer={this.props.viewer} />}
      </div>
    );
  }
}

PickByRect.propTypes = {
  changeMode: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
  ee: PropTypes.object.isRequired,
  modelLoad: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  mode: state.button.mode,
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
  ee: state.system.eventEmitter,
});
const mapDispatchToProps = (dispatch) => ({
  changeMode: mode => {
    dispatch(changeMode(mode));
  }
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PickByRect);

export default WrappedContainer;
