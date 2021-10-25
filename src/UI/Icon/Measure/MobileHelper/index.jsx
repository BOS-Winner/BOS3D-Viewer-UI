import React from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import MeasureControl from "./MeasureControl";

class MobileHelper extends React.PureComponent {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
  };

  onTouchMove(clientX, clientY) {
    this.props.viewer.getViewerImpl().controlManager.getToolByName('pickByMeasure').touchPointMove({
      clientX,
      clientY
    });
  }

  onOk(clientX, clientY) {
    this.props.viewer.getViewerImpl().controlManager.getToolByName('pickByMeasure').touchPointEnd({
      clientX,
      clientY
    });
  }

  onCancel() {
    this.props.viewer.getViewerImpl().controlManager.getToolByName('pickByMeasure').measure.cancelCurrentMeasure();
  }

  render() {
    return (
      <MeasureControl
        onTouchMove={(x, y) => { this.onTouchMove(x, y) }}
        onOk={(x, y) => { this.onOk(x, y) }}
        onCancel={() => { this.onCancel() }}
        viewer={this.props.viewer}
      />
    // <PointHelper
    //   viewer={this.props.viewer}
    //   onTouchMove={pos => { this.onTouchMove(pos.clientX, pos.clientY) }}
    //   onOk={pos => { this.onOk(pos.clientX, pos.clientY) }}
    // />
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D||state.system.viewer2D,
});
const mapDispatchToProps = () => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MobileHelper);
