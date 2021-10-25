import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "../Base/Icon";
// import fitPng from "./img/white/fit.png";
import { AntdIcon } from '../utils/utils';
import iconstyle from '../Toolbar/bottom.less';

/**
 * @class 构件聚焦
 */
class Fit extends React.PureComponent {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
  };

  onClick() {
    this.props.viewer.adaptiveSize();
  }

  render() {
    return (
      <div title="聚焦" role="button" tabIndex={0} onClick={() => { this.onClick() }}>
        <Icon
          icon={<AntdIcon type="iconfocusing" className={iconstyle.icon} />}
          title="聚焦"
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
});
const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Fit);
