import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// import Icon from "../../Base/Icon";
// // import scatterPng from "../img/white/floorScatter.png";
// import style from "./style.less";
// import { AntdIcon } from '../../utils/utils';
// import iconstyle from '../../Toolbar/bottom.less';

/**
 * 楼层分解
 */
class ModelScatter extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    enable: PropTypes.bool.isRequired,
    coefficient: PropTypes.number.isRequired,
  };

  shouldComponentUpdate(nextProps) {
    if (nextProps.enable && nextProps.coefficient !== this.props.coefficient) {
      this.onRangeChange(nextProps.coefficient);
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.enable && !this.props.enable) {
      const viewer3D = this.props.viewer;
      viewer3D.closeFloorExplosion();
    }
  }

  onRangeChange(value) {
    const coefficient = parseFloat(value);
    const viewer3D = this.props.viewer;
    viewer3D.floorExplosion(coefficient);
  }

  render() {
    return (
      <div
        // className={style.rangeContainer}
        title="楼层分解"
      >
        {/* <Icon
          icon={<AntdIcon type="iconloucengfenjie-01" className={iconstyle.icon} />}
          title="楼层"
          showTitle={false}
        /> */}
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
)(ModelScatter);
