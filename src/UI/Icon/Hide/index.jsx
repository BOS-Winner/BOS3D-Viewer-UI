import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import { updateList } from "../action";
import { ON_HIDE_COMPONENT } from "../eventType";
import toastr from "../../toastr";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';
import HideMobileHelper from "./MobileHelper/index";

const SENDER = "HideIcon";

class Hide extends React.PureComponent {
  onClick() {
    const viewer = this.props.viewer;
    const keys = viewer.getHighlightComponentsKey();
    if (keys.length === 0) {
      toastr.error("未选中构件", "", {
        target: `#${viewer.viewport}`
      });
    } else {
      // 隐藏前先取消高亮列表
      viewer.clearModelHighlightList();
      viewer.hideComponentsByKey(keys);
      this.props.updateList({
        name: "隐藏构件",
        type: "hide",
        keys
      });
      this.props.ee.emit(ON_HIDE_COMPONENT, {
        sender: SENDER,
        payload: {
          keys,
        }
      });
    }
  }

  render() {
    const { isMobile } = this.props;
    if (isMobile) {
      return <HideMobileHelper />;
    }
    return (
      <div title="隐藏" role="button" tabIndex={0} onClick={() => { this.onClick() }}>
        <Icon
          icon={<AntdIcon type="iconconceal" className={iconstyle.icon} />}
          title="隐藏"
        />
      </div>
    );
  }
}

Hide.propTypes = {
  updateList: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  ee: PropTypes.object.isRequired,
  isMobile: PropTypes.bool
};

Hide.defaultProps = {
  isMobile: false
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
)(Hide);

export default WrappedContainer;
