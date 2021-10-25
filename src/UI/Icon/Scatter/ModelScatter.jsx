import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// import Icon from "Base/Icon";
// // import scatterPng from "../img/white/modelScatter.png";
// import style from "./style.less";
// import { AntdIcon } from '../../utils/utils';
// import iconstyle from '../../Toolbar/bottom.less';

/**
 * 模型分解
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
      const modelKeys = viewer3D.getViewerImpl().modelManager.getModelKeys();
      viewer3D.closeModelsExplosion(modelKeys);
    }
  }

  onRangeChange(value) {
    const coefficient = parseFloat(value);
    const viewer3D = this.props.viewer;
    const modelKeys = viewer3D.getViewerImpl().modelManager.getModelKeys();
    viewer3D.modelsExplosion({
      modelKey: modelKeys,
      coefficientX: coefficient,
      coefficientY: coefficient,
      coefficientZ: coefficient,
    });
  }

  render() {
    return (
      <div
        // className={style.rangeContainer}
        title="模型分解"
      >

        {/* <Icon
          icon={<AntdIcon type="icondecompose" className={iconstyle.icon} />}
          title="模型"
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
