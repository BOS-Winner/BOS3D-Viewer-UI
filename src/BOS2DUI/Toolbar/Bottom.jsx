import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Toolbar from "Base/Toolbar";
import PickByRect from "./Icon/PickByRect";
import ZoomByRect from "./Icon/ZoomByRect";
import Measure from "./Icon/Measure";
import CptInfo from "./Icon/CptInfo";
import { showLayerSwitcher } from "../redux/bottomRedux/action";
import LayerSwitcher from "./Icon/LayerSwitcher";
import Setting from "./Icon/Setting";
import Annotation from "./Icon/Annotation";
import style from "./bottom.less";
import { AntdIcon, mobileCheck } from '../../UI/utils/utils';

function Bottom(props) {
  const done = React.useRef(false);
  const [visible, setVisible] = React.useState(true);
  const [handleState, setHandleState] = React.useState(true);
  const isMobile = mobileCheck();
  React.useEffect(() => {
    if (!done.current && props.linkage) {
      const emitter = props.linkage.emitter;
      const EVENTS = props.linkage.EVENTS;
      emitter.on(EVENTS.ON_SWITCH_MAIN3D, () => {
        if (!isMobile) {
          setVisible(false);
        }
      });
      emitter.on(EVENTS.ON_SWITCH_BOTH, () => {
        setVisible(true);
      });
      emitter.on(EVENTS.ON_SWITCH_MAIN2D, () => {
        setVisible(true);
      });
      emitter.on(EVENTS.ON_SWITCH_ONLY3D, () => {
        setVisible(true);
      });
      emitter.on(EVENTS.ON_HANDLE_LAYER,
        () => {
          props.showLayerSwitcher(!props.show);
        }
      );
      done.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.linkage]);

  function handle() {
    setHandleState(!handleState);
  }

  return (
    <Toolbar
      className={visible ? mobileCheck() ? style.right : style.bottom : style.noneDisplay}
      style={isMobile ? { right: handleState ? 0 : "-63px" } : {}}
    >
      {!isMobile && <PickByRect />}
      {!isMobile && <ZoomByRect />}
      <Measure />
      <LayerSwitcher />
      <CptInfo />
      <Annotation />
      <Setting />
      {
        isMobile && (
          <div className={style.handle} onClick={handle} role="presentation">
            <AntdIcon className={style.icon} type={handleState ? "iconicon_arrowright" : "iconicon_arrowleft-01"} />
          </div>
        )
      }

    </Toolbar>
  );
}

Bottom.propTypes = {
  linkage: PropTypes.object,
  showLayerSwitcher: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};
Bottom.defaultProps = {
  linkage: undefined,
};

const mapStateToProps = (state) => ({
  linkage: state.system.linkage,
  show: state.bottom.showLayerSwitcher,
});
const mapDispatchToProps = (dispatch) => ({
  showLayerSwitcher: state => dispatch(showLayerSwitcher(state)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Bottom);

export default WrappedContainer;
