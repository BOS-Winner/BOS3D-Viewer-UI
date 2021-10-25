import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { updateList } from "./action";
import toastr from "../toastr";
import Icon from "../Base/Icon";
// import wireframePng from "./img/white/wireframe.png";
import { AntdIcon } from '../utils/utils';
import iconstyle from '../Toolbar/bottom.less';
/**
 * @class 构件线框化
 */
class WireFrame extends React.PureComponent {
  onClick() {
    const viewer = this.props.viewer;
    const keys = viewer.getHighlightComponentsKey();
    if (keys.length === 0) {
      toastr.error("未选中构件", "", {
        target: `#${viewer.viewport}`
      });
    } else {
      viewer.wireFrameComponentsByKey(keys, true);
      this.props.updateList({
        type: "wireframe",
        name: "构件线框化",
        keys
      });
    }
  }

  render() {
    return (
      <div title="构件线框化" role="button" tabIndex={0} onClick={() => { this.onClick() }}>
        <Icon
          icon={<AntdIcon type="iconcomponentwireframing" className={iconstyle.icon} />}
          title=""
          showTitle={false}
        />
      </div>
    );
  }
}

WireFrame.propTypes = {
  updateList: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
});
const mapDispatchToProps = (dispatch) => ({
  updateList: item => { dispatch(updateList(item)) }
});

const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(WireFrame);

export default WrappedContainer;
