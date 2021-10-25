import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { EVENT } from "../../constant";

class Controler extends React.PureComponent {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    eventEmitter: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.roadNetManager = new props.BIMWINNER.BOS3D.Plugins.RoadNetManager({
      viewer3D: props.viewer
    });
  }

  // 监听开发者操作
  componentDidMount() {
    this.props.eventEmitter.on(EVENT.userAddRoadnet, (modelKey, start, end) => {
      this.roadNetManager.addRoadNet(modelKey, start, end);
    });
    this.props.eventEmitter.on(EVENT.userGetRoadnet, (modelKey, start, end, cb) => {
      cb(this.roadNetManager.getRoadNet(modelKey, start, end));
    });
    this.props.eventEmitter.on(EVENT.userRmRoadnet, (modelKey, start, end) => {
      this.roadNetManager.removeRoadNet(modelKey, start, end);
    });
  }

  render() {
    return (
      <></>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  eventEmitter: state.system.eventEmitter,
  BIMWINNER: state.system.BIMWINNER,
});
const mapDispatchToProps = () => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Controler);
