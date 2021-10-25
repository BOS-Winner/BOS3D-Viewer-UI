import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import toastr from "../../toastr";
import { updateList } from "../action";
import { ON_CLICK_ISOLATE } from "../eventType";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';
import IsolateMobileHelper from "./MobileHelper/index";

const sender = "IsolateIcon";

/**
 * @class 构件隔离
 */
class Isolate extends React.PureComponent {
  onClick() {
    const viewer = this.props.viewer;
    const keys = viewer.getHighlightComponentsKey();
    if (keys.length === 0) {
      toastr.error("未选中构件", "", {
        target: `#${viewer.viewport}`
      });
    } else {
      viewer.isolateComponentsByKey(keys);
      this.props.updateList({
        type: 'isolate',
        name: "构件隔离",
        keys
      });
      this.props.ee.emit(ON_CLICK_ISOLATE, {
        sender,
        payload: {
          keys,
        },
      });
    }
  }

  render() {
    const { isMobile } = this.props;
    if (isMobile) {
      return <IsolateMobileHelper />;
    }
    return (
      <div title="构件隔离" role="button" tabIndex={0} onClick={() => { this.onClick() }}>
        <Icon
          icon={<AntdIcon type="iconcomponentisolation" className={iconstyle.icon} />}
          title="隔离"
        />
      </div>
    );
  }
}

Isolate.propTypes = {
  updateList: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  ee: PropTypes.object.isRequired,
  isMobile: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  ee: state.system.eventEmitter,
  isMobile: state.system.isMobile,
});
const mapDispatchToProps = (dispatch) => ({
  updateList: item => { dispatch(updateList(item)) }
});

const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Isolate);

export default WrappedContainer;
