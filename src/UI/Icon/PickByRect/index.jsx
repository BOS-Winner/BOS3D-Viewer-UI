import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import MobileTool from "./MobileTool";
import Icon from "../../Base/Icon";
// import SVGRect from "./SVGRect";
import { changeMode, changeMouseIcon } from "../action";
import toastr from "../../toastr";
import fuckIE from "../../theme/fuckIE.less";
// import pickByRectPng from "../img/white/pickByRect.png";
import { AntdIcon } from "../../utils/utils";
import iconstyle from '../../Toolbar/bottom.less';
import { EVENT, modeMap } from "../../constant";

/**
 * @class 框选模式
 */
class PickByRect extends React.PureComponent {
  componentDidUpdate(prevProps) {
    const viewer = this.props.viewer;
    const PICK_BY_RECT = this.props.BIMWINNER.BOS3D.ToolMode.PICK_BY_RECT;
    const isMobile = this.props.BIMWINNER.BOS3D.DeviceTest.isMobileDevice();
    toastr.remove();
    //  open pickByReact
    if (prevProps.mode !== modeMap.pickByRectMode && this.props.mode === modeMap.pickByRectMode) {
      if (!isMobile) {
        toastr.info("按住'Ctrl'键,框选模式为增选;按住'Alt'键,框选模式为减选", "", {
          target: `#${viewer.viewport}`,
        });
      }
      viewer.viewerImpl.controlManager.enableTool(viewer.viewerImpl, PICK_BY_RECT);
      viewer.render();

      if (
        prevProps.mode.length > 0
        && prevProps.mode !== modeMap.sectionMode
      ) {
        toastr.info(`框选模式下将关闭${prevProps.mode}`, "", {
          target: `#${viewer.viewport}`
        });
      }

      if (prevProps.modeStack.includes(modeMap.sectionMode)) {
        toastr.info(`框选模式下,将自动隐藏剖切盒或者剖切面`, "", {
          target: `#${viewer.viewport}`
        });
        this.props.ee.emit(EVENT.handleSectionStatus, false);
      }
    }

    if (
      prevProps.mode === modeMap.pickByRectMode
      && this.props.mode !== modeMap.pickByRectMode
    ) {
      viewer.viewerImpl.controlManager.disableTool(PICK_BY_RECT);
      if (prevProps.modeStack.includes(modeMap.sectionMode)) {
        this.props.ee.emit(EVENT.handleSectionStatus, true);
        this.props.changeMouseIcon("");
      }
      viewer.render();
    }
  }

  onClick() {
    if (!this.props.modelLoad) return;
    const selected = (this.props.mode === modeMap.pickByRectMode
      || this.props.modeStack.includes(modeMap.pickByRectMode));
    if (selected) {
      // exit
      this.props.changeMode(modeMap.exit, modeMap.pickByRectMode);
      this.props.changeMouseIcon("");
    } else {
      // active
      this.props.changeMode(modeMap.pickByRectMode);
      this.props.changeMouseIcon(modeMap.pickByRectMode);
    }
  }

  render() {
    const selected = (this.props.modeStack.includes(modeMap.pickByRectMode));
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
        {/* {selected */}
        {/*  && ( */}
        {/*    <SVGRect */}
        {/*      viewer={this.props.viewer} */}
        {/*      BIMWINNER={this.props.BIMWINNER} */}
        {/*      ee={this.props.ee} */}
        {/*    /> */}
        {/*  )} */}
        {selected && isMobile && <MobileTool viewer={this.props.viewer} />}
      </div>
    );
  }
}

PickByRect.propTypes = {
  changeMode: PropTypes.func.isRequired,
  changeMouseIcon: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  modeStack: PropTypes.array.isRequired,
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
  ee: PropTypes.object.isRequired,
  modelLoad: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  mode: state.button.mode,
  modeStack: state.button.modeStack,
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
  ee: state.system.eventEmitter,
});
const mapDispatchToProps = (dispatch) => ({
  changeMode: (mode, exitMode) => {
    dispatch(changeMode(mode, exitMode));
  },
  changeMouseIcon: mode => {
    dispatch(changeMouseIcon(mode));
  }
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PickByRect);

export default WrappedContainer;
