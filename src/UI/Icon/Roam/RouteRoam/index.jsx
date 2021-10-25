import React from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import RouteManager from "./RouteManager";

class RouteRoam extends React.PureComponent {
  render() {
    return (
      <RouteManager
        viewer={this.props.viewer}
        BIMWINNER={this.props.BIMWINNER}
        active={this.props.active}
      />
    );
  }
}

RouteRoam.propTypes = {
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
  active: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
});
const mapDispatchToProps = () => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RouteRoam);
